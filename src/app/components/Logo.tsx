import logoImg from "@/assets/logo.png";

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
        <span style={{ fontSize: size * 0.6, fontWeight: 600, color: "var(--app-text)", letterSpacing: "-0.02em" }}>
          Friend<span style={{ color: "#5B88B2" }}>IA</span>
        </span>
      )}
    </div>
  );
}
