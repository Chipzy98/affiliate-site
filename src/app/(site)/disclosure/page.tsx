import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Affiliate disclosure" };

export default function DisclosurePage() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Affiliate disclosure</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-slate-700">
        <p>
          {site.name} is reader-supported. Some links on this website are affiliate links. If you click one and make a
          purchase, we may earn a small commission from the store. This does not change the price you pay.
        </p>
        <p>
          <strong>As an Amazon Associate I earn from qualifying purchases.</strong> We also take part in affiliate
          programs from other stores such as AliExpress and eBay.
        </p>
        <p>
          Prices and availability shown on this site were correct when the product was added and can change at any
          time. The price shown on the store&apos;s website at the time of purchase is the one that applies.
        </p>
      </div>
    </div>
  );
}
