import { useState } from "react";
import MinNav from "../../Components/Navbar/MinNav";
import OrderPurchases from "../../Components/Products/OrderPurchases";
import ReceivePurchases from "../../Components/Products/ReceivePurchases";
import ReturnPurchases from "../../Components/Products/ReturnPurchases";

export default function Purchase() {
  const [activeTab, setActiveTab] = useState<string>("Order Purchases");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "Order Purchases":
        return <OrderPurchases />;
      case "Receive Purchases":
        return <ReceivePurchases />;
      case "Return Purchases":
        return <ReturnPurchases />;
      default:
        return <OrderPurchases />;
    }
  };

  return (
    <>
      <MinNav
        navItems="purchase"
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />
      <div className="custom-card-shadow max-w-screen-xl px-14 py-8 mb-10 bg-white shadow rounded-xl mx-auto ">
        {renderActiveComponent()}
      </div>
    </>
  );
}
