import LargeCard from "../Cards/LargeCards";
import { useGet } from "../../Hook/API/useApiGet";
import { useState } from "react";
import { PackagePlus } from "lucide-react"; 
import { TableHeader } from "../Table/TableHeader";
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

interface Package {
  id: number;
  name: string;
  max_branches: number;
  max_owners: number;
  max_users: number;
  price: number;
  billing_cycle_days: number;
  description: string;
}

interface PackageResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Package[];
}

export default function PackageManage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(4);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const { data: packageResponse, isLoading, error, refetch } = useGet<PackageResponse>({
    endpoint: `/api/superadmin/packages/?page=${page}&page_size=${pageSize}`,
    queryKey: ['packages', page],
  });

 const formFields = [
  { name: 'name', label: 'Package Name', required: true },
  { name: 'max_branches', label: 'Max Branches', type: 'number', required: true },
  { name: 'max_owners', label: 'Max Owners', type: 'number', required: true },
  { name: 'max_users', label: 'Max Users', type: 'number', required: true },
  { name: 'price', label: 'Price', type: 'number', required: true },
  { name: 'billing_cycle_days', label: 'Billing Cycle Days', type: 'number', required: true },
  { name: 'description', label: 'Description', type: 'text', required: false }
];

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingPackage(null);
    refetch();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.delete(`/api/superadmin/packages/${id}/`);
      if (response.status === 204) {
        refetch(); 
      }
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const handleEditClick = (pkg: Package) => {
    const packageCopy = { ...pkg };
    setEditingPackage(packageCopy);
    setIsEditModalOpen(true);
  };

  if (isLoading) return <div className="p-6">
     <Box className="flex justify-center items-center w-full h-screen">
      <CircularProgress />
    </Box>
  </div>;
  if (error) return <div className="p-6">Error loading packages: {error.message}</div>;

  const hasPackages = packageResponse && packageResponse.results && packageResponse.results.length > 0;

  return (
    <div>
      <div >
        {!hasPackages && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <PackagePlus size={48} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packages yet</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Get started by creating your first subscription package for your pharmacy system.
            </p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Package
            </button>
          </div>
        )}

        {hasPackages && (
          <div className="flex flex-col justify-center">
            <TableHeader 
              title="Packages" 
              buttonText="Create Package" 
              onAddClick={() => setIsCreateModalOpen(true)} 
            />
            <div className='flex flex-col justify-around gap-4'>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                {packageResponse.results.map((pkg) => (
                  <div key={pkg.id}>
                    <LargeCard 
                      id={pkg.id}
                      name={pkg.name}
                      tag=""
                      tagType="available"
                      price={pkg.price}
                      button={['Edit', 'Delete']}
                      max_branches={pkg.max_branches}
                      max_owners={pkg.max_owners}
                      max_users={pkg.max_users}
                      description={pkg.description}
                      billing_cycle_days={pkg.billing_cycle_days}
                      onEditClick={() => handleEditClick(pkg)}
                      onDeleteClick={() => handleDelete(pkg.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Pagination
              currentPage={page}
              totalItems={packageResponse.count}
              itemsPerPage={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
              hasNext={!!packageResponse.next}
              hasPrevious={!!packageResponse.previous}
            />
          </div>
        )}

        {/* Create Package Modal */}
        {isCreateModalOpen && (
            <ReusableForm
              fields={formFields}
              endpoint="/api/superadmin/packages/"
              method="post"
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={handleCreateSuccess}
              submitButtonText="Create Package"
              key="create-form"
            />
      )}

      {isEditModalOpen && editingPackage && (
        <Dialog 
          open={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPackage(null);
          }} 
          maxWidth="sm" 
          fullWidth
        >
          <IconButton
            aria-label="close"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingPackage(null);
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
              fields={formFields}
              endpoint={`/api/superadmin/packages/${editingPackage.id}/`}
              method="put"
              initialValues={{
                ...editingPackage,
                max_branches: String(editingPackage.max_branches),
                max_owners: String(editingPackage.max_owners),
                max_users: String(editingPackage.max_users),
                price: String(editingPackage.price),
                billing_cycle_days: String(editingPackage.billing_cycle_days)
              }}
              onClose={() => {
                setIsEditModalOpen(false);
                setEditingPackage(null);
              }}
              onSuccess={handleEditSuccess}
              submitButtonText="Update Package"
              key={`edit-form-${editingPackage.id}`}
            />
        </Dialog>
      )}
      </div>
    </div>
  );
}