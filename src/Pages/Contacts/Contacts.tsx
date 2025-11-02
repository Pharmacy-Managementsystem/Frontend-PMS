import { useState } from "react";
import MinNav from "../../Components/Navbar/MinNav";
// import { useDecodedToken } from '../../Hook/useDecodedToken';
import Customers from "../../Components/Contacts/Customers";
import Suppliers from "../../Components/Contacts/Suppliers";

export default function Contacts() {
  // const decodedToken = useDecodedToken();
  const [activeTab, setActiveTab] = useState<string>("customers");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "customers":
        return <Customers />;
      case "suppliers":
        return <Suppliers />;
      default:
        return <Customers />;
    }
  };

  return (
    <>
      <MinNav
        navItems="contacts"
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />
      <div className="custom-card-shadow max-w-screen-xl px-5 py-4 mb-10 bg-white shadow rounded-xl mx-auto ">
        {renderActiveComponent()}
      </div>
    </>
  );
}
