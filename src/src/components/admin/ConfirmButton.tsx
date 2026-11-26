"use client";

import { useFormStatus } from "react-dom";

/** Submit button that asks "Are you sure?" first. */
export default function ConfirmButton({
  message,
  children,
  className = "btn-danger",
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
