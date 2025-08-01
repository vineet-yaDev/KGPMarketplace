// Base User interface
export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  mobileNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  isBlocked: boolean;
}

// Enum types matching Prisma schema
export type ProductStatus = "LISTED" | "SOLD" | "RENTED";
export type ProductType = "NEW" | "USED" | "RENT" | "SERVICE";
export type ProductSeasonality = "NONE" | "HALL_DAYS" | "PLACEMENTS" | "SEMESTER_END" | "FRESHERS" | "FESTIVE";
export type KGPHalls = "RK" | "RP" | "MS" | "LLR" | "MMM" | "LBS" | "AZAD" | "PATEL" | "NEHRU" | "SNIG" | "SNVH" | "MT";
export type ProductCategory = "ELECTRONICS" | "BOOKS" | "CLOTHING" | "FURNITURE" | "SPORTS" | "VEHICLES" | "FOOD" | "STATIONERY" | "OTHER";
export type ServiceCategory = "TUTORING" | "REPAIR" | "DELIVERY" | "CLEANING" | "PHOTOGRAPHY" | "CODING" | "DESIGN" | "CONSULTING" | "OTHER";

// Product interface
export interface Product {
  id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  originalPrice?: number | null;
  productType: ProductType;
  status: ProductStatus;
  condition: number;
  ageInMonths?: number | null;
  addressHall?: KGPHalls | null;
  mobileNumber?: string | null;
  ecommerceLink?: string | null;
  invoiceImageUrl?: string | null;
  seasonality: ProductSeasonality;
  category: ProductCategory;
  images: string[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: User;
}

// Service interface
export interface Service {
  id: string;
  title: string;
  description?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  addressHall?: KGPHalls | null;
  portfolioUrl?: string | null;
  experienceYears?: number | null;
  mobileNumber?: string | null;
  category: ServiceCategory;
  images: string[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: User;
}

// Demand interface
export interface Demand {
  id: string;
  title: string;
  description?: string | null;
  mobileNumber?: string | null;
  productCategory?: ProductCategory | null;
  serviceCategory?: ServiceCategory | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: User;
}

// API Response types
export interface ProductsResponse {
  products: Product[];
}

export interface ServicesResponse {
  services: Service[];
}

export interface DemandsResponse {
  demands: Demand[];
}

export interface ProductDetailResponse {
  product: Product;
  similarProducts: Product[];
  relatedServices: Service[];
}

export interface ServiceDetailResponse {
  service: Service;
  similarServices: Service[];
  relatedProducts: Product[];
}

export interface DemandDetailResponse {
  demand: Demand;
}

export interface UserWithListings extends User {
  products: Product[]
  services: Service[]
  demands: Demand[]
  _count: {
    products: number
    services: number
    demands: number
  }
}
