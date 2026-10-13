export const MAX_EMAIL_QUANTITY = 100;

/** Domínios reservados para exemplo e teste (RFC 2606 / RFC 6761). */
export const PRESET_DOMAINS = [
  "example.com",
  "example.org",
  "example.net",
  "example.test",
] as const;

export type PresetDomain = (typeof PRESET_DOMAINS)[number];

export const EMAIL_FORMATS = [
  "nome.sobrenome",
  "nome_sobrenome",
  "inicial.sobrenome",
  "nome.numero",
  "aleatorio",
] as const;

export type EmailFormat = (typeof EMAIL_FORMATS)[number];

export class InvalidEmailDomainError extends Error {
  constructor() {
    super("invalid-domain");
    this.name = "InvalidEmailDomainError";
  }
}

const FIRST_NAMES = [
  "ana",
  "bruno",
  "carla",
  "diego",
  "elena",
  "felipe",
  "gabriela",
  "henrique",
  "isabela",
  "joao",
  "karen",
  "lucas",
  "mariana",
  "nicolas",
  "olivia",
  "pedro",
  "rafael",
  "sofia",
  "thiago",
  "vanessa",
  "camila",
  "eduardo",
  "fernanda",
  "gustavo",
  "helena",
  "igor",
  "julia",
  "larissa",
  "marcos",
  "beatriz",
  "caio",
  "daniela",
  "francisco",
  "patricia",
  "renato",
  "tatiane",
] as const;

const LAST_NAMES = [
  "silva",
  "souza",
  "oliveira",
  "santos",
  "pereira",
  "lima",
  "costa",
  "ferreira",
  "rodrigues",
  "almeida",
  "nascimento",
  "araujo",
  "ribeiro",
  "carvalho",
  "gomes",
  "martins",
  "rocha",
  "barbosa",
  "dias",
  "moreira",
  "cardoso",
  "teixeira",
  "correia",
  "monteiro",
  "mendes",
  "freitas",
  "pinto",
  "azevedo",
  "duarte",
  "fonseca",
] as const;

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const ALNUM = `${LETTERS}0123456789`;

const LABEL = "(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)";
const DOMAIN_RE = new RegExp(`^${LABEL}(?:\\.${LABEL})+$`);

const RESERVED_PARENTS = ["example.com", "example.org", "example.net"] as const;
const RESERVED_SUFFIXES = new Set(["example", "test", "invalid", "localhost"]);

export type EmailRandom = {
  /** Inteiro em [0, max). */
  int: (max: number) => number;
};

export function createRandom(): EmailRandom {
  return {
    int(max: number) {
      if (max <= 1) return 0;
      const cryptoObj = globalThis.crypto;
      if (cryptoObj?.getRandomValues) {
        const buf = new Uint32Array(1);
        cryptoObj.getRandomValues(buf);
        return buf[0] % max;
      }
      return Math.floor(Math.random() * max);
    },
  };
}

export function normalizeDomain(raw: string): string | null {
  let value = raw.trim().toLowerCase();
  if (!value) return null;

  value = value.replace(/^https?:\/\//, "");
  value = value.replace(/\/.*$/, "");
  value = value.replace(/:\d+$/, "");

  if (value.includes("@")) {
    const parts = value.split("@");
    value = parts[parts.length - 1] ?? "";
    value = value.replace(/:\d+$/, "");
  }

  value = value.replace(/\.+$/, "");
  if (!value || value.length > 253) return null;
  if (value === "localhost") return value;
  if (!DOMAIN_RE.test(value)) return null;
  return value;
}

export function isReservedTestDomain(domain: string): boolean {
  const normalized = normalizeDomain(domain);
  if (!normalized) return false;
  if (normalized === "localhost") return true;
  if (
    RESERVED_PARENTS.some(
      (parent) => normalized === parent || normalized.endsWith(`.${parent}`),
    )
  ) {
    return true;
  }
  const suffix = normalized.split(".").pop();
  return suffix !== undefined && RESERVED_SUFFIXES.has(suffix);
}

function pick<T>(items: readonly T[], random: EmailRandom): T {
  return items[random.int(items.length)] as T;
}

function localPart(format: EmailFormat, random: EmailRandom): string {
  const first = pick(FIRST_NAMES, random);
  const last = pick(LAST_NAMES, random);

  switch (format) {
    case "nome.sobrenome":
      return `${first}.${last}`;
    case "nome_sobrenome":
      return `${first}_${last}`;
    case "inicial.sobrenome":
      return `${first[0]}.${last}`;
    case "nome.numero":
      return `${first}.${1000 + random.int(9000)}`;
    case "aleatorio": {
      const length = 8 + random.int(5);
      let value = LETTERS[random.int(LETTERS.length)] ?? "a";
      for (let i = 1; i < length; i += 1) {
        value += ALNUM[random.int(ALNUM.length)] ?? "x";
      }
      return value;
    }
    default:
      return `${first}.${last}`;
  }
}

function uniqueLocal(
  format: EmailFormat,
  random: EmailRandom,
  used: Set<string>,
  index: number,
): string {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = localPart(format, random);
    if (!used.has(candidate)) return candidate;
  }

  const base = localPart(format, random);
  let n = index + 1;
  let candidate = `${base}${n}`;
  while (used.has(candidate)) {
    n += 1;
    candidate = `${base}${n}`;
  }
  return candidate;
}

export type GenerateEmailsInput = {
  quantity?: number;
  domain?: string;
  format?: EmailFormat;
  random?: EmailRandom;
};

export function clampEmailQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_EMAIL_QUANTITY, Math.max(1, Math.trunc(quantity)));
}

export function generateEmails(input: GenerateEmailsInput = {}): string[] {
  const domain = normalizeDomain(input.domain ?? "example.com");
  if (!domain) throw new InvalidEmailDomainError();

  const format = input.format ?? "nome.sobrenome";
  const quantity = clampEmailQuantity(input.quantity ?? 1);
  const random = input.random ?? createRandom();
  const used = new Set<string>();
  const emails: string[] = [];

  for (let i = 0; i < quantity; i += 1) {
    const local = uniqueLocal(format, random, used, i);
    used.add(local);
    emails.push(`${local}@${domain}`);
  }

  return emails;
}
