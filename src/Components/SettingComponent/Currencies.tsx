import { DataTable } from '../Table/DataTable';
import { TableHeader } from '../Table/TableHeader';
import { TableRow } from '../Table/TableRow';
import  { useState } from 'react';
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

const columns = ['Currency Name', 'Currency Code', 'Symbol', 'Decimal Point', 'Is Default'];

interface Currency {
  id: number;
  code: string;
  symbol: string;
  name: string;
  decimal_point: string;
  is_default: boolean;
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Currency[];
}

const Currencies = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(4);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  
  const { data: currencyResponse, isLoading, error, refetch } = useGet<DataResponse>({
    endpoint: `/api/business/settings/currencies/?page=${page}&page_size=${pageSize}`,
    queryKey: ['all-currencies', page],
  });
  const { data: coreCurrenciesResponse} = useGet<DataResponse>({
    endpoint: `/api/core/currencies/`,
    queryKey: ['core-currencies', page],
  });
 const currencyOptions = coreCurrenciesResponse?.results.map(currency => ({
    value: currency.id,
    label: `${currency.code} - ${currency.name}`
  })) || [];

  const formFields = [
    { 
      name: 'currency', 
      label: 'Currency', 
      type: 'select', 
      required: true,
      options: currencyOptions // Add options here
    },
    { name: 'is_default', label: 'Is Default', type: 'checkbox', required: false }
  ];
  
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingCurrency(null);
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
        const response = await api.delete(`/api/business/settings/currencies/${id}/`);
        if (response.status === 204) {
          Swal.fire(
            'Deleted!',
            'Your currency has been deleted.',
            'success'
          );
          refetch();
        }
      } catch (error) {
        console.error('Error deleting currency:', error);
        Swal.fire(
          'Error!',
          'There was an error deleting the currency.',
          'error'
        );
      }
    }
  };

  const handleEditClick = (id: string | number) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const currency = currencyResponse?.results.find(p => p.id === numericId);
    if (currency) {
      setEditingCurrency(currency);
      setIsEditModalOpen(true);
    }
  };

  // Fixed the transformedData mapping to match table column expectations
  const transformedData = currencyResponse?.results?.map((currency) => ({
    id: currency.id,
    'Currency Name': currency.name,
    'Currency Code': currency.code,
    'Symbol': currency.symbol,
    'Decimal Point': currency.decimal_point,
    'Is Default': currency.is_default 
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

  if (error) return <div className="p-6">Error loading currencies: {error.message}</div>;

  const hasCurrency = currencyResponse && currencyResponse.results && currencyResponse.results.length > 0;

  return (
    <div className="container mx-auto p-6">
      {!hasCurrency ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <PackagePlus size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No currencies yet</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Get started by creating your first currency for your business.
          </p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create currency
          </button>
        </div>
      ) : (
        <>
          <TableHeader
            title="Currencies"
            buttonText="Add New Currency" 
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
            totalItems={currencyResponse.count}
            itemsPerPage={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
            hasNext={!!currencyResponse.next}
            hasPrevious={!!currencyResponse.previous}
          />
        </>
      )}

      {/* Create Modal */}
        {isCreateModalOpen && (
        <ReusableForm
          title="Currency"
          fields={formFields}
          endpoint="/api/business/settings/currencies/"
          method="post"
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          submitButtonText="Create Currency"
          key="create-form"
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingCurrency && (
        <Dialog 
          open={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCurrency(null);
          }} 
          maxWidth="sm" 
          fullWidth
        >
          <IconButton
            aria-label="close"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingCurrency(null);
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
            title=" Currency"
            fields={formFields}
            endpoint={`/api/business/settings/currencies/${editingCurrency.id}/`}
            method="patch"
            initialValues={{
              currency: editingCurrency.id, 
              is_default: editingCurrency.is_default
            }}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingCurrency(null);
            }}
            onSuccess={handleEditSuccess}
            submitButtonText="Update Currency"
            key={`edit-form-${editingCurrency.id}`}
          />
        </Dialog>
      )}
    </div>
  );
};

export default Currencies;