type ProductSchema = {
  name: string;
  price: number;
  description: string;
  image: string;
  stockQuantity: number;
};

type ProductSearchQuery = {
  price: number;
  stockQ: number; // stockQuantity
  page: number;
  resPerPage: number; // resultsPerPage
  sort: string;
};

export type { ProductSchema, ProductSearchQuery };
