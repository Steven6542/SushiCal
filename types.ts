export type Region = 'mainland' | 'hk' | 'macau';

export interface PlateType {
  id: string;
  name: string;
  color: string; // hex code
  price: number;
  regional_prices?: Record<string, number>;
}

export interface SideDish {
  id: string;
  name: string;
  price: number;
  icon: string; // material symbol name
  regional_prices?: Record<string, number>;
}

export interface ServiceChargeConfig {
  type: 'percent' | 'head' | 'none';
  value: number;
}

export interface User {
  id: string;
  email: string;
  is_admin?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  plates: PlateType[];
  sideDishes: SideDish[];
  defaultServiceCharge: ServiceChargeConfig;
  tags?: ('hot' | 'new')[];
  isShared?: boolean;
  region?: Region; // For filtering, simplified for this demo
  sortOrder?: number;
}

export interface MealItem {
  name: string;
  price: number;
  quantity: number;
  type: 'plate' | 'side';
  color?: string; // for plates
  icon?: string; // for sides
}

export interface MealRecord {
  id: string;
  brandName: string;
  brandLogo?: string;
  date: string; // ISO string
  totalPrice: number;
  totalPlates: number;
  region: Region;
  currencySymbol: string;

  // New detailed fields
  items?: MealItem[];
  serviceChargeAmount?: number;
  serviceChargeRule?: ServiceChargeConfig;
  headCount?: number;
}
