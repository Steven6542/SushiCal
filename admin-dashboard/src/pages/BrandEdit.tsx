import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Brand, Plate, SideDish } from '../types';
import { ImageUpload } from '../components/ImageUpload';

const REGION_NAMES: Record<string, string> = {
    mainland: '中国内地',
    hk: '香港',
    taiwan: '台湾'
};

export function BrandEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [brand, setBrand] = useState<Brand | null>(null);
    const [plates, setPlates] = useState<Plate[]>([]);
    const [sides, setSides] = useState<SideDish[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isPlateModalOpen, setPlateModalOpen] = useState(false);
    const [editingPlate, setEditingPlate] = useState<Partial<Plate>>({});

    const [isSideModalOpen, setSideModalOpen] = useState(false);
    const [editingSide, setEditingSide] = useState<Partial<SideDish>>({});

    useEffect(() => {
        if (id) fetchBrandData(id);
    }, [id]);

    const fetchBrandData = async (brandId: string) => {
        try {
            setLoading(true);
            // Fetch Brand
            const { data: brandData, error: brandError } = await supabase
                .from('brands')
                .select('*')
                .eq('id', brandId)
                .single();

            if (brandError) throw brandError;

            setBrand({
                id: brandData.id,
                name: brandData.name,
                description: brandData.description,
                logoUrl: brandData.logo_url,
                tags: brandData.tags || [],
                region: brandData.region,
                isShared: brandData.is_shared,
                defaultServiceCharge: brandData.default_service_charge,
            });

            // Fetch Plates
            const { data: platesData } = await supabase
                .from('brand_plates')
                .select('*')
                .eq('brand_id', brandId)
                .order('price');
            setPlates(platesData || []);

            // Fetch Sides
            const { data: sidesData } = await supabase
                .from('brand_side_dishes')
                .select('*')
                .eq('brand_id', brandId)
                .order('price');
            setSides(sidesData || []);

        } catch (error) {
            console.error('Error fetching brand:', error);
            alert('Failed to load brand data');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const updateBrand = async (updates: Partial<Brand>) => {
        if (!brand) return;
        try {
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.description !== undefined) dbUpdates.description = updates.description;
            if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;

            // Optimistic update
            setBrand({ ...brand, ...updates });

            const { error } = await supabase.from('brands').update(dbUpdates).eq('id', brand.id);
            if (error) throw error;
        } catch (error) {
            console.error('Failed to update brand:', error);
            alert('Failed to save changes');
            fetchBrandData(brand.id); // Revert
        }
    };

    const handleSavePlate = async () => {
        if (!brand || !editingPlate.name || !editingPlate.price) return;
        try {
            const plateData = {
                brand_id: brand.id,
                name: editingPlate.name,
                price: editingPlate.price,
                color: editingPlate.color || '#cccccc',
                image_url: editingPlate.image_url,
                regional_prices: editingPlate.regional_prices
            };

            let error;
            if (editingPlate.id) {
                // Update
                const { error: err } = await supabase.from('brand_plates').update(plateData).eq('id', editingPlate.id);
                error = err;
            } else {
                // Create
                const { error: err } = await supabase.from('brand_plates').insert(plateData);
                error = err;
            }

            if (error) throw error;
            setPlateModalOpen(false);
            fetchBrandData(brand.id);
        } catch (error) {
            alert('Failed to save plate: ' + (error as any).message);
        }
    };

    const handleSaveSide = async () => {
        if (!brand || !editingSide.name || !editingSide.price) return;
        try {
            const sideData = {
                brand_id: brand.id,
                name: editingSide.name,
                price: editingSide.price,
                icon: editingSide.icon || 'restaurant',
                image_url: editingSide.image_url,
                regional_prices: editingSide.regional_prices
            };

            let error;
            if (editingSide.id) {
                const { error: err } = await supabase.from('brand_side_dishes').update(sideData).eq('id', editingSide.id);
                error = err;
            } else {
                const { error: err } = await supabase.from('brand_side_dishes').insert(sideData);
                error = err;
            }

            if (error) throw error;
            setSideModalOpen(false);
            fetchBrandData(brand.id);
        } catch (error) {
            alert('Failed to save side dish');
        }
    };

    const deletePlate = async (id: string) => {
        if (!confirm('Delete this plate?')) return;
        await supabase.from('brand_plates').delete().eq('id', id);
        if (brand) fetchBrandData(brand.id);
    }

    const deleteSide = async (id: string) => {
        if (!confirm('Delete this side dish?')) return;
        await supabase.from('brand_side_dishes').delete().eq('id', id);
        if (brand) fetchBrandData(brand.id);
    }


    if (loading || !brand) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            {/* Brand Header & Meta */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
                    {brand.region && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {REGION_NAMES[brand.region] || brand.region}
                        </span>
                    )}
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0">
                        <ImageUpload
                            bucket="brand-logos"
                            path={`brands/${brand.id}/logo`}
                            currentImage={brand.logoUrl}
                            onUpload={(url) => updateBrand({ logoUrl: url })}
                            label="Change Logo"
                        />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                            <input
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                value={brand.name}
                                onChange={(e) => updateBrand({ name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                value={brand.description || ''}
                                onChange={(e) => updateBrand({ description: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Plates Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Plates</h2>
                    <button
                        onClick={() => { setEditingPlate({}); setPlateModalOpen(true); }}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Add Plate
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {plates.map(plate => (
                        <div key={plate.id} className="bg-white p-4 rounded shadow border relative group">
                            <div className="h-20 bg-gray-50 flex items-center justify-center mb-2 overflow-hidden">
                                {plate.image_url ? (
                                    <img src={plate.image_url} alt={plate.name} className="h-full object-contain" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: plate.color }}></div>
                                )}
                            </div>
                            <div className="text-center">
                                <div className="font-bold">{plate.name}</div>
                                <div className="text-gray-600">${plate.price}</div>
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                <button onClick={() => { setEditingPlate(plate); setPlateModalOpen(true); }} className="p-1 bg-blue-500 text-white rounded">Edit</button>
                                <button onClick={() => deletePlate(plate.id)} className="p-1 bg-red-500 text-white rounded">Del</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sides Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Side Dishes</h2>
                    <button
                        onClick={() => { setEditingSide({}); setSideModalOpen(true); }}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Add Side Dish
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {sides.map(side => (
                        <div key={side.id} className="bg-white p-4 rounded shadow border relative group">
                            <div className="h-20 bg-gray-50 flex items-center justify-center mb-2 overflow-hidden">
                                {side.image_url ? (
                                    <img src={side.image_url} alt={side.name} className="h-full object-contain" />
                                ) : (
                                    <span className="material-symbols-outlined text-3xl text-gray-400">{side.icon || 'restaurant'}</span>
                                )}
                            </div>
                            <div className="text-center">
                                <div className="font-bold">{side.name}</div>
                                <div className="text-gray-600">${side.price}</div>
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                <button onClick={() => { setEditingSide(side); setSideModalOpen(true); }} className="p-1 bg-blue-500 text-white rounded">Edit</button>
                                <button onClick={() => deleteSide(side.id)} className="p-1 bg-red-500 text-white rounded">Del</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plate Modal */}
            {isPlateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-bold mb-4">{editingPlate.id ? 'Edit Plate' : 'New Plate'}</h3>
                        <div className="space-y-4">
                            <input
                                className="w-full border p-2 rounded"
                                placeholder="Plate Name"
                                value={editingPlate.name || ''}
                                onChange={e => setEditingPlate({ ...editingPlate, name: e.target.value })}
                            />
                            <input
                                className="w-full border p-2 rounded"
                                type="number"
                                placeholder="Price"
                                value={editingPlate.price || ''}
                                onChange={e => setEditingPlate({ ...editingPlate, price: Number(e.target.value) })}
                            />
                            <div className="flex gap-2 items-center">
                                <span>Color:</span>
                                <input
                                    type="color"
                                    value={editingPlate.color || '#cccccc'}
                                    onChange={e => setEditingPlate({ ...editingPlate, color: e.target.value })}
                                />
                            </div>

                            {/* Regional Prices */}
                            <div className="border-t pt-2 mt-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Regional Prices (Optional)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <span className="text-xs text-gray-500">HK (HK$)</span>
                                        <input
                                            className="w-full border p-1 rounded text-sm"
                                            type="number"
                                            placeholder="HK$"
                                            value={editingPlate.regional_prices?.hk ?? ''}
                                            onChange={e => setEditingPlate({
                                                ...editingPlate,
                                                regional_prices: { ...editingPlate.regional_prices, hk: Number(e.target.value) }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">CN (¥)</span>
                                        <input
                                            className="w-full border p-1 rounded text-sm"
                                            type="number"
                                            placeholder="¥"
                                            value={editingPlate.regional_prices?.mainland ?? ''}
                                            onChange={e => setEditingPlate({
                                                ...editingPlate,
                                                regional_prices: { ...editingPlate.regional_prices, mainland: Number(e.target.value) }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Taiwan (NT$)</span>
                                        <input
                                            className="w-full border p-1 rounded text-sm"
                                            type="number"
                                            placeholder="MOP"
                                            value={editingPlate.regional_prices?.taiwan ?? ''}
                                            onChange={e => setEditingPlate({
                                                ...editingPlate,
                                                regional_prices: { ...editingPlate.regional_prices, taiwan: Number(e.target.value) }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <ImageUpload
                                bucket="menu-items"
                                path={`brands/${brand.id}/plates`}
                                currentImage={editingPlate.image_url}
                                onUpload={(url) => setEditingPlate({ ...editingPlate, image_url: url })}
                                label="Plate Image"
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setPlateModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={handleSavePlate} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Side Dish Modal */}
            {isSideModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-bold mb-4">{editingSide.id ? 'Edit Side Dish' : 'New Side Dish'}</h3>
                        <div className="space-y-4">
                            <input
                                className="w-full border p-2 rounded"
                                placeholder="Dish Name"
                                value={editingSide.name || ''}
                                onChange={e => setEditingSide({ ...editingSide, name: e.target.value })}
                            />
                            <input
                                className="w-full border p-2 rounded"
                                type="number"
                                placeholder="Price"
                                value={editingSide.price || ''}
                                onChange={e => setEditingSide({ ...editingSide, price: Number(e.target.value) })}
                            />

                            {/* Regional Prices for Side Dish */}
                            <div className="border-t pt-2 mt-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Regional Prices</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <span className="text-xs text-gray-500">HK</span>
                                        <input
                                            className="w-full border p-1 rounded text-sm"
                                            type="number"
                                            value={editingSide.regional_prices?.hk ?? ''}
                                            onChange={e => setEditingSide({
                                                ...editingSide,
                                                regional_prices: { ...editingSide.regional_prices, hk: Number(e.target.value) }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">CN</span>
                                        <input
                                            className="w-full border p-1 rounded text-sm"
                                            type="number"
                                            value={editingSide.regional_prices?.mainland ?? ''}
                                            onChange={e => setEditingSide({
                                                ...editingSide,
                                                regional_prices: { ...editingSide.regional_prices, mainland: Number(e.target.value) }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Taiwan</span>
                                        <input
                                            className="w-full border p-1 rounded text-sm"
                                            type="number"
                                            value={editingSide.regional_prices?.taiwan ?? ''}
                                            onChange={e => setEditingSide({
                                                ...editingSide,
                                                regional_prices: { ...editingSide.regional_prices, taiwan: Number(e.target.value) }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <ImageUpload
                                bucket="menu-items"
                                path={`brands/${brand.id}/sides`}
                                currentImage={editingSide.image_url}
                                onUpload={(url) => setEditingSide({ ...editingSide, image_url: url })}
                                label="Dish Image"
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setSideModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={handleSaveSide} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
