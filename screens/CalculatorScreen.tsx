import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../App';
import { ServiceChargeConfig, Region, MealItem } from '../types';
import { GET_CURRENCY } from '../constants';

const CalculatorScreen: React.FC = () => {
    const { brandId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { brands, addMeal, user, t } = useApp();
    const brand = brands.find(b => b.id === brandId);
    const region = (searchParams.get('region') as Region) || 'mainland';
    const currencySymbol = GET_CURRENCY(region);

    const [plateCounts, setPlateCounts] = useState<Record<string, number>>({});
    const [sideCounts, setSideCounts] = useState<Record<string, number>>({});

    // Initialize service charge with logic for specific region/brand rules
    const [serviceCharge, setServiceCharge] = useState<ServiceChargeConfig>(() => {
        if (!brand) return { type: 'percent', value: 10 };

        // Special rule: Mainland China Sushiro uses 5 RMB per head service fee
        if (brand.id === 'sushiro' && region === 'mainland') {
            return { type: 'head', value: 5 };
        }

        return brand.defaultServiceCharge;
    });

    const [headCount, setHeadCount] = useState<number>(1);
    const [showConfirm, setShowConfirm] = useState(false);

    // If brand not found, redirect
    if (!brand) return <div className="p-10 text-center">Brand not found</div>;

    const totalPlates = Object.values(plateCounts).reduce((a: number, b: number) => a + b, 0);

    const subtotal = useMemo(() => {
        let sum = 0;
        brand.plates.forEach(p => {
            sum += (plateCounts[p.id] || 0) * p.price;
        });
        brand.sideDishes.forEach(s => {
            sum += (sideCounts[s.id] || 0) * s.price;
        });
        return sum;
    }, [brand, plateCounts, sideCounts]);

    const serviceChargeAmount = useMemo(() => {
        if (serviceCharge.type === 'percent') {
            return subtotal * (serviceCharge.value / 100);
        }
        if (serviceCharge.type === 'head') {
            return serviceCharge.value * headCount;
        }
        return 0;
    }, [subtotal, serviceCharge, headCount]);

    const total = subtotal + serviceChargeAmount;

    const updatePlate = (id: string, delta: number) => {
        setPlateCounts(prev => {
            const next = (prev[id] || 0) + delta;
            return { ...prev, [id]: next < 0 ? 0 : next };
        });
    };

    const updateSide = (id: string, delta: number) => {
        setSideCounts(prev => {
            const next = (prev[id] || 0) + delta;
            return { ...prev, [id]: next < 0 ? 0 : next };
        });
    };

    const reset = () => {
        setPlateCounts({});
        setSideCounts({});
        setHeadCount(1);
    };

    const confirmFinish = () => {
        const items: MealItem[] = [];
        brand.plates.forEach(p => {
            if (plateCounts[p.id] > 0) {
                items.push({
                    name: p.name,
                    price: p.price,
                    quantity: plateCounts[p.id],
                    type: 'plate',
                    color: p.color
                });
            }
        });
        brand.sideDishes.forEach(s => {
            if (sideCounts[s.id] > 0) {
                items.push({
                    name: s.name,
                    price: s.price,
                    quantity: sideCounts[s.id],
                    type: 'side',
                    icon: s.icon
                });
            }
        });

        addMeal({
            id: Date.now().toString(),
            brandName: brand.name,
            brandLogo: brand.logoUrl,
            date: new Date().toISOString(),
            totalPrice: total,
            totalPlates,
            region: region,
            currencySymbol: currencySymbol,
            items,
            serviceChargeAmount,
            serviceChargeRule: serviceCharge,
            headCount
        });
        navigate('/history');
    };

    return (
        <div className="relative flex flex-col h-full min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div onClick={() => navigate('/')} className="flex flex-col cursor-pointer">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs font-semibold tracking-wide uppercase">
                        <span className="material-symbols-outlined text-[16px]">arrow_back_ios</span>
                        <span>{t('calc.back')}</span>
                    </div>
                    <h1 className="text-xl font-bold leading-tight text-gray-900 dark:text-white mt-1">{brand.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {!brand.isShared && (
                        <button
                            onClick={() => navigate(`/create-brand?edit=${brand.id}`)}
                            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                        >
                            <span className="material-symbols-outlined">edit</span>
                        </button>
                    )}
                    <button onClick={() => navigate('/history')} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200">
                        <span className="material-symbols-outlined">history</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-32 hide-scrollbar">
                {/* Totals Card */}
                <section className="px-4 pt-6 pb-2">
                    <div className="relative overflow-hidden rounded-2xl bg-surface-dark p-6 shadow-soft group text-center">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all"></div>
                        <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">{t('calc.est_total')}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-primary">{currencySymbol}</span>
                                <span className="text-6xl font-extrabold tracking-tighter text-white">{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">{t('calc.total_plates')}</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalPlates}</span>
                        </div>
                        <button onClick={reset} className="rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                            <span className="text-red-500 font-bold text-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                                {t('calc.reset')}
                            </span>
                        </button>
                    </div>
                </section>

                {/* Service Charge Config */}
                <section className="mt-4 px-4">
                    <div className="rounded-2xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">{t('calc.service')}</h3>
                            <span className="text-xs text-gray-500 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{t('calc.optional')}</span>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                            <button
                                onClick={() => setServiceCharge({ ...serviceCharge, type: 'percent' })}
                                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${serviceCharge.type === 'percent' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {t('calc.percent')}
                            </button>
                            <button
                                onClick={() => setServiceCharge({ ...serviceCharge, type: 'head' })}
                                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${serviceCharge.type === 'head' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {t('calc.head')}
                            </button>
                            <button
                                onClick={() => setServiceCharge({ ...serviceCharge, type: 'none' })}
                                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${serviceCharge.type === 'none' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {t('calc.none')}
                            </button>
                        </div>

                        {/* Details Config */}
                        {serviceCharge.type === 'percent' && (
                            <div className="flex items-center gap-4 bg-gray-50 dark:bg-black/20 p-3 rounded-xl">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('calc.rate')} (%)</label>
                                <input
                                    className="flex-1 min-w-0 bg-white dark:bg-gray-700 rounded-lg border-0 py-2 px-3 text-right font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50"
                                    type="number"
                                    value={serviceCharge.value}
                                    onChange={(e) => setServiceCharge({ ...serviceCharge, value: Number(e.target.value) })}
                                />
                            </div>
                        )}

                        {serviceCharge.type === 'head' && (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-black/20 p-3 rounded-xl">
                                    <label className="flex-1 text-sm font-medium text-gray-600 dark:text-gray-300">{t('calc.price_head')}</label>
                                    <div className="relative w-24">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{currencySymbol}</span>
                                        <input
                                            className="w-full bg-white dark:bg-gray-700 rounded-lg border-0 py-2 pl-6 pr-2 text-right font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50"
                                            type="number"
                                            value={serviceCharge.value}
                                            onChange={(e) => setServiceCharge({ ...serviceCharge, value: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-black/20 p-3 rounded-xl">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('calc.head_count')}</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setHeadCount(Math.max(1, headCount - 1))}
                                            className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-primary shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white w-6 text-center">{headCount}</span>
                                        <button
                                            onClick={() => setHeadCount(headCount + 1)}
                                            className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Plates */}
                <section className="mt-8 px-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">{t('calc.plate_count')}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {brand.plates.map(plate => (
                            <div key={plate.id} className="relative flex flex-col items-center rounded-2xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="mb-3 h-16 w-16 rounded-full border-4 border-white dark:border-surface-dark ring-2 ring-gray-100 dark:ring-gray-700 shadow-lg" style={{ backgroundColor: plate.color }}></div>
                                <div className="text-center mb-4">
                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{plate.name}</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{currencySymbol}{plate.price}</p>
                                </div>
                                <div className="flex w-full items-center justify-between bg-gray-50 dark:bg-black/20 rounded-full p-1">
                                    <button onClick={() => updatePlate(plate.id, -1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-700 text-gray-500 shadow-sm hover:text-gray-600 active:scale-90 transition-all">
                                        <span className="material-symbols-outlined">remove</span>
                                    </button>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white w-8 text-center">{plateCounts[plate.id] || 0}</span>
                                    <button onClick={() => updatePlate(plate.id, 1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-background-dark shadow-glow hover:bg-primary/90 active:scale-90 transition-all">
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Side Dishes */}
                {brand.sideDishes.length > 0 && (
                    <section className="mt-8 px-4 pb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('calc.sides')}</h2>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{t('calc.side_desc')}</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {brand.sideDishes.map(side => (
                                <div key={side.id} className="flex items-center justify-between rounded-xl bg-white dark:bg-surface-dark p-3 pr-4 shadow-sm border border-gray-100 dark:border-gray-800 group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                            <span className="material-symbols-outlined">{side.icon}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{side.name}</span>
                                            <span className="text-primary font-bold text-sm">{currencySymbol}{side.price}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-gray-50 dark:bg-black/20 rounded-full p-1 h-9 gap-1">
                                        <button onClick={() => updateSide(side.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                            <span className="material-symbols-outlined text-[16px]">remove</span>
                                        </button>
                                        <span className="w-6 text-center font-bold text-gray-900 dark:text-white text-sm">{sideCounts[side.id] || 0}</span>
                                        <button onClick={() => updateSide(side.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-background-dark shadow-sm hover:brightness-110 active:scale-95 transition-all">
                                            <span className="material-symbols-outlined text-[16px]">add</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Floating Action Button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent backdrop-blur-sm z-30">
                <button onClick={() => setShowConfirm(true)} className="w-full bg-primary text-background-dark font-black text-lg py-4 rounded-2xl shadow-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {t('calc.finish')}
                </button>
            </div>

            {/* Modal Overlay */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-[1px]">
                    <div className="bg-background-light dark:bg-background-dark rounded-t-3xl w-full max-w-md mx-auto overflow-hidden animate-in slide-in-from-bottom duration-300 shadow-2xl">
                        <div className="flex flex-col items-center pt-3">
                            <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        </div>
                        <div className="px-6 pt-8 pb-4 text-center">
                            <h3 className="text-gray-900 dark:text-white tracking-tight text-2xl font-bold leading-tight">{t('calc.modal.title')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{t('calc.modal.desc')}</p>
                        </div>
                        <div className="px-6 py-4">
                            <div className="flex gap-4">
                                <div className="flex-1 flex flex-col gap-2 rounded-xl p-5 border border-primary/20 bg-primary/5 dark:bg-primary/10">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-xl">payments</span>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">{t('calc.modal.bill')}</p>
                                    </div>
                                    <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold"><span className="text-lg font-semibold mr-1">{currencySymbol}</span>{total.toFixed(0)}</p>
                                </div>
                                <div className="flex-1 flex flex-col gap-2 rounded-xl p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-500 text-xl">layers</span>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">{t('calc.modal.plates')}</p>
                                    </div>
                                    <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold">{totalPlates}<span className="text-base font-normal ml-1">{t('history.unit')}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 px-6 py-6 pb-10">
                            <button onClick={confirmFinish} className="w-full h-14 bg-primary text-[#0d1b13] text-lg font-bold rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">{t('calc.modal.confirm')}</button>
                            <button onClick={() => setShowConfirm(false)} className="w-full h-14 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-lg font-bold rounded-full active:scale-[0.98] transition-transform">{t('calc.modal.cancel')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalculatorScreen;