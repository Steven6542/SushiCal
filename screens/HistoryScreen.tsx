import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { MealRecord, Region } from '../types';

const HistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { history, t } = useApp();
  const [filterRegion, setFilterRegion] = useState<Region | 'all'>('all');

  const filteredHistory = filterRegion === 'all' 
    ? history 
    : history.filter(h => h.region === filterRegion);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`;
  };

  const getMonthLabel = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月`;
  };
  
  // Group by month
  const groupedHistory = filteredHistory.reduce((acc, curr) => {
    const month = getMonthLabel(curr.date);
    if (!acc[month]) acc[month] = [];
    acc[month].push(curr);
    return acc;
  }, {} as Record<string, MealRecord[]>);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-50 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md pt-6 pb-2 px-6">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('history.title')}</h1>
            {/* Settings button removed as requested */}
        </div>
        
        {/* Search & Filter */}
        <div className="flex gap-3 items-center">
             <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">search</span>
                </div>
                <input 
                    className="block w-full pl-11 pr-4 py-3.5 bg-surface-light dark:bg-surface-dark border-none rounded-full text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary focus:outline-none shadow-sm" 
                    placeholder={t('history.search')} 
                    type="text"
                />
            </div>
            {/* Filter button removed as requested */}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 py-4 overflow-x-auto hide-scrollbar -mx-6 px-6">
            <FilterTab label={t('history.all')} active={filterRegion === 'all'} onClick={() => setFilterRegion('all')} />
            <FilterTab label={t('home.hk')} active={filterRegion === 'hk'} onClick={() => setFilterRegion('hk')} />
            <FilterTab label={t('home.macau')} active={filterRegion === 'macau'} onClick={() => setFilterRegion('macau')} />
            <FilterTab label={t('home.mainland')} active={filterRegion === 'mainland'} onClick={() => setFilterRegion('mainland')} />
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col flex-1 px-4 pb-24 space-y-4 overflow-y-auto hide-scrollbar">
        {Object.entries(groupedHistory).map(([month, records]: [string, MealRecord[]]) => (
            <React.Fragment key={month}>
                <div className="flex items-center gap-4 py-2 opacity-60">
                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700"></div>
                    <span className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400">{month}</span>
                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700"></div>
                </div>
                {records.map(record => (
                     <div key={record.id} onClick={() => navigate(`/history/${record.id}`)} className="group relative flex items-center gap-4 p-4 rounded-2xl bg-surface-light dark:bg-surface-dark shadow-soft hover:shadow-lg transition-all duration-300 border border-transparent dark:border-slate-800 cursor-pointer">
                        <div className="relative shrink-0">
                            {record.brandLogo ? (
                                <img src={record.brandLogo} alt="" className="h-16 w-16 rounded-full object-cover shadow-inner" />
                            ) : (
                                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">{record.brandName[0]}</div>
                            )}
                            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                                <span className="material-symbols-outlined text-[14px] text-primary">restaurant</span>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col justify-center min-w-0">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate pr-2">{record.brandName}</h3>
                                <p className="text-lg font-bold text-slate-900 dark:text-primary whitespace-nowrap">{record.currencySymbol}{record.totalPrice.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between items-end mt-1">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{formatDate(record.date)}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                            record.region === 'hk' ? 'bg-primary/20 dark:bg-primary/10 text-emerald-800 dark:text-primary' :
                                            record.region === 'mainland' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                                            'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                                        }`}>
                                            {record.region === 'hk' ? t('home.hk') : record.region === 'mainland' ? t('home.mainland') : t('home.macau')}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">{record.totalPlates} {t('history.unit')}</p>
                            </div>
                        </div>
                         <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </div>
                    </div>
                ))}
            </React.Fragment>
        ))}
        
        {filteredHistory.length === 0 && (
             <div className="text-center pt-8 pb-4">
                <p className="text-sm text-slate-400 dark:text-slate-600">{t('history.empty')}</p>
            </div>
        )}
      </div>

       <div className="fixed bottom-[88px] right-6 z-30">
        <button className="flex items-center justify-center w-14 h-14 bg-primary text-slate-900 rounded-full shadow-lg hover:bg-primary-dark hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-primary/40">
            <span className="material-symbols-outlined text-[28px] font-bold">add</span>
        </button>
      </div>

    </div>
  );
};

const FilterTab: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm whitespace-nowrap transition-colors ${
            active 
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
            : 'bg-surface-light dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
    >
        {label}
    </button>
);

export default HistoryScreen;