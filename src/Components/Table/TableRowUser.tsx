import React, { useState, useRef, useEffect } from 'react';
import { CiMenuKebab } from "react-icons/ci";

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
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150 relative">
      {columns.map((col) => (
        <td key={col} className="py-4 px-6 text-sm text-gray-900">
          {col === 'Status' ? (
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusColors[data[col] as string] || 'bg-gray-100 text-gray-500'}`}>
              <span className={`w-2 h-2 rounded-full ${data[col] === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {data[col]}
            </span>
          ) : (
            <span className="text-gray-900">{data[col]}</span>
          )}
        </td>
      ))}
      <td className="py-4 px-6 relative">
        <button
          ref={btnRef}
          onClick={() => setOpen((v) => !v)}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-150"
          title="Actions"
        >
          <CiMenuKebab className="text-lg" />
        </button>
        {open && (
          <div
            ref={dropdownRef}
            className="absolute right-16 mt-2 w-48 px-2 py-5 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
          >
            {renderDropdown ? renderDropdown(data.id) : null}
          </div>
        )}
      </td>
    </tr>
  );
}
