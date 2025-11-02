import { useState } from "react";
import { useGet } from "../../Hook/API/useApiGet";
import { DataTable } from "../Table/DataTable";
import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { TableRow } from "../Table/TableRow";
import ReusableForm from "../Forms/ReusableForm";
import Pagination from "../Pagination";
import { CircularProgress } from "@mui/material";
import Box from "@mui/material/Box";
import { Users } from "lucide-react";
import api from "../../Hook/API/api";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import CustomerInfo from "../Info/InfoContacts/CustomerInfo";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

const Customers = () => {
  const { t } = useTranslation();

  const columns = [
    t("customers.customerName"),
    t("customers.phone"),
    t("customers.email"),
    t("customers.address"),
    t("customers.created_at"),
  ];

  const [page, setPage] = useState(1);
  const [pageSize] = useState(4);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<string | null>(null);

  const {
    data: CustomersResponse,
    isLoading,
    error,
    refetch,
  } = useGet<DataResponse>({
    endpoint: `/api/customer/?page=${page}&page_size=${pageSize}`,
    queryKey: ["all-customers", page],
  });

  const formFields = [
    { name: "name", label: t("customers.customerName") },
    { name: "phone", label: t("customers.phone") },
    { name: "email", label: t("customers.email"), type: "email" },
    { name: "address", label: t("customers.address") },
    { name: "idc", label: t("customers.idc") },
  ];
  const handleViewClick = (id: string) => {
    setContactInfo(id);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: t("customers.swal.areYouSure"),
      text: t("customers.swal.cantRevert"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("customers.swal.yesDelete"),
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/customer/${id}/`);
        if (response.status === 204) {
          Swal.fire(
            t("customers.swal.deleted"),
            t("customers.swal.customerDeleted"),
            "success",
          );
          refetch();
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
        Swal.fire(
          t("customers.swal.error"),
          t("customers.swal.errorDeleting"),
          "error",
        );
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const customer = CustomersResponse?.results.find((c) => c.id === id);
    if (customer) {
      try {
        const response = await api.patch(`/api/customer/${id}/`);
        if (response.status === 200) {
          refetch();
          Swal.fire(
            t("customers.statusUpdated"),
            t("customers.statusUpdatedSuccessfully"),
            "success",
          );
        }
      } catch (error) {
        console.error("Error toggling customer status:", error);
        Swal.fire(
          t("customers.swal.error"),
          t("customers.errorUpdatingStatus"),
          "error",
        );
      }
    }
  };

  const transformedData =
    CustomersResponse?.results?.map((customer) => ({
      id: customer.id,
      [columns[0]]: customer.name,
      [columns[1]]: customer.phone,
      [columns[2]]: customer.email,
      [columns[3]]: customer.address,
      [columns[4]]: customer.created_at,
    })) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <Box className="flex justify-center items-center w-full h-screen">
          <CircularProgress />
        </Box>
      </div>
    );
  }

  if (error)
    return (
      <div className="p-6">
        {t("customers.errorLoading")}: {error.message}
      </div>
    );

  const hasCustomers =
    CustomersResponse &&
    CustomersResponse.results &&
    CustomersResponse.results.length > 0;

  return (
    <>
      {contactInfo ? (
        <CustomerInfo
          CustomerInfo={contactInfo}
          title="customer"
          onClose={() => setContactInfo(null)}
        />
      ) : (
        <div className="container mx-auto p-6">
          {!hasCustomers ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Users size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("customers.noCustomers")}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                {t("customers.getStarted")}
              </p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setIsCreateModalOpen(true)}
              >
                {t("customers.createCustomer")}
              </button>
            </div>
          ) : (
            <>
              <TableHeaderSearch
                title={t("customers.title")}
                buttonText={t("customers.addNewCustomer")}
                onAddClick={() => setIsCreateModalOpen(true)}
              />
              <DataTable
                columns={columns}
                data={transformedData}
                RowComponent={TableRow}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onView={handleViewClick}
                actions={["view", "delete"]}
              />
              <Pagination
                currentPage={page}
                totalItems={CustomersResponse.count}
                itemsPerPage={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                hasNext={!!CustomersResponse.next}
                hasPrevious={!!CustomersResponse.previous}
              />
            </>
          )}

          {/* Create Modal */}
          {isCreateModalOpen && (
            <ReusableForm
              title={t("customers.createCustomer")}
              fields={formFields}
              endpoint="/api/customer/"
              method="post"
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={handleCreateSuccess}
              submitButtonText={t("customers.createCustomer")}
              key="create-form"
            />
          )}
        </div>
      )}
    </>
  );
};

export default Customers;
