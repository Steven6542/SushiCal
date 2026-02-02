import { supabase } from '../lib/supabaseClient';
import { MealRecord, MealItem } from '../types';

export interface DatabaseMealRecord {
    id: string;
    user_id: string;
    brand_name: string;
    brand_logo: string | null;
    date: string;
    total_price: number;
    total_plates: number;
    region: string;
    currency_symbol: string;
    service_charge_amount: number | null;
    service_charge_rule: any;
    head_count: number | null;
    created_at: string;
    updated_at: string;
}

export interface DatabaseMealItem {
    id: string;
    meal_record_id: string;
    name: string;
    price: number;
    quantity: number;
    type: 'plate' | 'side';
    color: string | null;
    icon: string | null;
    created_at: string;
}

/**
 * Fetch all meal records for the current user
 */
export const getMealRecords = async (userId: string): Promise<MealRecord[]> => {
    const { data, error } = await supabase
        .from('meal_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) {
        console.error('Failed to fetch meal records:', error);
        throw error;
    }

    return (data || []).map(dbRecord => ({
        id: dbRecord.id,
        brandName: dbRecord.brand_name,
        brandLogo: dbRecord.brand_logo || undefined,
        date: dbRecord.date,
        totalPrice: dbRecord.total_price,
        totalPlates: dbRecord.total_plates,
        region: dbRecord.region as any,
        currencySymbol: dbRecord.currency_symbol,
        serviceChargeAmount: dbRecord.service_charge_amount || undefined,
        serviceChargeRule: dbRecord.service_charge_rule || undefined,
        headCount: dbRecord.head_count || undefined,
    }));
};

/**
 * Fetch a single meal record with its items
 */
export const getMealRecordById = async (recordId: string): Promise<MealRecord | null> => {
    // Fetch the meal record
    const { data: recordData, error: recordError } = await supabase
        .from('meal_records')
        .select('*')
        .eq('id', recordId)
        .single();

    if (recordError) {
        console.error('Failed to fetch meal record:', recordError);
        return null;
    }

    // Fetch the meal items
    const { data: itemsData, error: itemsError } = await supabase
        .from('meal_items')
        .select('*')
        .eq('meal_record_id', recordId);

    if (itemsError) {
        console.error('Failed to fetch meal items:', itemsError);
    }

    const items: MealItem[] = (itemsData || []).map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type as 'plate' | 'side',
        color: item.color || undefined,
        icon: item.icon || undefined,
    }));

    return {
        id: recordData.id,
        brandName: recordData.brand_name,
        brandLogo: recordData.brand_logo || undefined,
        date: recordData.date,
        totalPrice: recordData.total_price,
        totalPlates: recordData.total_plates,
        region: recordData.region as any,
        currencySymbol: recordData.currency_symbol,
        serviceChargeAmount: recordData.service_charge_amount || undefined,
        serviceChargeRule: recordData.service_charge_rule || undefined,
        headCount: recordData.head_count || undefined,
        items,
    };
};

/**
 * Create a new meal record with items
 */
export const createMealRecord = async (
    meal: MealRecord,
    userId: string
): Promise<MealRecord> => {
    // Insert the meal record
    const { data: recordData, error: recordError } = await supabase
        .from('meal_records')
        .insert({
            id: meal.id,
            user_id: userId,
            brand_name: meal.brandName,
            brand_logo: meal.brandLogo || null,
            date: meal.date,
            total_price: meal.totalPrice,
            total_plates: meal.totalPlates,
            region: meal.region,
            currency_symbol: meal.currencySymbol,
            service_charge_amount: meal.serviceChargeAmount || null,
            service_charge_rule: meal.serviceChargeRule || null,
            head_count: meal.headCount || null,
        })
        .select()
        .single();

    if (recordError) {
        console.error('Failed to create meal record:', recordError);
        throw recordError;
    }

    // Insert meal items if they exist
    if (meal.items && meal.items.length > 0) {
        const itemsToInsert = meal.items.map(item => ({
            meal_record_id: recordData.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            type: item.type,
            color: item.color || null,
            icon: item.icon || null,
        }));

        const { error: itemsError } = await supabase
            .from('meal_items')
            .insert(itemsToInsert);

        if (itemsError) {
            console.error('Failed to create meal items:', itemsError);
            // Don't throw here, the record is already created
        }
    }

    return meal;
};

/**
 * Delete a meal record (items will be cascade deleted)
 */
export const deleteMealRecord = async (recordId: string): Promise<void> => {
    const { error } = await supabase
        .from('meal_records')
        .delete()
        .eq('id', recordId);

    if (error) {
        console.error('Failed to delete meal record:', error);
        throw error;
    }
};
