import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: string;
  username: string;
  email: string;
  is_superuser: boolean;
}

const dropdownContent = {
  management: ['businessManagement','userManagement', 'subscriptionsManagement' ,"roles", 'branchesManagement', 'packageManagement'],
  settings: ['business','user', 'paymentMethods', 'taxRates', 'currencies'],
  contacts: ['customers', 'suppliers'],
  inventory: ['products', 'purchase', 'stockTransfers'],
  purchase: ['Order Purchases', 'Receive Purchases', 'Return Purchases'],

} as const;

type DropdownContentKeys = keyof typeof dropdownContent;

interface MinNavProps {
  navItems: DropdownContentKeys;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MinNav({ 
  navItems, 
  activeTab, 
  onTabChange 
}: MinNavProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const isRTL = language === 'ar';
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('access');
      if (token) {
        setDecodedToken(jwtDecode(token));
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }, []);

  const items = dropdownContent[navItems];

  // Filter items based on user role
  const filteredItems = items.filter(item => {
    if (navItems === 'management') {
      if (decodedToken?.is_superuser) {
        return item === 'businessManagement' || item === 'packageManagement' || item === 'subscriptionsManagement';
      }
      return item === 'userManagement' || item === 'branchesManagement' || item === 'roles';
    }
    return true;
  });

  // Handle active tab for superusers
  const getActiveTab = () => {
    if (navItems === 'management') {
      if (decodedToken?.is_superuser) {
        if (filteredItems.includes(activeTab as typeof filteredItems[number])) {
          return activeTab;
        } else {
          return filteredItems[0];
        }
      } else {
        if (filteredItems.includes(activeTab as typeof filteredItems[number])) {
          return activeTab;
        } else {
          return filteredItems[0];
        }
      }
    }
    return activeTab;
  };

  const currentActiveTab = getActiveTab();

  // Update active tab if current activeTab is not in filtered items
  useEffect(() => {
    if (currentActiveTab !== activeTab) {
      onTabChange(currentActiveTab);
    }
  }, [currentActiveTab, activeTab, onTabChange]);

  useEffect(() => {
    if (decodedToken && navItems === 'management') {
      const isSuperuser = decodedToken.is_superuser;
      const isAccessingRestrictedTab = isSuperuser 
        ? (activeTab === 'userManagement' || activeTab === 'branchesManagement')
        : (activeTab === 'businessManagement' || activeTab === 'packageManagement');
      
      if (isAccessingRestrictedTab) {
        const appropriateTab = isSuperuser ? 'businessManagement' : 'userManagement';
        onTabChange(appropriateTab);
      }
    }
  }, [decodedToken, activeTab, navItems, onTabChange]);


  return (
    <div key={language}>
        <div className='top-16 left-0 sticky right-0 z-40 mt-8'>
          <div className="max-w-screen-xl mx-auto">
            <div className={`flex flex-wrap md-nowrap items-center justify-center h-16 ${isRTL ? 'space-x-reverse space-x-12' : 'space-x-12'}`}> 
            {filteredItems.map((item, index) => (
              <div 
                key={`${item}-${language}-${index}`}
                className='flex items-center cursor-pointer'
                onClick={() => onTabChange(item)}
              >
                <span className={`text-sm font-medium pb-3 px-6 ${currentActiveTab === item 
                  ? 'text-black border-b-1 border-primary' 
                  : 'text-gray-500 hover:text-primary'}`}>
                  {t(`minNav.${item}`)}
                </span>
              </div>
            ))}
            </div>
          </div>
        </div>
    </div>
  )
}