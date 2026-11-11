export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  details?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sustainabilityLabel?: string;
  categoryId: string;
  category?: Category;
  isFeatured: boolean;
  isBestseller: boolean;
  rating: number;
  reviewCount: number;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  paymentStatus: string;
  orderStatus: string;
  items: OrderItem[];
  createdAt: string;
}

export interface Donation {
  id: string;
  donationNumber: string;
  fullName: string;
  status: string;
  city: string;
  clothingCategory: string;
  itemCount: number;
  createdAt: string;
}

export interface FlowerCollection {
  id: string;
  requestNumber: string;
  fullName: string;
  status: string;
  flowerSource: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface WebsiteContent {
  id: string;
  key: string;
  section: string;
  title?: string;
  subtitle?: string;
  image?: string;
  content?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
