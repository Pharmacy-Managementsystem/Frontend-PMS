import  { useState } from 'react';
import { DataTable } from '../Table/DataTable';
import { TableHeaderSearch } from '../Table/TableHeaderSearch';
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
  "Payment Name",
  "Country", 
  "Tax rate",
];

interface PaymentMethod {
  id: string;
  name: string;
  country: string;
  tax_rate: number | string; 
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaymentMethod[];
}

const PaymentMethods = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(4);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  
  const { data: PaymentResponse, isLoading, error, refetch } = useGet<DataResponse>({
    endpoint: `/api/business/settings/payment-methods/?page=${page}&page_size=${pageSize}`,
    queryKey: ['all-payment-methods', page],
  });

 const formFields = [
  { name: 'name', label: 'Payment Name', required: true },
  { name: 'country', label: 'Country', required: true },
  { 
    name: 'tax_rate', 
    label: 'Tax Rate', 
    type: 'number',  // Change to number type
    required: false,
    // Add conversion to handle string/number conversion
    formatValue: (value: string | number | null) => value ? Number(value) : null,
    parseValue: (value: number | string | null) => value?.toString()
  }
];

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingPayment(null);
    refetch();
  };

  const handleDelete = async (id: string) => {
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
      const response = await api.delete(`/api/business/settings/payment-methods/${id}/`);
      if (response.status === 204) {
        Swal.fire(
          'Deleted!',
          'Your payment method has been deleted.',
          'success'
        );
        refetch();
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      Swal.fire(
        'Error!',
        'There was an error deleting the payment method.',
        'error'
      );
    }
  }
};

  const handleEditClick = (id: string) => {
  const payment = PaymentResponse?.results.find(p => p.id === id);
  if (payment) {
    setEditingPayment(payment);
    setIsEditModalOpen(true);
  }
};

 const transformedData = PaymentResponse?.results?.map((method) => ({
  id: method.id,
  "Payment Name": method.name,
  "Country": method.country,
  "Tax rate": method.tax_rate?.toString(),  // Convert to string
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

  if (error) return <div className="p-6">Error loading payment methods: {error.message}</div>;

  const hasPaymentMethods = PaymentResponse && PaymentResponse.results && PaymentResponse.results.length > 0;

  return (
    <div className="container mx-auto p-6">
      {!hasPaymentMethods ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <PackagePlus size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods yet</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Get started by creating your first payment method for your business.
          </p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Payment Method
          </button>
        </div>
      ) : (
        <>
          <TableHeaderSearch
            title="Payment Methods"
            buttonText="Add New Payment Method" 
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
            totalItems={PaymentResponse.count}
            itemsPerPage={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
            hasNext={!!PaymentResponse.next}
            hasPrevious={!!PaymentResponse.previous}
          />
        </>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <ReusableForm
          title="Payment Method"
          fields={formFields}
          endpoint="/api/business/settings/payment-methods/"
          method="post"
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          submitButtonText="Create Payment Method"
          key="create-form"
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingPayment && (
        <Dialog 
          open={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPayment(null);
          }} 
          maxWidth="sm" 
          fullWidth
        >
          <IconButton
            aria-label="close"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingPayment(null);
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
            title="Payment Method"
            fields={formFields}
            endpoint={`/api/business/settings/payment-methods/${editingPayment.id}/`}
            method="patch"
            initialValues={{
            ...editingPayment,
            tax_rate: editingPayment.tax_rate?.toString() 
            }}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingPayment(null);
            }}
            onSuccess={handleEditSuccess}
            submitButtonText="Update Payment Method"
            key={`edit-form-${editingPayment.id}`}
          />
        </Dialog>
      )}
    </div>
  );
};

export default PaymentMethods;