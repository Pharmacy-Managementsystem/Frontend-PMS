import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";

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
  management: ['Business Management','User Management', 'Subscriptions Management' ,"Roles", 'Branches Management', 'Package Management'],
  settings: ['Business','User', 'Payment Methods', 'Tax Rates', 'Currencies'],
  contacts: ['Customers', 'Suppliers']
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
        return item === 'Business Management' || item === 'Package Management' || item === 'Subscriptions Management';
      }
      return item === 'User Management' || item === 'Branches Management' || item === 'Roles';
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
        ? (activeTab === 'User Management' || activeTab === 'Branches Management')
        : (activeTab === 'Business Management' || activeTab === 'Package Management');
      
      if (isAccessingRestrictedTab) {
        const appropriateTab = isSuperuser ? 'Business Management' : 'User Management';
        onTabChange(appropriateTab);
      }
    }
  }, [decodedToken, activeTab, navItems, onTabChange]);

  return (
    <div>
        <div className='top-16 left-0 sticky right-0 z-40 mt-8'>
          <div className="max-w-screen-xl mx-auto">
            <div className='flex flex-wrap md-nowrap items-center justify-center space-x-12 h-16 '> 
            {filteredItems.map((item, index) => (
              <div 
                key={index}
                className='flex items-center cursor-pointer'
                onClick={() => onTabChange(item)}
              >
                <span className={`text-sm font-medium capitalize pb-3 px-6 ${currentActiveTab === item 
                  ? 'text-black border-b-1 border-primary' 
                  : 'text-gray-500 hover:text-primary'}`}>
                  {item}
                </span>
              </div>
            ))}
            </div>
          </div>
        </div>
    </div>
  )
}