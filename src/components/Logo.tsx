type LogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
};

// Logotipo tipográfico de Cashly (amarillo sobre cian, redondeado y bold).
export default function Logo({ size = "md", className = "" }: LogoProps) {
  return (
    <span
      className={`font-display font-bold tracking-tight text-yellow ${sizes[size]} ${className}`}
    >
      Cashly
    </span>
  );
}
