import { useTranslation } from "react-i18next";

interface TableRowSubscriptionProps {
  data: Record<string, string | boolean | number> & { id: string };
  columns: string[];
  onActionsClick?: (id: string) => void; // used for Renew
}

const statusColors: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Expired: "bg-rose-100 text-rose-700",
  Cancelled: "bg-gray-100 text-gray-600",
  Suspended: "bg-amber-100 text-amber-700",
  Pending: "bg-sky-100 text-sky-700",
};

export default function TableRowSubscription({
  data,
  columns,
  onActionsClick,
}: TableRowSubscriptionProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {columns.map((col) => (
        <td
          key={col}
          className={`py-4 px-6 text-sm text-gray-900 ${isRTL ? "text-right" : "text-left"}`}
        >
          {col === "Status" ? (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusColors[String(data[col])] || "bg-gray-100 text-gray-500"}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${String(data[col]) === "Active" ? "bg-emerald-500" : String(data[col]) === "Pending" ? "bg-sky-500" : String(data[col]) === "Suspended" ? "bg-amber-500" : String(data[col]) === "Cancelled" ? "bg-gray-400" : "bg-rose-500"}`}
              ></span>
              {String(data[col]) === "Active"
                ? t("table.status.active")
                : String(data[col]) === "Expired"
                  ? t("table.status.expired")
                  : String(data[col]) === "Cancelled"
                    ? t("table.status.cancelled")
                    : String(data[col]) === "Suspended"
                      ? t("table.status.suspended")
                      : String(data[col]) === "Pending"
                        ? t("table.status.pending")
                        : data[col]}
            </span>
          ) : (
            <span className="text-gray-900">{data[col]}</span>
          )}
        </td>
      ))}
      <td className={`py-4 px-6 ${isRTL ? "text-right" : "text-center"}`}>
        <button
          type="button"
          onClick={() => onActionsClick && onActionsClick(data.id)}
          className={`inline-flex items-center gap-1 bg-brand-600 text-gary-200 text-center px-3 py-1 rounded-lg shadow-soft bg-blue-300/10 hover:bg-blue-300 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {t("table.renew")}
        </button>
      </td>
    </tr>
  );
}
