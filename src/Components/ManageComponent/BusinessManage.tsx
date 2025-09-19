import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { DataTable } from "../Table/DataTable";
import TableRowUser from "../Table/TableRowUser";
import DeactivateUser from "./DeactivateUser";
import  { useState } from "react";
import { useGet } from "../../Hook/API/useApiGet";
import Pagination from "../Pagination";
import FormBusiness from "../Forms/FormBusiness";

const columns = [
  "Business Name",
  "Owner Email",
  "Subscription Status",
  "Subscription Period",
  "Contact Number",
  "Package"
];

interface Business {
  id: number;
  package_name: string;
  owner_user_email: string;
  owner_user_username: string;
  name: string;
  subscription_start_date: string;
  subscription_end_date: string;
  subscription_status: string;
  contact_number: string;
  website: string;
  package: number;
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Business[];
}

export default function BusinessManage() {
  const [page, setPage] = useState(1);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [pageSize] = useState(10);
  const [businessAction , setBusinessAction] = useState<string | null>(null);
  const { data: businessResponse, isLoading } = useGet<DataResponse>({
    endpoint: `/api/superadmin/all-businesses/?page=${page}&page_size=${pageSize}`,
    queryKey: ['all-businesses', page],
  });

  const handleBack = () => {
    setBusinessAction(null);
  };

  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSubscriptionPeriod = (start: string, end: string) => {
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Transform API data to match table structure
  const tableData = businessResponse?.results?.map(business => ({
    id: business.id.toString(),
    "Business Name": business.name,
    "Owner Email": business.owner_user_email,
    "Subscription Status": (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(business.subscription_status)}`}>
        {business.subscription_status}
      </span>
    ),
    "Subscription Period": formatSubscriptionPeriod(
      business.subscription_start_date,
      business.subscription_end_date
    ),
    "Contact Number": business.contact_number || 'N/A',
    "Package": business.package_name
  })) || [];

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl px-14 py-8 mb-5 bg-white shadow-xl rounded-xl mx-auto mt-5">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  

  return (
    <>
      {businessAction ? (
        <div className="max-w-screen-2xl px-14 py-8 mb-5 bg-white shadow-xl rounded-xl mx-auto mt-5">
          <FormBusiness 
            mode={businessAction === "Add New Business" ? "add" : "edit"}
            businessId={businessAction === "Add New Business" ? null : businessAction}
            onBack={handleBack}
          />
        </div>
      ) : (
        <div className="max-w-screen-2xl px-14 py-8 mb-5 bg-white shadow-xl rounded-xl mx-auto mt-5">
          <TableHeaderSearch 
            title="Business Management"
            buttonText="Add New Business"
            onAddClick={() => setBusinessAction("Add New Business")}
          />
          
          <DataTable
            columns={columns}
            data={tableData}
            RowComponent={TableRowUser}
            renderDropdown={(id: string) => (
              <div className="p-2">
                
                <button 
                  onClick={() => setDeactivateId(id)} 
                  className="block w-full text-left text-gray-700 text-sm px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Deactivate Business
                </button>
              </div>
            )}
          />
          
          {businessResponse && (
            <Pagination
              currentPage={page}
              totalItems={businessResponse.count}
              itemsPerPage={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
              hasNext={!!businessResponse.next}
              hasPrevious={!!businessResponse.previous}
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