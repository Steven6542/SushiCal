import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Brand } from '../types';

interface OrderEditorProps {
    brands: Brand[];
    onClose: () => void;
    onSave: () => void; // Reloads data
}

export function OrderEditor({ brands, onClose, onSave }: OrderEditorProps) {
    const [items, setItems] = useState(brands);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setItems(brands.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)));
    }, [brands]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = items.map((brand, index) => ({
                id: brand.id,
                sort_order: index + 1 // 1-based index
            }));

            for (const update of updates) {
                await supabase.from('brands').update({ sort_order: update.sort_order }).eq('id', update.id);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save order:', error);
            alert('Failed to save order');
        } finally {
            setSaving(false);
        }
    };

    const move = (index: number, direction: -1 | 1) => {
        const newItems = [...items];
        if (index + direction < 0 || index + direction >= newItems.length) return;

        const temp = newItems[index];
        newItems[index] = newItems[index + direction];
        newItems[index + direction] = temp;
        setItems(newItems);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] flex flex-col">
                <h3 className="text-xl font-bold mb-4">Reorder Brands</h3>
                <div className="flex-1 overflow-auto space-y-2">
                    {items.map((brand, index) => (
                        <div key={brand.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                            <span className="font-medium">{index + 1}. {brand.name}</span>
                            <div className="flex gap-1">
                                <button onClick={() => move(index, -1)} disabled={index === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">⬆️</button>
                                <button onClick={() => move(index, 1)} disabled={index === items.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">⬇️</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Order'}
                    </button>
                </div>
            </div>
        </div>
    );
}
