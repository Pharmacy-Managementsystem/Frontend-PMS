import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { DataTable } from "../Table/DataTable";
import TableRowUser from "../Table/TableRowUser";
import DeactivateUser from "./DeactivateUser";
import  { useState } from "react";
import { useGet } from "../../Hook/API/useApiGet";
import Pagination from "../Pagination";
import FormBusiness from "../Forms/FormBusiness";
import { useTranslation } from 'react-i18next';


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
  const { t } = useTranslation();
  
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

  const getTranslatedStatus = (status: string) => {
    switch (status) {
      case 'active':
        return t('table.status.active');
      case 'inactive':
        return t('table.status.inactive');
      case 'pending':
        return t('table.status.pending');
      default:
        return status;
    }
  };

  // Transform API data to match table structure
  const tableData = businessResponse?.results?.map(business => ({
    id: business.id.toString(),
    [t('businessManagement.businessName')]: business.name,
    [t('businessManagement.ownerEmail')]: business.owner_user_email,
    [t('businessManagement.subscriptionStatus')]: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(business.subscription_status)}`}>
        {getTranslatedStatus(business.subscription_status)}
      </span>
    ),
    [t('businessManagement.subscriptionPeriod')]: formatSubscriptionPeriod(
      business.subscription_start_date,
      business.subscription_end_date
    ),
    [t('businessManagement.contactNumber')]: business.contact_number || t('contactInfo.messages.notAvailable'),
    [t('businessManagement.package')]: business.package_name
  })) || [];

  if (isLoading) {
    return (
      <div className="max-w-screen-xl px-14 py-8 mb-5 bg-white shadow-xl rounded-xl mx-auto mt-5">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {businessAction ? (
        <div>
          <FormBusiness 
            mode={businessAction === t('businessManagement.addNewBusiness') ? "add" : "edit"}
            businessId={businessAction === t('businessManagement.addNewBusiness') ? null : businessAction}
            onBack={handleBack}
          />
        </div>
      ) : (
        <div>
          <TableHeaderSearch 
            title={t('businessManagement.title')}
            buttonText={t('businessManagement.addNewBusiness')}
            onAddClick={() => setBusinessAction(t('businessManagement.addNewBusiness'))}
          />
          
          <DataTable
            columns={[
              t('businessManagement.businessName'),
              t('businessManagement.ownerEmail'),
              t('businessManagement.subscriptionStatus'),
              t('businessManagement.subscriptionPeriod'),
              t('businessManagement.contactNumber'),
              t('businessManagement.package')
            ]}
            data={tableData}
            RowComponent={TableRowUser}
            renderDropdown={(id: string) => (
              <div className="p-2">
                <button 
                  onClick={() => setDeactivateId(id)} 
                  className="block w-full text-left text-gray-700 text-sm px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {t('businessManagement.deactivateBusiness')}
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