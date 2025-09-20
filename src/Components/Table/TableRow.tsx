import React from 'react';
import { GrEdit } from "react-icons/gr";
import { RiDeleteBin7Line } from "react-icons/ri";



interface TableRowProps {
  data: Record<string, string | boolean | number> & { id: string };
  columns: string[];
  onEdit: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const TableRow: React.FC<TableRowProps> = ({ 
  data, 
  columns, 
  onEdit,
}) => {
  const handleDelete = (id: string) => {
    console.log('Delete item:', id);
  };

  

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {columns.map((col) => (
        <td key={col} className="py-4 px-6 text-sm text-gray-900">
          {col === 'Status' ? (
            <span 
              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                data[col] === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-header'
              }`}
            >
              {data[col]}
            </span>
          ) : col === 'Is Default' ? (
            <span className={`text-sm ${data[col] ? 'text-green-600' : 'text-header'}`}>
              {data[col] ? 'Yes' : 'No'}
            </span>
          ) : (
            <span className="text-gray-900">{data[col]}</span>
          )}
        </td>
      ))}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onEdit(data.id)}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
            title="Edit"
          >
           <GrEdit className="text-md" />
          </button>
          <button 
            onClick={() => handleDelete(data.id)}
            className="text-red-600 hover:text-red-800 transition-colors duration-150"
            title="Delete"
          >
            <RiDeleteBin7Line className="text-md" />
          </button>
        </div>
      </td>
    </tr>
  );
};