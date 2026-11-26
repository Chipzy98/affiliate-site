type IconProps = { className?: string };

export function SearchIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** Arrow pointing out of the box: "opens the store in a new tab". */
export function ExternalIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 4h6v6" />
      <path d="M20 4 10.5 13.5" />
      <path d="M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
    </svg>
  );
}

export function CheckIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/** The logo mark: a little price tag. */
export function TagMark({ className = "h-9 w-9" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden>
      <rect width="40" height="40" rx="11" fill="#2f3beb" />
      <path d="M13 12h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H13l-5-8z" fill="#ffd23f" />
      <circle cx="13.5" cy="20" r="1.8" fill="#2f3beb" />
    </svg>
  );
}
