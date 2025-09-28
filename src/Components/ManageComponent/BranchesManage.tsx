import { useState } from "react";
import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { DataTable } from "../Table/DataTable";
import { TableRow } from '../Table/TableRow';
import { useGet } from "../../Hook/API/useApiGet";
import Pagination from "../Pagination";
import {
  CircularProgress,
 
} from '@mui/material';
import { PackagePlus } from 'lucide-react';
import api from "../../Hook/API/api";
import Swal from 'sweetalert2';
import FormBranch from "../Forms/FormBranch";

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
  const [branchAction , setBranchAction] = useState<string | null>(null);
  const [pageSize] = useState(4);
  const[id, setId] = useState<number | null>(null);
 
  
  const { data: branchResponse, isLoading, error, refetch } = useGet<DataResponse>({
    endpoint: `/api/branch/?page=${page}&page_size=${pageSize}`,
    queryKey: ['all-branches', page],
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
    const handleBack = () => {
    setBranchAction(null);
  };


 

  const handleDelete = async (id: string | number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/branch/${id}/`);
        if (response.status === 204) {
          Swal.fire(
            'Deleted!',
            'Your branch has been deleted.',
            'success'
          );
          refetch();
        }
      } catch (error) {
        console.error('Error deleting branch:', error);
        Swal.fire(
          'Error!',
          'There was an error deleting the branch.',
          'error'
        );
      }
    }
  };

  const handleEditClick = (id: string | number) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    setBranchAction("Edit Branch"); 
    setId(numericId);

  };

  // Transform API data to match table structure
  const tableData = branchResponse?.results?.map(branch => ({
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
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (error) return <div className="p-6">Error loading branches: {error.message}</div>;

  const hasBranches = branchResponse && branchResponse.results && branchResponse.results.length > 0;

  return (
    <>
           {branchAction ? (
<div >
          <FormBranch 
              mode={branchAction === "Add New Branch" ? "add" : "edit"}
              branchId={branchAction === "Add New Branch" ?null  : id}
              onBack={handleBack}
            />
        </div>
      ) : (
    <div className="">
      {!hasBranches ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <PackagePlus size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No branches yet</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Get started by creating your first branch for your business.
          </p>
          <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setBranchAction("Add New Branch")}  // Changed from "Add New Branches"
            >
              Create Branch
            </button>
        </div>
      ) : (
        <>
          <TableHeaderSearch 
            title="Branches Management"
            buttonText="Add New Branches"
            onAddClick={() => setBranchAction("Add New Branch")}
          />
          
          <DataTable
            columns={columns}
            data={tableData}
            RowComponent={TableRow}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />

          <Pagination
            currentPage={page}
            totalItems={branchResponse?.count || 0}
            itemsPerPage={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
            hasNext={!!branchResponse?.next}
            hasPrevious={!!branchResponse?.previous}
          />
        </>
      )}

    

     
    </div>
   )}
    </>
  );
}