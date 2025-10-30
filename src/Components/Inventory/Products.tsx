import { useState } from "react";
import ProductsList from "../ProductsComponents/ProductsList";
import ProductsCompany from "../ProductsComponents/ProductsCompany";
import ProductsType from "../ProductsComponents/ProductsType";
import ProductsUnit from "../ProductsComponents/ProductsUnit";
import { useTranslation } from 'react-i18next';

const Products = () => {
  const { t } = useTranslation();
  
  const [openTab, setOpenTab] = useState(1);
  
  const activeClasses = 'text-blue-600 border-blue-600 bg-blue-50';
  const inactiveClasses = 'text-gray-500 hover:text-gray-700 hover:bg-gray-50';

  const tabs = [
    { id: 1, label: t('productsPage.tabs.productsList'), component: <ProductsList /> },
    { id: 2, label: t('productsPage.tabs.productsType'), component: <ProductsType /> },
    { id: 3, label: t('productsPage.tabs.productsUnit'), component: <ProductsUnit /> },
    { id: 4, label: t('productsPage.tabs.productsCompany'), component: <ProductsCompany /> },
  ];

  const renderActiveComponent = () => {
    const activeTab = tabs.find(tab => tab.id === openTab);
    return activeTab ? activeTab.component : <ProductsList />;
  };

  return (
    <>
      <nav className="mb-6">
        <div className="border-b border-gray-200">
          <ul className="flex -mb-px">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setOpenTab(tab.id)}
                  className={`mr-1 py-3 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                    openTab === tab.id 
                      ? activeClasses 
                      : inactiveClasses
                  } ${openTab === tab.id ? 'border-blue-600' : 'border-transparent'}`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="w-full">
        {renderActiveComponent()}
      </div>
    </>
  );
};

export default Products;