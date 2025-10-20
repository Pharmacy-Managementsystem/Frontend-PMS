import React, { useState, useRef, useEffect } from 'react';
import { CiMenuKebab } from "react-icons/ci";
import { useTranslation } from 'react-i18next';

interface TableRowUserProps {
  data: Record<string, string | boolean | number> & { id: string };
  columns: string[];
  renderDropdown?: (id: string) => React.ReactNode;
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-red-100 text-red-600',
};

export default function TableRowUser({ data, columns, renderDropdown }: TableRowUserProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [openDropdown, setOpenDropdown] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150 relative">
      {columns.map((col) => (
        <td key={col} className={`py-4 px-6 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
          {col === t('suppliers.status') || col === 'Status' ? ( // استخدام الترجمة
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusColors[data[col] as string] || 'bg-gray-100 text-gray-500'}`}>
              <span className={`w-2 h-2 rounded-full ${data[col] === t('table.status.active') || data[col] === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {data[col] === t('table.status.active') || data[col] === 'Active' ? t('table.status.active') : 
               data[col] === t('table.status.inactive') || data[col] === 'Inactive' ? t('table.status.inactive') : 
               data[col]}
            </span>
          ) : (
            <span className="text-gray-900">{data[col]}</span>
          )}
        </td>
      ))}
      <td className="py-4 px-6 relative">
        <button
          ref={btnRef}
          onClick={() => setOpenDropdown(!openDropdown)}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-150 p-1 rounded"
          title={t('table.actions')}
        >
          <CiMenuKebab className="text-lg" />
        </button>
        
        {openDropdown && (
          <div
            ref={dropdownRef}
            className={`fixed mt-1 w-48 bg-white rounded-lg shadow-2xl border border-gray-100 z-50 overflow-hidden ${
              isRTL ? 'left-0' : 'right-0'
            }`}
          >
            {renderDropdown ? renderDropdown(data.id) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                {t('table.noActions', 'No actions available')} {/* إضافة ترجمة افتراضية */}
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}