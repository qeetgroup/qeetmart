export type ProductServiceOperationId =
  | "productHealth"
  | "listProducts"
  | "createProduct"
  | "getProduct"
  | "updateProduct"
  | "deleteProduct";

export type ProductServiceOperation = {
  id: string;
  method: string;
  path: string;
  summary: string;
};

export const ProductServiceOperations: ProductServiceOperation[] = [
  { id: "productHealth", method: "GET", path: "/actuator/health", summary: "Health check" },
  { id: "listProducts", method: "GET", path: "/products", summary: "List products" },
  { id: "createProduct", method: "POST", path: "/products", summary: "Create product" },
  { id: "getProduct", method: "GET", path: "/products/{productId}", summary: "Get product" },
  { id: "updateProduct", method: "PUT", path: "/products/{productId}", summary: "Update product" },
  { id: "deleteProduct", method: "DELETE", path: "/products/{productId}", summary: "Delete product" },
];

