// import { useGet } from '../../Hook/API/useApiGet';
import { useTranslation } from "react-i18next";
import SmallCards from "../../Components/Cards/SmallCards";
import Financial from "../../Components/Financial/Financial";
import ChartTrend from "../../Components/ChartTrend/ChartTrend";

function Dashboard() {
  const { t } = useTranslation();

  const cardData = [
    {
      title: t("dashboard.dailySales"),
      mainNumber: "$13,048",
      secondaryText: t("dashboard.lookingGood"),
      trendDirection: "up" as const,
      color: "#2563EB",
    },
    {
      title: t("dashboard.profitToday"),
      mainNumber: "$5,917",
      trendDirection: "up" as const,
      color: "#22C55E",
    },
    {
      title: t("dashboard.itemsInStock"),
      mainNumber: "680 items",
      secondaryText: t("dashboard.inTotal"),
      trendDirection: "horizontal" as const,
      color: "#EAB308",
    },
    {
      title: t("dashboard.itemsInStock"),
      mainNumber: "200 ",
      secondaryText: t("dashboard.criticalItems"),
      trendDirection: "down" as const,
      color: "#EF4444",
    },
  ];

  return (
    <div className="flex flex-col gap-8 py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 gap-6">
        {cardData.map((card, index) => (
          <SmallCards
            key={index}
            title={card.title}
            mainNumber={card.mainNumber}
            secondaryText={card.secondaryText}
            trendDirection={card.trendDirection}
            color={card.color}
          />
        ))}
      </div>

      <Financial />
      <ChartTrend />
    </div>
  );
}

export default Dashboard;
