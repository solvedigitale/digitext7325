// src/pages/SignupPage.tsx - düzeltilmiş versiyon
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { MessageCircle, Lock, User, Eye, EyeOff, Mail } from 'lucide-react';
import { useStore } from '../store';
import supabase from '../lib/supabase';
import { ROLES, getPermissionsByRole } from '../constants/roles';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const { login, isAuthenticated } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, if any
  const from = location.state?.from?.pathname || '/';

  // If already authenticated, redirect to intended destination or home
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from);
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDebugInfo('');
    setIsLoading(true);

    // Validate form
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter uzunluğunda olmalıdır');
      setIsLoading(false);
      return;
    }

    try {
      // Önce email'in kullanılıp kullanılmadığını kontrol et
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email);

      if (checkError) {
        console.error('Email kontrol hatası:', checkError);
      } else if (existingUsers && existingUsers.length > 0) {
        setError('Bu email adresi zaten kullanılmaktadır. Farklı bir email adresi kullanın veya giriş yapın.');
        setIsLoading(false);
        return;
      }
      
      setDebugInfo('Supabase ile kayıt işlemi başlatılıyor...');
      
      // Supabase ile kayıt işlemi
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      setDebugInfo('Kayıt başarılı, kullanıcı profili oluşturuluyor...');
      console.log('Kayıt işlemi başarılı:', data);
      
      // Profil bilgilerini oluştur
      if (data?.user) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .upsert({  // insert yerine upsert kullanıyoruz
              id: data.user.id,
              email: email,
              name: name,
              avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
              role: ROLES.ADMIN, // Default admin rolü
              permissions: getPermissionsByRole(ROLES.ADMIN) // Admin için tüm izinler
            }, { onConflict: 'id' });  // Çakışma durumunda id'ye göre güncelle
        
          if (profileError) {
            console.error('Profil oluşturma hatası:', profileError);
            setDebugInfo(`Profil hatası: ${profileError.message}`);
            
            // Profil oluşturma hatası olsa bile devam etmeyi deneyelim
            setSuccess('Hesabınız oluşturuldu ama profil bilgileri kaydedilemedi. Giriş yapmayı deneyebilirsiniz.');
          } else {
            setSuccess('Hesabınız başarıyla oluşturuldu! Email adresinize gönderilen onay linkine tıklayın veya doğrudan giriş yapmayı deneyin.');
          }
        } catch (profileErr) {
          console.error('Profil oluşturma işlem hatası:', profileErr);
          setDebugInfo(`Profil işlem hatası: ${profileErr.message}`);
          setSuccess('Hesabınız oluşturuldu ama profil bilgileri işlenirken hata oluştu. Giriş yapmayı deneyebilirsiniz.');
        }
      }
      
      // Kayıt sonrası otomatik giriş dene
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (!loginError && loginData?.user) {
          setDebugInfo('Otomatik giriş başarılı, yönlendiriliyor...');
          
          // User bilgilerini store'a kaydet
          login({
            id: loginData.user.id,
            name: name,
            email: email,
            role: ROLES.ADMIN,
            permissions: getPermissionsByRole(ROLES.ADMIN),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
          });
          
          // Kullanıcıyı yönlendir
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          // Otomatik giriş başarısız ama kayıt başarılı
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (loginErr) {
        // Otomatik giriş başarısız ama kayıt başarılı
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      setDebugInfo(`Hata detayı: ${err.message} (${err.code || 'Kod yok'})`);
      
      // Email zaten kullanılıyorsa daha anlaşılır mesaj ver
      if (err.message?.includes('email') && err.message?.includes('already')) {
        setError('Bu email adresi zaten kullanılmaktadır. Farklı bir email adresi kullanın veya giriş yapın.');
      } else {
        setError(err.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
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
          Yeni hesap oluşturun
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {debugInfo && (
            <div className="bg-blue-50 p-4 mb-6 rounded text-sm text-blue-800">
              {debugInfo}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 p-4 mb-6 rounded text-sm text-green-800">
              {success}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 p-4 mb-6 rounded text-sm text-red-800">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Ad Soyad
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
              </div>
            
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-posta adresi
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
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
                    autoComplete="new-password"
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
            
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Şifre Tekrar
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'İşlem yapılıyor...' : 'Hesap oluştur'}
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
                    Zaten hesabınız var mı?
                  </span>
                </div>
              </div>
            
              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Giriş yap
                </Link>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}