import { HiOutlineArrowDown } from "react-icons/hi";
import { HiOutlineArrowUp } from "react-icons/hi";
import {
  ChartNoAxesColumnIncreasing,
  ShoppingCart,
  DollarSign,
  FileText,
  ScrollText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
export default function Financial() {
  const { t } = useTranslation();

  const cardData = [
    {
      title: t("financial.totalSales"),
      mainNumber: "48,000",
      bg: "bg-green-400/10",
      icon: <DollarSign className="text-green-400" />,
    },
    {
      title: t("financial.netProfit"),
      mainNumber: "39,400",
      bg: "bg-green-400/10",
      icon: <ChartNoAxesColumnIncreasing className="text-green-400" />,
    },
    {
      title: t("financial.medicineSales"),
      mainNumber: "32,000",
      bg: "bg-yellow-400/10",
      icon: <FileText className="text-yellow-400" />,
    },
    {
      title: t("financial.totalPurchase"),
      mainNumber: "25,000",
      bg: "bg-blue-400/10",
      icon: <ShoppingCart className="text-blue-400" />,
    },
    {
      title: t("financial.totalSalesReturn"),
      mainNumber: "1,500",
      bg: "bg-yellow-400/10",
      icon: <HiOutlineArrowUp className="text-yellow-400" />,
    },
    {
      title: t("financial.totalPurchaseReturn"),
      mainNumber: "6000",
      bg: "bg-red-400/10",
      icon: <HiOutlineArrowDown className="text-red-400" />,
    },
    {
      title: t("financial.expired"),
      mainNumber: "4.150",
      bg: "bg-red-400/10",
      icon: <ScrollText className="text-red-400" />,
    },
    {
      title: t("financial.damaged"),
      mainNumber: "1,500",
      bg: "bg-red-400/10",
      icon: <HiOutlineArrowDown className="text-red-400" />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-black font-semibold text-lg">
        {t("financial.financialSummary")}
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
        {cardData.map((card) => (
          <div className="bg-white rounded-lg p-4 flex justify-start items-center gap-4">
            <div
              className={`flex justify-center items-center w-12 h-12 rounded-full ${card.bg}`}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-lg font-semibold text-gray-800">
                {card.mainNumber}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
