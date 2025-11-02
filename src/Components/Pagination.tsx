import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  hasNext,
  hasPrevious,
}: PaginationProps) {
  const { t, i18n } = useTranslation();
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const language = i18n.language;
  const isRTL = language === "ar";
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      // Adjust to always show maxVisiblePages
      if (end - start + 1 < maxVisiblePages) {
        if (start === 1) {
          end = Math.min(totalPages, start + maxVisiblePages - 1);
        } else {
          start = Math.max(1, end - maxVisiblePages + 1);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between mt-8 px-4">
      <div className="text-sm text-gray-600">
        {t("pagination.showing", { from, to, total: totalItems })}
      </div>

      {isRTL ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
            aria-label={t("pagination.previous")}
          >
            <ChevronRight size={16} />
          </button>

          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                page === currentPage
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => onPageChange(page)}
              disabled={page === currentPage}
              aria-label={t("pagination.page", { page })}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            aria-label={t("pagination.next")}
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
            aria-label={t("pagination.previous")}
          >
            <ChevronLeft size={16} />
          </button>

          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                page === currentPage
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => onPageChange(page)}
              disabled={page === currentPage}
              aria-label={t("pagination.page", { page })}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            aria-label={t("pagination.next")}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
