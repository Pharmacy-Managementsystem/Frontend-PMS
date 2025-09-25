// UserInfo.tsx
import React, { useState, useEffect } from 'react';
import { FaPen, FaSave, FaTimes } from 'react-icons/fa';
import { useGet } from '../../Hook/API/useApiGet';
import { useMutate } from '../../Hook/API/useApiMutate';
import { ArrowLeft } from 'lucide-react';
import { FaCheckSquare ,FaWindowClose} from "react-icons/fa";



// Type definitions based on your JSON structure
interface DataResponse {
  id: string;
  email: string;
  name?: string;
  username?: string;
  phone_number: string;
  address: string;
  branches_id: string[];
  role_name: string;
}

interface UserInfoProps {
  userId: string;
  onBack: () => void; 
}

interface Branch {
  id: number;
  name: string;
}

interface BranchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Branch[];
}

interface Permission {
  id: number;
  name: string;
}

interface RolePermission {
  id: number;
  name: string;
  permissions: string[];
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

const UserInfo: React.FC<UserInfoProps> = ({ userId, onBack }) => {
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  const { data: userData, isLoading, error } = useGet<DataResponse>({
    endpoint: `/api/user/${userId}/`,
    queryKey: ['User', userId],
  });

  const { data: branchResponse } = useGet<BranchResponse>({
    endpoint: `/api/branch/?minimal=true`,
    queryKey: ["all-branches"],
  });

  const { data: roleResponse } = useGet<RolePermissionsResponse>({
    endpoint: `/api/business/roles/?role__name__icontains=${userData?.role_name || ''}`,
    queryKey: ["role-permissions", userData?.role_name],
    enabled: !!userData?.role_name,
  });

  // جلب كل الصلاحيات المتاحة
  const { data: allPermissionsResponse } = useGet<Permission[]>({
    endpoint: `/api/role-permissions/permissions/`,
    queryKey: ["all-permissions"],
  });

  // Mutation for updating role permissions
  const updateRoleMutation = useMutate<RolePermission, UpdateRolePermissions>({
    endpoint: `/api/business/roles/${roleResponse?.results[0]?.id}/`,
    method: 'patch',
    invalidate: ['role-permissions', userData?.role_name],
  });

  useEffect(() => {
    if (roleResponse?.results?.[0]?.permissions && allPermissionsResponse) {
      const rolePermissionIds = roleResponse.results[0].permissions.map(permissionName => {
        const permission = allPermissionsResponse.find(p => p.name === permissionName);
        return permission?.id;
      }).filter((id): id is number => id !== undefined);
      
      setSelectedPermissionIds(rolePermissionIds);
    }
  }, [roleResponse, allPermissionsResponse]);

  const getBranchNames = (branchIds: string[]): string[] => {
    if (!branchResponse?.results || !branchIds) return [];
    
    return branchIds.map(branchId => {
      const branch = branchResponse.results.find(b => b.id.toString() === branchId.toString());
      return branch?.name || `Unknown Branch (ID: ${branchId})`;
    });
  };

  // Handle permission checkbox change
  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissionIds(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Handle select all permissions in a section
  const handleSelectAllSection = (section: string, select: boolean) => {
    if (!allPermissionsResponse) return;

    const sectionPermissions = allPermissionsResponse.filter(permission => 
      permission.name.startsWith(`${section}.`)
    ).map(p => p.id);

    setSelectedPermissionIds(prev => {
      if (select) {
        const newPermissions = [...prev];
        sectionPermissions.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return newPermissions;
      } else {
        return prev.filter(id => !sectionPermissions.includes(id));
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
      console.error('Error updating permissions:', error);
    }
  };

  // تجميع الصلاحيات حسب الأقسام
  const groupPermissionsBySection = (permissions: Permission[]) => {
    const grouped: { [key: string]: Permission[] } = {};
    
    permissions.forEach(permission => {
      const parts = permission.name.split('.');
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
  if (error || !userData) {
    return (
      <div className="max-w-7xl py-10 mx-auto flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading user data</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const displayName = userData.name || userData.username || 'Unknown User';

  const branchNames = getBranchNames(userData.branches_id);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const ProfileDetailItem = ({ 
    label, 
    value, 
  }: { 
    label: string; 
    value: string; 
  }) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <p className="text-sm text-gray-700 break-words">{value}</p>
    </div>
  );

  const PermissionsDisplay = () => {
    const groupedAllPermissions = groupPermissionsBySection(allPermissionsResponse || []);

    // حساب عدد الصلاحيات المختارة لكل قسم
    const getSectionSelectionStatus = (section: string) => {
      if (!allPermissionsResponse) return { selected: 0, total: 0 };
      
      const sectionPermissions = allPermissionsResponse.filter(p => 
        p.name.startsWith(`${section}.`)
      );
      const selectedInSection = sectionPermissions.filter(p => 
        selectedPermissionIds.includes(p.id)
      ).length;
      
      return {
        selected: selectedInSection,
        total: sectionPermissions.length,
        allSelected: selectedInSection === sectionPermissions.length,
        someSelected: selectedInSection > 0 && selectedInSection < sectionPermissions.length
      };
    };

    // Function to generate accessible permission label
    const getPermissionLabel = (permissionName: string) => {
      return permissionName.split('.').slice(1).join(' → ').replace(/_/g, ' ');
    };

    return (
      <div className="space-y-4">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {Object.entries(groupedAllPermissions).map(([section, permissions]) => {
            const sectionStatus = getSectionSelectionStatus(section);
            
            return (
              <div key={section} className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-800 capitalize">
                    {section.replace(/_/g, ' ')}
                  </h5>
                  {isEditingPermissions && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">
                        {sectionStatus.selected}/{sectionStatus.total}
                      </span>
                      <button
                        onClick={() => handleSelectAllSection(section, !sectionStatus.allSelected)}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        aria-label={`${sectionStatus.allSelected ? 'Deselect' : 'Select'} all ${section.replace(/_/g, ' ')} permissions`}
                      >
                        {sectionStatus.allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map(permission => {
                    const permissionLabel = getPermissionLabel(permission.name);
                    const checkboxId = `permission-${permission.id}`;
                    const isSelected = selectedPermissionIds.includes(permission.id);

                    
                    return (
                      <div key={permission.id} className="flex items-center space-x-2">
                        {isEditingPermissions ? (
                          <>
                            <input
                              id={checkboxId}
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handlePermissionChange(permission.id)}
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
                          <FaCheckSquare className="text-lg  text-sky-600" aria-label="Permission granted" />
                        ) : (
                          <FaWindowClose className="text-lg  text-red-600" aria-label="Permission not granted" />
                        )}
                        <label 
                          className="text-sm text-gray-700 capitalize"
                        >
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
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full relative">
      
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back to users list"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className='text-2xl font-bold text-gray-900'>
          Back to Users
        </h1>
      </div>
      
      <div className='flex flex-col lg:flex-row gap-6 h-full'>
        
        {/* Left Column - Profile Card */}
        <div className="w-full md:max-w-xs flex flex-col h-full">
          <div className="bg-white rounded-lg shadow-2xl p-6 flex-1">
            <div className="relative mb-8">
              <div className="absolute inset-x-0 top-16 h-24 bg-blue-50 bg-opacity-10 rounded-xl" />
              
              <div className="relative flex flex-col items-center pt-2">
                {/* Avatar */}
                <div 
                  className="w-25 h-25 bg-blue-600 rounded-full flex items-center justify-center z-10"
                  aria-label={`Avatar for ${displayName}`}
                >
                  <span className="text-white text-3xl font-medium">
                    {getInitials(displayName)}
                  </span>
                </div>
                
                {/* Name and Role */}
                <h2 className="text-lg font-bold text-gray-900">{displayName}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  ID: <span className='capitalize'>{userData.role_name}</span>  #{userData.id}
                </p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4 text-center">
              <ProfileDetailItem 
                label="Email Address" 
                value={userData.email} 
              />
              <ProfileDetailItem 
                label="Phone Number" 
                value={userData.phone_number} 
              />
              <ProfileDetailItem 
                label="Address" 
                value={userData.address} 
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            {isEditingPermissions ? (
              <>
                <button 
                  onClick={handleSavePermissions}
                  disabled={updateRoleMutation.isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                  aria-label="Save permission changes"
                >
                  <FaSave size={14} />
                  {updateRoleMutation.isLoading ? 'Saving...' : 'Save Permissions'}
                </button>
                <button 
                  onClick={() => {
                    setIsEditingPermissions(false);
                    if (roleResponse?.results?.[0]?.permissions && allPermissionsResponse) {
                      const originalIds = roleResponse.results[0].permissions.map(permissionName => {
                        const permission = allPermissionsResponse.find(p => p.name === permissionName);
                        return permission?.id;
                      }).filter((id): id is number => id !== undefined);
                      setSelectedPermissionIds(originalIds);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
                  aria-label="Cancel permission changes"
                >
                  <FaTimes size={14} />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditingPermissions(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                  aria-label="Edit user permissions"
                >
                  <FaPen size={14} />
                  Edit Permissions
                </button>
                <button 
                  className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                  aria-label="Deactivate user account"
                >
                  Deactivate User
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="bg-white rounded-lg shadow-2xl p-6 flex-1 flex flex-col gap-6 h-full">
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3 h-full'>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center pb-4 mb-5 bg-gray-100 rounded-lg border-gray-200">
                <h3 className="text-base font-semibold p-3 text-gray-800">User Details</h3>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-col">
                  <div className='ps-3 pb-3'>
                    <label className="block text-base text-gray-500 mb-2">Branch Assigned</label>
                    <p className="text-sm text-gray-700 capitalize">
                        {branchNames.length ? (
                          branchNames.map((name, index) => (
                            <span key={index}>
                              - {name}
                              {index < branchNames.length - 1 && <br />}
                            </span>
                          ))
                        ) : (
                          'No branches assigned'
                        )}
                      </p>
                  </div>
                  <div className='ps-3 pb-3'>
                    <label className="block text-base text-gray-500 mb-2">Address</label>
                    <p className="text-sm text-gray-700">{userData.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center pb-4 mb-5 bg-gray-100 rounded-lg border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 p-3 capitalize">
                  Assigned Permissions {userData.role_name}
                </h3>
              </div>
              <PermissionsDisplay />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;