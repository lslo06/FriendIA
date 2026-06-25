import logoImg from "figma:asset/01c21fb0-9201-45ea-a054-5ec5bdc2f330.png";

interface LogoProps {
  size?: number;
  showName?: boolean;
  className?: string;
}

export function Logo({ size = 32, showName = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logoImg} alt="FriendIA logo" width={size} height={size} style={{ objectFit: "contain" }} />
      {showName && (
        <span style={{ fontSize: size * 0.6, fontWeight: 600, color: "#E2E8F0", letterSpacing: "-0.02em" }}>
          Friend<span style={{ color: "#5B88B2" }}>IA</span>
        </span>
      )}
    </div>
  );
}
