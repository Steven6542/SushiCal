import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Brand } from '../types';
import { Link } from 'react-router-dom';

export function Dashboard() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const { data, error } = await supabase
                .from('brands')
                .select('*')
                .eq('is_shared', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map DB snake_case to CamelCase if needed or just use DB types?
            // Our type definition in types.ts used camelCase (e.g. logoUrl).
            // We need to map it.

            const mappedBrands = (data || []).map(b => ({
                id: b.id,
                name: b.name,
                description: b.description,
                logoUrl: b.logo_url,
                tags: b.tags,
                region: b.region,
                isShared: b.is_shared,
                defaultServiceCharge: b.default_service_charge,
            }));

            setBrands(mappedBrands);
        } catch (error) {
            console.error('Error loading brands:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Shared Brands</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brands.map(brand => (
                    <div key={brand.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                        <div className="h-32 bg-gray-50 flex items-center justify-center p-4 border-b border-gray-100">
                            {brand.logoUrl ? (
                                <img src={brand.logoUrl} alt={brand.name} className="h-full object-contain" />
                            ) : (
                                <span className="text-gray-400">No Logo</span>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{brand.name}</h3>
                                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 font-medium">
                                    {brand.id}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{brand.description}</p>

                            <Link
                                to={`/brands/${brand.id}`}
                                className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            >
                                Manage Brand
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
