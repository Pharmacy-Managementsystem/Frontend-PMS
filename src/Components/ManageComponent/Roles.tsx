import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { useState } from "react";
import { useGet } from "../../Hook/API/useApiGet";
import Pagination from "../Pagination";
import { CircularProgress } from "@mui/material";
import Box from "@mui/material/Box";
import api from "../../Hook/API/api";
import Swal from "sweetalert2";
import { PackagePlus, Trash2, SquareChartGantt, Users } from "lucide-react";
import AddRole from "../Forms/AddRole";
import EditRoleView from "../Forms/EditRoleView";
import { useTranslation } from "react-i18next";

interface role {
  id: number;
  name: string;
  permissions: [];
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: role[];
}

const Roles = () => {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] =
    useState<string>("");

  const {
    data: roleResponse,
    isLoading,
    error,
    refetch,
  } = useGet<DataResponse>({
    endpoint: `/api/business/roles/?page=${page}&page_size=${pageSize}`,
    queryKey: ["all-roles", page],
  });

  const handleDelete = async (id: string | number) => {
    const result = await Swal.fire({
      title: t("roles.swal.areYouSure"),
      text: t("roles.swal.cantRevert"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("roles.swal.yesDelete"),
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/business/roles/${id}/`);
        if (response.status === 204) {
          Swal.fire(
            t("roles.swal.deleted"),
            t("roles.swal.roleDeleted"),
            "success",
          );
          refetch();
        }
      } catch (error) {
        console.error("Error deleting role:", error);
        Swal.fire(
          t("roles.swal.error"),
          t("roles.swal.errorDeleting"),
          "error",
        );
      }
    }
  };

  const handleBackFromAddRole = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleBackFromPermissions = () => {
    setIsPermissionsModalOpen(false);
    setSelectedRoleForPermissions("");
    refetch();
  };

  const handleManagePermissions = (roleName: string) => {
    setSelectedRoleForPermissions(roleName);
    setIsPermissionsModalOpen(true);
  };

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
        {t("roles.errorLoading")}: {error.message}
      </div>
    );

  const hasrole =
    roleResponse && roleResponse.results && roleResponse.results.length > 0;

  return (
    <div className="container mx-auto p-6">
      {isCreateModalOpen ? (
        <AddRole onBack={handleBackFromAddRole} />
      ) : !hasrole ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-blue-50 p-8 rounded-full mb-6">
            <Users size={64} className="text-blue-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            {t("roles.noRoles")}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md text-lg">
            {t("roles.getStarted")}
          </p>
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PackagePlus size={20} />
            {t("roles.createFirstRole")}
          </button>
        </div>
      ) : (
        <>
          <TableHeaderSearch
            title={t("roles.title")}
            buttonText={t("roles.addNewRole")}
            onAddClick={() => setIsCreateModalOpen(true)}
          />

          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {roleResponse.results.map((role) => (
                <div key={role.id} className="group">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 p-6 h-40 flex flex-col justify-between transform group-hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <Users size={20} className="text-blue-600" />
                        </div>
                        <span className="text-xl font-semibold text-gray-900 capitalize truncate max-w-[120px]">
                          {role.name}
                        </span>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => handleManagePermissions(role.name)}
                          title={t("roles.managePermissions")}
                        >
                          <SquareChartGantt size={18} />
                        </button>

                        <button
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => handleDelete(role.id)}
                          title={t("roles.deleteRole")}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{t("roles.permissions")}:</span>
                        <span className="font-medium text-blue-600">
                          {role.permissions?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalItems={roleResponse.count}
              itemsPerPage={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
              hasNext={!!roleResponse.next}
              hasPrevious={!!roleResponse.previous}
            />
          </div>

          {isPermissionsModalOpen && selectedRoleForPermissions && (
            <EditRoleView
              role_name={selectedRoleForPermissions}
              onBack={handleBackFromPermissions}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Roles;
