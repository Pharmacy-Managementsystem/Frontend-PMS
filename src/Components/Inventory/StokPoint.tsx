import { useState } from "react";
import { DataTable } from "../Table/DataTable";
import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { TableRow } from "../Table/TableRow";
import { useGet } from "../../Hook/API/useApiGet";
import ReusableForm from "../Forms/ReusableForm";
import Pagination from "../Pagination";
import { CircularProgress, Dialog, IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import { X } from "lucide-react";
import api from "../../Hook/API/api";
import Swal from "sweetalert2";
import { PackagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StokPoint {
  id: string;
  name: string;
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StokPoint[];
}

const StokPoint = () => {
  const { t } = useTranslation();

  const columns = [t("stockPoint.id"), t("stockPoint.name")];

  const [page, setPage] = useState(1);
  const [pageSize] = useState(4);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStokPoint, setEditingStokPoint] = useState<StokPoint | null>(
    null,
  );

  const {
    data: StokPointResponse,
    isLoading,
    error,
    refetch,
  } = useGet<DataResponse>({
    endpoint: `/api/inventory/stocks/stock-points/?page=${page}&page_size=${pageSize}`,
    queryKey: ["all-stok-point", page],
  });

  const formFields = [
    { name: "name", label: t("stockPoint.stockPointName"), required: true },
  ];

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingStokPoint(null);
    refetch();
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: t("stockPoint.swal.areYouSure"),
      text: t("stockPoint.swal.cantRevert"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("stockPoint.swal.yesDelete"),
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(
          `/api/inventory/stocks/stock-points/${id}/`,
        );
        if (response.status === 204) {
          Swal.fire(
            t("stockPoint.swal.deleted"),
            t("stockPoint.swal.stockPointDeleted"),
            "success",
          );
          refetch();
        }
      } catch (error) {
        console.error("Error deleting stock point:", error);
        Swal.fire(
          t("stockPoint.swal.error"),
          t("stockPoint.swal.errorDeleting"),
          "error",
        );
      }
    }
  };

  const handleEditClick = (id: string) => {
    const StokPoint = StokPointResponse?.results.find((p) => p.id === id);
    if (StokPoint) {
      setEditingStokPoint(StokPoint);
      setIsEditModalOpen(true);
    }
  };

  const transformedData =
    StokPointResponse?.results?.map((Point) => ({
      id: Point.id,
      [columns[0]]: Point.id,
      [columns[1]]: Point.name,
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
        {t("stockPoint.errorLoading")}: {error.message}
      </div>
    );

  const hasStockPoints =
    StokPointResponse &&
    StokPointResponse.results &&
    StokPointResponse.results.length > 0;

  return (
    <div className="container mx-auto p-6">
      {!hasStockPoints ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <PackagePlus size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("stockPoint.noStockPoints")}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            {t("stockPoint.getStarted")}
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t("stockPoint.createStockPoint")}
          </button>
        </div>
      ) : (
        <>
          <TableHeaderSearch
            buttonText={t("stockPoint.addNewStockPoint")}
            onAddClick={() => setIsCreateModalOpen(true)}
          />
          <DataTable
            columns={columns}
            data={transformedData}
            RowComponent={TableRow}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
          <Pagination
            currentPage={page}
            totalItems={StokPointResponse.count}
            itemsPerPage={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
            hasNext={!!StokPointResponse.next}
            hasPrevious={!!StokPointResponse.previous}
          />
        </>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <ReusableForm
          title={t("stockPoint.createStockPoint")}
          fields={formFields}
          endpoint="/api/inventory/stocks/stock-points/"
          method="post"
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          submitButtonText={t("stockPoint.createStockPoint")}
          key="create-form"
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingStokPoint && (
        <Dialog
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingStokPoint(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <IconButton
            aria-label="close"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingStokPoint(null);
            }}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <X />
          </IconButton>
          <ReusableForm
            title={t("stockPoint.updateStockPoint")}
            fields={formFields}
            endpoint={`/api/inventory/stocks/stock-points/${editingStokPoint.id}/`}
            method="patch"
            initialValues={{
              ...editingStokPoint,
            }}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingStokPoint(null);
            }}
            onSuccess={handleEditSuccess}
            submitButtonText={t("stockPoint.updateStockPoint")}
            key={`edit-form-${editingStokPoint.id}`}
          />
        </Dialog>
      )}
    </div>
  );
};

export default StokPoint;
