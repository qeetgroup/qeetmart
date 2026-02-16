// API contracts and DTOs

// Product contracts
export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl?: string;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  imageUrl?: string;
}

// Order contracts
export interface OrderDTO {
  id: string;
  userId: string;
  items: OrderItemDTO[];
  total: number;
  status: OrderStatus;
  shippingAddress: AddressDTO;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemDTO {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CreateOrderDTO {
  userId: string;
  items: CreateOrderItemDTO[];
  shippingAddress: AddressDTO;
}

export interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// User contracts
export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
}

export type UserRole = 'customer' | 'admin' | 'seller';

// Payment contracts
export interface PaymentDTO {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  createdAt: Date;
}

export interface CreatePaymentDTO {
  orderId: string;
  amount: number;
  method: PaymentMethod;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';

// Inventory contracts
export interface InventoryDTO {
  productId: string;
  quantity: number;
  reserved: number;
  available: number;
  lastUpdated: Date;
}

export interface UpdateInventoryDTO {
  quantity?: number;
  reserved?: number;
}

// Common contracts
export interface AddressDTO {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
