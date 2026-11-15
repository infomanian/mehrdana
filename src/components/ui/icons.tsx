import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 15a3 3 0 0 1-3 3H8l-4 3V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.9M17.5 14.3A6 6 0 0 1 21 20" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
    </svg>
  );
}

export function TicketIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3.5a1.5 1.5 0 0 0 0-3z" />
      <path d="M12 8v8" strokeDasharray="2 2.5" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5.5-5.5 2 2-5.5z" />
    </svg>
  );
}

export function OfflineIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8.5A15 15 0 0 1 12 6a15 15 0 0 1 8 2.5" />
      <path d="M7 12.5A10 10 0 0 1 12 11a10 10 0 0 1 5 1.5" />
      <path d="M9.5 16.5a5 5 0 0 1 5 0" />
      <path d="M12 20h.01" />
      <path d="m3 3 18 18" />
    </svg>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="40" height="40" rx="11" fill="currentColor" />
      <circle cx="20" cy="20" r="9.5" stroke="white" strokeOpacity="0.35" strokeWidth="2" fill="none" />
      <circle cx="20" cy="20" r="4.4" fill="#E85D4A" />
      <circle cx="20" cy="10.5" r="2.1" fill="white" fillOpacity="0.9" />
      <circle cx="29.5" cy="20" r="2.1" fill="white" fillOpacity="0.55" />
      <circle cx="20" cy="29.5" r="2.1" fill="white" fillOpacity="0.55" />
    </svg>
  );
}
