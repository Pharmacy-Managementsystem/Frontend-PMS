import React from 'react';
import { GrEdit } from "react-icons/gr";
import { RiDeleteBin7Line } from "react-icons/ri";
import { useTranslation } from 'react-i18next';

interface TableRowProps {
  data: Record<string, string | boolean | number> & { id: string };
  columns: string[];
  onEdit: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void; 
}

export const TableRow: React.FC<TableRowProps> = ({ 
  data, 
  columns, 
  onEdit,
  onDelete 
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {columns.map((col) => (
        <td key={col} className={`py-4 px-6 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
          {col === t('suppliers.status') || col === 'Status' ? ( // استخدام الترجمة
            <span 
              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                data[col] === t('table.status.active') || data[col] === 'Active'
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-header'
              }`}
            >
              {data[col] === t('table.status.active') || data[col] === 'Active' ? t('table.status.active') : 
               data[col] === t('table.status.inactive') || data[col] === 'Inactive' ? t('table.status.inactive') : 
               data[col]}
            </span>
          ) : col === t('currencies.isDefault') || col === 'Is Default' ? ( // استخدام الترجمة
            <span className={`text-sm ${data[col] ? 'text-green-600' : 'text-header'}`}>
              {data[col] ? t('table.yes') : t('table.no')}
            </span>
          ) : (
            <span className="text-gray-900">{data[col]}</span>
          )}
        </td>
      ))}
      <td className="py-4 px-6">
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button 
            onClick={() => onEdit(data.id)}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
            title={t('table.edit')}
          >
           <GrEdit className="text-md" />
          </button>
          <button 
            onClick={() => onDelete(data.id)}
            className="text-red-600 hover:text-red-800 transition-colors duration-150"
            title={t('table.delete')}
          >
            <RiDeleteBin7Line className="text-md" />
          </button>
        </div>
      </td>
    </tr>
  );
};