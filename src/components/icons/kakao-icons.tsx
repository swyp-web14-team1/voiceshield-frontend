const ICON_SIZE = "1.5em";

export function ChatBubbleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ width: ICON_SIZE, height: ICON_SIZE }}
    >
      <path d="M12 3C6.477 3 2 6.582 2 11c0 2.775 1.79 5.222 4.5 6.66-.146.55-.94 3.29-.97 3.5 0 0-.02.16.086.222a.29.29 0 0 0 .225.02c.297-.04 3.44-2.25 4.02-2.66.7.1 1.42.16 2.14.16 5.523 0 10-3.582 10-8s-4.477-8-10-8Z" />
    </svg>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ width: ICON_SIZE, height: ICON_SIZE }}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
