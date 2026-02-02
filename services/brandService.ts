import { supabase } from '../lib/supabaseClient';
import { Brand, PlateType, SideDish, ServiceChargeConfig } from '../types';

export interface DatabaseBrand {
    id: string;
    user_id: string | null;
    name: string;
    description: string | null;
    logo_url: string | null;
    plates: any[];
    side_dishes: any[];
    default_service_charge: any;
    tags: string[] | null;
    region: string | null;
    is_shared: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Convert database brand to frontend Brand type
 */
const dbBrandToBrand = (dbBrand: DatabaseBrand): Brand => {
    return {
        id: dbBrand.id,
        name: dbBrand.name,
        description: dbBrand.description || undefined,
        logoUrl: dbBrand.logo_url || undefined,
        plates: dbBrand.plates as PlateType[],
        sideDishes: dbBrand.side_dishes as SideDish[],
        defaultServiceCharge: dbBrand.default_service_charge as ServiceChargeConfig,
        tags: dbBrand.tags as ('hot' | 'new')[] | undefined,
        region: (dbBrand.region as any) || undefined,
    };
};

/**
 * Convert frontend Brand to database format
 */
const brandToDbBrand = (brand: Brand, userId: string | null): Partial<DatabaseBrand> => {
    return {
        id: brand.id,
        user_id: userId,
        name: brand.name,
        description: brand.description || null,
        logo_url: brand.logoUrl || null,
        plates: brand.plates,
        side_dishes: brand.sideDishes,
        default_service_charge: brand.defaultServiceCharge,
        tags: brand.tags || null,
        region: brand.region || null,
        is_shared: false,
    };
};

/**
 * Fetch all brands (user's own brands + shared brands)
 */
export const getBrands = async (): Promise<Brand[]> => {
    const { data, error } = await supabase
        .from('brands')
        .select(`
            *,
            brand_plates (*),
            brand_side_dishes (*)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch brands:', error);
        throw error;
    }

    return (data || []).map(dbBrand => ({
        ...dbBrandToBrand(dbBrand),
        // Use relational data if available, otherwise fall back to JSON (for backward compatibility during migration)
        plates: dbBrand.brand_plates?.length > 0 ? dbBrand.brand_plates.map(mapDbPlate) : dbBrandToBrand(dbBrand).plates,
        sideDishes: dbBrand.brand_side_dishes?.length > 0 ? dbBrand.brand_side_dishes.map(mapDbSide) : dbBrandToBrand(dbBrand).sideDishes
    }));
};

/**
 * Fetch a single brand by ID
 */
export const getBrandById = async (brandId: string): Promise<Brand | null> => {
    const { data, error } = await supabase
        .from('brands')
        .select(`*, brand_plates(*), brand_side_dishes(*)`)
        .eq('id', brandId)
        .single();

    if (error) {
        console.error('Failed to fetch brand:', error);
        return null;
    }
    if (!data) return null;

    return {
        ...dbBrandToBrand(data),
        plates: data.brand_plates?.map(mapDbPlate) || [],
        sideDishes: data.brand_side_dishes?.map(mapDbSide) || []
    };
};

/**
 * Create a new brand
 */
export const createBrand = async (brand: Brand, userId: string): Promise<Brand> => {
    const dbBrand = brandToDbBrand(brand, userId);

    // 1. Insert brand (without plates/sides JSON if possible, but keeping for now is fine)
    const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .insert(dbBrand)
        .select()
        .single();

    if (brandError) throw brandError;

    const brandId = brandData.id;

    // 2. Insert plates
    if (brand.plates.length > 0) {
        const platesToInsert = brand.plates.map(p => ({
            brand_id: brandId,
            name: p.name,
            color: p.color,
            price: p.price
        }));
        const { error: platesError } = await supabase.from('brand_plates').insert(platesToInsert);
        if (platesError) throw platesError;
    }

    // 3. Insert side dishes
    if (brand.sideDishes.length > 0) {
        const sidesToInsert = brand.sideDishes.map(s => ({
            brand_id: brandId,
            name: s.name,
            price: s.price,
            icon: s.icon
        }));
        const { error: sidesError } = await supabase.from('brand_side_dishes').insert(sidesToInsert);
        if (sidesError) throw sidesError;
    }

    const newBrand = await getBrandById(brandId);
    if (!newBrand) throw new Error('Failed to retrieve created brand');
    return newBrand;
};

/**
 * Update an existing brand
 */
export const updateBrand = async (brand: Brand, userId: string): Promise<Brand> => {
    // 1. Update brand info
    const { error: brandError } = await supabase
        .from('brands')
        .update({
            name: brand.name,
            description: brand.description,
            logo_url: brand.logoUrl,
            default_service_charge: brand.defaultServiceCharge,
            tags: brand.tags,
            region: brand.region,
            // We don't update JSON columns anymore
        })
        .eq('id', brand.id);

    if (brandError) throw brandError;

    // 2. Update plates (Simple strategy: Delete all and re-insert)
    // This allows full sync with frontend state
    const { error: deletePlatesError } = await supabase.from('brand_plates').delete().eq('brand_id', brand.id);
    if (deletePlatesError) throw deletePlatesError;

    if (brand.plates.length > 0) {
        const platesToInsert = brand.plates.map(p => ({
            brand_id: brand.id,
            name: p.name,
            color: p.color,
            price: p.price
        }));
        const { error: insertPlatesError } = await supabase.from('brand_plates').insert(platesToInsert);
        if (insertPlatesError) throw insertPlatesError;
    }

    // 3. Update side dishes
    const { error: deleteSidesError } = await supabase.from('brand_side_dishes').delete().eq('brand_id', brand.id);
    if (deleteSidesError) throw deleteSidesError;

    if (brand.sideDishes.length > 0) {
        const sidesToInsert = brand.sideDishes.map(s => ({
            brand_id: brand.id,
            name: s.name,
            price: s.price,
            icon: s.icon
        }));
        const { error: insertSidesError } = await supabase.from('brand_side_dishes').insert(sidesToInsert);
        if (insertSidesError) throw insertSidesError;
    }

    const updatedBrand = await getBrandById(brand.id);
    if (!updatedBrand) throw new Error('Failed to retrieve updated brand');
    return updatedBrand;
};

/**
 * Delete a brand
 */
export const deleteBrand = async (brandId: string): Promise<void> => {
    const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

    if (error) {
        console.error('Failed to delete brand:', error);
        throw error;
    }
};

const mapDbPlate = (p: any): PlateType => ({
    id: p.id,
    name: p.name,
    color: p.color,
    price: Number(p.price)
});

const mapDbSide = (s: any): SideDish => ({
    id: s.id,
    name: s.name,
    price: Number(s.price),
    icon: s.icon
});
