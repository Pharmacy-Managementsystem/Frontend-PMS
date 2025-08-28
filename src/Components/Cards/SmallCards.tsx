
import { ChartIcon } from '../../Icon/ChartIcon';

interface SmallCardProps {
  title: string;
  mainNumber: string;
  secondaryText: string | undefined;
    secondaryNumber?: string;
  color: string;
  trendDirection: 'up' | 'down' | "horizontal";
}

export default function SmallCards({
  title,
  mainNumber,
  secondaryText,
  secondaryNumber,
    trendDirection,
  color
}: SmallCardProps) {
  return (
    <div className='bg-white rounded-lg min-w-72  w-full h-28 px-4 py-2 flex flex-col justify-around shadow-sm hover:shadow-md transition-shadow'>
      <div className='flex justify-between items-center'>
        <span className='text-xs text-gray-500 font-medium'>{title}</span>
        <ChartIcon variant={trendDirection} color={color} />
      </div>
      
      <div className='flex justify-between items-end'>
        <span className='text-xl font-semibold text-gray-800'>{mainNumber}</span>
        
        {secondaryNumber && (
          <div className='text-right'>
            <span className='block text-lg font-bold text-gray-800'>{secondaryNumber}</span>
            <span className='text-xs text-header font-light'>{secondaryText}</span>
          </div>
        )}
      </div>
      
      {!secondaryNumber && (
        <div className='flex justify-between'>
          <span className='text-xs text-header font-light'>{secondaryText}</span>
        </div>
      )}
    </div>
  );
}