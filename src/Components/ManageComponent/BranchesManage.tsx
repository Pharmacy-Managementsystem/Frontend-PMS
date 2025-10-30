import { useState, useEffect } from "react";
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  const columns = [
    t('branchesManagement.branchName'),
    t('branchesManagement.country'),
    t('branchesManagement.contactNumber'),
    t('branchesManagement.createdDate'),
    t('branchesManagement.taxRate')
  ];

  const [page, setPage] = useState(1);
  const [branchAction, setBranchAction] = useState<string | null>(null);
  const [pageSize] = useState(4);
  const [id, setId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState("");

  // استخدم search في useGet مع debouncing
  const { data: branchResponse, isLoading, error, refetch } = useGet<DataResponse>({
    endpoint: `/api/branch/?page=${page}&page_size=${pageSize}&name__icontains=${search}`,
    queryKey: ['all-branches', page, search],
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const handleBack = () => {
    setBranchAction(null);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    
    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleDelete = async (id: string | number) => {
    const result = await Swal.fire({
      title: t('branchesManagement.swal.areYouSure'),
      text: t('branchesManagement.swal.cantRevert'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('branchesManagement.swal.yesDelete')
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/branch/${id}/`);
        if (response.status === 204) {
          Swal.fire(
            t('branchesManagement.swal.deleted'),
            t('branchesManagement.swal.branchDeleted'),
            'success'
          );
          refetch();
        }
      } catch (error) {
        console.error('Error deleting branch:', error);
        Swal.fire(
          t('branchesManagement.swal.error'),
          t('branchesManagement.swal.errorDeleting'),
          'error'
        );
      }
    }
  };

  const handleEditClick = (id: string | number) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    setBranchAction(t('branchesManagement.editBranch')); 
    setId(numericId);
  };

  // Transform API data to match table structure
  const tableData = branchResponse?.results?.map(branch => ({
    id: branch.id.toString(),
    [columns[0]]: branch.name,
    [columns[1]]: branch.country || t('contactInfo.messages.notAvailable'),
    [columns[2]]: branch.mobile || branch.landline || t('contactInfo.messages.notAvailable'),
    [columns[3]]: formatDate(branch.created_at),
    [columns[4]]: `${branch.tax_rate}%`
  })) || [];

  const hasBranches = branchResponse && branchResponse.results && branchResponse.results.length > 0;

  return (
    <>
      {branchAction ? (
        <div>
          <FormBranch 
            mode={branchAction === t('branchesManagement.addNewBranch') ? "add" : "edit"}
            branchId={branchAction === t('branchesManagement.addNewBranch') ? null : id}
            onBack={handleBack}
          />
        </div>
      ) : (
        <div className="">
          <TableHeaderSearch 
            title={t('branchesManagement.title')}
            buttonText={t('branchesManagement.addNewBranch')}
            onAddClick={() => setBranchAction(t('branchesManagement.addNewBranch'))}
            value={searchInput}
            onSearchChange={handleSearchChange}
          />
          {error ? (
            <div className="p-6">{t('branchesManagement.errorLoading')}: {error.message}</div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-64">
              <CircularProgress />
            </div>
          ) : !hasBranches ? (
            searchInput.trim() ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <PackagePlus size={48} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('table.search.notFound')}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {t('table.search.tryDifferent')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <PackagePlus size={48} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('branchesManagement.noBranches')}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {t('branchesManagement.getStarted')}
                </p>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setBranchAction(t('branchesManagement.addNewBranch'))}  
                >
                  {t('branchesManagement.createBranch')}
                </button>
              </div>
            )
          ) : (
            <>
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