// /lib/constants.ts

// Import all required types from the single source of truth: /lib/types.ts
import type { 
  KGPHalls, 
  ProductCategory, 
  ServiceCategory, 
  ProductType, 
  ProductSeasonality, 
  ProductStatus,
  AdminRole
} from './types';

import {
  Smartphone,
  BookOpen,
  PenTool,
  Dumbbell,
  Armchair,
  Home,
  Bike,
  Shirt,
  Ticket,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Trophy,
  Handshake,
  Brush,
  Code,
  Store,
} from 'lucide-react'

// =================================================================
// I C O N   M A P P I N G S
// =================================================================

export const PRODUCT_CATEGORY_ICONS: Record<ProductCategory, React.ReactNode> = {
  ELECTRONICS: <Smartphone size={48} />,
  BOOKS: <BookOpen size={48} />,
  STATIONERY: <PenTool size={48} />,
  FURNITURE: <Armchair size={48} />,
  HOUSEHOLD: <Home size={48} />,
  SPORTS: <Dumbbell size={48} />,
  CYCLE: <Bike size={48} />,
  APPAREL: <Shirt size={48} />,
  TICKETS: <Ticket size={48} />,
  OTHER: <AlertCircle size={48} />,
}

export const SERVICE_CATEGORY_ICONS: Record<ServiceCategory, React.ReactNode> = {
  ACADEMICS: <GraduationCap size={48} />,
  CAREERS: <Briefcase size={48} />,
  COMPETITION: <Trophy size={48} />,
  FREELANCING: <Handshake size={48} />,
  DESIGN: <Brush size={48} />,
  CODING: <Code size={48} />,
  VENDORS: <Store size={48} />,
  OTHER: <AlertCircle size={48} />,
}

// =================================================================
// T E X T   M A P P I N G S
// =================================================================

export const CONDITION_TEXT_MAP: Record<number, string> = {
  1: 'Poor',
  2: 'Fair', 
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
}

export const PRODUCT_TYPE_TEXT_MAP: Record<ProductType, string> = {
  'NEW': 'Brand New',
  'USED': 'Used',
  'RENT': 'For Rent',
  'SERVICE': 'Service'
}

export const SEASONALITY_TEXT_MAP: Record<ProductSeasonality, string> = {
  'NONE': 'Year Round',
  'HALL_DAYS': 'Hall Days',
  'PLACEMENTS': 'Placement Season',
  'SEMESTER_END': 'Semester End',
  'FRESHERS': 'Freshers',
  'FESTIVE': 'Festive Season'
}

export const SERVICE_CATEGORY_TEXT_MAP: Record<ServiceCategory, string> = {
  'ACADEMICS': 'Academics',
  'CAREERS': 'Careers',
  'COMPETITION': 'Competition',
  'FREELANCING': 'Freelancing',
  'DESIGN': 'Design',
  'CODING': 'Coding',
  'VENDORS': 'Vendors',
  'OTHER': 'Other'
}

// =================================================================
// E N U M   C O N S T A N T S
// =================================================================

export const HALLS: readonly KGPHalls[] = [
  'RK', 'RP', 'LBS', 'AZAD', 'HJB', 'MT', 'PATEL', 'VS', 'BCR', 'SNVH', 'SNIG', 
  'ABV', 'MMM', 'BRH', 'JCB', 'GKH', 'RLB', 'NEHRU', 'LLR', 'SBP', 'MS', 'ZH', 
  'GOKHALE', 'VSRC', 'SAM', 'OTHER'
];

export const HALL_OPTIONS: { value: KGPHalls; label: string }[] = HALLS.map(hall => ({
  value: hall,
  label: hall === 'OTHER' ? 'Other' : hall
}));

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  'ELECTRONICS', 'BOOKS', 'STATIONERY', 'FURNITURE', 'HOUSEHOLD', 'SPORTS', 'CYCLE', 'APPAREL', 'TICKETS', 'OTHER'
];

export const PRODUCT_CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = PRODUCT_CATEGORIES.map(category => ({
  value: category,
  label: category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ')
}));

export const SERVICE_CATEGORIES: readonly ServiceCategory[] = [
  'ACADEMICS', 'CAREERS', 'COMPETITION', 'FREELANCING', 'DESIGN', 'CODING', 'VENDORS', 'OTHER'
];

export const SERVICE_CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = SERVICE_CATEGORIES.map(category => ({
  value: category,
  label: category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ')
}));

export const PRODUCT_TYPES: readonly { value: ProductType; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'USED', label: 'Used' },
  { value: 'RENT', label: 'For Rent' },
  { value: 'SERVICE', label: 'Service' }
];

export const SEASONALITIES: readonly { value: ProductSeasonality; label: string }[] = [
  { value: 'NONE', label: 'None' },
  { value: 'HALL_DAYS', label: 'Hall Days' },
  { value: 'PLACEMENTS', label: 'Placements' },
  { value: 'SEMESTER_END', label: 'Semester End' },
  { value: 'FRESHERS', label: 'Freshers' },
  { value: 'FESTIVE', label: 'Festive' }
];

export const PRODUCT_STATUSES: readonly { value: ProductStatus; label: string }[] = [
  { value: 'LISTED', label: 'Listed' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'RENTED', label: 'Rented' }
];

export const CONDITION_OPTIONS: readonly { value: number; label: string }[] = [
  { value: 5, label: '5 - Excellent (Like new)' },
  { value: 4, label: '4 - Very Good (Minimal wear)' },
  { value: 3, label: '3 - Good (Light wear)' },
  { value: 2, label: '2 - Fair (Visible wear)' },
  { value: 1, label: '1 - Poor (Heavy wear, issues)' }
];

export const EXPERIENCE_RANGES: readonly { value: string; label: string; min: number; max: number }[] = [
  { value: '0-1', label: 'Less than 1 year', min: 0, max: 1 },
  { value: '1-3', label: '1-3 years', min: 1, max: 3 },
  { value: '3-5', label: '3-5 years', min: 3, max: 5 },
  { value: '5+', label: '5+ years', min: 5, max: 100 }
];

export const ADMIN_ROLES: readonly AdminRole[] = [
  'MODERATOR', 'ADMIN', 'SUPER_ADMIN'
];

// =================================================================
// V A L I D A T I O N  &  C O N F I G
// =================================================================

export const VALIDATION = {
  MOBILE_NUMBER_REGEX: /^\d{10}$/,
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_IMAGES_PER_LISTING: 5,
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000
} as const;

export const CLOUDINARY_OPTIONS = {
  maxFiles: VALIDATION.MAX_IMAGES_PER_LISTING,
  resourceType: "image",
  clientAllowedFormats: VALIDATION.SUPPORTED_IMAGE_FORMATS,
  maxFileSize: VALIDATION.MAX_IMAGE_SIZE_BYTES,
  cropping: false,
  multiple: true,
  defaultSource: "local",
} as const;

// Default values for forms or database seeding
export const DEFAULT_VALUES = {
  PRODUCT_TYPE: 'USED' as ProductType,
  PRODUCT_STATUS: 'LISTED' as ProductStatus,
  CONDITION: 3,
  SEASONALITY: 'NONE' as ProductSeasonality,
  PRODUCT_CATEGORY: 'OTHER' as ProductCategory,
  SERVICE_CATEGORY: 'OTHER' as ServiceCategory,
  ADMIN_ROLE: 'MODERATOR' as AdminRole,
} as const;

export const formatEnumName = (value: string) => {
  return value.replace(/_/g, ' ');
};

