import { useState, useEffect } from 'react';
import { useGet } from '../../Hook/API/useApiGet';
import { FaCheckSquare, FaWindowClose } from "react-icons/fa";

interface Permission {
  id: number;
  name: string;
}

interface UserProps {
  role_name: string;
}

interface RolePermission {
  id: number;
  name: string;
  permissions: string[];
}

interface RolePermissionsResponse {
  results: RolePermission[];
}

const groupPermissionsBySection = (permissions: Permission[] = []) => {
  const grouped: { [key: string]: Permission[] } = {};
  
  permissions.forEach(permission => {
    const section = permission.name.split('.')[0];
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push(permission);
  });
  
  return grouped;
};

const getPermissionLabel = (permissionName: string) => {
  return permissionName.split('.').slice(1).join(' → ').replace(/_/g, ' ');
};

export default function Permission({ role_name }: UserProps) {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  const { data: roleResponse } = useGet<RolePermissionsResponse>({
    endpoint: `/api/business/roles/?role__name__icontains=${role_name || ''}`,
    queryKey: ["role-permissions", role_name],
    enabled: !!role_name,
  });

  const { data: allPermissions } = useGet<Permission[]>({
    endpoint: `/api/role-permissions/permissions/`,
    queryKey: ["all-permissions"],
  });
  
  useEffect(() => {
    if (roleResponse?.results?.[0]?.permissions && allPermissions) {
      const rolePermissionIds = roleResponse.results[0].permissions
        .map(permissionName => allPermissions.find(p => p.name === permissionName)?.id)
        .filter((id): id is number => id !== undefined);
      
      setSelectedPermissionIds(rolePermissionIds);
    }
  }, [roleResponse, allPermissions]);

  const groupedPermissions = groupPermissionsBySection(allPermissions);

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-80 h-full overflow-y-auto">
        {Object.entries(groupedPermissions).map(([section, permissions]) => (
          <div key={section} className="p-2">
            <h5 className="font-medium text-gray-800 capitalize mb-2">
              {section.replace(/_/g, ' ')}
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {permissions.map(permission => {
                const isSelected = selectedPermissionIds.includes(permission.id);
                const Icon = isSelected ? FaCheckSquare : FaWindowClose;
                const iconColor = isSelected ? "text-sky-600" : "text-red-600";

                return (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Icon className={`text-lg ${iconColor}`} />
                    <label className="text-sm text-gray-700 capitalize">
                      {getPermissionLabel(permission.name)}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}