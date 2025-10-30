import  { useState } from 'react';
import MinNav from '../../Components/Navbar/MinNav';
import Products from '../../Components/Inventory/Products';
import StockTransfers from '../../Components/Inventory/StockTransfers';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<string>('products');
  
  const renderActiveComponent = () => {
    switch(activeTab) {
      case 'products': return <Products />;

      // case 'purchase': return <Products />;
      case 'stockTransfers': return <StockTransfers />;
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
      <div className="custom-card-shadow max-w-screen-xl px-14 py-8 mb-10 bg-white shadow rounded-xl mx-auto ">
        {renderActiveComponent()}
      </div>
    </>
  )
}




























