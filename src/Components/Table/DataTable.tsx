import React from 'react';

interface DataTableProps {
  columns: string[];
  data: Record<string, any>[];
  RowComponent: React.FC<any>;
  onEdit?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onActionsClick?: (id: string) => void;
  renderDropdown?: (id: string) => React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  RowComponent,
  onEdit,
  onToggleStatus,
  onActionsClick,
  renderDropdown
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-200 rounded-lg">
          <tr>
            {columns.map((column) => (
              <th key={column} className="py-4 px-6 text-left text-sm font-medium text-gray-700 first:rounded-l-lg last:rounded-r-lg">
                {column}
              </th>
            ))}
            <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 last:rounded-r-lg">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <RowComponent
              key={row.id}
              data={row}
              columns={columns}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onActionsClick={onActionsClick}
              renderDropdown={renderDropdown}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};