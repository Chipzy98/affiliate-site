import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-6xl">🧐</p>
        <h1 className="mt-4 text-2xl font-extrabold">Page not found</h1>
        <p className="mt-2 text-slate-500">This deal may have ended or the link is wrong.</p>
        <Link href="/" className="btn-primary mt-6 rounded-full px-6">
          Back to deals
        </Link>
      </div>
    </div>
  );
}
