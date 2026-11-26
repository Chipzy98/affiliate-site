import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-6 text-center">
      <div>
        <span className="price-tag text-4xl">404</span>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">This page isn&apos;t here</h1>
        <p className="mx-auto mt-2 max-w-sm text-muted">The deal may have ended, or the link has a typo.</p>
        <Link href="/products" className="btn-primary mt-7 px-6 py-3">
          See all deals
        </Link>
      </div>
    </div>
  );
}
