import React, { useState, useEffect } from "react";
import { FaPen, FaSave, FaTimes } from "react-icons/fa";
import { useGet } from "../../Hook/API/useApiGet";
import { useMutate } from "../../Hook/API/useApiMutate";
import { ArrowLeft } from "lucide-react";
import { FaCheckSquare, FaWindowClose } from "react-icons/fa";

interface Permission {
  id: number;
  name: string;
}

interface RolePermission {
  id: number;
  name: string;
  permissions: string[];
}

interface RoleProps {
  role_name: string;
  onBack: () => void;
}

interface RolePermissionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RolePermission[];
}

interface UpdateRolePermissions {
  role_name: string;
  role_permissions: number[];
}

const EditRoleView: React.FC<RoleProps> = ({ role_name, onBack }) => {
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    [],
  );

  const {
    data: roleResponse,
    isLoading,
    error,
  } = useGet<RolePermissionsResponse>({
    endpoint: `/api/business/roles/?role__name__icontains=${role_name || ""}`,
    queryKey: ["role-permissions", role_name],
  });

  // جلب كل الصلاحيات المتاحة
  const { data: allPermissionsResponse } = useGet<Permission[]>({
    endpoint: `/api/role-permissions/permissions/`,
    queryKey: ["all-permissions"],
  });

  // Mutation for updating role permissions
  const updateRoleMutation = useMutate<RolePermission, UpdateRolePermissions>({
    endpoint: `/api/business/roles/${roleResponse?.results[0]?.id}/`,
    method: "patch",
    invalidate: ["role-permissions"],
  });

  useEffect(() => {
    if (roleResponse?.results?.[0]?.permissions && allPermissionsResponse) {
      const rolePermissionIds = roleResponse.results[0].permissions
        .map((permissionName) => {
          const permission = allPermissionsResponse.find(
            (p) => p.name === permissionName,
          );
          return permission?.id;
        })
        .filter((id): id is number => id !== undefined);

      setSelectedPermissionIds(rolePermissionIds);
    }
  }, [roleResponse, allPermissionsResponse]);

  // Handle permission checkbox change
  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissionIds((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Handle select all permissions in a section
  const handleSelectAllSection = (section: string, select: boolean) => {
    if (!allPermissionsResponse) return;

    const sectionPermissions = allPermissionsResponse
      .filter((permission) => permission.name.startsWith(`${section}.`))
      .map((p) => p.id);

    setSelectedPermissionIds((prev) => {
      if (select) {
        const newPermissions = [...prev];
        sectionPermissions.forEach((id) => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return newPermissions;
      } else {
        return prev.filter((id) => !sectionPermissions.includes(id));
      }
    });
  };

  // Handle save permissions
  const handleSavePermissions = async () => {
    if (!roleResponse?.results?.[0]) return;

    try {
      await updateRoleMutation.mutateAsync({
        role_name: roleResponse.results[0].name,
        role_permissions: selectedPermissionIds,
      });
      setIsEditingPermissions(false);
    } catch (error) {
      console.error("Error updating permissions:", error);
    }
  };

  // Handle cancel editing
  const handleCancelEditing = () => {
    // Reset to original permissions
    if (roleResponse?.results?.[0]?.permissions && allPermissionsResponse) {
      const rolePermissionIds = roleResponse.results[0].permissions
        .map((permissionName) => {
          const permission = allPermissionsResponse.find(
            (p) => p.name === permissionName,
          );
          return permission?.id;
        })
        .filter((id): id is number => id !== undefined);

      setSelectedPermissionIds(rolePermissionIds);
    }
    setIsEditingPermissions(false);
  };

  // تجميع الصلاحيات حسب الأقسام
  const groupPermissionsBySection = (permissions: Permission[]) => {
    const grouped: { [key: string]: Permission[] } = {};

    permissions.forEach((permission) => {
      const parts = permission.name.split(".");
      if (parts.length >= 2) {
        const section = parts[0];
        if (!grouped[section]) {
          grouped[section] = [];
        }
        grouped[section].push(permission);
      }
    });

    return grouped;
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl py-10 mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle error state
  if (error || !roleResponse?.results?.[0]) {
    return (
      <div className="max-w-7xl py-10 mx-auto flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading data</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Role
          </button>
        </div>
      </div>
    );
  }

  const PermissionsDisplay = () => {
    const groupedAllPermissions = groupPermissionsBySection(
      allPermissionsResponse || [],
    );

    // حساب عدد الصلاحيات المختارة لكل قسم
    const getSectionSelectionStatus = (section: string) => {
      if (!allPermissionsResponse) return { selected: 0, total: 0 };

      const sectionPermissions = allPermissionsResponse.filter((p) =>
        p.name.startsWith(`${section}.`),
      );
      const selectedInSection = sectionPermissions.filter((p) =>
        selectedPermissionIds.includes(p.id),
      ).length;

      return {
        selected: selectedInSection,
        total: sectionPermissions.length,
        allSelected: selectedInSection === sectionPermissions.length,
        someSelected:
          selectedInSection > 0 &&
          selectedInSection < sectionPermissions.length,
      };
    };

    // Function to generate accessible permission label
    const getPermissionLabel = (permissionName: string) => {
      return permissionName.split(".").slice(1).join(" → ").replace(/_/g, " ");
    };

    return (
      <div className="space-y-4">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {Object.entries(groupedAllPermissions).map(
            ([section, permissions]) => {
              const sectionStatus = getSectionSelectionStatus(section);

              return (
                <div key={section} className="p-2 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-800 capitalize">
                      {section.replace(/_/g, " ")}
                    </h5>
                    {isEditingPermissions && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600">
                          {sectionStatus.selected}/{sectionStatus.total}
                        </span>
                        <button
                          onClick={() =>
                            handleSelectAllSection(
                              section,
                              !sectionStatus.allSelected,
                            )
                          }
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          aria-label={`${sectionStatus.allSelected ? "Deselect" : "Select"} all ${section.replace(/_/g, " ")} permissions`}
                        >
                          {sectionStatus.allSelected
                            ? "Deselect All"
                            : "Select All"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {permissions.map((permission) => {
                      const permissionLabel = getPermissionLabel(
                        permission.name,
                      );
                      const checkboxId = `permission-${permission.id}`;
                      const isSelected = selectedPermissionIds.includes(
                        permission.id,
                      );

                      return (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2"
                        >
                          {isEditingPermissions ? (
                            <>
                              <input
                                id={checkboxId}
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  handlePermissionChange(permission.id)
                                }
                                className="h-4 w-4 text-blue-600 rounded"
                                aria-label={`Permission: ${permissionLabel}`}
                              />
                              <label
                                htmlFor={checkboxId}
                                className="text-sm text-gray-700 capitalize cursor-pointer"
                              >
                                {permissionLabel}
                              </label>
                            </>
                          ) : (
                            <>
                              {isSelected ? (
                                <FaCheckSquare
                                  className="text-lg text-sky-600"
                                  aria-label="Permission granted"
                                />
                              ) : (
                                <FaWindowClose
                                  className="text-lg text-red-600"
                                  aria-label="Permission not granted"
                                />
                              )}
                              <label className="text-sm text-gray-700 capitalize">
                                {permissionLabel}
                              </label>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>
    );
  };

  const currentRole = roleResponse.results[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="p-6 relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Back to roles"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {currentRole.name} Permissions
              </h2>
              <p className="text-gray-600 text-sm">
                Manage and view permissions for this role
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditingPermissions ? (
              <button
                onClick={() => setIsEditingPermissions(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaPen className="h-4 w-4" />
                <span>Edit Permissions</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancelEditing}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FaTimes className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={updateRoleMutation.isPending}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <FaSave className="h-4 w-4" />
                  <span>
                    {updateRoleMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Permissions Display */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {isEditingPermissions
                ? "Edit Permissions"
                : "Current Permissions"}
            </h3>
            <p className="text-sm text-gray-600">
              {isEditingPermissions
                ? 'Select or deselect permissions for this role. Use "Select All" to quickly manage section permissions.'
                : `Viewing all permissions assigned to the ${currentRole.name} role.`}
            </p>
          </div>

          <PermissionsDisplay />
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Total permissions: {allPermissionsResponse?.length || 0}
            </span>
            <span>
              Selected: {selectedPermissionIds.length} /{" "}
              {allPermissionsResponse?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRoleView;
