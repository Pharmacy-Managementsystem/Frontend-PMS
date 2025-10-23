import { useState } from 'react';
import { useGet } from '../../Hook/API/useApiGet';
import { DataTable } from '../Table/DataTable';
import { TableHeaderSearch } from '../Table/TableHeaderSearch';
import { TableRow } from '../Table/TableRow';
import ReusableForm from "../Forms/ReusableForm";
import Pagination from "../Pagination";
import {
  CircularProgress,
  Dialog,
  IconButton
} from '@mui/material';
import Box from '@mui/material/Box';
import { X, PackagePlus } from 'lucide-react';
import api from "../../Hook/API/api";
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import ContactInfo from '../Info/InfoContacts/ContactInfo';

interface Supplier {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  phone: string;
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Supplier[];
}

const Suppliers = () => {
  const { t } = useTranslation();
  
  const columns = [
    t('suppliers.supplierName'),
    t('suppliers.phone'),
    t('suppliers.email'),
    t('suppliers.status'),
  ];

  const [page, setPage] = useState(1);
  const [pageSize] = useState(4);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [contactInfo, setContactInfo] = useState<string | null>(null);

  const { data: SuppliersResponse, isLoading, error, refetch } = useGet<DataResponse>({
    endpoint: `/api/suppliers/?page=${page}&page_size=${pageSize}`,
    queryKey: ['all-suppliers', page],
  });

  const formFields = [
    { name: 'name', label: t('suppliers.supplierName') },
    { name: 'phone', label: t('suppliers.phone') },
    { name: 'email', label: t('suppliers.email'), type: 'email' },
    { name: 'land_line', label: t('suppliers.land_line') },
    { name: 'cr', label: t('suppliers.cr') },
    { name: 'address', label: t('suppliers.address') },
    { name: 'tax_number', label: t('suppliers.tax_number') },
    { 
      name: 'is_active', 
      label: t('suppliers.active'), 
      type: 'checkbox',
      required: false 
    }
  ];

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingSupplier(null);
    refetch();
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: t('suppliers.swal.areYouSure'),
      text: t('suppliers.swal.cantRevert'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('suppliers.swal.yesDelete')
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/suppliers/${id}/`);
        if (response.status === 204) {
          Swal.fire(
            t('suppliers.swal.deleted'),
            t('suppliers.swal.supplierDeleted'),
            'success'
          );
          refetch();
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        Swal.fire(
          t('suppliers.swal.error'),
          t('suppliers.swal.errorDeleting'),
          'error'
        );
      }
    }
  };

  // أضيفي هذه الدالة المفقودة
  const handleEditClick = (id: string) => {
    const supplier = SuppliersResponse?.results.find(s => s.id === id);
    if (supplier) {
      setEditingSupplier(supplier);
      setIsEditModalOpen(true);
    }
  };

  // أضيفي هذه الدالة للـ view
  const handleViewClick = (id: string) => {
    setContactInfo(id);
  };

  const handleToggleStatus = async (id: string) => {
    const supplier = SuppliersResponse?.results.find(s => s.id === id);
    if (supplier) {
      try {
        const response = await api.patch(`/api/suppliers/${id}/`, {
          is_active: !supplier.is_active
        });
        if (response.status === 200) {
          refetch();
          Swal.fire(
            t('suppliers.statusUpdated'),
            t('suppliers.statusUpdatedSuccessfully'),
            'success'
          );
        }
      } catch (error) {
        console.error('Error toggling supplier status:', error);
        Swal.fire(
          t('suppliers.swal.error'),
          t('suppliers.errorUpdatingStatus'),
          'error'
        );
      }
    }
  };

  const transformedData = SuppliersResponse?.results?.map((supplier) => ({
    id: supplier.id,
    [columns[0]]: supplier.name,
    [columns[1]]: supplier.phone,
    [columns[2]]: supplier.email,
    [columns[3]]: supplier.is_active ? t('table.status.active') : t('table.status.inactive'),
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

  if (error) return <div className="p-6">{t('suppliers.errorLoading')}: {error.message}</div>;

  const hasSuppliers = SuppliersResponse && SuppliersResponse.results && SuppliersResponse.results.length > 0;

  return (
    <>
      {contactInfo ? (
        <ContactInfo contactInfo={contactInfo} title="suppliers" onClose={() => setContactInfo(null)} />
      ) : (
        <div className="container mx-auto p-6">
          {!hasSuppliers ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <PackagePlus size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('suppliers.noSuppliers')}</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                {t('suppliers.getStarted')}
              </p>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setIsCreateModalOpen(true)}
              >
                {t('suppliers.createSupplier')}
              </button>
            </div>
          ) : (
            <>
              <TableHeaderSearch
                title={t('suppliers.title')}
                buttonText={t('suppliers.addNewSupplier')} 
                onAddClick={() => setIsCreateModalOpen(true)}
              />
              <DataTable
                columns={columns}
                data={transformedData}
                RowComponent={TableRow}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onView={handleViewClick}
                onToggleStatus={handleToggleStatus}
                actions={['view', 'delete']} 
              />
              <Pagination
                currentPage={page}
                totalItems={SuppliersResponse.count}
                itemsPerPage={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                hasNext={!!SuppliersResponse.next}
                hasPrevious={!!SuppliersResponse.previous}
              />
            </>
          )}

          {/* Create Modal */}
          {isCreateModalOpen && (
            <ReusableForm
              title={t('suppliers.createSupplier')}
              fields={formFields}
              endpoint="/api/suppliers/"
              method="post"
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={handleCreateSuccess}
              submitButtonText={t('suppliers.createSupplier')}
              key="create-form"
            />
          )}

          {/* Edit Modal */}
          {isEditModalOpen && editingSupplier && (
            <Dialog 
              open={isEditModalOpen} 
              onClose={() => {
                setIsEditModalOpen(false);
                setEditingSupplier(null);
              }} 
              maxWidth="sm" 
              fullWidth
            >
              <IconButton
                aria-label="close"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingSupplier(null);
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
                title={t('suppliers.editSupplier')}
                fields={formFields}
                endpoint={`/api/suppliers/${editingSupplier.id}/`}
                method="patch"
                initialValues={{
                  ...editingSupplier
                }}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setEditingSupplier(null);
                }}
                onSuccess={handleEditSuccess}
                submitButtonText={t('suppliers.updateSupplier')}
                key={`edit-form-${editingSupplier.id}`}
              />
            </Dialog>
          )}
        </div>
      )}
    </>
  );
};

export default Suppliers;