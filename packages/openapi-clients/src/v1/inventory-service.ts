export type InventoryServiceOperationId =
  | "inventoryHealth"
  | "getInventory"
  | "addStock"
  | "reserveStock";

export type InventoryServiceOperation = {
  id: string;
  method: string;
  path: string;
  summary: string;
};

export const InventoryServiceOperations: InventoryServiceOperation[] = [
  { id: "inventoryHealth", method: "GET", path: "/health", summary: "Health check" },
  { id: "getInventory", method: "GET", path: "/inventory/{productId}", summary: "Get inventory" },
  { id: "addStock", method: "POST", path: "/inventory/add-stock", summary: "Add stock" },
  { id: "reserveStock", method: "POST", path: "/inventory/reserve", summary: "Reserve stock" },
];

