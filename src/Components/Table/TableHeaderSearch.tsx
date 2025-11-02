import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

interface TableHeaderProps {
  title?: string; // جعل title اختياري
  buttonText: string;
  onAddClick: () => void;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  value?: string; // allow controlled usage to persist across remounts
}

export const TableHeaderSearch: React.FC<TableHeaderProps> = ({
  title,
  buttonText,
  onAddClick,
  onSearchChange,
  searchPlaceholder,
  value,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearchChange) onSearchChange(value);
  };

  return (
    <div
      className={`flex flex-col md:flex-row ${title ? "justify-between" : "justify-end"} pb-6 gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
    >
      {title && (
        <h1
          className={`text-3xl font-bold text-title ${isRTL ? "text-right" : "text-left"}`}
        >
          {title}
        </h1>
      )}

      <div
        className={`flex flex-col sm:flex-row ${!title ? "justify-between w-full" : ""} gap-4 items-start sm:items-center ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`relative transition-all ${isSearchFocused ? "w-full sm:w-64" : "w-full sm:w-48"} ${!title ? "flex-1" : ""}`}
        >
          <input
            type="text"
            placeholder={searchPlaceholder || t("table.search")}
            value={typeof value === "string" ? value : searchValue}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`w-full py-2 ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} text-gray-700 bg-white border rounded-xl outline-none transition-all ${
              isSearchFocused ? "border-blue-500" : "border-gray-300"
            }`}
          />

          <div
            className={`absolute inset-y-0 ${isRTL ? "right-0 pr-3" : "left-0 pl-3"} flex items-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 transition-all ${
                isSearchFocused ? "text-blue-500" : "text-gray-400"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <button
          onClick={onAddClick}
          className={`bg-primary hover:bg-blue-900 text-white px-8 py-2 sm:py-4 rounded-lg flex items-center gap-3 transition-colors duration-200 text-sm font-medium whitespace-nowrap ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <FaPlus className="text-md" />
          {buttonText}
        </button>
      </div>
    </div>
  );
};
