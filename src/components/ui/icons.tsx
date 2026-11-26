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

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function VideoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="13" height="12" rx="3" />
      <path d="m16 10 5-3v10l-5-3z" />
    </svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="10" width="16" height="10" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v2" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8 6 4-6 4z" />
    </svg>
  );
}

/**
 * The brand emblem on its own. The full logo file also contains the wordmark and
 * the tagline; the header renders those as real text so they stay legible at any
 * size. `viewBox` is cropped to the emblem paths only.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      id="brand-mark"
      viewBox="142.8 47.5 187.8 196.5"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path fill="#06253e" d="M280.82,99.86l.02-1.07v.67c0,.14-.02.27-.02.4Z"/>
      <path fill="#06253e" d="M196.02,47.51h50.96v6.81c0,13.76-11.15,24.92-24.91,24.92h-28.84c-10.32,0-18.7,8.36-18.7,18.7v30.75c0,11.21,6.98,20.79,16.84,24.61-.21,1.88-.31,3.78-.31,5.71l.19,27.49c-27.25-2.96-48.45-26.04-48.45-54.06v-31.73c0-29.38,23.84-53.2,53.22-53.2h0Z"/>
      <path fill="#06253e" d="M280.84,99.24v6.78c-1.58-.14-3.2-.21-4.82-.21h-26.66l.05-33.3c29.81,0,31.34,24.13,31.42,26.73h.01Z"/>
      <path fill="#06253e" d="M280.91,132.35c0,.95-.02,1.89-.07,2.84v-35.72l.02,6.55.05,26.33Z"/>
      <path fill="#06253e" d="M280.85,106.01h-.02v29.17c-.07,1.24-.16,2.46-.31,3.68,10.54,3.46,18.15,13.38,18.15,25.08v21.98c0,14.57-11.8,26.39-26.35,26.4l-33.25.05c-8.98.02-16.27-7.26-16.27-16.24v-9.31h-25.61c-2.01,0-3.99-.1-5.93-.33l.1,16.12c.15,22.89,18.8,41.37,41.69,41.31l45.7-.1c28.76-1.43,51.65-25.2,51.65-54.32v-29.33c0-28.4-21.78-51.72-49.55-54.18v.02Z"/>
      <path fill="#00a69c" d="M276.02,105.81h-31.73c-27.47,0-50.07,20.79-52.91,47.51-.21,1.88-.31,3.78-.31,5.71l.19,27.49c1.94.22,3.92.33,5.93.33h29.33c27.88,0,50.84-20.97,54.01-47.97.15-1.22.24-2.44.31-3.68v-29.17c-1.58-.14-3.2-.21-4.82-.21h0ZM247.81,145.53c-.02.33-.04.65-.08.97-.84,7.14-6.9,12.67-14.27,12.67h-7.75c-.53,0-1.05-.03-1.57-.09l-.05-7.26c0-.51.03-1.01.08-1.51.75-7.06,6.72-12.55,13.98-12.55h8.38c.43,0,.85.02,1.27.05v7.71h.01Z"/>
    </svg>
  );
}
