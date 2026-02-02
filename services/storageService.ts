import { supabase } from '../lib/supabaseClient';

/**
 * Storage service for managing file uploads
 */

/**
 * Upload a brand logo to Supabase Storage
 * @param file - The image file to upload
 * @param brandId - The brand ID (used for organizing files)
 * @returns The public URL of the uploaded file
 */
export const uploadBrandLogo = async (
    file: File,
    brandId: string
): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${brandId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload file to storage
    const { data, error } = await supabase.storage
        .from('brand-logos')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Failed to upload file:', error);
        throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(data.path);

    return urlData.publicUrl;
};

/**
 * Delete a brand logo from Supabase Storage
 * @param logoUrl - The full URL of the logo to delete
 */
export const deleteBrandLogo = async (logoUrl: string): Promise<void> => {
    // Extract file path from URL
    const url = new URL(logoUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];

    const { error } = await supabase.storage
        .from('brand-logos')
        .remove([fileName]);

    if (error) {
        console.error('Failed to delete file:', error);
        throw error;
    }
};

/**
 * Update brand logo URL in database
 * @param brandId - The brand ID to update
 * @param logoUrl - The new logo URL
 */
export const updateBrandLogoUrl = async (
    brandId: string,
    logoUrl: string
): Promise<void> => {
    const { error } = await supabase
        .from('brands')
        .update({ logo_url: logoUrl })
        .eq('id', brandId);

    if (error) {
        console.error('Failed to update brand logo URL:', error);
        throw error;
    }
};

/**
 * Upload and update brand logo (complete workflow)
 * @param file - The image file to upload
 * @param brandId - The brand ID
 * @param oldLogoUrl - Optional: the old logo URL to delete
 * @returns The new logo URL
 */
export const uploadAndUpdateBrandLogo = async (
    file: File,
    brandId: string,
    oldLogoUrl?: string
): Promise<string> => {
    // Upload new logo
    const newLogoUrl = await uploadBrandLogo(file, brandId);

    // Update database
    await updateBrandLogoUrl(brandId, newLogoUrl);

    // Delete old logo if it exists and is from Supabase Storage
    if (oldLogoUrl && oldLogoUrl.includes('supabase.co/storage')) {
        try {
            await deleteBrandLogo(oldLogoUrl);
        } catch (error) {
            console.warn('Failed to delete old logo:', error);
            // Don't throw error, the new logo is already uploaded
        }
    }

    return newLogoUrl;
};
