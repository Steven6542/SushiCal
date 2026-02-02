import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../App';
import { Brand } from '../types';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { brands, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const region = searchParams.get('region') || 'mainland';

  const setRegion = (r: string) => {
    setSearchParams({ region: r }, { replace: true });
  };

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-0.5">{t('home.greeting')}</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t('home.title')}</h1>
          </div>
          {/* Settings button removed */}
        </div>

        {/* Search */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full p-4 pl-12 text-base rounded-2xl bg-white dark:bg-surface-dark border-none shadow-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
            placeholder={t('home.search')}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 hide-scrollbar">
        {/* Region Toggle */}
        <div className="py-4">
          <div className="flex p-1.5 bg-white dark:bg-surface-dark rounded-full shadow-sm">
            {['mainland', 'hk', 'macau'].map((r) => (
              <label key={r} className="flex-1 relative cursor-pointer">
                <input
                  type="radio"
                  name="region"
                  value={r}
                  checked={region === r}
                  onChange={() => setRegion(r)}
                  className="peer sr-only"
                />
                <div className="w-full py-3 text-center text-sm font-bold rounded-full text-slate-500 peer-checked:bg-primary peer-checked:text-slate-900 peer-checked:shadow-md transition-all duration-200 capitalize">
                  {r === 'mainland' ? t('home.mainland') : r === 'hk' ? t('home.hk') : t('home.macau')}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Brands Grid */}
        <div className="mt-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 pl-1">{t('home.popular')}</h2>
          <div className="grid grid-cols-2 gap-4 pb-8">
            {filteredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} onClick={() => navigate(`/calculator/${brand.id}?region=${region}`)} />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button (Simulated sticky bottom in flow) */}
      <div className="absolute bottom-[72px] left-0 w-full p-4 pointer-events-none flex justify-center bg-gradient-to-t from-background-light via-background-light/90 to-transparent dark:from-background-dark dark:via-background-dark/90 pb-6 pt-12">
        <button
          onClick={() => navigate('/create-brand')}
          className="pointer-events-auto w-full max-w-[90%] h-14 bg-primary hover:bg-[#1fd668] active:bg-[#1ab859] rounded-full flex items-center justify-center gap-3 shadow-[0_8px_20px_-6px_rgba(43,238,121,0.5)] transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-slate-900 text-[26px]">add_circle</span>
          <span className="text-lg font-bold text-slate-900">{t('home.create')}</span>
        </button>
      </div>
    </div>
  );
};

const BrandCard: React.FC<{ brand: Brand; onClick: () => void }> = ({ brand, onClick }) => {
  const { t } = useApp();
  return (
    <button onClick={onClick} className="group relative flex flex-col items-center p-5 bg-white dark:bg-surface-dark rounded-[2rem] shadow-sm hover:shadow-lg transition-all duration-300 active:scale-95 text-left h-full">
      {brand.tags?.includes('hot') && (
        <div className="absolute top-4 right-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          {t('home.tag.hot')}
        </div>
      )}
      {brand.tags?.includes('new') && (
        <div className="absolute top-4 right-4 bg-primary/20 text-green-700 dark:text-green-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          {t('home.tag.new')}
        </div>
      )}

      <div className="w-20 h-20 mb-4 rounded-full bg-slate-50 dark:bg-background-dark p-1 shadow-inner overflow-hidden flex items-center justify-center">
        {brand.logoUrl ? (
          <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-cover rounded-full" />
        ) : (
          <span className="text-2xl font-bold text-slate-400">{brand.name[0]}</span>
        )}
      </div>

      <div className="text-center w-full mt-auto">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{brand.name}</h3>
        {brand.description && (
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">{brand.description}</p>
        )}
      </div>
    </button>
  );
};

export default HomeScreen;