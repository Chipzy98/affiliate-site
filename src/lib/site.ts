export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "DealHub",
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || "Hand-picked deals from Amazon & more",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
};

/** Stores offered in the admin form (you can still type any other store name). */
export const STORES = ["Amazon", "AliExpress", "eBay", "Walmart", "Daraz", "Temu", "Etsy", "Other"];
