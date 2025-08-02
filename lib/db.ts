// /lib/db.ts

import { prisma } from '@/lib/prisma';
import type { User, Product, Service, Demand, KGPHalls, ProductType, ProductCategory, ServiceCategory } from '@prisma/client';
import { DEFAULT_VALUES } from '@/lib/constants';

// =================================================================
// H E L P E R S  &  C O N S T A N T S
// =================================================================

function generateInitials(email?: string | null): string {
  if (!email) return "NA";
  const emailParts = email.split("@")[0];
  const nameParts = emailParts.split(".");
  if (nameParts.length >= 2) {
    return nameParts.map(part => part.charAt(0).toUpperCase()).join("");
  }
  return emailParts.charAt(0).toUpperCase() + (emailParts.charAt(1) || "").toUpperCase();
}

const ownerSelect = {
  select: { name: true, email: true, image: true },
};

// =================================================================
// U S E R   O P E R A T I ONS
// =================================================================

export async function createOrUpdateUser(userData: {
  email: string;
  name?: string | null;
  image?: string | null;
  mobileNumber?: string | null;
}): Promise<User> {
  if (!userData.email || typeof userData.email !== 'string') {
    throw new Error('createOrUpdateUser requires a valid email');
  }
  try {
    const finalName = userData.name || generateInitials(userData.email);
    const updateData: { name?: string; image?: string | null; mobileNumber?: string | null } = {};
    if (userData.name !== undefined) updateData.name = finalName;
    if (userData.image !== undefined) updateData.image = userData.image;
    if (userData.mobileNumber !== undefined) updateData.mobileNumber = userData.mobileNumber;

    return await prisma.user.upsert({
      where: { email: userData.email },
      update: updateData,
      create: {
        email: userData.email,
        name: finalName,
        image: userData.image || null,
        mobileNumber: userData.mobileNumber || null,
        isBlocked: false,
      },
    });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!email) return null;
  try {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        _count: {
          select: { products: true, services: true, demands: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

/** Fetches a single user by ID, including all their listings and counts. */
export async function getUserById(id: string) {
  if (!id) {
    console.warn('No user id provided to getUserById');
    return null;
  }
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        // THIS IS THE FIX: The `ownerSelect` constant must be nested inside an `owner` property.
        products: { include: { owner: ownerSelect }, orderBy: { createdAt: 'desc' } },
        services: { include: { owner: ownerSelect }, orderBy: { createdAt: 'desc' } },
        demands: { include: { owner: ownerSelect }, orderBy: { createdAt: 'desc' } },
        _count: {
          select: { products: true, services: true, demands: true },
        },
      },
    });
  } catch (error) {
    console.log('Error fetching user by ID:', error);
    return null;
  }
}

export async function getAllUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true, services: true, demands: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

// =================================================================
// P R O D U C T   O P E R A T I O N S
// =================================================================

export async function createProduct(userData: {
  email: string;
  title: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  productType?: ProductType;
  condition?: number;
  ageInMonths?: number;
  addressHall?: KGPHalls;
  mobileNumber?: string;
  ecommerceLink?: string;
  invoiceImageUrl?: string;
  category?: ProductCategory;
  images?: string[];
}): Promise<Product> {
  if (!userData.email) {
    throw new Error('Email is required to create product');
  }
  try {
    const user = await createOrUpdateUser({ email: userData.email });
    return await prisma.product.create({
      data: {
        title: userData.title,
        description: userData.description,
        price: userData.price,
        originalPrice: userData.originalPrice,
        productType: userData.productType || DEFAULT_VALUES.PRODUCT_TYPE,
        condition: userData.condition || DEFAULT_VALUES.CONDITION,
        ageInMonths: userData.ageInMonths,
        addressHall: userData.addressHall,
        mobileNumber: userData.mobileNumber,
        ecommerceLink: userData.ecommerceLink,
        invoiceImageUrl: userData.invoiceImageUrl,
        category: userData.category || DEFAULT_VALUES.PRODUCT_CATEGORY,
        images: userData.images || [],
        ownerId: user.id,
      },
      include: { owner: ownerSelect },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: { owner: ownerSelect },
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
}

export async function getProductsByUserEmail(email: string): Promise<Product[]> {
  try {
    const user = await getUserByEmail(email);
    if (!user) return [];
    return await prisma.product.findMany({
      where: { ownerId: user.id },
      include: { owner: ownerSelect },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching user products:', error);
    return [];
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    return await prisma.product.findMany({
      where: { status: 'LISTED' },
      include: { owner: ownerSelect },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

// =================================================================
// S E R V I C E   O P E R A T I O N S
// =================================================================

export async function createService(userData: {
  email: string;
  title: string;
  description?: string;
  minPrice?: number;
  maxPrice?: number;
  addressHall?: KGPHalls;
  portfolioUrl?: string;
  experienceYears?: number;
  mobileNumber?: string;
  category?: ServiceCategory;
  images?: string[];
}): Promise<Service> {
  if (!userData.email) {
    throw new Error('Email is required to create service');
  }
  try {
    const user = await createOrUpdateUser({ email: userData.email });
    return await prisma.service.create({
      data: {
        title: userData.title,
        description: userData.description,
        minPrice: userData.minPrice,
        maxPrice: userData.maxPrice,
        addressHall: userData.addressHall,
        portfolioUrl: userData.portfolioUrl,
        experienceYears: userData.experienceYears,
        mobileNumber: userData.mobileNumber,
        category: userData.category || DEFAULT_VALUES.SERVICE_CATEGORY,
        images: userData.images || [],
        ownerId: user.id,
      },
      include: { owner: ownerSelect },
    });
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

export async function getServiceById(id: string): Promise<Service | null> {
  try {
    return await prisma.service.findUnique({
      where: { id },
      include: { owner: ownerSelect },
    });
  } catch (error) {
    console.error('Error fetching service by ID:', error);
    return null;
  }
}

export async function getServicesByUserEmail(email: string): Promise<Service[]> {
  try {
    const user = await getUserByEmail(email);
    if (!user) return [];
    return await prisma.service.findMany({
      where: { ownerId: user.id },
      include: { owner: ownerSelect },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching user services:', error);
    return [];
  }
}

export async function getAllServices(): Promise<Service[]> {
  try {
    return await prisma.service.findMany({
      include: { owner: ownerSelect },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching all services:', error);
    return [];
  }
}

// =================================================================
// D E M A N D   O P E R A T I O N S
// =================================================================

export type DemandWithOwner = Demand & {
  owner: { name: string | null; email: string; image: string | null; } | null;
};

export async function createDemand(userData: {
  email: string;
  title: string;
  description?: string;
  mobileNumber?: string;
  productCategory?: ProductCategory;
  serviceCategory?: ServiceCategory;
}): Promise<Demand> {
  if (!userData.email) {
    throw new Error('Email is required to create demand');
  }
  try {
    const user = await createOrUpdateUser({ email: userData.email });
    return await prisma.demand.create({
      data: {
        title: userData.title,
        description: userData.description,
        mobileNumber: userData.mobileNumber,
        productCategory: userData.productCategory,
        serviceCategory: userData.serviceCategory,
        ownerId: user.id,
      },
      include: { owner: ownerSelect },
    });
  } catch (error) {
    console.error('Error creating demand:', error);
    throw error;
  }
}

export async function updateDemand(id: string, updateData: {
  title?: string;
  description?: string;
  mobileNumber?: string;
  productCategory?: ProductCategory;
  serviceCategory?: ServiceCategory;
}): Promise<Demand> {
  try {
    return await prisma.demand.update({
      where: { id },
      data: updateData,
      include: { owner: ownerSelect },
    });
  } catch (error) {
    console.error('Error updating demand:', error);
    throw error;
  }
}

export async function deleteDemand(id: string): Promise<void> {
  try {
    await prisma.demand.delete({ where: { id } });
  } catch (error) {
    console.error('Error deleting demand:', error);
    throw error;
  }
}

export async function getDemandById(id: string): Promise<DemandWithOwner | null> {
  try {
    return await prisma.demand.findUnique({
      where: { id },
      include: { owner: ownerSelect },
    });
  } catch (error) {
    console.error('Error fetching demand by ID:', error);
    return null;
  }
}

export async function getDemandsByUserEmail(email: string): Promise<Demand[]> {
  try {
    const user = await getUserByEmail(email);
    if (!user) return [];
    return await prisma.demand.findMany({
      where: { ownerId: user.id },
      include: { owner: ownerSelect },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching user demands:', error);
    return [];
  }
}

export async function getAllDemands(): Promise<Demand[]> {
  try {
    return await prisma.demand.findMany({
      include: { owner: ownerSelect },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching all demands:', error);
    return [];
  }
}
