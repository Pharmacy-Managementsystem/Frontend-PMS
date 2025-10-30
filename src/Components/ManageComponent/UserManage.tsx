import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { DataTable } from "../Table/DataTable";
import TableRowUser from "../Table/TableRowUser";
import DeactivateUser from "./DeactivateUser";
import { useEffect, useState } from "react";
import UserInfo from "../Info/InfoUser/UserInfo";
import Pagination from "../Pagination";
import { useGet } from "../../Hook/API/useApiGet";
import ReusableForm from "../Forms/ReusableForm";
import { useTranslation } from 'react-i18next';

interface User {
  id: number;
  email: string;
  username: string;
  phone_number: string;
  address: string;
  user_branches: Array<{
    id: number;
    name: string;
  }>; 
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
  const { t } = useTranslation();
  
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<string | null>(null);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState('');

  const { data: userResponse, isLoading, refetch } = useGet<DataResponse>({
    endpoint: `/api/user/?page=${page}&search=${search}`,
    queryKey: ["all-users", page, search], 
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
    { name: 'username', label: t('userManagement.userName'), required: true },
    { name: 'email', label: t('userManagement.emailAddress'), required: true },
    { name: 'phone_number', label: t('userManagement.phoneNumber'), required: true },
    { name: 'address', label: t('userManagement.address'), required: true },
    { name: 'password', label: t('userManagement.password'), required: true, type: 'password' },
    { name: 'confirmPassword', label: t('userManagement.confirmPassword'), required: true, type: 'password' },
    { 
      name: 'branches', 
      label: t('userManagement.branches'), 
      type: 'multiselect', 
      required: true,
      options: branchesOptions,
    },
    { 
      name: 'role', 
      label: t('userManagement.role'), 
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

  const tableData =
    userResponse?.results?.map((user) => {
      const branchNames = user.user_branches?.map(branch => branch.name) || [];

      return {
        id: user.id.toString(),
        [t('userManagement.userName')]: user.username,
        [t('userManagement.emailAddress')]: user.email,
        [t('userManagement.phoneNumber')]: user.phone_number,
        [t('userManagement.branchAssigned')]:
          branchNames.length > 0 ? branchNames.join(", ") : t('userInfo.noBranchesAssigned'),
        [t('userManagement.role')]: user.role_name,
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
            title={t('userManagement.title')}
            buttonText={t('userManagement.addNewUser')}
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
                columns={[
                  t('userManagement.userName'),
                  t('userManagement.emailAddress'),
                  t('userManagement.phoneNumber'),
                  t('userManagement.branchAssigned'),
                  t('userManagement.role')
                ]}
                data={tableData}
                RowComponent={TableRowUser}
                renderDropdown={(id: string) => (
                  <div>
                    <button
                      onClick={() => setShowInfo(id)}
                      className="block w-full text-left text-label text-base px-4 py-2 hover:bg-gray-50"
                    >
                      {t('userManagement.showUserInfo')}
                    </button>
                    <button
                      onClick={() => setDeactivateId(id)}
                      className="block w-full text-left text-label text-base px-4 py-2 hover:bg-gray-50"
                    >
                      {t('userManagement.deactivateUser')}
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
              title={t('userManagement.user')}
              fields={formFields}
              endpoint="/api/user/"
              method="post"
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={handleCreateSuccess}
              submitButtonText={t('userManagement.createUser')}
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