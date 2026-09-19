/** Brand marks — lucide-react no longer ships these, so they live here as inline SVGs. */
type IconProps = { className?: string };

export function Instagram({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Youtube({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 12c0-2.6.3-4.4.6-5.3.3-.8.9-1.4 1.7-1.6C6.3 4.7 9 4.5 12 4.5s5.7.2 7.2.6c.8.2 1.4.8 1.7 1.6.3.9.6 2.7.6 5.3s-.3 4.4-.6 5.3c-.3.8-.9 1.4-1.7 1.6-1.5.4-4.2.6-7.2.6s-5.7-.2-7.2-.6c-.8-.2-1.4-.8-1.7-1.6-.3-.9-.6-2.7-.6-5.3Z" />
      <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Facebook({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" />
    </svg>
  );
}
