import React, { useState, useEffect } from 'react';
import { useGet } from '../../../Hook/API/useApiGet';
import { useMutate } from '../../../Hook/API/useApiMutate';
import { ArrowLeft, Edit } from 'lucide-react';
import Permission from './Permission';
import { useTranslation } from 'react-i18next';

interface DataResponse {
  id: string;
  email: string;
  username?: string;
  phone_number: string;
  address: string;
  user_branches: Array<{  
    id: number;
    name: string;
  }>;
  role_name: string;
  branches_id?: string[]; 
}


interface UserInfoProps {
  userId: string;
  onBack?: () => void;
  editMode?: 'full' | 'limited';
}

interface Branch {
  id: number;
  name: string;
}

const ProfileDetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <p className="text-sm text-gray-700 break-words">{value}</p>
  </div>
);

const getInitials = (name: string) => name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);

const UserInfo: React.FC<UserInfoProps> = ({ userId, onBack, editMode = 'limited' }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '', email: '', phone_number: '', address: '', branches_id: [] as string[], role: ''
  });

  const { data: userData, isLoading, error, refetch } = useGet<DataResponse>({
    endpoint: `/api/user/${userId}/`,
    queryKey: ['User', userId],
  });

  const { data: rolesResponse } = useGet<{ results: { id: number; name: string }[] }>({
    endpoint: `/api/business/roles/`,
    queryKey: ["all-roles"],
  });

  const { data: branchResponse } = useGet<{ results: Branch[] }>({
    endpoint: `/api/branch/?minimal=true`,
    queryKey: ["all-branches"],
  });

  const { mutate: updateUser, isLoading: isUpdating } = useMutate({
    endpoint: `/api/user/${userId}/`,
    method: 'patch',
    onSuccess: () => {
      setIsEditing(false);
      refetch();
    },
  });

  useEffect(() => {
    if (userData) {
      const branchIds = userData.user_branches?.map(branch => branch.id.toString()) || [];
      
      setEditData({
        username: userData.username || '',
        email: userData.email,
        phone_number: userData.phone_number,
        address: userData.address,
        branches_id: branchIds,
        role: userData.role_name
      });
    }
  }, [userData]);

  const canEditField = (fieldName: string): boolean => 
    editMode === 'full' 
      ? ['username', 'phone_number', 'email', 'address'].includes(fieldName)
      : ['branches_id', 'role'].includes(fieldName);

const handleSave = async () => {
  if (!editData.email || !editData.phone_number) {
    alert('Email and phone number are required');
    return;
  }

  const changedData: Record<string, unknown> = {};

  if (userData) {
    const originalBranchIds = userData.user_branches?.map(branch => branch.id.toString()) || [];
    
    if (editData.username !== (userData.username || '')) {
      changedData.username = editData.username;
    }
    if (editData.email !== userData.email) {
      changedData.email = editData.email;
    }
    if (editData.phone_number !== userData.phone_number) {
      changedData.phone_number = editData.phone_number;
    }
    if (editData.address !== userData.address) {
      changedData.address = editData.address;
    }
    
    const currentBranches = [...editData.branches_id].sort();
    const originalBranches = [...originalBranchIds].sort();
    if (JSON.stringify(currentBranches) !== JSON.stringify(originalBranches)) {
      changedData.branches_id = editData.branches_id;
    }
    
    if (editData.role && editData.role !== userData.role_name) {
      const selectedRole = rolesResponse?.results.find(role => role.name === editData.role);
      if (selectedRole) {
        changedData.role = selectedRole.id;
      }
    }
  }

  if (Object.keys(changedData).length === 0) {
    setIsEditing(false);
    return;
  }

  updateUser(changedData);
};

  const handleCancel = () => {
    if (userData) {
      const branchIds = userData.user_branches?.map(branch => branch.id.toString()) || [];
      
      setEditData({
        username: userData.username || '',
        email: userData.email,
        phone_number: userData.phone_number,
        address: userData.address,
        branches_id: branchIds,
        role: userData.role_name
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setEditData(prev => ({ ...prev, branches_id: selectedOptions }));
  };

  if (isLoading) return (
    <div className="max-w-7xl py-10 mx-auto flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error || !userData) return (
    <div className="max-w-7xl py-10 mx-auto flex justify-center items-center h-64">
      <div className="text-center">
        <p className="text-red-500 mb-4">{t('userInfo.errorLoading')}</p>
        {onBack && (
          <button onClick={onBack} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            {t('userInfo.backToUsers')}
          </button>
        )}
      </div>
    </div>
  );

  const displayName = userData.username || t('userInfo.unknownUser');
  const userBranches = userData.user_branches || [];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full relative">
      {onBack && (
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title={t('userInfo.backToUsers')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className='text-2xl font-bold text-gray-900'>{t('userInfo.backToUsers')}</h1>
        </div>
      )}
      
      <div className='flex flex-col lg:flex-row gap-6 h-full'>
        <div className="w-full lg:max-w-xs flex flex-col h-full">
          <div className="bg-white rounded-lg shadow-2xl p-6 flex-1">
            <div className="relative mb-8">
              <div className="absolute inset-x-0 top-16 h-24 bg-blue-50 bg-opacity-10 rounded-xl" />
              <div className="relative flex flex-col items-center pt-2">
                <div className="w-25 h-25 bg-blue-600 rounded-full flex items-center justify-center z-10">
                  <span className="text-white text-3xl font-medium">{getInitials(displayName)}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">{displayName}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  ID: <span className='capitalize'>{userData.role_name}</span>  #{userData.id}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-center">
              <ProfileDetailItem label={t('userInfo.emailAddress')} value={userData.email} />
              <ProfileDetailItem label={t('userInfo.phoneNumber')} value={userData.phone_number} />
              <ProfileDetailItem label={t('userInfo.address')} value={userData.address} />
            </div>
          </div>
{/*  */}



          <div className="flex gap-3 mt-6">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex-1 py-2.5 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" /> {t('userInfo.editUser')}
              </button>
            ) : (
              <>
                <button onClick={handleSave} disabled={isUpdating} className={`flex-1 py-2.5 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isUpdating ? t('userInfo.saving') : t('userInfo.save')}
                </button>
                <button onClick={handleCancel} disabled={isUpdating} className={`flex-1 py-2.5 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {t('userInfo.cancel')}
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
                <h3 className="text-base font-semibold p-3 text-gray-800">{t('userInfo.userDetails')}</h3>
              </div>
              <div className="flex flex-col">
                {isEditing && editMode === "full" ? (
                  <>
                    {['username', 'phone_number', 'email', 'address'].map(field => canEditField(field) && (
                      <div key={field} className='ps-3 pb-3'>
                        <label className="block text-base text-gray-500 mb-2 capitalize">{t(`userInfo.${field}`)}</label>
                        <input
                          id={field}
                          type="text"
                          placeholder={field.replace('_', ' ')}
                          value={editData[field as keyof typeof editData] as string}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <>    
                    <div className='ps-3 pb-3'>
                      {isEditing && canEditField('role') && (
                        <>
                          <label className="block text-base text-gray-500 mb-2">{t('userInfo.role')}</label>
                          <select 
                            value={editData.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            title={t('userInfo.selectRole')}
                          >
                            {rolesResponse?.results.map(role => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                    <div className='ps-3 pb-3'>
                      <label className="block text-base text-gray-500 mb-2">{t('userInfo.branchAssigned')}</label>
                      {isEditing && canEditField('branches_id') ? (
                        <select 
                          multiple
                          value={editData.branches_id}
                          onChange={handleBranchChange}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          size={5} // Show 5 options at once
                          title={t('userInfo.selectBranches')}
                        >
                          {branchResponse?.results.map(branch => (
                            <option key={branch.id} value={branch.id.toString()}>{branch.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-gray-700 capitalize">
                          {userBranches.length ? 
                            userBranches.map((branch) => (
                              <span key={branch.id} className="block">
                                - {branch.name}
                              </span>
                            )) 
                            : t('userInfo.noBranchesAssigned')
                          }
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center pb-4 mb-5 bg-gray-100 rounded-lg border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 p-3 capitalize">{t('userInfo.assignedPermissions')} {userData.role_name}</h3>
              </div>
              <Permission role_name={userData.role_name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;