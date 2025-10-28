import React from 'react';
import { useTranslation } from 'react-i18next';
export type TableAction = 'view' | 'edit' | 'delete' | 'toggleStatus' | 'custom';

interface DataTableProps {
  columns: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RowComponent: React.FC<any>;
  onEdit?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onActionsClick?: (id: string) => void;
  renderDropdown?: (id: string) => React.ReactNode;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void; // أضيفي هذا السطر
  actions?: TableAction[];
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  RowComponent,
  onEdit,
  onDelete,
  onToggleStatus,
  onActionsClick,
  onView, // أضيفي هذا
  renderDropdown,
  actions
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <div className="overflow-x-auto relative">
      <table className="w-full">
        <thead className="bg-gray-200 rounded-lg">
          <tr>
            {columns.map((column) => (
              <th key={column} className={`py-4 px-6 text-sm font-medium text-gray-700  ${isRTL ? 'text-right first:rounded-r-lg last:rounded-l-lg' : 'text-left first:rounded-l-lg last:rounded-r-lg '}`}>
                {column}
              </th>
            ))}
            <th className={`py-4 px-6 text-sm font-medium text-gray-700  relative z-10 ${isRTL ? 'text-right last:rounded-l-lg' : 'text-left last:rounded-r-lg'}`}>
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <RowComponent
              key={row.id}
              data={row}
              columns={columns}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onView={onView} // أضيفي هذا
              onActionsClick={onActionsClick}
              renderDropdown={renderDropdown}
              actions={actions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};