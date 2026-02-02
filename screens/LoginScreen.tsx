import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';

const LoginScreen: React.FC = () => {
  const { t, login, register, loginAsGuest } = useApp();
  const navigate = useNavigate();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [regAccount, setRegAccount] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!agreed) {
      alert(t('login.error_agree'));
      return;
    }
    if (!account || !password) {
      alert(t('login.error_empty'));
      return;
    }

    try {
      // 调用异步登录
      const success = await login(account, password);
      if (success) {
        // 等待一小段时间让session完全建立
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/');
      } else {
        alert(t('login.error_auth'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(t('login.error_auth'));
    }
  };

  const handleGuestLogin = () => {
    if (!agreed) {
      alert(t('login.error_agree'));
      return;
    }
    loginAsGuest();
    navigate('/');
  };

  const handleRegister = () => {
    // 1. 检查用户名是否为空
    if (!regAccount || regAccount.trim().length === 0) {
      alert(t('register.error_empty_username'));
      return;
    }

    // 2. 检查密码是否为空且至少6位（Supabase要求）
    if (!regPassword || regPassword.length < 6) {
      alert('密码至少需要6位字符');
      return;
    }

    // Attempt registration
    const success = register(regAccount, regPassword);
    if (success) {
      alert(t('register.success'));
      // Pre-fill login form
      setAccount(regAccount);
      setPassword('');
      // Close modal
      setShowRegModal(false);
      // Clean up registration form
      setRegAccount('');
      setRegPassword('');
    } else {
      alert(t('register.error_exists'));
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#f6f8f7] dark:bg-[#102217] text-[#0d1b13] dark:text-[#f8fcfa]">
      {/* Top Navigation */}
      <div className="flex items-center p-4 justify-between sticky top-0 bg-[#f6f8f7]/80 dark:bg-[#102217]/80 backdrop-blur-md z-10">
        <div className="text-[#0d1b13] dark:text-[#f8fcfa] flex size-12 shrink-0 items-center justify-start cursor-pointer opacity-50">
          {/* Back button hidden/disabled for root login screen to prevent going back to protected routes */}
          {/* <span className="material-symbols-outlined">arrow_back_ios</span> */}
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">{t('login.header')}</h2>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 flex flex-col px-6 pt-10 w-full">
        {/* Header Section */}
        <div className="mb-12 animate-in slide-in-from-bottom duration-500">
          <h1 className="text-[#0d1b13] dark:text-[#f8fcfa] tracking-tight text-[40px] font-bold leading-tight mb-2">{t('login.title')}</h1>
          <p className="text-[#4c9a6b] dark:text-[#a3d9b8] text-base">{t('login.subtitle')}</p>
        </div>

        {/* Login Form */}
        <div className="space-y-6 animate-in slide-in-from-bottom duration-700 delay-100">

          {/* Account Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[#0d1b13] dark:text-[#f8fcfa] text-base font-medium leading-normal pl-1">
              {t('login.account')}
              <div className="relative flex items-center group mt-1">
                <div className="absolute left-4 flex items-center justify-center text-[#4c9a6b]">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <input
                  className="flex w-full min-w-0 flex-1 rounded-2xl text-[#0d1b13] dark:text-[#f8fcfa] focus:outline-0 focus:ring-2 focus:ring-[#2bee79] border border-[#cfe7d9] dark:border-[#2a4535] bg-white dark:bg-[#1a2e22] h-16 pl-12 pr-4 placeholder:text-[#4c9a6b]/50 text-lg font-medium transition-all shadow-sm"
                  placeholder={t('login.account_ph')}
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                />
              </div>
            </label>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[#0d1b13] dark:text-[#f8fcfa] text-base font-medium leading-normal pl-1">
              {t('login.password')}
              <div className="relative flex items-center group mt-1">
                <div className="absolute left-4 flex items-center justify-center text-[#4c9a6b]">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <input
                  className="flex w-full min-w-0 flex-1 rounded-2xl text-[#0d1b13] dark:text-[#f8fcfa] focus:outline-0 focus:ring-2 focus:ring-[#2bee79] border border-[#cfe7d9] dark:border-[#2a4535] bg-white dark:bg-[#1a2e22] h-16 pl-12 pr-12 placeholder:text-[#4c9a6b]/50 text-lg font-medium transition-all shadow-sm"
                  placeholder={t('login.password_ph')}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 flex items-center justify-center text-[#4c9a6b] hover:text-[#2bee79] transition-colors"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col gap-4">
            <button
              onClick={handleLogin}
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-[#2bee79] text-[#0d1b13] text-lg font-bold shadow-lg shadow-[#2bee79]/20 active:scale-[0.98] transition-transform hover:brightness-105"
            >
              <span className="truncate">{t('login.btn')}</span>
            </button>

            <div className="flex items-center justify-between px-2">
              <button onClick={() => setShowRegModal(true)} className="text-sm font-medium text-[#4c9a6b] dark:text-[#a3d9b8] hover:text-[#2bee79] dark:hover:text-[#2bee79] transition-colors py-2">
                {t('login.no_account')} <span className="underline font-bold decoration-2 underline-offset-4">{t('login.register_link')}</span>
              </button>

              <button onClick={handleGuestLogin} className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-[#0d1b13] dark:hover:text-white transition-colors py-2">
                {t('login.guest')} &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Sushi Pattern (Subtle) */}
        <div className="mt-8 opacity-5 flex justify-center gap-8 select-none pointer-events-none">
          <span className="material-symbols-outlined text-6xl text-[#0d1b13] dark:text-white">bakery_dining</span>
          <span className="material-symbols-outlined text-6xl text-[#0d1b13] dark:text-white">restaurant</span>
          <span className="material-symbols-outlined text-6xl text-[#0d1b13] dark:text-white">set_meal</span>
        </div>

        {/* Spacer to push content to top */}
        <div className="flex-1"></div>

        {/* Legal and Footer */}
        <div className="pb-10 pt-6 animate-in fade-in duration-1000 delay-300">
          <div className="flex items-start gap-3 px-2">
            <div className="relative mt-0.5">
              <input
                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#cfe7d9] dark:border-[#2a4535] bg-white dark:bg-[#1a2e22] checked:bg-[#2bee79] checked:border-[#2bee79] transition-all"
                id="agreement"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="material-symbols-outlined absolute top-0 left-0 text-[20px] text-[#0d1b13] opacity-0 peer-checked:opacity-100 pointer-events-none">
                check
              </span>
            </div>
            <label className="text-sm leading-snug text-[#4c9a6b] dark:text-[#a3d9b8] cursor-pointer" htmlFor="agreement">
              {t('login.agreement_pre')} <span className="text-[#2bee79] font-semibold underline decoration-[#2bee79]/30">{t('login.agreement_user')}</span> {t('login.agreement_and')} <span className="text-[#2bee79] font-semibold underline decoration-[#2bee79]/30">{t('login.agreement_privacy')}</span>{t('login.agreement_post')}
            </label>
          </div>
        </div>
      </main>

      {/* App Icon / Branding (Bottom Center) */}
      <div className="flex justify-center pb-8 animate-in zoom-in duration-500 delay-200">
        <div className="w-12 h-12 rounded-2xl bg-[#2bee79] flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-[#0d1b13] text-3xl font-bold">counter_3</span>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#1a2c23] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300 border border-[#cfe7d9] dark:border-[#2a4535] relative">
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-black/20 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>

            <h3 className="text-2xl font-bold text-[#0d1b13] dark:text-[#f8fcfa] mb-2">{t('register.title')}</h3>
            <p className="text-sm text-[#4c9a6b] mb-6">{t('login.subtitle')}</p>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0d1b13] dark:text-[#f8fcfa]">{t('login.account')}</label>
                <input
                  className="flex w-full rounded-xl text-[#0d1b13] dark:text-[#f8fcfa] focus:outline-0 focus:ring-2 focus:ring-[#2bee79] border border-[#cfe7d9] dark:border-[#2a4535] bg-[#f6f8f7] dark:bg-[#102217] h-12 px-4 text-base font-medium shadow-inner"
                  placeholder={t('register.account_hint')}
                  type="text"
                  value={regAccount}
                  onChange={(e) => setRegAccount(e.target.value)}
                />         </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0d1b13] dark:text-[#f8fcfa]">{t('login.password')}</label>
                <div className="relative">
                  <input
                    className="flex w-full rounded-xl text-[#0d1b13] dark:text-[#f8fcfa] focus:outline-0 focus:ring-2 focus:ring-[#2bee79] border border-[#cfe7d9] dark:border-[#2a4535] bg-[#f6f8f7] dark:bg-[#102217] h-12 px-4 pr-12 text-base font-medium shadow-inner"
                    placeholder={t('register.password_hint')}
                    type={regShowPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                  <button
                    onClick={() => setRegShowPassword(!regShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#4c9a6b] hover:text-[#2bee79] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">{regShowPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleRegister}
                className="w-full mt-4 h-12 bg-[#2bee79] text-[#0d1b13] text-lg font-bold rounded-full shadow-lg shadow-[#2bee79]/20 active:scale-[0.98] transition-transform hover:brightness-105"
              >
                {t('register.btn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;