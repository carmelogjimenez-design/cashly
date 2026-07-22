/* eslint-disable @next/next/no-img-element */

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "text" | "image";
  className?: string;
};

const textSizes: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
  xl: "text-7xl",
};

const imageSizes: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 40,
  md: 64,
  lg: 128,
  xl: 168,
};

// Logotipo de Cashly. Por defecto usa el logo real (imagen);
// la variante "text" es un respaldo tipográfico.
export default function Logo({
  size = "md",
  variant = "image",
  className = "",
}: LogoProps) {
  if (variant === "text") {
    return (
      <span
        className={`font-display font-bold tracking-tight text-yellow ${textSizes[size]} ${className}`}
      >
        Cashly
      </span>
    );
  }

  const px = imageSizes[size];
  return (
    <img
      src="/logo.png"
      alt="Cashly"
      width={px}
      height={px}
      className={`rounded-[28%] shadow-[0_16px_40px_-12px_rgba(7,26,58,0.5)] ${className}`}
      style={{ width: px, height: px }}
    />
  );
}
