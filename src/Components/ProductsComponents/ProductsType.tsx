import { useState, useEffect } from "react";
import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { DataTable } from "../Table/DataTable";
import { TableRow } from "../Table/TableRow";
import { useGet } from "../../Hook/API/useApiGet";
import Pagination from "../Pagination";
import { CircularProgress } from "@mui/material";
import { FolderTree } from "lucide-react";
import api from "../../Hook/API/api";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import ReusableForm from "../Forms/ReusableForm";
import ViewTypeOrUnit from "../Info/ViewTypeOrUnit"; // أضف هذا الاستيراد

interface ProductType {
  id: number;
  name: string;
  parent: number | null;
  parent_name: string | null;
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductType[];
}

export default function ProductsType() {
  const [action, setAction] = useState<string | null>(null);
  const [id, setId] = useState<number | null>(null);
  const { t } = useTranslation();

  const columns = [t("productsType.name"), t("productsType.parent")];

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [parentTypes, setParentTypes] = useState<
    { value: number; label: string }[]
  >([]);

  // Build query parameters based on available search options
  const buildQueryParams = () => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search.trim()) {
      params.append("name__icontains", search.trim());
    }

    return params.toString();
  };

  const {
    data: typeResponse,
    isLoading,
    error,
    refetch,
  } = useGet<DataResponse>({
    endpoint: `/api/inventory/products/types/?${buildQueryParams()}`,
    queryKey: ["productTypes", page, search],
  });

  // Fetch parent types for dropdown
  const { data: allTypes } = useGet<DataResponse>({
    endpoint: `/api/inventory/products/types/?minimal=true`,
    queryKey: ["allProductTypes"],
  });

  useEffect(() => {
    if (allTypes?.results) {
      const options = allTypes.results.map((type) => ({
        value: type.id,
        label: type.name,
      }));
      setParentTypes([
        { value: 0, label: t("productsType.noParent") },
        ...options,
      ]);
    }
  }, [allTypes, t]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleDelete = async (id: string | number) => {
    const result = await Swal.fire({
      title: t("productsType.swal.areYouSure"),
      text: t("productsType.swal.cantRevert"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("productsType.swal.yesDelete"),
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/inventory/products/types/${id}/`);
        Swal.fire(
          t("productsType.swal.deleted"),
          t("productsType.swal.typeDeleted"),
          "success",
        );
        refetch();
      } catch (error: unknown) {
        console.error("Error deleting product type:", error);

        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const axiosError = error as {
            response?: {
              status?: number;
              data?: {
                error?: string;
              };
            };
          };

          if (
            axiosError.response?.status === 400 &&
            axiosError.response?.data?.error
          ) {
            Swal.fire(
              t("productsType.swal.error"),
              axiosError.response.data.error,
              "error",
            );
          } else {
            Swal.fire(
              t("productsType.swal.error"),
              t("productsType.swal.errorDeleting"),
              "error",
            );
          }
        } else {
          Swal.fire(
            t("productsType.swal.error"),
            t("productsType.swal.errorDeleting"),
            "error",
          );
        }
      }
    }
  };

  const handleBack = () => {
    setAction(null);
    setId(null);
  };

  const handleEditClick = (id: string | number) => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    setAction("edit");
    setId(numericId);
  };

  const handleViewClick = (id: string | number) => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    setAction("view");
    setId(numericId);
  };

  const handleAddClick = () => {
    setAction("add");
    setId(null);
  };

  const handleSuccess = () => {
    refetch();
    handleBack();
  };

  // Get initial values for edit
  const getInitialValues = () => {
    if (action === "edit" && id && typeResponse?.results) {
      const typeToEdit = typeResponse.results.find((type) => type.id === id);
      if (typeToEdit) {
        return {
          name: typeToEdit.name,
          parent: typeToEdit.parent || 0, // Use 0 for no parent
        };
      }
    }
    return {
      name: "",
      parent: 0,
    };
  };

  // Define form fields for product types
  const formFields = [
    {
      name: "name",
      label: t("productsType.name"),
      type: "text",
      required: true,
    },
    {
      name: "parent",
      label: t("productsType.parent"),
      type: "select",
      required: false,
      options: parentTypes,
    },
  ];

  // Transform API data to match table structure
  const tableData =
    typeResponse?.results?.map((type) => ({
      id: type.id.toString(),
      [columns[0]]: type.name,
      [columns[1]]: type.parent_name || t("productsType.noParent"),
    })) || [];

  const hasTypes =
    typeResponse && typeResponse.results && typeResponse.results.length > 0;

  return (
    <>
      {action === "view" && id ? (
        <ViewTypeOrUnit itemId={id} itemType="type" onBack={handleBack} />
      ) : action === "add" || action === "edit" ? (
        <ReusableForm
          fields={formFields}
          title={
            action === "add"
              ? t("productsType.addNewType")
              : t("productsType.editType")
          }
          endpoint={
            action === "add"
              ? "/api/inventory/products/types/"
              : `/api/inventory/products/types/${id}/`
          }
          method={action === "add" ? "post" : "put"}
          onSuccess={handleSuccess}
          onClose={handleBack}
          submitButtonText={
            action === "add"
              ? t("productsType.createType")
              : t("productsType.updateType")
          }
          initialValues={getInitialValues()}
        />
      ) : (
        <div className="">
          <TableHeaderSearch
            buttonText={t("productsType.addNewType")}
            onAddClick={handleAddClick}
            value={searchInput}
            onSearchChange={handleSearchChange}
            searchPlaceholder={t("productsType.searchPlaceholder")}
          />
          {error ? (
            <div className="p-6">
              {t("productsType.errorLoading")}: {error.message}
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-64">
              <CircularProgress />
            </div>
          ) : !hasTypes ? (
            searchInput.trim() ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <FolderTree size={48} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("productsType.noTypesFound")}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {t("productsType.tryDifferentSearch")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <FolderTree size={48} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("productsType.noTypes")}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {t("productsType.getStarted")}
                </p>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={handleAddClick}
                >
                  {t("productsType.createType")}
                </button>
              </div>
            )
          ) : (
            <>
              <DataTable
                columns={columns}
                data={tableData}
                RowComponent={TableRow}
                onEdit={handleEditClick}
                onView={handleViewClick} // أضف هذا
                onDelete={handleDelete}
                actions={["view", "edit", "delete"]}
              />

              <Pagination
                currentPage={page}
                totalItems={typeResponse?.count || 0}
                itemsPerPage={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                hasNext={!!typeResponse?.next}
                hasPrevious={!!typeResponse?.previous}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}
