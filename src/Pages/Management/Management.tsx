import  { useState } from 'react';
import MinNav from '../../Components/Navbar/MinNav';
import UserInfo from '../../Components/ManageComponent/UserInfo';
import BranchesManage from '../../Components/ManageComponent/BranchesManage';
import UserManage from '../../Components/ManageComponent/UserManage';
import PackageManage from '../../Components/ManageComponent/PackageManage';

function Management() {
  const [activeTab, setActiveTab] = useState<string>('User Management');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleBackFromUserInfo = () => {
    setActiveTab('User Management');
    setSelectedUserId('');
  };
  const renderActiveComponent = () => {
    switch(activeTab) {
        case 'User Management': return <UserManage />;
        case 'Branches Management': return <BranchesManage />;
        case 'User info':  return <UserInfo 
               userId={selectedUserId} 
               onBack={handleBackFromUserInfo} 
      />;
      case 'Package Management': return <PackageManage />;
        default: return < UserManage/>;
    }
  }

  return (
    <>
      <MinNav 
        navItems="management" 
        onTabChange={setActiveTab} 
        activeTab={activeTab}
      />
   <div className='w-full h-full bg-white py-2'>
    {renderActiveComponent()}
</div>
    </>
  )
}

export default Management;