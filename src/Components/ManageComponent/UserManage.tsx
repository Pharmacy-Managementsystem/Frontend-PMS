import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { DataTable } from "../Table/DataTable";
import TableRowUser from "../Table/TableRowUser";
import DeactivateUser from "./DeactivateUser";
import { useEffect, useState } from "react";
import UserInfo from "../Info/UserInfo";
import Pagination from "../Pagination";
import { useGet } from "../../Hook/API/useApiGet";
import ReusableForm from "../Forms/ReusableForm";

const columns = [
  "User Name",
  "Email Address",
  "Phone Number",
  "Branch Assigned", 
  "Role",
];

interface User {
  id: number;
  email: string;
  username: string;
  phone_number: string;
  address: string;
  branches_id: number[]; 
  role_name: string;
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
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

export default function UserManage() {
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<string | null>(null);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState('');


const { data: userResponse, isLoading, refetch } = useGet<DataResponse>({
  endpoint: `/api/user/?page=${page}&search=${search}`,
  queryKey: ["all-users", page, search], // مهم نضيف search للـ queryKey عشان react-query يعمل cache صح
});


  const { data: rolesResponse } = useGet<BranchResponse>({
    endpoint: `/api/business/roles/`,
    queryKey: ["all-roles"],
  });

  const rolesOptions = rolesResponse?.results.map(role => ({
    value: role.id,
    label: `${role.name}`
  })) || [];
  
  const { data: branchResponse } = useGet<BranchResponse>({
    endpoint: `/api/branch/?minimal=true`,
    queryKey: ["all-branches"],
  });

   const branchesOptions = branchResponse?.results.map(branch => ({
    value: branch.id,
    label: `${branch.name}`
   })) || [];
  
const formFields = [
  { name: 'username', label: 'User Name', required: true },
  { name: 'email', label: 'Email Address', required: true },
  { name: 'phone_number', label: 'Phone Number', required: true },
  { name: 'address', label: 'Address', required: true },
  { name: 'password', label: 'Password', required: true, type: 'password' },
  { name: 'confirmPassword', label: 'Confirm Password', required: true, type: 'password' },
  { 
    name: 'branches', 
    label: 'Branches', 
    type: 'multiselect', 
    required: true,
    options: branchesOptions,
  },
  { 
    name: 'role', 
    label: 'Role', 
    type: 'select', 
    required: true,
    options: rolesOptions,
  },
  ];

  useEffect(() => {
  const handler = setTimeout(() => setSearch(searchInput), 500);
  return () => clearTimeout(handler);
}, [searchInput]);

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleBack = () => {
    setShowInfo(null);
  };

  // ✅ نعمل map للـ branches_id array
  const tableData =
    userResponse?.results?.map((user) => {
      const branchNames =
        user.branches_id?.map((branchId) =>
          branchResponse?.results?.find((branch) => branch.id === branchId)
            ?.name
        ) || [];

      return {
        id: user.id.toString(),
        "User Name": user.username,
        "Email Address": user.email,
        "Phone Number": user.phone_number,
        "Branch Assigned":
          branchNames.length > 0 ? branchNames.join(", ") : "—",
        "Role": user.role_name,
      };
    }) || [];

  return (
    <>
      {showInfo ? (
<UserInfo 
  userId={showInfo}  
  onBack={handleBack}
  editMode="limited" 
/>
      ) : (
        <div>
          
          <TableHeaderSearch
            title="User Management"
            buttonText="Add New User"
            onAddClick={() => setIsCreateModalOpen(true)}
            value={searchInput}
            onSearchChange={(value) => {
              setSearchInput(value);
              setPage(1);
            }}
          />
          {isLoading ? (
            <div className="max-w-7xl px-14 py-8 mb-5 bg-white shadow-xl rounded-xl mx-auto mt-5">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={tableData}
                RowComponent={TableRowUser}
                renderDropdown={(id: string) => (
                  <div>
                    <button
                      onClick={() => setShowInfo(id)}
                      className="block w-full text-left text-label  text-base px-4 py-2 hover:bg-gray-50"
                    >
                      Show User Info
                    </button>
                    <button
                      onClick={() => setDeactivateId(id)}
                      className="block w-full text-left text-label text-base px-4 py-2 hover:bg-gray-50"
                    >
                      Deactivate User
                    </button>
                  </div>
                )}
              />
              {userResponse && (
                <Pagination
                  currentPage={page}
                  totalItems={userResponse.count}
                  itemsPerPage={pageSize}
                  onPageChange={(newPage) => setPage(newPage)}
                  hasNext={!!userResponse.next}
                  hasPrevious={!!userResponse.previous}
                />
              )}
            </>
          )}

             {isCreateModalOpen && (
                      <ReusableForm
                          title="User"
                          fields={formFields}
                          endpoint="/api/user/"
                          method="post"
                          onClose={() => setIsCreateModalOpen(false)}
                          onSuccess={handleCreateSuccess}
                          submitButtonText="Create User"
                          key="create-form"
                        />
                  )}
          {deactivateId && (
            <DeactivateUser
              onClose={() => setDeactivateId(null)}
                id={deactivateId}
            />
          )}
        </div>
      )}
    </>
  );
}
