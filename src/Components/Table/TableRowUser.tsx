import React, { useState, useRef, useEffect } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { useTranslation } from "react-i18next";

interface TableRowUserProps {
  data: Record<string, string | boolean | number> & { id: string };
  columns: string[];
  renderDropdown?: (id: string) => React.ReactNode;
  onView?: (id: string) => void;
}

// Extended status colors for stock transfers
const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Inactive: "bg-red-100 text-red-600",
  Completed: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Transferring : "bg-blue-100 text-blue-800",
  Approved: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function TableRowUser({
  data,
  columns,
  renderDropdown,
}: TableRowUserProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
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

  const getStatusColor = (status: string) => {
    return statusColors[status] || "bg-gray-100 text-gray-500";
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "Active":
        case "Approved":
      case "Completed":
        return "bg-green-500";
      case "In Transit":
        return "bg-blue-500";
      case "Pending":
        return "bg-yellow-500";
      case "Inactive":
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
    <tr className=" hover:bg-gray-50 transition-colors duration-150 relative">
      {columns.map((col) => (
        <td
          key={col}
          className={`py-4 px-6 text-sm text-gray-900 ${isRTL ? "text-right" : "text-left"}`}
        >
          {col === t("transfers.status", "Status") || 
           col === t("suppliers.status", "Status") ? (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(data[col] as string)}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${getStatusDotColor(data[col] as string)}`}
              ></span>
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
          onClick={() => setOpenDropdown(!openDropdown)}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-150 p-1 rounded"
          title={t("table.actions")}
        >
          <CiMenuKebab className="text-lg" />
        </button>

        {openDropdown && renderDropdown && (
       <div
            ref={dropdownRef}
            className={`fixed mt-1 w-48 bg-white rounded-lg shadow-2xl border border-gray-100 z-50 overflow-hidden ${
              isRTL ? "left-15" : "right-15"
            }`}
          >
          {renderDropdown(data.id)}
        </div>
      )}
      </td>
       
    </tr>
   
    </>

  );
}