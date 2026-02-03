import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Brand } from '../types';
import { Link } from 'react-router-dom';
import { OrderEditor } from '../components/OrderEditor';

type Region = 'mainland' | 'hk' | 'taiwan';

const REGION_LABELS: Record<Region, string> = {
    mainland: '中国内地',
    hk: '香港',
    taiwan: '台湾'
};

export function Dashboard() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReorder, setShowReorder] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<Region>('hk');

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const { data, error } = await supabase
                .from('brands')
                .select('*')
                .eq('is_shared', true)
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedBrands = (data || []).map(b => ({
                id: b.id,
                name: b.name,
                description: b.description,
                logoUrl: b.logo_url,
                tags: b.tags,
                region: b.region,
                isShared: b.is_shared,
                defaultServiceCharge: b.default_service_charge,
                sortOrder: b.sort_order
            }));

            setBrands(mappedBrands);
        } catch (error) {
            console.error('Error loading brands:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter brands by selected region
    const filteredBrands = brands.filter(b => b.region === selectedRegion);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="text-lg">Loading...</div></div>;

    return (
        <div>
            {/* Header with Region Selector */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">品牌管理</h2>
                    <button
                        onClick={() => setShowReorder(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">sort</span>
                        重新排序
                    </button>
                </div>

                {/* Region Selector */}
                <div className="flex gap-3 bg-gray-100 p-1.5 rounded-lg w-fit">
                    {(Object.keys(REGION_LABELS) as Region[]).map((region) => (
                        <button
                            key={region}
                            onClick={() => setSelectedRegion(region)}
                            className={`px-6 py-2 rounded-md font-medium transition-all ${selectedRegion === region
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {REGION_LABELS[region]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Brands Grid */}
            {filteredBrands.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <span className="material-symbols-outlined text-5xl text-gray-400 mb-2">store</span>
                    <p className="text-gray-500 text-lg">该地区暂无品牌</p>
                    <p className="text-gray-400 text-sm mt-2">请切换到其他地区或添加新品牌</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBrands.map(brand => (
                        <div key={brand.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
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
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 font-medium">
                                            #{brand.sortOrder ?? 99}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{brand.description}</p>

                                <Link
                                    to={`/brands/${brand.id}`}
                                    className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
                                >
                                    管理品牌
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showReorder && (
                <OrderEditor
                    brands={brands}
                    onClose={() => setShowReorder(false)}
                    onSave={fetchBrands}
                />
            )}
        </div>
    );
}
