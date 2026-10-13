type AdSlotProps = {
  label?: string;
  size: "leaderboard" | "rectangle" | "skyscraper";
  className?: string;
  /** Mostra o retângulo tracejado de preview. Padrão: oculto. */
  preview?: boolean;
};

const SIZE_CLASS = {
  leaderboard: "min-h-[90px] w-full max-w-[728px]",
  rectangle: "min-h-[250px] w-full max-w-[300px]",
  skyscraper: "min-h-[600px] w-full max-w-[160px]",
} as const;

/**
 * Slot de anúncio.
 * Por padrão fica invisível e sem ocupar layout.
 * Passe `preview` para ver o espaço, ou injete o ad real como children depois.
 */
export function AdSlot({
  label = "Espaço para anúncio",
  size,
  className = "",
  preview = false,
  children,
}: AdSlotProps & { children?: React.ReactNode }) {
  if (!preview && !children) return null;

  return (
    <div
      aria-hidden={!children}
      className={`${SIZE_CLASS[size]} ${
        preview && !children
          ? "mx-auto flex items-center justify-center rounded-lg border border-dashed border-stone-300/80 bg-stone-100/60 text-[11px] font-medium tracking-wide text-stone-400 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-600"
          : "mx-auto"
      } ${className}`}
    >
      {children ?? label}
    </div>
  );
}
