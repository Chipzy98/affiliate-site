export type Product = {
  id: number;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  price: string;
  original_price: string;
  rating: number | null;
  store: string;
  category: string;
  affiliate_url: string;
  featured: boolean;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

/** Fields needed to show a product card (keeps public pages light). */
export type ProductCardData = Pick<
  Product,
  "id" | "slug" | "title" | "image_url" | "price" | "original_price" | "rating" | "store" | "category"
>;
