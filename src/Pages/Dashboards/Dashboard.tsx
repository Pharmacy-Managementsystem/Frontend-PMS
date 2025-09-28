// import { useGet } from '../../Hook/API/useApiGet';
import SmallCards from '../../Components/Cards/SmallCards';
import Financial from '../../Components/Financial/Financial';
import ChartTrend from '../../Components/ChartTrend/ChartTrend';

function Dashboard() {



  const cardData = [
    {
      title: "Daily Sales",
      mainNumber: "$13,048",
      secondaryText: "Looking good!",
      trendDirection: "up" as const,
      color: "#2563EB"
    },
    {
      title: "Profit Today",
      mainNumber: "$5,917",
      trendDirection: "up" as const,
      color : "#22C55E"
    },
    {
      title: "Items in Stock",
      mainNumber: "680 items",
      secondaryText: "In total",
      trendDirection: "horizontal" as const,
      color : "#EAB308"
    },
    {
      title: "Items in Stock",
      mainNumber: "200 ",
      secondaryText: "Critical items",
      trendDirection: "down" as const,
      color: "#EF4444"
    }
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

      
