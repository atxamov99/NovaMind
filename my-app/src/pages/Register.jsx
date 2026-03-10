import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess } from '../store/authSlice';
import { registerUser } from '../services/api';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      setIsLoading(false);
      return;
    }

    try {
      const data = await registerUser(name, email, password);
      dispatch(loginSuccess({ token: data.token, user: data.user }));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 flex-col">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary-500 to-secondary-500 shadow-lg mb-6">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ro'yxatdan o'tish</h1>
          <p className="text-gray-500 dark:text-gray-400">Gemini AI'dan bepul foydalanish uchun hisob yarating</p>
        </div>

        <div className="bg-white dark:bg-dark-panel p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ism</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="Ismingiz..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email pochta</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="Sizning emailingiz..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Parol</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="Yangi parol o'ylab toping"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-md shadow-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2 group"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Hisob yaratish
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Allaqachon hisobingiz bormi?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Tizimga kiring
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
