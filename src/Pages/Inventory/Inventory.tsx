import  { useState } from 'react';
import MinNav from '../../Components/Navbar/MinNav';
// import { useDecodedToken } from '../../Hook/useDecodedToken';
import Products from '../../Components/Inventory/Products';
import StockTransfers from '../../Components/Inventory/StockTransfers';

export default function Inventory() {
  // const decodedToken = useDecodedToken();
  const [activeTab, setActiveTab] = useState<string>('Products');
  
  const renderActiveComponent = () => {
    switch(activeTab) {
      case 'Products': return <Products />;
      case 'Purchase': return <Products />;
      case 'Stock Transfers': return <StockTransfers />;
      default: return <Products />;
    }
  }

  return (
    <>
      <MinNav 
        navItems="inventory" 
        onTabChange={setActiveTab} 
        activeTab={activeTab}
      />
      <div className="custom-card-shadow max-w-screen-2xl px-14 py-8 mb-10 bg-white shadow rounded-xl mx-auto ">
        {renderActiveComponent()}
      </div>
    </>
  )
}




