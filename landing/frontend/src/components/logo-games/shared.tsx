import { ASSETS } from '../../constants/brand';

export const LOGO_SRC = ASSETS.navLogo;

export function LogoImage({
  className = '',
  size = 120,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <img
      src={LOGO_SRC}
      alt="Hopiin"
      className={`lg-logo-img ${className}`}
      width={size}
      height={size}
      draggable={false}
      decoding="async"
    />
  );
}

export function polarXY(angleDeg: number, radius: number, cx: number, cy: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}
