-- This is an empty migration.
-- Migration: 20250803_simple_fuzzy_search.sql

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Simple trigram indexes for fuzzy matching
CREATE INDEX idx_product_title_trgm ON "Product" USING gin(title gin_trgm_ops);
CREATE INDEX idx_product_description_trgm ON "Product" USING gin(description gin_trgm_ops);
CREATE INDEX idx_service_title_trgm ON "Service" USING gin(title gin_trgm_ops);
CREATE INDEX idx_demand_title_trgm ON "Demand" USING gin(title gin_trgm_ops);

-- Full-text search indexes
CREATE INDEX idx_product_combined_fts ON "Product" USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_service_combined_fts ON "Service" USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_demand_combined_fts ON "Demand" USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
