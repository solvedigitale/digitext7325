// src/pages/LoginPage.tsx düzeltilmiş versiyon

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { MessageCircle, Lock, User, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useStore } from '../store';
import supabase from '../lib/supabase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const { login, isAuthenticated } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, if any
  const from = location.state?.from?.pathname || '/';

  // Check for password reset success parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetSuccess = params.get('reset_success');
    
    if (resetSuccess === 'true') {
      setDebugInfo('Şifre sıfırlama başarılı. Lütfen yeni şifrenizle giriş yapın.');
    }
  }, [location]);

  // If already authenticated, redirect to intended destination or home
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from);
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    setIsLoading(true);

    try {
      // Supabase ile doğrudan giriş işlemi 
      console.log('Giriş denenecek:', email);
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (loginError) {
        throw loginError;
      }
      
      setDebugInfo('Auth başarılı, kullanıcı bilgileri alınıyor...');
      console.log('Auth başarılı:', data);
      
      if (data?.user) {
        try {
          // User bilgilerini al
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (userError) {
            console.error('Kullanıcı veri hatası:', userError);
            
            // Kullanıcı tablosunda veri yoksa oluştur
            if (userError.code === 'PGRST116') {
              setDebugInfo('Kullanıcı bulunamadı, otomatik oluşturuluyor...');
              
              const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.email.split('@')[0],
                  role: 'admin',
                  avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.email)}`
                })
                .select()
                .single();
                
              if (createError) {
                console.error('Kullanıcı oluşturma hatası:', createError);
                
                // Hata oluşsa bile login işlemine devam et
                login({
                  id: data.user.id,
                  name: data.user.email.split('@')[0],
                  email: data.user.email,
                  role: 'admin',
                  permissions: ['dashboard:view', 'analytics:view'],
                  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.email)}`
                });
              } else {
                // Store'a kaydet
                login({
                  id: newUser.id,
                  name: newUser.name,
                  email: newUser.email,
                  role: newUser.role || 'admin',
                  permissions: newUser.permissions || ['dashboard:view', 'analytics:view'],
                  avatar: newUser.avatar_url
                });
              }
            } else {
              // Diğer hataları göster ama yine de login işlemine devam et
              console.error('Kullanıcı bilgisi alınamadı, varsayılan verilerle devam ediliyor');
              login({
                id: data.user.id,
                name: data.user.email.split('@')[0],
                email: data.user.email,
                role: 'admin',
                permissions: ['dashboard:view', 'analytics:view'],
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.email)}`
              });
            }
          } else {
            setDebugInfo('Kullanıcı bilgileri alındı, giriş yapılıyor...');
            
            // User bilgilerini store'a kaydet
            login({
              id: userData.id,
              name: userData.name || data.user.email.split('@')[0],
              email: userData.email,
              role: userData.role || 'admin',
              permissions: userData.permissions || ['dashboard:view', 'analytics:view'],
              avatar: userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || data.user.email)}`
            });
          }
        } catch (userDataError) {
          console.error('Kullanıcı bilgileri alınırken hata:', userDataError);
          
          // Hata durumunda temel bilgilerle giriş yap
          login({
            id: data.user.id,
            name: data.user.email.split('@')[0],
            email: data.user.email,
            role: 'admin',
            permissions: ['dashboard:view', 'analytics:view'],
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.email)}`
          });
        }
        
        // Kullanıcıyı yönlendir
        navigate(from);
      }
    } catch (err: any) {
      console.error('Giriş hatası:', err);
      setDebugInfo(`Hata detayı: ${err.message} (${err.code || 'Kod yok'})`);
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin ve tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <MessageCircle className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Hesabınıza giriş yapın
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {debugInfo && (
            <div className="bg-blue-50 p-4 mb-6 rounded text-sm text-blue-800">
              {debugInfo}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 p-4 mb-6 rounded text-sm text-red-800">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta adresi
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder="ornek@domain.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Beni hatırla
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Şifrenizi mi unuttunuz?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş yap'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Hesabınız yok mu?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/signup"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hesap oluştur
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}