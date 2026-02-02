import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../App';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useApp();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-surface-light dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-20 sticky bottom-0 w-full">
      <button 
        onClick={() => navigate('/')}
        className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
      >
        <span className={`material-symbols-outlined ${isActive('/') ? 'fill-current' : ''}`}>home</span>
        {isActive('/') && <span className="text-[10px] font-bold">{t('nav.home')}</span>}
      </button>
      
      <button 
        onClick={() => navigate('/history')}
        className={`flex flex-col items-center gap-1 transition-colors ${isActive('/history') ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
      >
        <span className={`material-symbols-outlined ${isActive('/history') ? 'fill-current' : ''}`}>history</span>
        {isActive('/history') && <span className="text-[10px] font-bold">{t('nav.history')}</span>}
      </button>
      
      <button 
        onClick={() => navigate('/profile')}
        className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
      >
        <span className={`material-symbols-outlined ${isActive('/profile') ? 'fill-current' : ''}`}>person</span>
        {isActive('/profile') && <span className="text-[10px] font-bold">{t('nav.profile')}</span>}
      </button>
    </div>
  );
};

export default BottomNav;