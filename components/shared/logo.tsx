interface LogoProps {
  width?: number;
  height?: number;
}

export function Logo({ width = 46, height = 46 }: LogoProps) {
  return (
    <img
      src="/cypher-logo-mini.svg"
      alt="Cypher Logo"
      width={width}
      height={height}
      className="h-auto"
    />
  );
}
