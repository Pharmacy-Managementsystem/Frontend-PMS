import  { useState } from 'react';
import MinNav from '../../Components/Navbar/MinNav';
import Business from '../../Components/SettingComponent/Business';
import Branches from '../../Components/SettingComponent/Branches';
import PaymentMethods from '../../Components/SettingComponent/PaymentMethods';
import TaxRate from '../../Components/SettingComponent/TaxRate';
import Currencies from '../../Components/SettingComponent/Currencies'
import UserManage from '../../Components/ManageComponent/UserManage';

function Setting() {
  const [activeTab, setActiveTab] = useState<string>('Business');
  
  const renderActiveComponent = () => {
    switch(activeTab) {
      case 'Business': return <UserManage />;
      case 'Branches': return <Branches />;
      case 'Payment Methods': return <PaymentMethods />;
      case 'Tax Rates': return <TaxRate />;
      case 'Currencies': return <Currencies />;
      default: return <Business />;
    }
  }

  return (
    <>
      <MinNav 
        navItems="settings" 
        onTabChange={setActiveTab} 
        activeTab={activeTab}
      />
      <div className="custom-card-shadow max-w-screen-2xl px-14 py-8 mb-10 bg-white shadow rounded-xl mx-auto ">
        {renderActiveComponent()}
      </div>
    </>
  )
}

export default Setting;