import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { DataTable } from "../Table/DataTable";
import TableRowUser from "../Table/TableRowUser";
import DeactivateUser from "./DeactivateUser";
import { useState } from "react";
import UserInfo from "../Info/UserInfo";
import Pagination from "../Pagination";
import { useGet } from "../../Hook/API/useApiGet";

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
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<string | null>(null);
  const [pageSize] = useState(10);

  // ✅ الـ user API
  const { data: userResponse, isLoading } = useGet<DataResponse>({
    endpoint: `/api/user/?page=${page}`,
    queryKey: ["all-users", page],
  });

  // ✅ الـ branch API
  const { data: branchResponse } = useGet<BranchResponse>({
    endpoint: `/api/branch/?minimal=true`,
    queryKey: ["all-branches"],
  });

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

  if (isLoading) {
    return (
      <div className="max-w-7xl px-14 py-8 mb-5 bg-white shadow-xl rounded-xl mx-auto mt-5">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showInfo ? (
        <UserInfo userId={showInfo} onBack={handleBack} />
      ) : (
        <div>
          <TableHeaderSearch
            title="User Management"
            buttonText="Add New User"
            onAddClick={() => console.log("Add User Clicked")}
          />
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

          {deactivateId && (
            <DeactivateUser
              onClose={() => setDeactivateId(null)}
                id={deactivateId}
                type="user"
            />
          )}
        </div>
      )}
    </>
  );
}
