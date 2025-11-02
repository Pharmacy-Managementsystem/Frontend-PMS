import React from "react";
import { SquareChartGantt, Edit, Trash2, Power, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

export type TableAction =
  | "view"
  | "edit"
  | "delete"
  | "toggleStatus"
  | "custom";
interface TableRowProps {
  data: Record<string, string | boolean | number> & { id: string };
  columns: string[];
  onEdit?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void; // دالة جديدة للمشاهدة
  onCustomAction?: (id: string) => void;
  actions?: TableAction[];
}

export const TableRow: React.FC<TableRowProps> = ({
  data,
  columns,

  onEdit,
  onDelete,
  onToggleStatus,
  onView,
  onCustomAction,
  actions, // هنا هيتبعت من الDataTable
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // هنا الافتراضي هيشتغل لو actions مش متبعتة
  const displayActions = actions || ["edit", "delete"];

  const renderActionIcon = (action: TableAction) => {
    switch (action) {
      case "view":
        return <SquareChartGantt size={18} />;
      case "edit":
        return <Edit size={18} />;
      case "delete":
        return <Trash2 size={18} />;
      case "toggleStatus":
        return <Power size={18} />;
      case "custom":
        return <Settings size={18} />;
      default:
        return null;
    }
  };

  const getActionTitle = (action: TableAction) => {
    switch (action) {
      case "view":
        return t("table.view") || "View Details";
      case "edit":
        return t("table.edit") || "Edit";
      case "delete":
        return t("table.delete") || "Delete";
      case "toggleStatus":
        return t("table.toggleStatus") || "Toggle Status";
      case "custom":
        return t("table.custom") || "Custom Action";
      default:
        return "";
    }
  };

  // دالة للتعامل مع النقر على الإجراء
  const handleActionClick = (action: TableAction, id: string) => {
    switch (action) {
      case "view":
        onView?.(id); // استدعاء دالة المشاهدة
        break;
      case "edit":
        onEdit?.(id);
        break;
      case "delete":
        onDelete?.(id);
        break;
      case "toggleStatus":
        onToggleStatus?.(id);
        break;
      case "custom":
        onCustomAction?.(id);
        break;
      default:
        break;
    }
  };

  // دالة لتحديد لون الزر لكل إجراء
  const getActionColor = (action: TableAction) => {
    switch (action) {
      case "view":
        return "text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded";
      case "edit":
        return "text-green-600 hover:text-green-800 hover:bg-green-50 p-1 rounded";
      case "delete":
        return "text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded";
      case "toggleStatus":
        return "text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-1 rounded";
      case "custom":
        return "text-gray-600 hover:text-gray-800 hover:bg-gray-50 p-1 rounded";
      default:
        return "text-gray-600 hover:text-gray-800 hover:bg-gray-50 p-1 rounded";
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {columns.map((col) => (
        <td
          key={col}
          className={`py-4 px-6 text-sm text-gray-900 ${isRTL ? "text-right" : "text-left"}`}
        >
          {col === t("suppliers.status") || col === "Status" ? (
            <span
              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                data[col] === t("table.status.active") || data[col] === "Active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-header"
              }`}
            >
              {data[col] === t("table.status.active") || data[col] === "Active"
                ? t("table.status.active")
                : data[col] === t("table.status.inactive") ||
                    data[col] === "Inactive"
                  ? t("table.status.inactive")
                  : data[col]}
            </span>
          ) : col === t("currencies.isDefault") || col === "Is Default" ? (
            <span
              className={`text-sm ${data[col] ? "text-green-600" : "text-header"}`}
            >
              {data[col] ? t("table.yes") : t("table.no")}
            </span>
          ) : (
            <span className="text-gray-900">{data[col]}</span>
          )}
        </td>
      ))}
      <td className="py-4 px-3">
        <div className={`flex items-center gap-2 `}>
          {displayActions.map((action) => (
            <button
              key={action}
              onClick={() => handleActionClick(action, data.id)}
              className={`${getActionColor(action)} transition-colors duration-150`}
              title={getActionTitle(action)}
            >
              {renderActionIcon(action)}
            </button>
          ))}
        </div>
      </td>
    </tr>
  );
};
