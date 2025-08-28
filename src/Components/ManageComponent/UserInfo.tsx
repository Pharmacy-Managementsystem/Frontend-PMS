// UserInfo.tsx
import React from 'react';
import { FaPen } from 'react-icons/fa';
interface UserInfoProps {
  userId: string;
  onBack: () => void; 
}

const UserInfo: React.FC<UserInfoProps> = ({ userId, onBack }) => {
  const userData = {
    name: `${userId}. Emily Johnson`, 
    initials: 'EJ',
    role: 'Pharmacist',
    id: '545662548',
    email: 'emily.johnson@pharmadmin.com',
    phone: '+20 123-456-7890',
    address: '123 Pharmacy Street, Cairo, Egypt',
    dob: '1990-05-15',
    employment: {
      branch: 'Main Branch',
      hireDate: '2022-03-01',
      lastLogin: '2023-07-18 14:30',
      status: 'Active',
    },
    permissions: [
      { id: 'p1', label: 'Manage user accounts', checked: true },
      { id: 'p2', label: 'Access business analytics', checked: true },
      { id: 'p3', label: 'Process Sales at POS', checked: true },
      { id: 'p4', label: 'Manage Inventory', checked: false },
      { id: 'p5', label: 'View Customer Medication History', checked: true },
      { id: 'p6', label: 'Manage Suppliers', checked: false },
      { id: 'p7', label: 'Process Refunds', checked: false },
    ]
  };
// Add this helper component outside your main component
const ProfileDetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <p className="text-sm text-gray-700 break-words">{value}</p>
  </div>
);
return (
    <div className="max-w-7xl py-10 mx-auto flex flex-col md:flex-row gap-6 h-full relative">
      {/* زر الرجوع الجديد */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center gap-2  text-blue-500 hover:text-blue-700"
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
    <div className="w-full md:max-w-xs flex flex-col h-full">
      <div className="bg-white rounded-lg shadow-2xl p-6 flex-1">
        <div className="relative mb-8">
          <div className="absolute inset-x-0 top-16 h-24 bg-blue-50 bg-opacity-10 rounded-xl" />
          
          <div className="relative flex flex-col items-center pt-2">
            {/* Avatar */}
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4 z-10">
              <span className="text-white text-2xl font-medium">{userData.initials}</span>
            </div>
            
            {/* Name and ID */}
            <h2 className="text-lg font-bold text-gray-900"> {userData.name}</h2>
            <p className="text-xs text-gray-500 mt-1">
              ID: {userData.role} #{userData.id}
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-4 text-center">
          <ProfileDetailItem label="Email Address" value={userData.email} />
          <ProfileDetailItem label="Phone Number" value={userData.phone} />
          <ProfileDetailItem label="Address" value={userData.address} />
          <ProfileDetailItem label="Date of Birth" value={userData.dob} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium">
          <FaPen size={14} />
          Edit Profile
        </button>
        <button className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium">
          Deactivate User
        </button>
      </div>
    </div>

    {/* Details Column (Right) */}
    <div className="bg-white rounded-lg shadow-2xl p-6 flex-1 flex flex-col gap-6 h-full">
      {/* Employment Details */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 h-full'>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center pb-4 mb-5 bg-gray-100 rounded-lg border-gray-200">
            <h3 className="text-base font-semibold p-3 text-gray-800">Employment Details</h3>
          </div>
          <div className="flex flex-col">
            <div className='ps-3 pb-3'>
              <label className="block text-base text-gray-500 mb-2">Branch Assigned</label>
              <p className="text-sm text-gray-700">{userData.employment.branch}</p>
            </div>
            <div className='ps-3 pb-3'>
              <label className="block text-base text-gray-500 mb-2">Date Hired</label>
              <p className="text-sm text-gray-700">{userData.employment.hireDate}</p>
            </div>
            <div className='ps-3 pb-3'>
              <label className="block text-base text-gray-500 mb-2">Last Login</label>
              <p className="text-sm text-gray-700">{userData.employment.lastLogin}</p>
            </div>
            <div className='ps-3 pb-3'>
              <label className="block text-base text-gray-500 mb-2">Status</label>
              <span className="inline-block px-3 py-1 rounded-full text-base font-medium bg-green-100 text-green-800">
                {userData.employment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Permissions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center pb-4 mb-5 bg-gray-100 rounded-lg border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 p-3">Assigned Permissions</h3>
          </div>
          <ul className="flex flex-col ">
            {userData.permissions.map((permission) => (
              <li key={permission.id} className="flex items-center py-2 gap-3">
                <input 
                  type="checkbox" 
                  id={permission.id} 
                  defaultChecked={permission.checked}
                  className="w-4.5 h-4.5 text-blue-500 rounded"
                />
                <label htmlFor={permission.id} className="text-sm text-gray-700">
                  {permission.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

    
    </div>
  </div>
);
};

export default UserInfo;