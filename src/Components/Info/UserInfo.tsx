// UserInfo.tsx
import React, { useState } from 'react';
import { FaPen, FaSave, FaTimes } from 'react-icons/fa';
import { useGet } from '../../Hook/API/useApiGet';

// Type definitions based on your JSON structure
interface UserData {
  id: string;
  email: string;
  name: string;
  phone_number: string;
  address: string;
  branches_id: string[];
  role_name: string;
  // Add other fields as needed
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserData[];
}

interface UserInfoProps {
  userId: string;
  onBack: () => void; 
}

const UserInfo: React.FC<UserInfoProps> = ({ userId, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UserData>>({});
  const [page] = useState(1); // Add page state if needed

  const { data: UserResponse, isLoading, error } = useGet<DataResponse>({
    endpoint: `/api/user/${userId}/?page=${page}`,
    queryKey: ['User', userId, page],
  });

  // Get user data from API response
  const userData = UserResponse?.results?.[0];

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

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      setEditedData({});
    } else {
      setEditedData({ ...userData });
    }
    setIsEditing(!isEditing);
  };

  // Handle input changes
  const handleInputChange = (field: keyof UserData, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      console.log('Saving user data:', editedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  // Helper component for profile details
  const ProfileDetailItem = ({ 
    label, 
    value, 
    field, 
    isEditable = true 
  }: { 
    label: string; 
    value: string; 
    field?: keyof UserData;
    isEditable?: boolean;
  }) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {isEditing && isEditable && field ? (
        <input
          type="text"
          value={editedData[field] || value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
        />
      ) : (
        <p className="text-sm text-gray-700 break-words">{value}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl py-10 mx-auto flex flex-col md:flex-row gap-6 h-full relative">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center gap-2 text-blue-500 hover:text-blue-700"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <span>Back to Users</span>
      </button>

      {/* Left Column - Profile Card */}
      <div className="w-full md:max-w-xs flex flex-col h-full">
        <div className="bg-white rounded-lg shadow-2xl p-6 flex-1">
          <div className="relative mb-8">
            <div className="absolute inset-x-0 top-16 h-24 bg-blue-50 bg-opacity-10 rounded-xl" />
            
            <div className="relative flex flex-col items-center pt-2">
              {/* Avatar */}
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4 z-10">
                <span className="text-white text-2xl font-medium">
                  {getInitials(userData.name)}
                </span>
              </div>
              
              {/* Name and Role */}
              <h2 className="text-lg font-bold text-gray-900">{userData.name}</h2>
              <p className="text-xs text-gray-500 mt-1">
                ID: {userData.role_name} #{userData.id}
              </p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4 text-center">
            <ProfileDetailItem 
              label="Email Address" 
              value={userData.email} 
              field="email"
            />
            <ProfileDetailItem 
              label="Phone Number" 
              value={userData.phone_number} 
              field="phone_number"
            />
            <ProfileDetailItem 
              label="Address" 
              value={userData.address} 
              field="address"
            />
            <ProfileDetailItem 
              label="Role" 
              value={userData.role_name} 
              isEditable={false}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
              >
                <FaSave size={14} />
                Save Changes
              </button>
              <button 
                onClick={handleEditToggle}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                <FaTimes size={14} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleEditToggle}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                <FaPen size={14} />
                Edit Profile
              </button>
              <button className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium">
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
              <div className='ps-3 pb-3'>
                <label className="block text-base text-gray-500 mb-2">User ID</label>
                <p className="text-sm text-gray-700">{userData.id}</p>
              </div>
              <div className='ps-3 pb-3'>
                <label className="block text-base text-gray-500 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email || userData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="text-sm text-gray-700">{userData.email}</p>
                )}
              </div>
              <div className='ps-3 pb-3'>
                <label className="block text-base text-gray-500 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData.phone_number || userData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="text-sm text-gray-700">{userData.phone_number}</p>
                )}
              </div>
              <div className='ps-3 pb-3'>
                <label className="block text-base text-gray-500 mb-2">Role</label>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {userData.role_name}
                </span>
              </div>
              <div className='ps-3 pb-3'>
                <label className="block text-base text-gray-500 mb-2">Branches</label>
                <p className="text-sm text-gray-700">
                  {userData.branches_id?.length ? userData.branches_id.join(', ') : 'No branches assigned'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional section - you can add more details here */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center pb-4 mb-5 bg-gray-100 rounded-lg border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 p-3">Additional Information</h3>
            </div>
            <div className="flex flex-col">
              <div className='ps-3 pb-3'>
                <label className="block text-base text-gray-500 mb-2">Address</label>
                {isEditing ? (
                  <textarea
                    value={editedData.address || userData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-700">{userData.address}</p>
                )}
              </div>
              {/* Add more fields as needed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;