-- =============================================
-- Admin Dashboard Feature: Multi-Regional Pricing
-- =============================================

-- Add regional_prices to brand_plates
-- Storing prices as JSONB: {"hk": 12, "mainland": 10, "macau": 12}
ALTER TABLE public.brand_plates 
ADD COLUMN IF NOT EXISTS regional_prices JSONB DEFAULT '{}'::jsonb;

-- Add regional_prices to brand_side_dishes
ALTER TABLE public.brand_side_dishes 
ADD COLUMN IF NOT EXISTS regional_prices JSONB DEFAULT '{}'::jsonb;

-- Comment on migration
COMMENT ON COLUMN public.brand_plates.regional_prices IS 'Store regional prices e.g. {"hk": 10, "mainland": 8}';
COMMENT ON COLUMN public.brand_side_dishes.regional_prices IS 'Store regional prices e.g. {"hk": 20, "mainland": 18}';
