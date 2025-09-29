import React, { useState, useEffect } from 'react';
import { useGet } from '../../Hook/API/useApiGet';
import { useMutate } from '../../Hook/API/useApiMutate';
import { ArrowLeft, Edit } from 'lucide-react';
import Permission from './Permission';

interface DataResponse {
  id: string;
  email: string;
  username?: string;
  phone_number: string;
  address: string;
  branches_id: string[];
  role_name: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '', email: '', phone_number: '', address: '', branches_id: [] as string[], role_name: ''
  });

  const { data: userData, isLoading, error, refetch } = useGet<DataResponse>({
    endpoint: `/api/user/${userId}/`,
    queryKey: ['User', userId],
  });

  const { data: branchResponse } = useGet<{ results: Branch[] }>({
    endpoint: `/api/branch/?minimal=true`,
    queryKey: ["all-branches"],
  });

  const { mutate: updateUser, isLoading: isUpdating } = useMutate({
    endpoint: `/api/user/${userId}/`,
    method: 'put',
    onSuccess: () => {
      setIsEditing(false);
      refetch();
    },
    onError: (error) => console.error('Error updating user:', error)
  });

  useEffect(() => {
    if (userData) setEditData({
      username: userData.username || '',
      email: userData.email,
      phone_number: userData.phone_number,
      address: userData.address,
      branches_id: userData.branches_id,
      role_name: userData.role_name
    });
  }, [userData]);

  const canEditField = (fieldName: string): boolean => 
    editMode === 'full' 
      ? ['username', 'phone_number', 'email', 'address'].includes(fieldName)
      : ['branches_id', 'role_name'].includes(fieldName);

  const getBranchNames = (branchIds: string[]): string[] => 
    branchIds.map(branchId => 
      branchResponse?.results.find(b => b.id.toString() === branchId.toString())?.name || `Unknown Branch (ID: ${branchId})`
    );

  const handleSave = async () => {
    if (!editData.email || !editData.phone_number) {
      alert('Email and phone number are required');
      return;
    }

    const updateData = editMode === 'limited' 
      ? { username: editData.username, email: editData.email, phone_number: editData.phone_number, address: editData.address, role_name: editData.role_name }
      : { ...editData };

    updateUser(updateData);
  };

  const handleCancel = () => {
    if (userData) setEditData({
      username: userData.username || '',
      email: userData.email,
      phone_number: userData.phone_number,
      address: userData.address,
      branches_id: userData.branches_id,
      role_name: userData.role_name
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) return (
    <div className="max-w-7xl py-10 mx-auto flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error || !userData) return (
    <div className="max-w-7xl py-10 mx-auto flex justify-center items-center h-64">
      <div className="text-center">
        <p className="text-red-500 mb-4">Error loading user data</p>
        {onBack && (
          <button onClick={onBack} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Back to Users
          </button>
        )}
      </div>
    </div>
  );

  const displayName = userData.username || 'Unknown User';
  const branchNames = getBranchNames(userData.branches_id);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full relative">
      {onBack && (
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title='Back to Users'
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className='text-2xl font-bold text-gray-900'>Back to Users</h1>
        </div>
      )}
      
      <div className='flex flex-col lg:flex-row gap-6 h-full'>
        {/* Left Column - Profile Card */}
        <div className="w-full md:max-w-xs flex flex-col h-full">
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
              <ProfileDetailItem label="Email Address" value={userData.email} />
              <ProfileDetailItem label="Phone Number" value={userData.phone_number} />
              <ProfileDetailItem label="Address" value={userData.address} />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex-1 py-2.5 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" /> Edit User
              </button>
            ) : (
              <>
                <button onClick={handleSave} disabled={isUpdating} className={`flex-1 py-2.5 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
                <button onClick={handleCancel} disabled={isUpdating} className={`flex-1 py-2.5 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                {isEditing && editMode === "full" ? (
                  <>
                    {['username', 'phone_number', 'email', 'address'].map(field => canEditField(field) && (
                      <div key={field} className='ps-3 pb-3'>
                        <label className="block text-base text-gray-500 mb-2 capitalize">{field.replace('_', ' ')}</label>
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
                  <div className='ps-3 pb-3'>
                    <label className="block text-base text-gray-500 mb-2">Branch Assigned</label>
                    {isEditing && canEditField('branches_id') ? (
                      <select 
                          multiple
                        value={editData.branches_id}
                        onChange={(e) => setEditData(prev => ({ ...prev, branches_id: Array.from(e.target.selectedOptions, option => option.value) }))}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        
                      >
                        {branchResponse?.results.map(branch => (
                          <option key={branch.id} value={branch.id.toString()}>{branch.name}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm grid grid-cols-2 text-gray-700 capitalize">
                        {branchNames.length ? branchNames.map((name, index) => <span key={index}>- {name}</span>) : 'No branches assigned'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center pb-4 mb-5 bg-gray-100 rounded-lg border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 p-3 capitalize">Assigned Permissions {userData.role_name}</h3>
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