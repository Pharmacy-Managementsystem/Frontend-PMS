import { useState, useEffect } from "react";
import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { DataTable } from "../Table/DataTable";
import { TableRow } from "../Table/TableRow";
import { useGet } from "../../Hook/API/useApiGet";
import Pagination from "../Pagination";
import { CircularProgress } from "@mui/material";
import { PackagePlus } from "lucide-react";
import api from "../../Hook/API/api";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import FormProduct from "../Forms/FormProducts";

interface Unit {
  id: number;
  unit: number;
  unit_name: string;
  quantity_per_parent: number;
  is_main_unit: boolean;
}

interface Batch {
  id: number;
  batch: number;
  batch_size: number;
  price: string;
  barcode: string;
  created_by_username: string;
  batch_num: string;
  exp_date: string;
}

interface Product {
  id: number;
  arabic_name: string;
  global_code: string;
  short_code: string;
  is_discountable: boolean;
  max_discount: number;
  english_name: string;
  commercial_name: string;
  cost: string;
  company: number;
  company_name: string;
  type: number;
  type_name: string;
  description: string;
  is_expirable: boolean;
  has_label: boolean;
  created_by_username: string;
  created_at: string;
  modified_at: string;
  units: Unit[];
  batches: Batch[];
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export default function ProductsList() {
  const [productsAction, setProductsAction] = useState<string | null>(null);
  const [id, setId] = useState<number | null>(null);
  const { t } = useTranslation();

  const columns = [
    t("products.productName"),
    t("products.englishName"),
    t("products.globalCode"),
    t("products.cost"),
    t("products.company"),
    t("products.type"),
  ];

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Build query parameters based on available search options
  const buildQueryParams = () => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search.trim()) {
      // params.append('search', search.trim());
      params.append("english_name__icontains", search);
      // params.append('arabic_name_icontains', search);
      // params.append('global_code_icontains', search);
    }

    return params.toString();
  };

  const {
    data: productResponse,
    isLoading,
    error,
    refetch,
  } = useGet<DataResponse>({
    endpoint: `/api/inventory/products/?${buildQueryParams()}`,
    queryKey: ["products", page, search],
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

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
      title: t("products.swal.areYouSure"),
      text: t("products.swal.cantRevert"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("products.swal.yesDelete"),
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/inventory/products/${id}/`);
        if (response.status === 204) {
          Swal.fire(
            t("products.swal.deleted"),
            t("products.swal.productDeleted"),
            "success",
          );
          refetch();
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire(
          t("products.swal.error"),
          t("products.swal.errorDeleting"),
          "error",
        );
      }
    }
  };

  // Transform API data to match table structure
  const tableData =
    productResponse?.results?.map((product) => ({
      id: product.id.toString(),
      [columns[0]]:
        product.arabic_name || product.commercial_name || product.english_name,
      [columns[1]]: product.english_name,
      [columns[2]]: product.global_code,
      [columns[3]]: `${formatCurrency(product.cost)} `,
      [columns[4]]: product.company_name,
      [columns[5]]: product.type_name,
    })) || [];

  const hasProducts =
    productResponse &&
    productResponse.results &&
    productResponse.results.length > 0;

  const handleBack = () => {
    setProductsAction(null);
  };

  const handleEditClick = (id: string | number) => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    setProductsAction(t("branchesManagement.editBranch"));
    setId(numericId);
  };

  return (
    <>
      {productsAction ? (
        <div>
          <FormProduct
            mode={
              productsAction === t("branchesManagement.addNewBranch")
                ? "add"
                : "edit"
            }
            productId={
              productsAction === t("branchesManagement.addNewBranch")
                ? null
                : id
            }
            onBack={handleBack}
          />
        </div>
      ) : (
        <div className="">
          <TableHeaderSearch
            buttonText={t("products.addNewProduct")}
            onAddClick={() =>
              setProductsAction(t("branchesManagement.addNewBranch"))
            }
            value={searchInput}
            onSearchChange={handleSearchChange}
            searchPlaceholder={t("products.searchPlaceholder")}
          />
          {error ? (
            <div className="p-6">
              {t("products.errorLoading")}: {error.message}
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-64">
              <CircularProgress />
            </div>
          ) : !hasProducts ? (
            searchInput.trim() ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <PackagePlus size={48} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("products.noProductsFound")}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {t("products.tryDifferentSearch")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <PackagePlus size={48} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("products.noProducts")}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {t("products.getStarted")}
                </p>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() =>
                    setProductsAction(t("branchesManagement.addNewBranch"))
                  }
                >
                  {t("products.createProduct")}
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
                onDelete={handleDelete}
                actions={["edit", "delete"]}
              />

              <Pagination
                currentPage={page}
                totalItems={productResponse?.count || 0}
                itemsPerPage={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                hasNext={!!productResponse?.next}
                hasPrevious={!!productResponse?.previous}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}
