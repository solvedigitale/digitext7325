import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, MessageCircle, ArrowRight, ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { initFacebookSDK, loginWithFacebook, getFacebookPages, getInstagramAccount, addAccountToSupabase } from '../services/auth';

type ConnectionType = 'facebook' | 'instagram' | 'whatsapp';

interface ApiConnectionWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function ApiConnectionWizard({ onComplete, onCancel }: ApiConnectionWizardProps) {
  const [step, setStep] = useState(1);
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fbInitialized, setFbInitialized] = useState(false);
  const [fbLoginData, setFbLoginData] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [instagramAccount, setInstagramAccount] = useState<any>(null);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [isMessengerConnected, setIsMessengerConnected] = useState(false);
  const { addAccount, currentUser } = useStore();

  // Initialize Facebook SDK
  useEffect(() => {
    const initFB = async () => {
      try {
        await initFacebookSDK();
        setFbInitialized(true);
        console.log('Facebook SDK başarıyla başlatıldı');
      } catch (error) {
        console.error('Facebook SDK başlatılamadı:', error);
        setError('Facebook SDK başlatılamadı. Lütfen daha sonra tekrar deneyin.');
      }
    };
    
    initFB();
  }, []);

  const handleFacebookLogin = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      // Login with Facebook
      const fbResponse = await loginWithFacebook();
      console.log('Facebook giriş yanıtı:', fbResponse);
      setFbLoginData(fbResponse);
      
      // Get user's Facebook pages
      const pagesData = await getFacebookPages(fbResponse.accessToken);
      console.log('Facebook sayfaları:', pagesData);
      
      if (!pagesData || pagesData.length === 0) {
        throw new Error('Facebook Sayfası bulunamadı. Bu uygulamayı kullanmak için en az bir Facebook Sayfasına ihtiyacınız var. Lütfen önce bir Facebook Sayfası oluşturun veya test kullanıcınızın bir sayfaya erişimi olduğundan emin olun.');
      }
      
      setPages(pagesData);
      setStep(2);
    } catch (error: any) {
      console.error('Facebook giriş hatası:', error);
      setError(error.message || 'Facebook ile giriş yapılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageSelect = async (page: any) => {
    setSelectedPage(page);
    setIsLoading(true);
    setError('');
    
    try {
      // Check if Instagram Business Account is connected to this page
      if (connectionType === 'instagram') {
        try {
          console.log('Sayfa için Instagram hesabı alınıyor:', page.id);
          const igAccount = await getInstagramAccount(page.access_token, page.id);
          console.log('Instagram hesabı:', igAccount);
          setInstagramAccount(igAccount);
        } catch (error: any) {
          console.warn('Bu sayfa için Instagram hesabı bulunamadı:', error);
          setError('Bu Facebook Sayfasına bağlı bir Instagram İşletme Hesabı yok. Lütfen başka bir sayfa seçin veya önce bu sayfaya bir Instagram İşletme Hesabı bağlayın.');
          setIsLoading(false);
          return;
        }
      }
      
      setStep(3);
    } catch (error: any) {
      console.error('Sayfa seçme hatası:', error);
      setError(error.message || 'Seçilen sayfa işlenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectAccount = async () => {
    if (!currentUser || !selectedPage) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      if (connectionType === 'facebook' || connectionType === 'messenger') {
        // Add Facebook Messenger account
        const messengerAccount = await addAccountToSupabase({
          user_id: currentUser.id,
          name: `${selectedPage.name} (Messenger)`,
          platform: 'messenger',
          avatar_url: `https://graph.facebook.com/${selectedPage.id}/picture?type=large`,
          access_token: selectedPage.access_token,
          page_id: selectedPage.id,
          business_id: selectedPage.id
        });
        
        // Add to local store
        addAccount(messengerAccount);
        setIsMessengerConnected(true);
      }
      
      if (connectionType === 'instagram' && instagramAccount) {
        // Add Instagram account
        const instagramAccountData = await addAccountToSupabase({
          user_id: currentUser.id,
          name: `${instagramAccount.username} (Instagram)`,
          platform: 'instagram',
          avatar_url: `https://ui-avatars.com/api/?name=${instagramAccount.username}&background=E1306C&color=fff`,
          access_token: selectedPage.access_token,
          page_id: selectedPage.id,
          ig_user_id: instagramAccount.id,
          business_id: selectedPage.id
        });
        
        // Add to local store
        addAccount(instagramAccountData);
        setIsInstagramConnected(true);
      }
      
      // Move to success step
      setStep(4);
    } catch (error: any) {
      console.error('Hesap bağlama hatası:', error);
      setError(error.message || 'Hesap bağlanırken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Adım 1: Platform Seçin</h3>
      <p className="text-sm text-gray-500">
        Hesabınıza bağlamak istediğiniz mesajlaşma platformunu seçin.
      </p>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          onClick={() => setConnectionType('facebook')}
          className={`relative rounded-lg border p-4 flex flex-col items-center space-y-2 ${
            connectionType === 'facebook'
              ? 'bg-blue-50 border-blue-200'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="p-2 rounded-full bg-blue-100">
            <Facebook className="h-6 w-6 text-blue-600" />
          </div>
          <span className="block text-sm font-medium text-gray-900">Facebook Messenger</span>
          {connectionType === 'facebook' && (
            <div className="absolute top-2 right-2">
              <Check className="h-5 w-5 text-blue-600" />
            </div>
          )}
        </button>
        
        <button
          onClick={() => setConnectionType('instagram')}
          className={`relative rounded-lg border p-4 flex flex-col items-center space-y-2 ${
            connectionType === 'instagram'
              ? 'bg-pink-50 border-pink-200'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="p-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500">
            <Instagram className="h-6 w-6 text-white" />
          </div>
          <span className="block text-sm font-medium text-gray-900">Instagram Business</span>
          {connectionType === 'instagram' && (
            <div className="absolute top-2 right-2">
              <Check className="h-5 w-5 text-pink-600" />
            </div>
          )}
        </button>
        
        <button
          onClick={() => setConnectionType('whatsapp')}
          className={`relative rounded-lg border p-4 flex flex-col items-center space-y-2 ${
            connectionType === 'whatsapp'
              ? 'bg-green-50 border-green-200'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="p-2 rounded-full bg-green-100">
            <MessageCircle className="h-6 w-6 text-green-600" />
          </div>
          <span className="block text-sm font-medium text-gray-900">WhatsApp Business</span>
          {connectionType === 'whatsapp' && (
            <div className="absolute top-2 right-2">
              <Check className="h-5 w-5 text-green-600" />
            </div>
          )}
        </button>
      </div>
      
      {connectionType === 'whatsapp' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-700">
            WhatsApp Business API bağlantısı manuel kurulum gerektirir. Yardım için lütfen destek ekibiyle iletişime geçin.
          </p>
        </div>
      )}
      
      {(connectionType === 'facebook' || connectionType === 'instagram') && (
        <div className="mt-6">
          <button
            onClick={handleFacebookLogin}
            disabled={isLoading || !fbInitialized}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Bağlanıyor...
              </>
            ) : (
              <>
                <Facebook className="h-5 w-5 mr-2" />
                Facebook ile Devam Et
              </>
            )}
          </button>
          <p className="mt-2 text-xs text-center text-gray-500">
            {connectionType === 'facebook' 
              ? 'Messenger kullanmak için Facebook Sayfanızı bağlayın'
              : 'Facebook üzerinden Instagram İşletme Hesabınızı bağlayın'}
          </p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          İptal
        </button>
        
        <button
          type="button"
          onClick={() => connectionType && connectionType !== 'whatsapp' ? handleFacebookLogin() : null}
          disabled={!connectionType || connectionType === 'whatsapp' || isLoading || !fbInitialized}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          İleri
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Adım 2: Facebook Sayfası Seçin</h3>
      <p className="text-sm text-gray-500">
        {connectionType === 'facebook'
          ? 'Messenger için kullanmak istediğiniz Facebook Sayfasını seçin.'
          : 'Instagram İşletme Hesabınıza bağlı Facebook Sayfasını seçin.'}
      </p>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => handlePageSelect(page)}
            className={`w-full flex items-center p-3 border rounded-md ${
              selectedPage?.id === page.id
                ? 'bg-blue-50 border-blue-300'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <img 
              src={`https://graph.facebook.com/${page.id}/picture?type=square`} 
              alt={page.name}
              className="h-10 w-10 rounded-md"
            />
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-gray-900">{page.name}</p>
              <p className="text-xs text-gray-500">Sayfa ID: {page.id}</p>
            </div>
            {selectedPage?.id === page.id && (
              <Check className="ml-auto h-5 w-5 text-blue-600" />
            )}
          </button>
        ))}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </button>
        
        <button
          type="button"
          onClick={() => selectedPage ? handlePageSelect(selectedPage) : null}
          disabled={!selectedPage || isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              İşleniyor...
            </>
          ) : (
            <>
              İleri
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Adım 3: Bağlantıyı Onaylayın</h3>
      
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900">Bağlantı Detayları</h4>
        
        <div className="mt-3 space-y-3">
          <div className="flex items-center">
            <img 
              src={`https://graph.facebook.com/${selectedPage?.id}/picture?type=square`} 
              alt={selectedPage?.name}
              className="h-10 w-10 rounded-md"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{selectedPage?.name}</p>
              <p className="text-xs text-gray-500">Facebook Sayfası</p>
            </div>
          </div>
          
          {connectionType === 'instagram' && instagramAccount && (
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">@{instagramAccount.username}</p>
                <p className="text-xs text-gray-500">Instagram İşletme Hesabı</p>
              </div>
            </div>
          )}
          
          {connectionType === 'facebook' && (
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-blue-600 flex items-center justify-center">
                <Facebook className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Messenger</p>
                <p className="text-xs text-gray-500">Facebook Messenger</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-700">
          {connectionType === 'instagram'
            ? 'Bu Instagram İşletme Hesabını bağlayarak, Instagram Direct Mesajlarını alabilir ve yanıtlayabilirsiniz.'
            : 'Bu Facebook Sayfasını bağlayarak, Messenger konuşmalarını alabilir ve yanıtlayabilirsiniz.'}
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </button>
        
        <button
          type="button"
          onClick={handleConnectAccount}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Bağlanıyor...
            </>
          ) : (
            'Hesabı Bağla'
          )}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <Check className="h-6 w-6 text-green-600" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900">Bağlantı Başarılı!</h3>
      
      <div className="space-y-2">
        {isMessengerConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-center">
            <Facebook className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-700">Facebook Messenger başarıyla bağlandı</p>
          </div>
        )}
        
        {isInstagramConnected && (
          <div className="bg-pink-50 border border-pink-200 rounded-md p-3 flex items-center">
            <Instagram className="h-5 w-5 text-pink-600 mr-2" />
            <p className="text-sm text-pink-700">Instagram İşletme Hesabı başarıyla bağlandı</p>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-500">
        Artık bu hesaptan mesaj alabilir ve yanıtlayabilirsiniz.
      </p>
      
      <div className="pt-4 flex flex-col space-y-3">
        <button
          type="button"
          onClick={handleComplete}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Tamam
        </button>
        
        <button
          type="button"
          onClick={() => {
            setStep(1);
            setConnectionType(null);
            setSelectedPage(null);
            setInstagramAccount(null);
            setIsInstagramConnected(false);
            setIsMessengerConnected(false);
            setError('');
          }}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Başka Bir Hesap Bağla
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                stepNumber < step ? 'bg-blue-600' : 
                stepNumber === step ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-gray-200'
              }`}>
                {stepNumber < step ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className={`text-sm font-medium ${stepNumber === step ? 'text-white' : 'text-gray-500'}`}>
                    {stepNumber}
                  </span>
                )}
              </div>
              
              {stepNumber < 4 && (
                <div className={`flex-1 h-0.5 ${stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">Platform Seçin</span>
          <span className="text-xs text-gray-500">Sayfa Seçin</span>
          <span className="text-xs text-gray-500">Onaylayın</span>
          <span className="text-xs text-gray-500">Tamamlandı</span>
        </div>
      </div>
      
      {/* Step content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
}