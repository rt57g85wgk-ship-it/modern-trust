interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  variant?: "default" | "light";
}

export function Logo({ className = "", showWordmark = true, variant = "default" }: LogoProps) {
  const navy = variant === "light" ? "#FFFFFF" : "#0D1B2A";
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M8 22 L24 8 L40 22 V40 H8 Z" stroke={navy} strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="20" y="26" width="8" height="14" stroke={navy} strokeWidth="2" />
        <circle cx="13" cy="30" r="2" fill="#2563EB" />
        <circle cx="9" cy="36" r="1.5" fill="#06B6D4" />
        <path d="M13 30 L18 33" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
        <path d="M11 36 L13 30" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 22 L34 26 L42 18" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight" style={{ color: navy }}>
            Modern<span className="text-brand-blue"> Trust</span>
          </span>
          <span className="text-[9px] font-medium tracking-[0.2em] text-muted-foreground">RENTAL PLATFORM</span>
        </div>
      )}
    </div>
  );
}
