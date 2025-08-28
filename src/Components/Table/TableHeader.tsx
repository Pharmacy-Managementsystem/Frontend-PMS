import React from 'react';
import { Plus } from 'lucide-react';


interface TableHeaderProps {
  title: string;
  buttonText: string;
  onAddClick: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ 
  title, 
  buttonText,
  onAddClick 
}) => {
  return (
    <div className="flex justify-between pb-6">
      <h1 className="text-3xl font-bold text-title">{title}</h1>
      <button 
        onClick={onAddClick}
        className="bg-primary cursor-pointer hover:bg-blue-900 text-white px-8 py-4 rounded-lg flex items-center gap-3 transition-colors duration-200 text-sm font-medium"
      >
        <Plus  className='text-md'/>
        {buttonText}
      </button>
    </div>
  );
};