import React, { useState, useEffect } from 'react';
import { useGet } from '../../Hook/API/useApiGet';
import { ArrowLeft, Edit } from 'lucide-react';
import { FaCheckSquare, FaWindowClose } from "react-icons/fa";
import { useMutate } from '../../Hook/API/useApiMutate'; // أضف هذا الاستيراد

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
  onBack?: () => void;
  currentUserRole: string;
  editMode?: 'limited' | 'full'; // أضف هذه الخاصية الجديدة
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

const UserInfo: React.FC<UserInfoProps> = ({ 
  userId, 
  onBack, 
  currentUserRole,
  editMode = 'limited' // القيمة الافتراضية
}) => {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    phone_number: '',
    address: '',
    branches_id: [] as string[],
    role_name: ''
  });

  const { data: userData, isLoading, error, refetch } = useGet<DataResponse>({
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

  const { data: allPermissionsResponse } = useGet<Permission[]>({
    endpoint: `/api/role-permissions/permissions/`,
    queryKey: ["all-permissions"],
  });

  // أضف الهوك الخاص بـ API mutation
  const { mutate: updateUser,  isLoading: isUpdating } = useMutate({
    endpoint: `/api/user/${userId}/`,
    method: 'put',
    onSuccess: () => {
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error updating user:', error);
    }
  });

  // تهيئة بيانات التعديل
  useEffect(() => {
    if (userData) {
      setEditData({
        username: userData.username || '',
        email: userData.email,
        phone_number: userData.phone_number,
        address: userData.address,
        branches_id: userData.branches_id,
        role_name: userData.role_name
      });
    }
  }, [userData]);

  useEffect(() => {
    if (roleResponse?.results?.[0]?.permissions && allPermissionsResponse) {
      const rolePermissionIds = roleResponse.results[0].permissions.map(permissionName => {
        const permission = allPermissionsResponse.find(p => p.name === permissionName);
        return permission?.id;
      }).filter((id): id is number => id !== undefined);
      
      setSelectedPermissionIds(rolePermissionIds);
    }
  }, [roleResponse, allPermissionsResponse]);

  // دالة للتحقق من إمكانية تعديل حقل معين
  const canEditField = (fieldName: string): boolean => {
    if (editMode === 'full') {
      return true; // من UserManagement: يمكن تعديل كل الحقول
    }
    
    // من Settings: يمكن تعديل هذه الحقول فقط
    const allowedFields = ['username', 'phone_number', 'email', 'address'];
    return allowedFields.includes(fieldName);
  };

  const getBranchNames = (branchIds: string[]): string[] => {
    if (!branchResponse?.results || !branchIds) return [];
    
    return branchIds.map(branchId => {
      const branch = branchResponse.results.find(b => b.id.toString() === branchId.toString());
      return branch?.name || `Unknown Branch (ID: ${branchId})`;
    });
  };

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

  // دالة بدء التعديل
  const handleEdit = () => {
    setIsEditing(true);
  };

  // دالة حفظ التعديلات
  const handleSave = async () => {
    try {
      // تحقق من صحة البيانات الأساسية
      if (!editData.email || !editData.phone_number) {
        alert('Email and phone number are required');
        return;
      }

      // تحضير البيانات للإرسال بناءً على وضع التعديل
      let updateData: any = {};
      
      if (editMode === 'limited') {
        updateData = {
          username: editData.username,
          email: editData.email,
          phone_number: editData.phone_number,
          address: editData.address,
          role_name: editData.role_name
        };
      } else {
        // من UserManagement: تحديث كل الحقول
        updateData = {
          username: editData.username,
          email: editData.email,
          phone_number: editData.phone_number,
          address: editData.address,
          branches_id: editData.branches_id,
          role_name: editData.role_name
        };
      }

      // إرسال البيانات إلى الخادم
      updateUser(updateData);
      
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // دالة إلغاء التعديل
  const handleCancel = () => {
    if (userData) {
      setEditData({
        username: userData.username || '',
        email: userData.email,
        phone_number: userData.phone_number,
        address: userData.address,
        branches_id: userData.branches_id,
        role_name: userData.role_name
      });
    }
    setIsEditing(false);
  };

  // دالة تحديث بيانات التعديل
  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // التحقق مما إذا كان المستخدم الحالي admin
  const isAdmin = currentUserRole === 'admin';

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
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Users
            </button>
          )}
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
    field,
    isEditing: editing,
    onChange
  }: { 
    label: string; 
    value: string;
    field?: string;
    isEditing?: boolean;
    onChange?: (field: string, value: string) => void;
  }) => {
    const canEdit = field ? canEditField(field) : false;
    
    return (
      <div>
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        {editing && field && canEdit ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(field, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />
        ) : (
          <p className="text-sm text-gray-700 break-words">{value}</p>
        )}
      </div>
    );
  };

  const PermissionsDisplay = () => {
    const groupedAllPermissions = groupPermissionsBySection(allPermissionsResponse || []);

    // Function to generate accessible permission label
    const getPermissionLabel = (permissionName: string) => {
      return permissionName.split('.').slice(1).join(' → ').replace(/_/g, ' ');
    };

    return (
      <div className="space-y-4">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {Object.entries(groupedAllPermissions).map(([section, permissions]) => {
            return (
              <div key={section} className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-800 capitalize">
                    {section.replace(/_/g, ' ')}
                  </h5>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map(permission => {
                    const permissionLabel = getPermissionLabel(permission.name);
                    const isSelected = selectedPermissionIds.includes(permission.id);

                    return (
                      <div key={permission.id} className="flex items-center space-x-2">
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
  {onBack && (
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
      )}
      
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
                value={isEditing ? editData.email : userData.email}
                field="email"
                isEditing={isEditing}
                onChange={handleInputChange}
              />
              <ProfileDetailItem 
                label="Phone Number" 
                value={isEditing ? editData.phone_number : userData.phone_number}
                field="phone_number"
                isEditing={isEditing}
                onChange={handleInputChange}
              />
              <ProfileDetailItem 
                label="Address" 
                value={isEditing ? editData.address : userData.address}
                field="address"
                isEditing={isEditing}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            {!isEditing ? (
              <>
                {isAdmin && (
                  <button 
                    onClick={handleEdit}
                    className="flex-1 py-2.5 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    aria-label="Edit user information"
                  >
                    <Edit className="w-4 h-4" />
                    Edit User
                  </button>
                )}
                <button 
                  className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                  aria-label="Deactivate user account"
                >
                  Deactivate User
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleSave}
                  disabled={isUpdating}
                  className={`flex-1 py-2.5 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
                <button 
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className={`flex-1 py-2.5 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
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
                    {isEditing && isAdmin && canEditField('branches_id') ? (
                      <select 
                        multiple
                        value={editData.branches_id}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setEditData(prev => ({ ...prev, branches_id: selected }));
                        }}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        {branchResponse?.results.map(branch => (
                          <option key={branch.id} value={branch.id.toString()}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    ) : (
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
                    )}
                  </div>
                  <div className='ps-3 pb-3'>
                    <label className="block text-base text-gray-500 mb-2">Address</label>
                    {isEditing && canEditField('address') ? (
                      <textarea
                        value={editData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-700">{userData.address}</p>
                    )}
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