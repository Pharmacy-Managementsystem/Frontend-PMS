import { DataTable } from '../Table/DataTable';
import { TableHeader } from '../Table/TableHeader';
import { TableRow } from '../Table/TableRow';

const Suppliers = () => {
  const Suppliers = [
    {
      id: '1',
      'Supplier Name': 'ABC Pharmaceuticals',
      'Contact Person': 'John Miller',
      'Phone': '+1 (555) 123-4567',
      'Email': 'john.miller@abcpharma.com'
    },
    {
      id: '2',
      'Supplier Name': 'MediSupply Co.',
      'Contact Person': 'Sarah Williams',
      'Phone': '+1 (555) 234-5678',
      'Email': 'sarah@medisupply.com'
    },
    {
      id: '3',
      'Supplier Name': 'Global Health Products',
      'Contact Person': 'Ahmed Hassan',
      'Phone': '+20 (100) 123-4567',
      'Email': 'ahmed@ghp.com'
    },
    {
      id: '4',
      'Supplier Name': 'PharmaWholesale Inc.',
      'Contact Person': 'Maria Garcia',
      'Phone': '+1 (555) 345-6789',
      'Email': 'maria@pharmawholesale.com'
    },
    {
      id: '5',
      'Supplier Name': 'MedTech Solutions',
      'Contact Person': 'Robert Johnson',
      'Phone': '+1 (555) 456-7890',
      'Email': 'robert@medtechsolutions.com'
    }
  ];

  const columns = ['Supplier Name', 'Contact Person', 'Phone', 'Email'];

  const handleAddSupplier = () => {
    console.log('Add new Supplier');
  };

  const handleEditSupplier = (id: string) => {
    console.log('Edit Supplier :', id);
  };

  const handleToggleStatus = (id: string) => {
    console.log('Toggle status for:', id);
  };

  return (
    <div className="container mx-auto">
      <TableHeader
        title="Suppliers"
        buttonText="Add New Supplier" 
        onAddClick={handleAddSupplier}
      />
      <DataTable
        columns={columns}
        data={Suppliers}
        RowComponent={TableRow}
        onEdit={handleEditSupplier}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default Suppliers;