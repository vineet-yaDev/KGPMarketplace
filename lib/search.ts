// lib/search.ts (Corrected and Secure)
import { PrismaClient, Prisma } from '@prisma/client';
import { Product, Service, Demand } from './types'; // Import your types

const prisma = new PrismaClient();

interface SearchFilters {
  category?: string;
  hall?: string;
  priceRange?: { min?: number; max?: number };
  type?: 'product' | 'service' | 'demand';
  productType?: string;
  status?: string;
  condition?: { min?: number; max?: number };
  experience?: string;
}

// Define result types that match your raw query results
interface RawProductResult extends Omit<Product, 'owner'> {
  score: number;
  owner_name: string | null;
  owner_email: string | null;
}
interface RawServiceResult extends Omit<Service, 'owner'> {
  score: number;
  owner_name: string | null;
  owner_email: string | null;
}
interface RawDemandResult extends Omit<Demand, 'owner'> {
  score: number;
  owner_name: string | null;
  owner_email: string | null;
}

export class SearchService {
  
  async searchProducts(query: string, filters?: SearchFilters, limit = 20): Promise<RawProductResult[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      // Build WHERE conditions safely using Prisma.sql
      const conditions: Prisma.Sql[] = [
        Prisma.sql`to_tsvector('english', p.title || ' ' || COALESCE(p.description, '')) @@ websearch_to_tsquery('english', ${query})`
      ];

      // Add filters safely
      if (filters?.category) {
        conditions.push(Prisma.sql`AND p.category = ${filters.category}`);
      }
      if (filters?.hall) {
        conditions.push(Prisma.sql`AND p."addressHall" = ${filters.hall}`);
      }
      if (filters?.productType) {
        conditions.push(Prisma.sql`AND p."productType" = ${filters.productType}`);
      }
      if (filters?.status) {
        conditions.push(Prisma.sql`AND p.status = ${filters.status}`);
      }
      if (filters?.condition?.min) {
        conditions.push(Prisma.sql`AND p.condition >= ${filters.condition.min}`);
      }
      if (filters?.condition?.max) {
        conditions.push(Prisma.sql`AND p.condition <= ${filters.condition.max}`);
      }
      if (filters?.priceRange?.min !== undefined) {
        conditions.push(Prisma.sql`AND p.price >= ${filters.priceRange.min}`);
      }
      if (filters?.priceRange?.max !== undefined) {
        conditions.push(Prisma.sql`AND p.price <= ${filters.priceRange.max}`);
      }

      const whereClause = Prisma.join(conditions, ' ');

      const results = await prisma.$queryRaw<RawProductResult[]>`
        SELECT 
          p.*,
          u.name as owner_name,
          u.email as owner_email,
          ts_rank(
            to_tsvector('english', p.title || ' ' || COALESCE(p.description, '')),
            websearch_to_tsquery('english', ${query})
          ) as score
        FROM "Product" p
        JOIN "User" u ON p."ownerId" = u.id
        WHERE p.status = 'LISTED'
          AND u."isBlocked" = false
          AND (${whereClause})
        ORDER BY score DESC, p."createdAt" DESC
        LIMIT ${limit}
      `;

      return results.map((result) => ({
        ...result,
        owner: {
          id: result.ownerId,
          name: result.owner_name,
          email: result.owner_email
        }
      })) as RawProductResult[];

    } catch (error) {
      console.error('Product search error:', error);
      return [];
    }
  }

  async searchServices(query: string, filters?: SearchFilters, limit = 15): Promise<RawServiceResult[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const conditions: Prisma.Sql[] = [
        Prisma.sql`to_tsvector('english', s.title || ' ' || COALESCE(s.description, '')) @@ websearch_to_tsquery('english', ${query})`
      ];

      if (filters?.category) {
        conditions.push(Prisma.sql`AND s.category = ${filters.category}`);
      }
      if (filters?.hall) {
        conditions.push(Prisma.sql`AND s."addressHall" = ${filters.hall}`);
      }
      if (filters?.priceRange?.min !== undefined) {
        conditions.push(Prisma.sql`AND s."minPrice" >= ${filters.priceRange.min}`);
      }
      if (filters?.priceRange?.max !== undefined) {
        conditions.push(Prisma.sql`AND s."maxPrice" <= ${filters.priceRange.max}`);
      }
      if (filters?.experience) {
        conditions.push(Prisma.sql`AND s."experienceYears" >= ${parseFloat(filters.experience)}`);
      }

      const whereClause = Prisma.join(conditions, ' ');

      const results = await prisma.$queryRaw<RawServiceResult[]>`
        SELECT 
          s.*,
          u.name as owner_name,
          u.email as owner_email,
          ts_rank(
            to_tsvector('english', s.title || ' ' || COALESCE(s.description, '')),
            websearch_to_tsquery('english', ${query})
          ) as score
        FROM "Service" s
        JOIN "User" u ON s."ownerId" = u.id
        WHERE u."isBlocked" = false
          AND (${whereClause})
        ORDER BY score DESC, s."createdAt" DESC
        LIMIT ${limit}
      `;

      return results.map((result) => ({
        ...result,
        owner: {
          id: result.ownerId,
          name: result.owner_name,
          email: result.owner_email
        }
      })) as RawServiceResult[];

    } catch (error) {
      console.error('Service search error:', error);
      return [];
    }
  }

  async searchDemands(query: string, filters?: SearchFilters, limit = 10): Promise<RawDemandResult[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const conditions: Prisma.Sql[] = [
        Prisma.sql`to_tsvector('english', d.title || ' ' || COALESCE(d.description, '')) @@ websearch_to_tsquery('english', ${query})`
      ];

      if (filters?.category) {
        conditions.push(Prisma.sql`AND (d."productCategory" = ${filters.category} OR d."serviceCategory" = ${filters.category})`);
      }

      const whereClause = Prisma.join(conditions, ' ');

      const results = await prisma.$queryRaw<RawDemandResult[]>`
        SELECT 
          d.*,
          u.name as owner_name,
          u.email as owner_email,
          ts_rank(
            to_tsvector('english', d.title || ' ' || COALESCE(d.description, '')),
            websearch_to_tsquery('english', ${query})
          ) as score
        FROM "Demand" d
        JOIN "User" u ON d."ownerId" = u.id
        WHERE u."isBlocked" = false
          AND (${whereClause})
        ORDER BY score DESC, d."createdAt" DESC
        LIMIT ${limit}
      `;

      return results.map((result) => ({
        ...result,
        owner: {
          id: result.ownerId,
          name: result.owner_name,
          email: result.owner_email
        }
      })) as RawDemandResult[];

    } catch (error) {
      console.error('Demand search error:', error);
      return [];
    }
  }

  async universalSearch(query: string, filters?: SearchFilters): Promise<{
    products: RawProductResult[];
    services: RawServiceResult[];
    demands: RawDemandResult[];
    total: number;
  }> {
    if (!query || query.trim().length < 2) {
      return { products: [], services: [], demands: [], total: 0 };
    }

    const searchFilters = filters || {};

    try {
      const [products, services, demands] = await Promise.all([
        !searchFilters.type || searchFilters.type === 'product' 
          ? this.searchProducts(query, searchFilters) 
          : Promise.resolve([]),
        !searchFilters.type || searchFilters.type === 'service' 
          ? this.searchServices(query, searchFilters) 
          : Promise.resolve([]),
        !searchFilters.type || searchFilters.type === 'demand' 
          ? this.searchDemands(query, searchFilters) 
          : Promise.resolve([])
      ]);

      return {
        products,
        services,
        demands,
        total: products.length + services.length + demands.length
      };
    } catch (error) {
      console.error('Universal search error:', error);
      return { products: [], services: [], demands: [], total: 0 };
    }
  }
}

export const searchService = new SearchService();
