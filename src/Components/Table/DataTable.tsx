import React from 'react';

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
    onDelete?: (id: string) => void; // Add this line

}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  RowComponent,
  onEdit,
  onToggleStatus,
  onActionsClick,
  renderDropdown,
  onDelete, 

}) => {
  return (
    <div className="overflow-x-auto relative">
      <table className="w-full">
        <thead className="bg-gray-200 rounded-lg">
          <tr>
            {columns.map((column) => (
              <th key={column} className="py-4 px-6 text-left text-sm font-medium text-gray-700 first:rounded-l-lg last:rounded-r-lg">
                {column}
              </th>
            ))}
            <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 last:rounded-r-lg relative z-10">Actions</th>
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
              onActionsClick={onActionsClick}
              renderDropdown={renderDropdown}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};