import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { DataTable } from "../Table/DataTable";
import TableRowUser from "../Table/TableRowUser";
import DeactivateUser from "./DeactivateUser";
import  { useState } from "react";
import UserInfo from "../Info/UserInfo";
import { useGet } from "../../Hook/API/useApiGet";

const columns = [
  "Branch Name",
  "Country",
  "Contact Number",
  "Created Date",
  "Tax Rate"
];

interface Currency {
  pk: number;
  currency: number;
  exchange_rate: string;
  currency_name: string;
  currency_symbol: string;
  currency_code: string;
  currency_decimal_point: number;
  default: boolean;
}

interface PaymentMethod {
  payment_method: number;
  payment_method_name: string;
}

interface CustomField {
  field_name: string;
  field_key: string;
  value: string;
}

interface Branch {
  id: number;
  currencies: Currency[];
  payment_methods: PaymentMethod[];
  custom_fields: CustomField[];
  name: string;
  address_line: string;
  country: string;
  mobile: string;
  landline: string;
  created_at: string;
  vat_number: string;
  cr_number: string;
  manual_gold_price: string;
  gold_price_source: string;
  logo: string;
  business: number;
  tax_rate: number;
  currency: number[];
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Branch[];
}

export default function BranchesManage() {
  const [page, setPage] = useState(1);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<string | null>(null);
  
  const { data: businessResponse, isLoading } = useGet<DataResponse>({
    endpoint: `/api/branch/?page=${page}`,
    queryKey: ['all-branches', page],
  });

  const handleBack = () => {
    setShowInfo(null);
  };

  const handleNextPage = () => {
    if (businessResponse?.next) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (businessResponse?.previous) {
      setPage(prev => prev - 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Transform API data to match table structure
  const tableData = businessResponse?.results?.map(branch => ({
    id: branch.id.toString(),
    "Branch Name": branch.name,
    "Country": branch.country || 'N/A',
    "Contact Number": branch.mobile || branch.landline || 'N/A',
    "Created Date": formatDate(branch.created_at),
    "Tax Rate": `${branch.tax_rate}%`
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
      {showInfo ? (
        <UserInfo userId={showInfo} onBack={handleBack} />
      ) : (
        <div >
          <TableHeaderSearch 
            title="Branch Management"
            buttonText="Add New Branch"
            onAddClick={() => console.log('Add Branch Clicked')}
          />
          
          <DataTable
            columns={columns}
            data={tableData}
            RowComponent={TableRowUser}
            renderDropdown={(id: string) => (
              <div className="bg-white shadow-lg rounded-md p-1">
                <button 
                  onClick={() => setShowInfo(id)} 
                  className="block w-full text-left text-label text-base px-4 py-2 hover:bg-gray-50 rounded-md"
                >
                  Show Branch Info
                </button>
                <button 
                  onClick={() => setDeactivateId(id)} 
                  className="block w-full text-left text-label text-base px-4 py-2 hover:bg-gray-50 rounded-md"
                >
                  Deactivate Branch
                </button>
              </div>
            )}
          />
          
          <div className="flex justify-between items-center px-2 py-4 text-sm text-gray-500">
            <span>Total Number of Branches: <b>{businessResponse?.count || 0}</b></span>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevPage}
                disabled={!businessResponse?.previous}
                className={`px-3 py-1 rounded ${
                  !businessResponse?.previous 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Previous
              </button>
              <span>Page <b>{page}</b></span>
              <button
                onClick={handleNextPage}
                disabled={!businessResponse?.next}
                className={`px-3 py-1 rounded ${
                  !businessResponse?.next 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next
              </button>
            </div>
          </div>
          
          {deactivateId && (
            <DeactivateUser
              onClose={() => setDeactivateId(null)}
                id={deactivateId}
                type="Branch"
            />
          )}
        </div>
      )}
    </>
  );
}