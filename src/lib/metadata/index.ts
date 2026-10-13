import exifr from "exifr";

const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/tiff",
] as const;

export const METADATA_LIMITS = {
  maxBytes: MAX_BYTES,
  maxMb: 20,
  acceptedTypes: [
    ...ACCEPTED_TYPES,
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".heic",
    ".tif",
    ".tiff",
  ],
} as const;

export function assertMetadataImage(file: File) {
  const byType = ACCEPTED_TYPES.includes(
    file.type as (typeof ACCEPTED_TYPES)[number],
  );
  const byExt = /\.(jpe?g|png|webp|gif|heic|heif|tiff?)$/i.test(file.name);
  if (!byType && !byExt) throw new Error("UNSUPPORTED_TYPE");
  if (file.size > MAX_BYTES) throw new Error("FILE_TOO_LARGE");
}

export type MetadataRow = { label: string; value: string };

export type ImageMetadataResult = {
  file: MetadataRow[];
  image: MetadataRow[];
  camera: MetadataRow[];
  gps: MetadataRow[];
  other: MetadataRow[];
  hasExif: boolean;
  mapUrl: string | null;
  raw: Record<string, unknown>;
};

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function asString(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(String).join(", ");
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function push(
  rows: MetadataRow[],
  label: string,
  value: unknown,
  format?: (v: unknown) => string | null,
) {
  const formatted = format ? format(value) : asString(value);
  if (formatted) rows.push({ label, value: formatted });
}

function loadImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("IMAGE_LOAD_FAILED"));
    };
    img.src = url;
  });
}

/** Convert EXIF GPS DMS ([deg, min, sec]) or number + N/S/E/W ref to decimal. */
export function dmsToDecimal(dms: unknown, ref?: unknown): number | null {
  if (typeof dms === "number" && Number.isFinite(dms)) {
    const negative = typeof ref === "string" && /[SWsw]/.test(ref);
    return negative ? -Math.abs(dms) : dms;
  }

  if (!Array.isArray(dms) || dms.length < 1) return null;

  const parts = dms.map((part) => {
    if (typeof part === "number") return part;
    if (typeof part === "string") return Number(part);
    if (part && typeof part === "object" && "numerator" in part) {
      const num = Number((part as { numerator: number }).numerator);
      const den = Number(
        (part as { denominator?: number }).denominator ?? 1,
      );
      return den ? num / den : NaN;
    }
    return Number(part);
  });

  if (!parts.every((n) => Number.isFinite(n))) return null;

  const [deg = 0, min = 0, sec = 0] = parts;
  let decimal = Math.abs(deg) + min / 60 + sec / 3600;
  if (
    deg < 0 ||
    (typeof ref === "string" && /[SWsw]/.test(ref))
  ) {
    decimal = -decimal;
  }
  return decimal;
}

function extractGps(raw: Record<string, unknown>) {
  if (typeof raw.latitude === "number" && typeof raw.longitude === "number") {
    if (Number.isFinite(raw.latitude) && Number.isFinite(raw.longitude)) {
      return { lat: raw.latitude, lng: raw.longitude };
    }
  }

  const lat = dmsToDecimal(raw.GPSLatitude, raw.GPSLatitudeRef);
  const lng = dmsToDecimal(raw.GPSLongitude, raw.GPSLongitudeRef);
  if (lat != null && lng != null) return { lat, lng };
  return null;
}

export async function readImageMetadata(
  file: File,
): Promise<ImageMetadataResult> {
  assertMetadataImage(file);

  const [exif, gpsOnly, size] = await Promise.all([
    exifr
      .parse(file, {
        mergeOutput: true,
        translateKeys: false,
        reviveValues: true,
        sanitize: false,
        gps: true,
        xmp: true,
        icc: false,
        iptc: true,
        jfif: true,
        ihdr: true,
      })
      .catch(() => null),
    exifr.gps(file).catch(() => null),
    loadImageSize(file).catch(() => ({ width: 0, height: 0 })),
  ]);

  const raw = (exif ?? {}) as Record<string, unknown>;
  const fileRows: MetadataRow[] = [];
  const imageRows: MetadataRow[] = [];
  const cameraRows: MetadataRow[] = [];
  const gpsRows: MetadataRow[] = [];
  const otherRows: MetadataRow[] = [];

  push(fileRows, "name", file.name);
  push(fileRows, "type", file.type || "—");
  push(fileRows, "size", formatBytes(file.size));
  push(
    fileRows,
    "lastModified",
    file.lastModified ? new Date(file.lastModified).toISOString() : null,
  );

  const width =
    size.width || Number(raw.ImageWidth) || Number(raw.ExifImageWidth);
  const height =
    size.height || Number(raw.ImageHeight) || Number(raw.ExifImageHeight);
  if (width && height) {
    push(imageRows, "dimensions", `${width} × ${height}`);
    push(imageRows, "megapixels", ((width * height) / 1_000_000).toFixed(2));
    push(imageRows, "aspectRatio", (width / height).toFixed(3));
  }
  push(imageRows, "orientation", raw.Orientation);
  push(imageRows, "colorSpace", raw.ColorSpace);
  push(imageRows, "bitDepth", raw.BitsPerSample);

  push(cameraRows, "make", raw.Make);
  push(cameraRows, "model", raw.Model);
  push(cameraRows, "lens", raw.LensModel ?? raw.Lens);
  push(cameraRows, "software", raw.Software);
  push(
    cameraRows,
    "dateTime",
    raw.DateTimeOriginal ?? raw.CreateDate ?? raw.ModifyDate,
  );
  push(cameraRows, "iso", raw.ISO ?? raw.ISOSpeedRatings);
  push(cameraRows, "fNumber", raw.FNumber, (v) =>
    typeof v === "number" ? `f/${v}` : asString(v),
  );
  push(cameraRows, "exposureTime", raw.ExposureTime, (v) => {
    if (typeof v !== "number") return asString(v);
    if (v >= 1) return `${v}s`;
    return `1/${Math.round(1 / v)}s`;
  });
  push(cameraRows, "focalLength", raw.FocalLength, (v) =>
    typeof v === "number" ? `${v} mm` : asString(v),
  );
  push(cameraRows, "flash", raw.Flash);

  const fromExifrGps =
    gpsOnly &&
    typeof gpsOnly.latitude === "number" &&
    typeof gpsOnly.longitude === "number"
      ? { lat: gpsOnly.latitude, lng: gpsOnly.longitude }
      : null;
  const gps = fromExifrGps ?? extractGps(raw);
  const hasGps = gps != null;

  if (gps) {
    push(gpsRows, "latitude", gps.lat.toFixed(6));
    push(gpsRows, "longitude", gps.lng.toFixed(6));
    push(gpsRows, "altitude", raw.GPSAltitude ?? raw.altitude);
    if (raw.GPSLatitudeRef || raw.GPSLongitudeRef) {
      push(
        gpsRows,
        "gpsRef",
        [raw.GPSLatitudeRef, raw.GPSLongitudeRef].filter(Boolean).join(" / "),
      );
    }
  }

  push(otherRows, "artist", raw.Artist ?? raw.creator);
  push(otherRows, "copyright", raw.Copyright ?? raw.rights);
  push(otherRows, "description", raw.ImageDescription ?? raw.description);
  push(otherRows, "keywords", raw.Keywords ?? raw.subject);

  const known = new Set([
    "Make",
    "Model",
    "LensModel",
    "Lens",
    "Software",
    "DateTimeOriginal",
    "CreateDate",
    "ModifyDate",
    "ISO",
    "ISOSpeedRatings",
    "FNumber",
    "ExposureTime",
    "FocalLength",
    "Flash",
    "Orientation",
    "ColorSpace",
    "BitsPerSample",
    "ImageWidth",
    "ImageHeight",
    "ExifImageWidth",
    "ExifImageHeight",
    "latitude",
    "longitude",
    "GPSLatitude",
    "GPSLongitude",
    "GPSLatitudeRef",
    "GPSLongitudeRef",
    "GPSAltitude",
    "altitude",
    "Artist",
    "creator",
    "Copyright",
    "rights",
    "ImageDescription",
    "description",
    "Keywords",
    "subject",
  ]);

  for (const [key, value] of Object.entries(raw)) {
    if (known.has(key)) continue;
    const text = asString(value);
    if (!text || text === "{}" || text === "[]") continue;
    if (otherRows.length >= 40) break;
    otherRows.push({ label: key, value: text });
  }

  return {
    file: fileRows,
    image: imageRows,
    camera: cameraRows,
    gps: gpsRows,
    other: otherRows,
    hasExif:
      cameraRows.length > 0 ||
      gpsRows.length > 0 ||
      Object.keys(raw).length > 0,
    mapUrl: hasGps
      ? `https://www.openstreetmap.org/?mlat=${gps!.lat}&mlon=${gps!.lng}#map=16/${gps!.lat}/${gps!.lng}`
      : null,
    raw: {
      ...raw,
      ...(gps ? { latitude: gps.lat, longitude: gps.lng } : {}),
    },
  };
}
