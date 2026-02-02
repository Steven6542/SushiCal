import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import { Brand, PlateType, SideDish } from '../types';

const BrandFormScreen: React.FC = () => {
    const navigate = useNavigate();
    const { addBrand, updateBrand, brands, t } = useApp();
    const location = useLocation();
    const editingBrandId = new URLSearchParams(location.search).get('edit');
    const existingBrand = editingBrandId ? brands.find(b => b.id === editingBrandId) : null;

    const [name, setName] = useState(existingBrand?.name || '');
    const [plates, setPlates] = useState<PlateType[]>(existingBrand?.plates || [
        { id: '1', name: '红碟', color: '#EF4444', price: 12 },
        { id: '2', name: '蓝碟', color: '#3B82F6', price: 18 }
    ]);
    const [sides, setSides] = useState<SideDish[]>(existingBrand?.sideDishes || [
        { id: '1', name: '味噌汤', price: 10, icon: 'soup_kitchen' }
    ]);
    const [serviceChargeType, setServiceChargeType] = useState<'percent' | 'head' | 'none'>(
        existingBrand?.defaultServiceCharge?.type || 'percent'
    );
    const [serviceChargeValue, setServiceChargeValue] = useState<number>(
        existingBrand?.defaultServiceCharge?.value ?? 10
    );

    const handleSave = async () => {
        if (!name.trim()) return;

        // 如果是编辑预置品牌（共享品牌），则创建副本
        if (existingBrand?.isShared) {
            if (!confirm(t('brand.edit_shared_confirm') || 'Editing a shared brand will create a personal copy. Continue?')) {
                return;
            }
        }

        const brandData: Brand = {
            id: existingBrand && !existingBrand.isShared ? existingBrand.id : Date.now().toString(),
            name,
            plates,
            sideDishes: sides,
            defaultServiceCharge: { type: serviceChargeType, value: serviceChargeValue },
            description: existingBrand?.description || '自定义品牌',
            isShared: false // User edited brands are always private copies
        };

        if (existingBrand && !existingBrand.isShared) {
            await updateBrand(brandData);
        } else {
            await addBrand(brandData);
        }
        navigate('/');
    };

    const updatePlate = (index: number, field: keyof PlateType, value: any) => {
        const newPlates = [...plates];
        newPlates[index] = { ...newPlates[index], [field]: value };
        setPlates(newPlates);
    };

    const addPlate = () => {
        setPlates([...plates, { id: Date.now().toString(), name: '', color: '#D1D5DB', price: 0 }]);
    };

    const updateSide = (index: number, field: keyof SideDish, value: any) => {
        const newSides = [...sides];
        newSides[index] = { ...newSides[index], [field]: value };
        setSides(newSides);
    };

    const addSide = () => {
        setSides([...sides, { id: Date.now().toString(), name: '', price: 0, icon: 'tapas' }]);
    };

    return (
        <div className="flex flex-col h-full min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="text-[#0d1b13] dark:text-gray-300 text-base font-medium leading-normal shrink-0 hover:opacity-70">
                    {t('brand.cancel')}
                </button>
                <h2 className="text-[#0d1b13] dark:text-white text-lg font-bold leading-tight absolute left-1/2 -translate-x-1/2">
                    {t('brand.new')}
                </h2>
                <button onClick={handleSave} className="text-primary text-base font-bold leading-normal shrink-0 hover:text-primary/80">
                    {t('brand.save')}
                </button>
            </div>

            <div className="flex-1 flex flex-col gap-6 p-4 pb-20 overflow-y-auto">
                {/* Basic Info */}
                <section className="flex flex-col gap-2">
                    <label className="flex flex-col w-full">
                        <p className="text-[#0d1b13] dark:text-gray-200 text-sm font-semibold uppercase tracking-wider mb-2 ml-1">{t('brand.basic')}</p>
                        <input
                            className="flex w-full rounded-xl text-[#0d1b13] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c2e24] h-14 p-[15px] text-base font-normal shadow-sm"
                            placeholder={t('brand.name_ph')}
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </label>
                </section>

                {/* Plates */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[#0d1b13] dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">{t('brand.plates')}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('brand.plates_desc')}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        {plates.map((plate, idx) => (
                            <div key={plate.id} className="flex items-center gap-3">
                                <div className="size-12 rounded-full border-4 border-white dark:border-[#1c2e24] shadow-md ring-1 ring-gray-200 dark:ring-gray-700 flex-shrink-0 relative overflow-hidden group" style={{ backgroundColor: plate.color }}>
                                    <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" value={plate.color} onChange={(e) => updatePlate(idx, 'color', e.target.value)} />
                                </div>
                                <div className="flex-1 flex gap-3">
                                    <input
                                        className="flex w-full min-w-0 flex-1 rounded-xl text-[#0d1b13] dark:text-white focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c2e24] h-12 px-4 text-base font-medium shadow-sm"
                                        placeholder={t('brand.name')}
                                        value={plate.name}
                                        onChange={(e) => updatePlate(idx, 'name', e.target.value)}
                                    />
                                    <div className="relative w-24 flex-shrink-0">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">¥</span>
                                        <input
                                            className="w-full rounded-xl text-right text-[#0d1b13] dark:text-white focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c2e24] h-12 pl-6 pr-4 text-base font-semibold shadow-sm"
                                            type="number"
                                            value={plate.price}
                                            onChange={(e) => updatePlate(idx, 'price', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setPlates(plates.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                    <span className="material-symbols-outlined text-[20px]">remove_circle</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addPlate} className="flex items-center justify-center gap-2 w-full py-3 mt-1 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-primary font-bold bg-gray-50/50 dark:bg-white/5 hover:bg-primary/5 hover:border-primary/50 transition-all">
                        <span className="material-symbols-outlined">add</span>
                        {t('brand.add_plate')}
                    </button>
                </section>

                <div className="h-px bg-gray-200 dark:bg-gray-800 my-2"></div>

                {/* Side Dishes (Extra Menu) */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[#0d1b13] dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">{t('brand.sides')}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('brand.sides_desc')}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        {sides.map((side, idx) => (
                            <div key={side.id} className="flex items-center gap-3">
                                <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 text-orange-500">
                                    <span className="material-symbols-outlined">restaurant_menu</span>
                                </div>
                                <div className="flex-1 flex gap-3">
                                    <input
                                        className="flex w-full min-w-0 flex-1 rounded-xl text-[#0d1b13] dark:text-white focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c2e24] h-12 px-4 text-base font-medium shadow-sm"
                                        placeholder={t('brand.dish_name')}
                                        value={side.name}
                                        onChange={(e) => updateSide(idx, 'name', e.target.value)}
                                    />
                                    <div className="relative w-24 flex-shrink-0">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">¥</span>
                                        <input
                                            className="w-full rounded-xl text-right text-[#0d1b13] dark:text-white focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c2e24] h-12 pl-6 pr-4 text-base font-semibold shadow-sm"
                                            type="number"
                                            value={side.price}
                                            onChange={(e) => updateSide(idx, 'price', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setSides(sides.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                    <span className="material-symbols-outlined text-[20px]">remove_circle</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addSide} className="flex items-center justify-center gap-2 w-full py-3 mt-1 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-primary font-bold bg-gray-50/50 dark:bg-white/5 hover:bg-primary/5 hover:border-primary/50 transition-all">
                        <span className="material-symbols-outlined">add</span>
                        {t('brand.add_side')}
                    </button>
                </section>

                <div className="h-px bg-gray-200 dark:bg-gray-800 my-2"></div>

                {/* Service Charge */}
                <section className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[#0d1b13] dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">{t('calc.service')}</h3>
                    </div>
                    <div className="bg-white dark:bg-[#1c2e24] p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
                        <div className="flex p-1 bg-gray-100 dark:bg-background-dark rounded-xl">
                            <button
                                onClick={() => { setServiceChargeType('percent'); setServiceChargeValue(10); }}
                                className={`flex-1 py-2 px-4 rounded-lg shadow-sm text-sm font-bold transition-all ${serviceChargeType === 'percent' ? 'bg-white dark:bg-[#1c2e24] text-[#0d1b13] dark:text-white' : 'bg-transparent text-gray-500 shadow-none'}`}
                            >
                                {t('calc.percent')}
                            </button>
                            <button
                                onClick={() => { setServiceChargeType('head'); setServiceChargeValue(5); }}
                                className={`flex-1 py-2 px-4 rounded-lg shadow-sm text-sm font-bold transition-all ${serviceChargeType === 'head' ? 'bg-white dark:bg-[#1c2e24] text-[#0d1b13] dark:text-white' : 'bg-transparent text-gray-500 shadow-none'}`}
                            >
                                {t('calc.head')}
                            </button>
                        </div>
                        {serviceChargeType !== 'none' && (
                            <div className="flex items-center gap-4">
                                <label className="flex-1 text-base font-medium text-[#0d1b13] dark:text-gray-200">
                                    {serviceChargeType === 'percent' ? t('calc.rate') : t('calc.price_head')}
                                </label>
                                <div className="relative w-32 flex-shrink-0">
                                    <input
                                        className="w-full rounded-xl text-right text-[#0d1b13] dark:text-white focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 h-12 pl-4 pr-10 text-lg font-bold shadow-inner"
                                        type="number"
                                        value={serviceChargeValue}
                                        onChange={e => setServiceChargeValue(Number(e.target.value))}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                                        {serviceChargeType === 'percent' ? '%' : '¥'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default BrandFormScreen;