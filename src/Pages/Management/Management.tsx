import  { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import MinNav from '../../Components/Navbar/MinNav';
import UserInfo from '../../Components/ManageComponent/UserInfo';
import BranchesManage from '../../Components/ManageComponent/BranchesManage';
import UserManage from '../../Components/ManageComponent/UserManage';
import PackageManage from '../../Components/ManageComponent/PackageManage';
import BusinessManage from '../../Components/ManageComponent/BusinessManage';
import SubscriptionsManagement from '../../Components/ManageComponent/SubscriptionsManagement';
import Roles from '../../Components/ManageComponent/Roles';

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

function Management() {
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Business Management');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    try {
      const token = localStorage.getItem('access');
      if (token) {
        const decoded = jwtDecode(token);
        setDecodedToken(decoded as DecodedToken);
        
        // Set initial activeTab based on user role
        if ((decoded as DecodedToken).is_superuser) {
          setActiveTab('Business Management');
        } else {
          setActiveTab('User Management');
        }
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }, []);

  const handleBackFromUserInfo = () => {
    // Return to appropriate tab based on user role
    if (decodedToken?.is_superuser) {
      setActiveTab('Business Management');
    } else {
      setActiveTab('User Management');
    }
    setSelectedUserId('');
  };

  const renderActiveComponent = () => {
    // Check if user is trying to access unauthorized component
    if (!decodedToken) {
      return <div>Loading...</div>;
    }

    // For superusers, allow Business Management and Package Management
    if (decodedToken.is_superuser) {
      switch(activeTab) {
        case 'Business Management': return <BusinessManage />;
        case 'Package Management': return <PackageManage />;
        case 'Subscriptions Management': return <SubscriptionsManagement />;

        case 'User info': return <UserInfo 
          userId={selectedUserId} 
          onBack={handleBackFromUserInfo} 
        />;
        default: return <BusinessManage />;
      }
    } else {
      switch(activeTab) {
        case 'User Management': return <UserManage />;
        case 'Branches Management': return <BranchesManage />;
        case 'Roles': return < Roles/>;
        case 'User info': return <UserInfo 
          userId={selectedUserId} 
          onBack={handleBackFromUserInfo} 
        />;
        default: return <UserManage />;
      }
    }
  }

  return (
    <>
      <MinNav 
        navItems="management" 
        onTabChange={setActiveTab} 
        activeTab={activeTab}
      />
      {/* استخدم custom-card-shadow هنا */}
      <div className="max-w-screen-2xl px-14 py-8 mb-10 bg-white custom-card-shadow rounded-xl mx-auto">
        {renderActiveComponent()}
      </div>
    </>
  )
}

export default Management;