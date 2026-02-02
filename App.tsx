import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Brand, MealRecord } from './types';
import { translations, Language } from './i18n';
import * as authService from './services/authService';
import * as brandService from './services/brandService';
import * as mealService from './services/mealService';

// --- Screens ---
import HomeScreen from './screens/HomeScreen';
import BrandFormScreen from './screens/BrandFormScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import HistoryScreen from './screens/HistoryScreen';
import HistoryDetailScreen from './screens/HistoryDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import BottomNav from './components/BottomNav';

interface User {
  id: string;
  email?: string;
}

// --- Global Context ---
interface AppContextType {
  brands: Brand[];
  history: MealRecord[];
  addMeal: (meal: MealRecord) => void;
  addBrand: (brand: Brand) => void;
  updateBrand: (brand: Brand) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: string;
  setCurrency: (curr: string) => void;
  t: (key: string) => string;
  isLoggedIn: boolean;
  login: (u: string, p: string) => boolean;
  register: (u: string, p: string) => boolean;
  logout: () => void;
  loginAsGuest: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useApp();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  // Show bottom nav on Home, History, and Profile, but only if logged in
  const { isLoggedIn } = useApp();
  const showBottomNav = isLoggedIn && ['/', '/history', '/profile'].includes(location.pathname);

  return (
    <div className="flex flex-col h-full min-h-screen bg-background-light dark:bg-background-dark max-w-md mx-auto shadow-2xl overflow-hidden relative">
      <div className="flex-1 overflow-hidden flex flex-col">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />

          <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryScreen /></ProtectedRoute>} />
          <Route path="/history/:id" element={<ProtectedRoute><HistoryDetailScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/create-brand" element={<ProtectedRoute><BrandFormScreen /></ProtectedRoute>} />
          <Route path="/calculator/:brandId" element={<ProtectedRoute><CalculatorScreen /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [history, setHistory] = useState<MealRecord[]>([]);
  const [language, setLanguage] = useState<Language>('简体中文');
  const [currency, setCurrency] = useState('¥');
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Initialize auth state and load data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsLoggedIn(true);
          // Load user data
          await loadUserData(currentUser.id);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: authListener } = authService.onAuthStateChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        setIsLoggedIn(true);
        await loadUserData(authUser.id);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setBrands([]);
        setHistory([]);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Load user data from Supabase
  const loadUserData = async (userId: string) => {
    try {
      // Load brands
      const brandsData = await brandService.getBrands();
      setBrands(brandsData);

      // Load meal history
      const historyData = await mealService.getMealRecords(userId);
      setHistory(historyData);

      // Load user profile
      const profile = await authService.getUserProfile(userId);
      if (profile) {
        setLanguage(profile.language as Language);
        setCurrency(profile.currency);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const addMeal = async (meal: MealRecord) => {
    if (isGuestMode || !user) {
      // Guest mode - just add to local state
      setHistory(prev => [meal, ...prev]);
      return;
    }

    try {
      await mealService.createMealRecord(meal, user.id);
      setHistory(prev => [meal, ...prev]);
    } catch (error) {
      console.error('Failed to add meal:', error);
      alert('保存餐饮记录失败，请重试');
    }
  };

  const addBrand = async (brand: Brand) => {
    if (isGuestMode || !user) {
      // Guest mode - just add to local state
      setBrands(prev => [...prev, brand]);
      return;
    }

    try {
      await brandService.createBrand(brand, user.id);
      setBrands(prev => [...prev, brand]);
    } catch (error) {
      console.error('Failed to add brand:', error);
      alert('保存品牌失败，请重试');
    }
  };

  const updateBrand = async (updatedBrand: Brand) => {
    if (isGuestMode || !user) {
      // Guest mode - just update local state
      setBrands(prev => prev.map(b => b.id === updatedBrand.id ? updatedBrand : b));
      return;
    }

    try {
      await brandService.updateBrand(updatedBrand, user.id);
      setBrands(prev => prev.map(b => b.id === updatedBrand.id ? updatedBrand : b));
    } catch (error) {
      console.error('Failed to update brand:', error);
      alert('更新品牌失败，请重试');
    }
  };

  const t = (key: string) => {
    const langData = translations[language];
    return langData[key] || key;
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password);

      // 立即加载用户数据
      if (result.user) {
        await loadUserData(result.user.id);
      }

      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(error.message || '登录失败，请检查用户名和密码');
      return false;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await authService.signUp(email, password);
      alert('注册成功！请登录。');
      return true;
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(error.message || '注册失败，该邮箱可能已被使用');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setIsGuestMode(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loginAsGuest = () => {
    setIsGuestMode(true);
    setIsLoggedIn(true);
    // Load mock data for guest mode
    import('./constants').then(({ MOCK_BRANDS, MOCK_HISTORY }) => {
      setBrands(MOCK_BRANDS);
      setHistory(MOCK_HISTORY);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      brands,
      history,
      addMeal,
      addBrand,
      updateBrand,
      language,
      setLanguage,
      currency,
      setCurrency,
      t,
      isLoggedIn,
      login,
      register,
      logout,
      loginAsGuest
    }}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;