import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { getRegionName } from '../utils/regionUtils';

// Define html2canvas type roughly for global access
declare global {
    interface Window {
        html2canvas: any;
    }
}

const HistoryDetailScreen: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { history, t } = useApp();
    const [isSharing, setIsSharing] = useState(false);

    const record = history.find(h => h.id === id);

    if (!record) return <div className="p-10 text-center text-slate-500">Record not found</div>;

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        // Format: 2023年10月12日 19:30
        return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const getLocationName = (region: string) => {
        switch (region) {
            case 'hk': return t('home.hk');
            case 'taiwan': return t('home.taiwan');
            case 'mainland': return t('home.mainland');
            default: return region;
        }
    };

    const handleShare = async () => {
        const element = document.getElementById('receipt-card');
        const html2canvas = (window as any).html2canvas;

        if (element && html2canvas) {
            setIsSharing(true);
            try {
                const canvas = await html2canvas(element, {
                    backgroundColor: null, // Keep transparency if any
                    scale: 2, // Better resolution
                    useCORS: true, // Needed for images
                });

                canvas.toBlob(async (blob: Blob | null) => {
                    if (!blob) return;

                    const file = new File([blob], `sushi_bill_${record.id}.png`, { type: 'image/png' });

                    if (navigator.share) {
                        try {
                            await navigator.share({
                                title: `Sushi Bill - ${record.brandName}`,
                                text: `我在 ${record.brandName} 吃寿司花了 ${record.currencySymbol}${record.totalPrice}!`,
                                files: [file],
                            });
                        } catch (err) {
                            console.log('Share cancelled or failed', err);
                            // Fallback to download
                            saveBlob(blob, `sushi_bill_${record.id}.png`);
                        }
                    } else {
                        // Fallback for desktop or non-supported browsers
                        saveBlob(blob, `sushi_bill_${record.id}.png`);
                    }
                    setIsSharing(false);
                }, 'image/png');
            } catch (error) {
                console.error("Screenshot failed", error);
                alert(t('detail.fail'));
                setIsSharing(false);
            }
        } else {
            alert("组件未加载完成");
        }
    };

    const saveBlob = (blob: Blob, fileName: string) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert(t('detail.saved'));
    };

    const plates = record.items?.filter(i => i.type === 'plate') || [];
    const sides = record.items?.filter(i => i.type === 'side') || [];

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                    <span className="text-sm font-bold">{t('detail.back')}</span>
                </button>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t('detail.title')}</h1>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            <div className="flex-1 overflow-y-auto p-4 pb-20">
                {/* Receipt Card */}
                <div id="receipt-card" className="bg-white dark:bg-surface-dark rounded-3xl shadow-soft p-6 border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors duration-300">
                    {/* Decorative jagged edge at top */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-[length:16px_16px] bg-[linear-gradient(135deg,transparent_75%,#f6f8f7_75%)_0_0,linear-gradient(-135deg,transparent_75%,#f6f8f7_75%)_0_0] dark:bg-[linear-gradient(135deg,transparent_75%,#102217_75%)_0_0,linear-gradient(-135deg,transparent_75%,#102217_75%)_0_0] bg-repeat-x opacity-30"></div>

                    <div className="flex flex-col items-center mb-6 pt-4">
                        <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-black/20 p-1 mb-4">
                            {record.brandLogo ? (
                                <img src={record.brandLogo} alt="" className="h-full w-full rounded-full object-cover cross-origin-anonymous" />
                            ) : (
                                <div className="h-full w-full rounded-full flex items-center justify-center font-bold text-slate-400 text-2xl bg-white dark:bg-surface-dark">{record.brandName[0]}</div>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{record.brandName}</h2>

                        {/* Time and Location Display */}
                        <div className="flex flex-col items-center gap-1.5 mt-2">
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                <span>{formatDate(record.date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                <span>{getRegionName(record.region as any, t)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-6"></div>

                    {/* Items List */}
                    <div className="flex flex-col gap-4">
                        {plates.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-slate-700 dark:text-slate-200 font-medium">{item.name}</span>
                                    <span className="text-slate-400 text-xs font-medium">x{item.quantity}</span>
                                </div>
                                <span className="text-slate-900 dark:text-white font-bold">{record.currencySymbol}{(item.price * item.quantity).toFixed(0)}</span>
                            </div>
                        ))}

                        {sides.length > 0 && <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>}

                        {sides.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-sm text-orange-500">{item.icon}</span>
                                    <span className="text-slate-700 dark:text-slate-200 font-medium">{item.name}</span>
                                    <span className="text-slate-400 text-xs font-medium">x{item.quantity}</span>
                                </div>
                                <span className="text-slate-900 dark:text-white font-bold">{record.currencySymbol}{(item.price * item.quantity).toFixed(0)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-6"></div>

                    {/* Breakdown */}
                    <div className="flex flex-col gap-2 mb-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">{t('detail.subtotal')}</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {record.currencySymbol}
                                {(record.totalPrice - (record.serviceChargeAmount || 0)).toFixed(2)}
                            </span>
                        </div>
                        {(record.serviceChargeAmount ?? 0) > 0 && record.serviceChargeRule && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">{t('detail.service')} ({record.serviceChargeRule.type === 'percent' ? `${record.serviceChargeRule.value}%` : t('calc.head')})</span>
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{record.currencySymbol}{record.serviceChargeAmount?.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className="bg-gray-50 dark:bg-black/20 -mx-6 -mb-6 p-6 flex justify-between items-center mt-4">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">{t('detail.total')}</span>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{record.currencySymbol}{record.totalPrice.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="text-primary font-bold text-sm flex items-center justify-center gap-2 mx-auto hover:opacity-80 transition-opacity bg-white dark:bg-surface-dark py-3 px-6 rounded-full shadow-sm"
                    >
                        {isSharing ? (
                            <>
                                <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                                {t('detail.generating')}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">share</span>
                                {t('detail.share')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistoryDetailScreen;