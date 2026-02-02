export interface Brand {
    id: string;
    name: string;
    description: string;
    logoUrl: string;
    tags?: string[];
    region?: string;
    isShared: boolean;
    sortOrder?: number;
    defaultServiceCharge: {
        type: 'percent' | 'head' | 'none';
        value: number;
    };
}

export interface Plate {
    id: string;
    brand_id: string;
    name: string;
    color: string;
    price: number;
    image_url?: string;
    regional_prices?: Record<string, number>; // e.g. { hk: 12, mainland: 10 }
}

export interface SideDish {
    id: string;
    brand_id: string;
    name: string;
    price: number;
    icon: string; // Keep specifically for material icon name if used
    image_url?: string; // New image field
    regional_prices?: Record<string, number>;
}

export interface UserProfile {
    id: string;
    username: string;
    is_admin: boolean;
}
