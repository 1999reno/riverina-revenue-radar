type Props = { className?: string; size?: number };

export const Logo = ({ className, size = 28 }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Telios Riverina Revenue Radar"
    className={className}
  >
    <rect width="32" height="32" rx="6" fill="hsl(var(--sidebar))" />
    <path
      d="M7 23 L16 7 L25 23 Z"
      fill="none"
      stroke="hsl(var(--sidebar-primary))"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="17" r="2.2" fill="hsl(var(--sidebar-primary))" />
    <path
      d="M11 19 L21 19"
      stroke="hsl(var(--sidebar-primary))"
      strokeOpacity="0.55"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);
