import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { X, User, Shield, Bell, Moon, Sun, Monitor, Check, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { setTheme, setLanguage, setNotification } from '../store/settingsSlice';
import i18n from '../i18n/index';

const TABS = ['general', 'security', 'notifications'];

const SettingsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { theme, language, notifications } = useSelector(state => state.settings);

  const [activeTab, setActiveTab] = useState('general');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });

  const tabIcons = { general: User, security: Shield, notifications: Bell };
  const tabLabels = { general: t('general'), security: t('security'), notifications: t('notifications') };

  const handleThemeChange = (newTheme) => {
    dispatch(setTheme(newTheme));
  };

  const handleLanguageChange = (lang) => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  const handleSavePw = () => {
    setSavedFeedback(true);
    setPwForm({ current: '', newPw: '', confirm: '' });
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const themeOptions = [
    { id: 'light', icon: Sun, label: t('themeLight') },
    { id: 'dark', icon: Moon, label: t('themeDark') },
    { id: 'system', icon: Monitor, label: t('themeSystem') },
  ];

  const languageOptions = [
    { id: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-dark-panel rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-border overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settingsTitle')}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-border rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-0">
            {/* Sidebar Tabs */}
            <div className="sm:w-52 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-dark-border p-3 flex sm:flex-col flex-row gap-1 bg-gray-50/50 dark:bg-dark-bg/50 shrink-0 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tabIcons[tab];
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap w-full text-left
                      ${isActive
                        ? 'bg-white dark:bg-dark-panel text-primary-600 dark:text-primary-400 shadow-sm border border-gray-200/60 dark:border-dark-border'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                      }`}
                  >
                    <Icon size={16} />
                    {tabLabels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-7"
                >
                  {/* ─── GENERAL TAB ─── */}
                  {activeTab === 'general' && (
                    <>
                      {/* Profile */}
                      <section>
                        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{t('profileInfo')}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-lg shadow-primary-500/20 shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{user?.name || t('defaultUser')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email || 'email@example.com'}</p>
                          </div>
                        </div>
                      </section>

                      <hr className="border-gray-100 dark:border-dark-border" />

                      {/* Theme */}
                      <section>
                        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{t('themePanel')}</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {themeOptions.map(opt => {
                            const Icon = opt.icon;
                            const isSelected = theme === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleThemeChange(opt.id)}
                                className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all
                                  ${isSelected
                                    ? 'border-primary-500 bg-primary-50 dark:bg-dark-bg shadow-sm'
                                    : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg hover:border-primary-400 dark:hover:border-primary-600'
                                  }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                                    <Check size={10} className="text-white" />
                                  </div>
                                )}
                                <Icon size={22} className={isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'} />
                                <span className={`text-xs font-semibold ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                  {opt.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </section>

                      <hr className="border-gray-100 dark:border-dark-border" />

                      {/* Language */}
                      <section>
                        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{t('regionAndLanguage')}</h3>
                        <div className="flex flex-col gap-2">
                          {languageOptions.map(opt => {
                            const isSelected = language === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleLanguageChange(opt.id)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                                  ${isSelected
                                    ? 'border-primary-500 bg-primary-50 dark:bg-dark-bg text-primary-700 dark:text-primary-300'
                                    : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-600'
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">{opt.flag}</span>
                                  <span className="text-sm font-medium">{opt.label}</span>
                                </div>
                                {isSelected && <Check size={16} className="text-primary-500" />}
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    </>
                  )}

                  {/* ─── SECURITY TAB ─── */}
                  {activeTab === 'security' && (
                    <>
                      <section>
                        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{t('changePassword')}</h3>
                        <div className="space-y-3">
                          {[
                            { key: 'current', label: t('currentPassword'), show: showCurrentPw, setShow: setShowCurrentPw },
                            { key: 'newPw', label: t('newPassword'), show: showNewPw, setShow: setShowNewPw },
                            { key: 'confirm', label: t('confirmPassword'), show: showConfirmPw, setShow: setShowConfirmPw },
                          ].map(field => (
                            <div key={field.key} className="relative">
                              <input
                                type={field.show ? 'text' : 'password'}
                                placeholder={field.label}
                                value={pwForm[field.key]}
                                onChange={e => setPwForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white text-sm placeholder-gray-400"
                              />
                              <button
                                type="button"
                                onClick={() => field.setShow(!field.show)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              >
                                {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={handleSavePw}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                              ${savedFeedback
                                ? 'bg-green-500 text-white'
                                : 'bg-primary-500 hover:bg-primary-600 text-white'
                              }`}
                          >
                            {savedFeedback ? (
                              <><Check size={16} /> {t('saved')}</>
                            ) : t('updatePassword')}
                          </button>
                        </div>
                      </section>

                      <hr className="border-gray-100 dark:border-dark-border" />

                      <section>
                        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{t('twoFactor')}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t('twoFactor')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 sm:line-clamp-none">{t('twoFactorDesc')}</p>
                          </div>
                          <button className="flex items-center justify-center w-full sm:w-auto gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors shrink-0">
                            {t('enable')} <ChevronRight size={14} />
                          </button>
                        </div>
                      </section>

                      <hr className="border-gray-100 dark:border-dark-border" />

                      <section>
                        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{t('sessions')}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t('sessions')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 sm:line-clamp-none">{t('sessionsDesc')}</p>
                          </div>
                          <button className="px-4 py-2 w-full sm:w-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shrink-0 flex items-center justify-center text-center">
                            {t('terminateAll')}
                          </button>
                        </div>
                      </section>
                    </>
                  )}

                  {/* ─── NOTIFICATIONS TAB ─── */}
                  {activeTab === 'notifications' && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{t('notifications')}</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'chat', label: t('notifChat'), desc: t('notifChatDesc') },
                          { key: 'updates', label: t('notifUpdates'), desc: t('notifUpdatesDesc') },
                          { key: 'security', label: t('notifSecurity'), desc: t('notifSecurityDesc') },
                        ].map(item => (
                          <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.label}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 sm:line-clamp-none">{item.desc}</p>
                            </div>
                            <button
                              onClick={() => dispatch(setNotification({ key: item.key, value: !notifications[item.key] }))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 self-start sm:self-auto
                                ${notifications[item.key] ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-border'}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                                  ${notifications[item.key] ? 'translate-x-6' : 'translate-x-1'}`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
