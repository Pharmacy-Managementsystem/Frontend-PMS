import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa6";
import { DataTable } from "../Table/DataTable";
import TableRowUser from "../Table/TableRowUser";
import { useGet } from "../../Hook/API/useApiGet";
import ReusableForm from "../Forms/ReusableForm";
import AddStock from "../Forms/AddStock";

// Interface for stock transfer data
interface StockTransfer {
  id: number;
  transfer_reference: string;
  current_branch_name: string;
  current_stock_point_name: string;
  target_branch_name: string;
  target_stock_point_name: string;
  status: "pending" | "transferring" | "completed" | "cancelled";
  request_notes: string;
  answer_notes: string;
  items_count: number;
  total_requested_quantity: number;
  created_at: string;
  modified_at: string;
}

interface StockTransferResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StockTransfer[];
}

export default function StockTransfers() {
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFormCreate, setIsFormCreate] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);
  const [action, setAction] = useState<"approve" | "accept" | "cancel" | null>(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const handleCreateSuccess = () => {
    setIsFormOpen(false);
    setSelectedTransferId(null);
    setAction(null);
    refetch();
  };
  // Build API endpoint with filter
  const endpoint = activeFilter 
    ? `/api/inventory/stocks/transfers/list/?status=${activeFilter}`
    : `/api/inventory/stocks/transfers/list/`;

  // Fetch stock transfers from API
  const { data: transfersData, isLoading, refetch } = useGet<StockTransferResponse>({
    endpoint,
    queryKey: ["stock-transfers", activeFilter],
  });


  // Define table columns
  const columns = [
    t("transfers.transferId", "Transfer ID"),
    t("transfers.requestNotes", "Request Notes"),
    t("transfers.fromBranch", "From Branch"),
    t("transfers.toBranch", "To Branch"),
    t("transfers.date", "Date"),
    t("transfers.status", "Status"),
  ];

  const filteredData = transfersData?.results?.filter((item) => {
    const searchLower = searchValue.toLowerCase();
    return (
      item.transfer_reference.toLowerCase().includes(searchLower) ||
      item.request_notes.toLowerCase().includes(searchLower) ||
      item.current_branch_name.toLowerCase().includes(searchLower) ||
      item.current_stock_point_name.toLowerCase().includes(searchLower) ||
      item.target_branch_name.toLowerCase().includes(searchLower) ||
      item.target_stock_point_name.toLowerCase().includes(searchLower)
    );
  }) || [];

  const tableData = filteredData.map(transfer => ({
    id: transfer.id.toString(),
    [columns[0]]: transfer.transfer_reference,
    [columns[1]]: transfer.request_notes,
    [columns[2]]: `${transfer.current_branch_name} - ${transfer.current_stock_point_name}`,
    [columns[3]]: `${transfer.target_branch_name} - ${transfer.target_stock_point_name}`,
    [columns[4]]: new Date(transfer.created_at).toLocaleDateString(),
    [columns[5]]: transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1),
    originalData: transfer
  }));

  const handleAction = (transferId: number, actionType: "approve" | "accept" | "cancel") => {
    setSelectedTransferId(transferId);
    setAction(actionType);
    setIsFormOpen(true);
  };

  

  const getFormFields = () => {
    const baseFields = [
      {
        name: "answer_notes",
        label: t("transfers.notes", "Notes"),
        type: "textarea" as const,
        required: false,
      },
    ];

    return baseFields;
  };



  const getFormTitle = () => {
    const actionText = action ? action.charAt(0).toUpperCase() + action.slice(1) : "";
    return `${actionText} ${t("transfers.stockTransfer", "Stock Transfer")}`;
  };

  

  const renderDropdown = (id: string) => {
    const transferId = parseInt(id);
    

    return (
      <div className="p-2">
          <button
            onClick={() => handleAction(transferId, "approve")}
            className="block w-full text-left text-label text-base px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            {t("actions.approve", "Approve")}
          </button>
        
          <button
            onClick={() => handleAction(transferId, "accept")}
            className="block w-full text-left text-label text-base px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            {t("actions.accept", "Accept")}
          </button>
        
          <button
            onClick={() => handleAction(transferId, "cancel")}
            className="block w-full text-left text-label text-base px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            { t("actions.cancel", "Cancel")}
          </button>
      </div>
    );
  };

  const handleFilterChange = (filter: string) => {
    if (filter === "All") {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter.toLowerCase());
    }
  };

  return (

    <>
   {isFormCreate ? (
        <AddStock
          onClose={() => setIsFormCreate(false)}
          onSuccess={handleCreateSuccess}
        />
       ):(
         <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4 justify-between">
          <h1 className={`text-3xl font-bold text-gray-900  ${isRTL ? "text-right" : "text-left"}`}>
            {t("stockTransfers.title", "Stock Transfers")}
          </h1>
          <button onClick={() => setIsFormCreate(true)} 
           className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors duration-200 text-sm font-medium whitespace-nowrap ml-auto ${isRTL ? "flex-row-reverse" : ""}`}>
            <FaPlus className="text-sm" />
            {t("transfers.initiateTransfer", "Initiate Transfer")}
          </button>
        </div>

        <div className={`flex gap-4 items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              className="w-full bg-white h-11 pl-12 pr-5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder={t("search.placeholder", "Search transfers...")}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <div className="absolute left-4 top-3.5">
              <svg
                className="h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
              </svg>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange("All")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeFilter === null
                  ? "bg-blue-100 text-blue-600"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {t("filters.all", "All")}
            </button>
            <button
              onClick={() => handleFilterChange("pending")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeFilter === "pending"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {t("transfers.pending", "Pending")}
            </button>
            <button
              onClick={() => handleFilterChange("transferring")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeFilter === "transferring"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {t("transfers.inTransit", "In Transfer")}
            </button>
            <button
              onClick={() => handleFilterChange("completed")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeFilter === "completed"
                  ? "bg-green-100 text-green-600"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {t("transfers.completed", "Completed")}
            </button>
            <button
              onClick={() => handleFilterChange("cancelled")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeFilter === "cancelled"
                  ? "bg-red-100 text-red-600"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {t("transfers.cancelled", "Cancelled")}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-500">Loading transfers...</div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={tableData}
            RowComponent={TableRowUser}
            renderDropdown={renderDropdown}
          />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && tableData.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-500">
            {searchValue ? "No transfers match your search." : "No transfers found."}
          </div>
        </div>
      )}

      {/* Reusable Form for Actions */}
      {isFormOpen && selectedTransferId && action && (
        <ReusableForm
          title={getFormTitle()}
          fields={getFormFields()}
          endpoint={`/api/inventory/stocks/transfers/${selectedTransferId}/${action}/`}
          method="post"
          onClose={() => {
            setIsFormOpen(false);
            setSelectedTransferId(null);
            setAction(null);
          }}
          onSuccess={handleCreateSuccess}
          submitButtonText="Done"
          key={`${action}-form-${selectedTransferId}`}
        />
      )}
       
      
    </div>

       )
       
       }
   
    </>
  );
}