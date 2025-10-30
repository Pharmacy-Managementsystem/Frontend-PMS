import { useState, useEffect } from "react";
import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { DataTable } from "../Table/DataTable";
import { TableRow } from '../Table/TableRow';
import { useGet } from "../../Hook/API/useApiGet";
import Pagination from "../Pagination";
import {
  CircularProgress,
} from '@mui/material';
import { Building2 } from 'lucide-react';
import api from "../../Hook/API/api";
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import ReusableForm from "../Forms/ReusableForm";

interface ProductCompany {
  id: number;
  name: string;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  created_by_username: string;
 
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductCompany[];
}

export default function ProductsCompany() {
  const [action, setAction] = useState<string | null>(null);
  const [id, setId] = useState<number | null>(null);
  const { t } = useTranslation();
  
  const columns = [
    t('productsCompany.name'),
    t('productsCompany.phone'),
    t('productsCompany.email'),
    t('productsCompany.address'),
    t('productsCompany.createdBy'),
  ];

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState("");

  const buildQueryParams = () => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search.trim()) {
      params.append('name__icontains', search.trim());
    }

    return params.toString();
  };

  const { data: companyResponse, isLoading, error, refetch } = useGet<DataResponse>({
    endpoint: `/api/inventory/products/companies/?${buildQueryParams()}`,
    queryKey: ['productCompanies', page, search],
  });

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
      title: t('productsCompany.swal.areYouSure'),
      text: t('productsCompany.swal.cantRevert'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('productsCompany.swal.yesDelete')
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/inventory/products/companies/${id}/`);
        if (response.status === 204) {
          Swal.fire(
            t('productsCompany.swal.deleted'),
            t('productsCompany.swal.companyDeleted'),
            'success'
          );
          refetch();
        }
      } catch (error) {
        console.error('Error deleting product company:', error);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : t('productsCompany.swal.errorDeleting');
        
        Swal.fire(
          t('productsCompany.swal.error'),
          errorMessage,
          'error'
        );
      }
    }
  };

  const handleBack = () => {
    setAction(null);
    setId(null);
  };

  const handleEditClick = (id: string | number) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    setAction('edit');
    setId(numericId);
  };

  const handleAddClick = () => {
    setAction('add');
    setId(null);
  };

  const handleSuccess = () => {
    refetch();
    handleBack();
  };

  // Get initial values for edit
  const getInitialValues = () => {
    if (action === 'edit' && id && companyResponse?.results) {
      const companyToEdit = companyResponse.results.find(company => company.id === id);
      if (companyToEdit) {
        return {
          name: companyToEdit.name || '',
          phone_number: companyToEdit.phone_number || '',
          email: companyToEdit.email || '',
          address: companyToEdit.address || ''
        };
      }
    }
    return {
      name: '',
      phone_number: '',
      email: '',
      address: ''
    };
  };

  // Define form fields for product companies
  const formFields = [
    {
      name: 'name',
      label: t('productsCompany.name'),
      type: 'text',
      required: true
    },
    {
      name: 'phone_number',
      label: t('productsCompany.phone'),
      type: 'text',
      required: false
    },
    {
      name: 'email',
      label: t('productsCompany.email'),
      type: 'email',
      required: false
    },
    {
      name: 'address',
      label: t('productsCompany.address'),
      type: 'text',
      required: false
    }
  ];

  // Safe data transformation with null checks
  const tableData = companyResponse?.results?.map(company => {
    // Ensure all required fields have safe fallbacks
    const safeCompany = {
      id: company?.id?.toString() || '',
      name: company?.name || t('productsCompany.unknown'),
      phone_number: company?.phone_number || t('productsCompany.notProvided'),
      email: company?.email || t('productsCompany.notProvided'),
      address: company?.address || t('productsCompany.notProvided'),
      created_by_username: company?.created_by_username || t('productsCompany.unknown'),
    };

    return {
      id: safeCompany.id,
      [columns[0]]: safeCompany.name,
      [columns[1]]: safeCompany.phone_number,
      [columns[2]]: safeCompany.email,
      [columns[3]]: safeCompany.address,
      [columns[4]]: safeCompany.created_by_username,
    };
  }) || [];

  const hasCompanies = companyResponse && companyResponse.results && companyResponse.results.length > 0;

  return (
    <>
      {action ? (
        <ReusableForm
          fields={formFields}
          title={action === 'add' ? t('productsCompany.addNewCompany') : t('productsCompany.editCompany')}
          endpoint={action === 'add' ? '/api/inventory/products/companies/' : `/api/inventory/products/companies/${id}/`}
          method={action === 'add' ? 'post' : 'put'}
          onSuccess={handleSuccess}
          onClose={handleBack}
          submitButtonText={action === 'add' ? t('productsCompany.createCompany') : t('productsCompany.updateCompany')}
          initialValues={getInitialValues()}
        />
      ) : (
        <div className="">
          <TableHeaderSearch 
            buttonText={t('productsCompany.addNewCompany')}
            onAddClick={handleAddClick}
            value={searchInput}
            onSearchChange={handleSearchChange}
            searchPlaceholder={t('productsCompany.searchPlaceholder')}
          />
          {error ? (
            <div className="p-6">
              {t('productsCompany.errorLoading')}: {error instanceof Error ? error.message : String(error)}
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-64">
              <CircularProgress />
            </div>
          ) : !hasCompanies ? (
            searchInput.trim() ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <Building2 size={48} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('productsCompany.noCompaniesFound')}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {t('productsCompany.tryDifferentSearch')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <Building2 size={48} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('productsCompany.noCompanies')}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {t('productsCompany.getStarted')}
                </p>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={handleAddClick}
                >
                  {t('productsCompany.createCompany')}
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
                actions={['edit', 'delete']}
              />

              <Pagination
                currentPage={page}
                totalItems={companyResponse?.count || 0}
                itemsPerPage={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                hasNext={!!companyResponse?.next}
                hasPrevious={!!companyResponse?.previous}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}