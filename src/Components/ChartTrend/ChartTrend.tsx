import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', sales: 2500, purchase: 5000 },
  { month: 'Feb', sales: 5000, purchase: 7500 },
  { month: 'Mar', sales: 7500, purchase: 10000 },
  { month: 'Apr', sales: 10000, purchase: 7500 },
  { month: 'May', sales: 7500, purchase: 5000 },
  { month: 'Jun', sales: 5000, purchase: 2500 },
];

export default function ChartTrend() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className='bg-white rounded-lg p-4 shadow-lg'>
        <h2 className="text-header  font-light mb-4">Sales Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" />

            <XAxis 
              dataKey="month" 
              label={{ value: 'Month', position: 'insideBottomRight', offset: -10 }} 
            />
            <YAxis 
              domain={[0, 10000]} 
              label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip formatter={(value) => [`$${value}`, '']} />
            <Legend verticalAlign="top" height={36} />
            <Line 
              name="Sales" 
              type="monotone" 
              dataKey="sales" 
              stroke="#8884d8" 
              strokeWidth={2} 
              dot={{ r: 6 }} 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Purchase Trend Chart */}
      <div className='bg-white rounded-lg p-4 shadow-lg'>
        <h4 className="text-header  font-light mb-4">Purchase Trend</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" />

            <XAxis 
              dataKey="month" 
              label={{ value: 'Month', position: 'insideBottomRight', offset: -10 }} 
            />
            <YAxis 
              domain={[0, 10000]} 
              label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip formatter={(value) => [`$${value}`, '']} />
            <Legend verticalAlign="top" height={36} />
            <Line 
              name="Purchase" 
              type="monotone" 
              dataKey="purchase" 
              stroke="#82ca9d" 
              strokeWidth={2} 
              dot={{ r: 6 }} 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}