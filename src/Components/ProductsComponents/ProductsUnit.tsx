import { useState, useEffect } from "react";
import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { DataTable } from "../Table/DataTable";
import { TableRow } from '../Table/TableRow';
import { useGet } from "../../Hook/API/useApiGet";
import Pagination from "../Pagination";
import {
  CircularProgress,
} from '@mui/material';
import { Ruler } from 'lucide-react';
import api from "../../Hook/API/api";
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import ReusableForm from "../Forms/ReusableForm";
import ViewTypeOrUnit from "../Info/ViewTypeOrUnit"; 

interface ProductUnit {
  id: number;
  name: string;
  parent: number | null;
  parent_name: string | null;
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductUnit[];
}

export default function ProductsUnit() {
  const [action, setAction] = useState<string | null>(null);
  const [id, setId] = useState<number | null>(null);
  const { t } = useTranslation();
  
  const columns = [
    t('productsUnit.name'),
    t('productsUnit.parent'),
  ];

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState("");
  const [parentUnits, setParentUnits] = useState<{value: number; label: string}[]>([]);

  // Build query parameters based on available search options
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

  const { data: unitResponse, isLoading, error, refetch } = useGet<DataResponse>({
    endpoint: `/api/inventory/products/units/?${buildQueryParams()}`,
    queryKey: ['productUnits', page, search],
  });

 
  useEffect(() => {
    if (unitResponse?.results) {
      const options = unitResponse.results.map(unit => ({
        value: unit.id,
        label: unit.name
      }));
      setParentUnits([{ value: 0, label: t('productsUnit.noParent') }, ...options]);
    }
  }, [unitResponse, t]);

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
      title: t('productsUnit.swal.areYouSure'),
      text: t('productsUnit.swal.cantRevert'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('productsUnit.swal.yesDelete')
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/inventory/products/units/${id}/`);
        if (response.status === 204) {
          Swal.fire(
            t('productsUnit.swal.deleted'),
            t('productsUnit.swal.unitDeleted'),
            'success'
          );
          refetch();
        }
      } catch (error) {
        console.error('Error deleting product unit:', error);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : t('productsUnit.swal.errorDeleting');
        
        Swal.fire(
          t('productsUnit.swal.error'),
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

  const handleViewClick = (id: string | number) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    setAction('view');
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
    if (action === 'edit' && id && unitResponse?.results) {
      const unitToEdit = unitResponse.results.find(unit => unit.id === id);
      if (unitToEdit) {
        return {
          name: unitToEdit.name || '',
          parent: unitToEdit.parent || 0
        };
      }
    }
    return {
      name: '',
      parent: 0
    };
  };

  // Define form fields for product units
  const formFields = [
    {
      name: 'name',
      label: t('productsUnit.name'),
      type: 'text',
      required: true
    },
    {
      name: 'parent',
      label: t('productsUnit.parent'),
      type: 'select',
      required: false,
      options: parentUnits
    }
  ];

  // Safe data transformation with null checks
  const tableData = unitResponse?.results?.map(unit => {
    // Ensure all required fields have safe fallbacks
    const safeUnit = {
      id: unit?.id?.toString() || '',
      name: unit?.name || t('productsUnit.unknown'),
      parent_name: unit?.parent_name || t('productsUnit.noParent'),
       };

    return {
      id: safeUnit.id,
      [columns[0]]: safeUnit.name,
      [columns[1]]: safeUnit.parent_name,
     
    };
  }) || [];

  const hasUnits = unitResponse && unitResponse.results && unitResponse.results.length > 0;

  return (
    <>
      {action === 'view' && id ? (
        <ViewTypeOrUnit 
          itemId={id}
          itemType="unit"
          onBack={handleBack}
        />
      ) : action === 'add' || action === 'edit' ? (
        <ReusableForm
          fields={formFields}
          title={action === 'add' ? t('productsUnit.addNewUnit') : t('productsUnit.editUnit')}
          endpoint={action === 'add' ? '/api/inventory/products/units/' : `/api/inventory/products/units/${id}/`}
          method={action === 'add' ? 'post' : 'patch'}
          onSuccess={handleSuccess}
          onClose={handleBack}
          submitButtonText={action === 'add' ? t('productsUnit.createUnit') : t('productsUnit.updateUnit')}
          initialValues={getInitialValues()}
        />
      ) : (
        <div className="">
          <TableHeaderSearch 
            buttonText={t('productsUnit.addNewUnit')}
            onAddClick={handleAddClick}
            value={searchInput}
            onSearchChange={handleSearchChange}
            searchPlaceholder={t('productsUnit.searchPlaceholder')}
          />
          {error ? (
            <div className="p-6">
              {t('productsUnit.errorLoading')}: {error instanceof Error ? error.message : String(error)}
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-64">
              <CircularProgress />
            </div>
          ) : !hasUnits ? (
            searchInput.trim() ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <Ruler size={48} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('productsUnit.noUnitsFound')}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {t('productsUnit.tryDifferentSearch')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <Ruler size={48} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('productsUnit.noUnits')}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {t('productsUnit.getStarted')}
                </p>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={handleAddClick}
                >
                  {t('productsUnit.createUnit')}
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
                onView={handleViewClick} // أضف هذا
                onDelete={handleDelete}
                actions={["view",'edit', 'delete']}
              />

              <Pagination
                currentPage={page}
                totalItems={unitResponse?.count || 0}
                itemsPerPage={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                hasNext={!!unitResponse?.next}
                hasPrevious={!!unitResponse?.previous}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}