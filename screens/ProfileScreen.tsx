import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';

const ProfileScreen: React.FC = () => {
  const { history, language, setLanguage, t, logout } = useApp();
  const navigate = useNavigate();
  
  const totalMeals = history.length;
  const totalPlates = history.reduce((acc, curr) => acc + curr.totalPlates, 0);

  type ThemeMode = 'light' | 'dark' | 'auto';
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  // Currency Toggle Logic
  const currencies = ['¥', 'HK$', 'MOP$'];
  const [currencyIdx, setCurrencyIdx] = useState(0);
  const currentCurrency = currencies[currencyIdx];
  
  // Modal states
  const [showLangModal, setShowLangModal] = useState(false);

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (dark: boolean) => {
        if (dark) {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }
    };

    if (themeMode === 'auto') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        applyTheme(mediaQuery.matches);
        
        const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    } else {
        applyTheme(themeMode === 'dark');
    }
  }, [themeMode]);

  // Exchange Rate Logic (Base: HKD)
  const calculateTotalSpent = useMemo(() => {
      // Rates to convert TO HKD
      const toHKD: Record<string, number> = {
          'HK$': 1,
          'MOP$': 0.97,
          '¥': 1.08,
      };

      // Rates to convert FROM HKD to Target
      const fromHKD: Record<string, number> = {
          'HK$': 1,
          'MOP$': 1.03,
          '¥': 0.92,
      };

      const totalInHKD = history.reduce((acc, curr) => {
          const rate = toHKD[curr.currencySymbol] || 1;
          return acc + (curr.totalPrice * rate);
      }, 0);

      const targetRate = fromHKD[currentCurrency] || 1;
      return totalInHKD * targetRate;
  }, [history, currentCurrency]);

  const toggleCurrency = () => {
      setCurrencyIdx((prev) => (prev + 1) % currencies.length);
  };

  const languageOptions = [
      { label: '简体中文', value: '简体中文' },
      { label: '繁体中文', value: '繁体中文' }
  ];

  const themeOptions = [
    { label: t('profile.theme_auto'), value: 'auto' },
    { label: t('profile.theme_light'), value: 'light' },
    { label: t('profile.theme_dark'), value: 'dark' },
  ];

  const getThemeLabel = (mode: ThemeMode) => {
      switch(mode) {
          case 'auto': return t('profile.theme_auto');
          case 'dark': return t('profile.theme_dark');
          case 'light': return t('profile.theme_light');
      }
  };

  const handleLogout = () => {
      logout();
      navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        {/* Profile Header */}
        <div className="relative pt-12 pb-8 px-6 bg-surface-light dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 rounded-b-[2.5rem] shadow-sm z-10 transition-colors duration-300">
            <div className="flex items-center gap-4 mb-6">
                 <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-emerald-600 p-[2px] shadow-lg">
                    <div className="h-full w-full rounded-full bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-800 overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="Avatar" className="h-full w-full object-cover" />
                    </div>
                 </div>
                 <div>
                     <h1 className="text-2xl font-black tracking-tight mb-1">{t('profile.title')}</h1>
                     <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">SushiCalc ID: 884920</p>
                 </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-between gap-2">
                <div className="flex-1 bg-gray-50 dark:bg-black/20 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{totalMeals}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{t('profile.meals')}</p>
                </div>
                 <div className="flex-1 bg-gray-50 dark:bg-black/20 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{totalPlates}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{t('profile.plates')}</p>
                </div>
                 <button onClick={toggleCurrency} className="flex-1 bg-gray-50 dark:bg-black/20 rounded-2xl p-4 text-center hover:bg-gray-100 dark:hover:bg-black/30 transition-colors relative group active:scale-95">
                    <p className="text-2xl font-black text-primary">
                        {(calculateTotalSpent / 1000).toFixed(1)}k
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('profile.spent')}</p>
                        <span className="text-[10px] font-bold text-slate-300 bg-slate-200 dark:bg-slate-700 px-1 rounded">{currentCurrency}</span>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="material-symbols-outlined text-slate-300 text-[14px]">swap_horiz</span>
                    </div>
                </button>
            </div>
        </div>

        {/* Menu Items */}
        <div className="p-6 space-y-6">
            
            <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">{t('profile.pref')}</h3>
                <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
                    <MenuItem 
                        icon="translate" 
                        label={t('profile.lang')} 
                        value={language} 
                        onClick={() => setShowLangModal(true)}
                    />
                    <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4"></div>
                    <MenuItem 
                        icon="palette" 
                        label={t('profile.theme')} 
                        value={getThemeLabel(themeMode)} 
                        onClick={() => setShowThemeModal(true)}
                    />
                </div>
            </section>

             <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">{t('profile.other')}</h3>
                <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
                    <MenuItem icon="help" label={t('profile.help')} onClick={() => alert("功能开发中...")} />
                    <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4"></div>
                    <MenuItem icon="info" label={t('profile.about')} value="v1.0.3" onClick={() => {}} />
                </div>
            </section>
            
            <button 
                onClick={handleLogout}
                className="w-full py-4 text-red-500 font-bold bg-white dark:bg-surface-dark rounded-2xl shadow-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
                {t('profile.logout')}
            </button>
        </div>
      </div>

      <SelectionModal 
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
        title={t('profile.select_lang')}
        options={languageOptions}
        selected={language}
        onSelect={(val) => setLanguage(val as any)}
      />

      <SelectionModal 
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        title={t('profile.select_theme')}
        options={themeOptions}
        selected={themeMode}
        onSelect={(val) => setThemeMode(val as any)}
      />
    </div>
  );
};

interface MenuItemProps {
    icon: string;
    label: string;
    value?: string;
    onClick: () => void;
    action?: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, value, onClick, action }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors cursor-pointer text-left">
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {value && <span className="text-sm font-medium text-slate-400">{value}</span>}
            {action ? action : <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>}
        </div>
    </button>
);

interface SelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    options: { label: string; value: string }[];
    selected: string;
    onSelect: (value: string) => void;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ isOpen, onClose, title, options, selected, onSelect }) => {
    if (!isOpen) return null;
    const { t } = useApp();

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-surface-light dark:bg-surface-dark w-full max-w-md rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                <div className="flex justify-center mb-6" onClick={onClose}>
                     <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">{title}</h3>
                <div className="flex flex-col gap-2 mb-8">
                    {options.map((opt) => (
                        <button 
                            key={opt.value}
                            onClick={() => { onSelect(opt.value); onClose(); }}
                            className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                                selected === opt.value 
                                ? 'bg-primary/10 text-primary font-bold shadow-sm border border-primary/20' 
                                : 'bg-gray-50 dark:bg-black/20 text-slate-700 dark:text-slate-300 font-medium hover:bg-gray-100 dark:hover:bg-black/40 border border-transparent'
                            }`}
                        >
                            <span>{opt.label}</span>
                            {selected === opt.value && <span className="material-symbols-outlined font-bold">check</span>}
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="w-full py-4 text-slate-500 dark:text-slate-400 font-bold bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {t('profile.cancel')}
                </button>
            </div>
        </div>
    );
};

export default ProfileScreen;