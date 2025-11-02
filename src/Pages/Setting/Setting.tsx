import { useState } from "react";
import MinNav from "../../Components/Navbar/MinNav";
import Business from "../../Components/SettingComponent/Business";
import PaymentMethods from "../../Components/SettingComponent/PaymentMethods";
import TaxRate from "../../Components/SettingComponent/TaxRate";
import Currencies from "../../Components/SettingComponent/Currencies";
import UserInfo from "../../Components/Info/InfoUser/UserInfo";
import { useDecodedToken } from "../../Hook/useDecodedToken";

function Setting() {
  const decodedToken = useDecodedToken();
  const [activeTab, setActiveTab] = useState<string>("business");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "business":
        return <Business />;
      case "user":
        return (
          <UserInfo userId={decodedToken?.user_id || ""} editMode="full" />
        );
      case "paymentMethods":
        return <PaymentMethods />;
      case "taxRates":
        return <TaxRate />;
      case "currencies":
        return <Currencies />;
      default:
        return <Business />;
    }
  };

  return (
    <>
      <MinNav
        navItems="settings"
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />
      <div className="custom-card-shadow max-w-screen-xl px-14 py-8 mb-10 bg-white shadow rounded-xl mx-auto ">
        {renderActiveComponent()}
      </div>
    </>
  );
}

export default Setting;
