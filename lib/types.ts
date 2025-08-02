// /lib/types.ts

// Import official Cloudinary types for best practice
import type {
  CloudinaryUploadWidgetResults,
  CloudinaryUploadWidgetError
} from 'next-cloudinary';

// =================================================================
// E N U M S  &  L I T E R A L   T Y P E S (Single Source of Truth)
// =================================================================

export type ProductStatus = "LISTED" | "SOLD" | "RENTED";
export type ProductType = "NEW" | "USED" | "RENT" | "SERVICE";
export type ProductSeasonality = "NONE" | "HALL_DAYS" | "PLACEMENTS" | "SEMESTER_END" | "FRESHERS" | "FESTIVE";
export type KGPHalls = "RK" | "RP" | "MS" | "LLR" | "MMM" | "LBS" | "AZAD" | "PATEL" | "NEHRU" | "SNIG" | "SNVH" | "MT";
export type ProductCategory = "ELECTRONICS" | "BOOKS" | "CLOTHING" | "FURNITURE" | "SPORTS" | "VEHICLES" | "FOOD" | "STATIONERY" | "OTHER";
export type ServiceCategory = "TUTORING" | "REPAIR" | "DELIVERY" | "CLEANING" | "PHOTOGRAPHY" | "CODING" | "DESIGN" | "CONSULTING" | "OTHER";
export type AdminRole = "MODERATOR" | "ADMIN" | "SUPER_ADMIN";


// =================================================================
// D A T A   M O D E L S (Client-Facing)
// These interfaces model data after it has been serialized for the client.
// `createdAt` and `updatedAt` are strings to prevent type errors in components.
// =================================================================

// Base User interface
export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  mobileNumber?: string | null;
  createdAt: string; // Corrected to string
  updatedAt: string; // Corrected to string
  isBlocked: boolean;
}

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
  createdAt: string; // Corrected to string
  updatedAt: string; // Corrected to string
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
  createdAt: string; // Corrected to string
  updatedAt: string; // Corrected to string
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
  createdAt: string; // Corrected to string
  updatedAt: string; // Corrected to string
  ownerId: string;
  owner: User;
}

export interface FilterState {
  category: string
  hall: string
  type: string
  status: string
  seasonality: string
  condition: string
  maxPrice: number
  search: string
  sort: string
}
// =================================================================
// A P I   R E S P O N S E S  &  E X T E N D E D   T Y P E S
// =================================================================

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
  products: Product[];
  services: Service[];
  demands: Demand[];
  _count: {
    products: number;
    services: number;
    demands: number;
  };
}


// =================================================================
// F O R M   D A T A
// Using stricter types for form data to improve validation and consistency.
// =================================================================

export interface ProductFormData {
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  productType: ProductType;
  condition: string;
  ageInMonths: string;
  category: ProductCategory;
  addressHall: KGPHalls;
  mobileNumber: string;
  ecommerceLink: string;
  seasonality: ProductSeasonality;
  images: string[];
}

export interface ServiceFormData {
  title: string;
  description: string;
  minPrice: string;
  maxPrice: string;
  category: ServiceCategory;
  addressHall: KGPHalls;
  mobileNumber: string;
  experienceYears: string;
  portfolioUrl: string;
  images: string[];
}

export interface DemandFormData {
  title: string;
  description: string;
  productCategory: ProductCategory | ""; // Allow empty for initial state
  serviceCategory: ServiceCategory | ""; // Allow empty for initial state
  mobileNumber: string;
}


// =================================================================
// T H I R D - P A R T Y   T Y P E S
// =================================================================

export type CloudinaryResult = CloudinaryUploadWidgetResults;
export type CloudinaryError = CloudinaryUploadWidgetError;

