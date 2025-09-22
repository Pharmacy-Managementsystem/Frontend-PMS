import { useState } from 'react';
import { DataTable } from '../Table/DataTable';
import { TableHeader } from '../Table/TableHeader';
import { TableRow } from '../Table/TableRow';
import { useGet } from '../../Hook/API/useApiGet';
import ReusableForm from "../Forms/ReusableForm";
import Pagination from "../Pagination";
import {
  CircularProgress,
  Dialog,
  IconButton
} from '@mui/material';
import Box from '@mui/material/Box';
import { X } from 'lucide-react';
import api from "../../Hook/API/api";
import Swal from 'sweetalert2';
import { PackagePlus } from "lucide-react"; 

const columns = [
  "Tax Name",
  "Country",
  "Country Tax Rate",
  "Tax Rate",
];

interface TaxRate {
  id: number;
  name: string;
  country: string;
  country_id?: number; // إضافة country_id إذا كان متوفراً من الـ API
  country_tax_rate: string;
  rate: string;
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TaxRate[];
}

interface Country {
  id: number;
  name: string;
  code: string;
}

interface CountryResponse {
  results: Country[];
}

const TaxRate = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);
  
  const { data: taxResponse, isLoading, error, refetch } = useGet<DataResponse>({
    endpoint: `/api/business/settings/tax-rates/?page=${page}&page_size=${pageSize}`,
    queryKey: ['tax-rates', page],
  });

  const { data: corecountryTaxResponse } = useGet<CountryResponse>({
    endpoint: `/api/core/country-tax/`,
    queryKey: ['country-tax'],
  });

  const countryOptions = corecountryTaxResponse?.results.map(countryTax => ({
    value: countryTax.id,
    label: countryTax.name
  })) || [];

 

  const formFieldsEdit = [
    { 
      name: 'tax', 
      label: 'Tax rate', 
      type: 'select', 
      required: true,
      options: countryOptions
    }
  ];
  
  const formFieldsCreate = [
    { name: 'name', label: 'Custom Name', required: true },
    { name: 'rate', label: 'Tax Rate', required: true },
  ];
  
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingTaxRate(null);
    refetch();
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
        const response = await api.delete(`/api/business/settings/tax-rates/${id}/`);
        if (response.status === 204) {
          Swal.fire(
            'Deleted!',
            'Your tax rate has been deleted.',
            'success'
          );
          refetch();
        }
      } catch (error) {
        console.error('Error deleting tax rate:', error);
        Swal.fire(
          'Error!',
          'There was an error deleting the tax rate.',
          'error'
        );
      }
    }
  };

  const handleEditClick = (id: string | number) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const taxRate = taxResponse?.results.find(p => p.id === numericId);
    if (taxRate) {
      setEditingTaxRate(taxRate);
      setIsEditModalOpen(true);
    }
  };

  const transformedData = taxResponse?.results?.map((tax) => ({
    id: tax.id,
    'Tax Name': tax.name,
    'Country': tax.country,
    'Country Tax Rate': tax.country_tax_rate,
    'Tax Rate': tax.rate,
  })) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <Box className="flex justify-center items-center w-full h-screen">
          <CircularProgress />
        </Box>
      </div>
    );
  }

  if (error) return <div className="p-6">Error loading tax rates: {error.message}</div>;

  const hasTaxRates = taxResponse && taxResponse.results && taxResponse.results.length > 0;

 

  return (
    <div className="container mx-auto p-6">
      {!hasTaxRates ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <PackagePlus size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tax rates yet</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Get started by creating your first tax rate for your business.
          </p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Tax Rate
          </button>
        </div>
      ) : (
        <>
          <TableHeader
            title="Tax Rates"
            buttonText="Add New Tax Rate" 
            onAddClick={() => setIsCreateModalOpen(true)}
          />
          <DataTable
            columns={columns}
            data={transformedData}
            RowComponent={TableRow}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
          <Pagination
            currentPage={page}
            totalItems={taxResponse.count}
            itemsPerPage={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
            hasNext={!!taxResponse.next}
            hasPrevious={!!taxResponse.previous}
          />
        </>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <ReusableForm
          fields={formFieldsCreate}
          title="Tax Rate"
          endpoint="/api/business/settings/tax-rates/custom/"
          method="post"
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          submitButtonText=" Tax Rate"
          key="create-form"
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingTaxRate && (
        <Dialog 
          open={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTaxRate(null);
          }} 
          maxWidth="sm" 
          fullWidth
        >
          <IconButton
            aria-label="close"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingTaxRate(null);
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <X />
          </IconButton>
          <ReusableForm
            fields={formFieldsEdit}
            title="Tax Rate"
            endpoint={`/api/business/settings/tax-rates/${editingTaxRate.id}/`}
            method="patch"
            initialValues={
             {tax: editingTaxRate.id}
            } 
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingTaxRate(null);
            }}
            onSuccess={handleEditSuccess}
            submitButtonText=" Tax Rate"
            key={`edit-form-${editingTaxRate.id}`}
          />
        </Dialog>
      )}
    </div>
  );
};

export default TaxRate;