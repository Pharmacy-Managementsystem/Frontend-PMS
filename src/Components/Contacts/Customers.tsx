import { DataTable } from '../Table/DataTable';
import { TableHeader } from '../Table/TableHeader';
import { TableRow } from '../Table/TableRow';

const Customers = () => {
  const Customers = [
    {
      id: '1',
      'Customer Name': 'Ben Smith',
      'Contact Number': '+1 (555) 123-4567',
      'Address': '123 Main St, Anytown, USA',
      'Total Purchases': '$2,350.75'
    },
    {
      id: '2',
      'Customer Name': 'Sarah Johnson',
      'Contact Number': '+1 (555) 234-5678',
      'Address': '456 Oak Ave, Somewhere, USA',
      'Total Purchases': '$1,875.25'
    },
    {
      id: '3',
      'Customer Name': 'Ahmed Hassan',
      'Contact Number': '+20 (100) 123-4567',
      'Address': '789 Nile St, Cairo, Egypt',
      'Total Purchases': '$3,420.00'
    },
    {
      id: '4',
      'Customer Name': 'Maria Garcia',
      'Contact Number': '+1 (555) 345-6789',
      'Address': '321 Elm St, Othertown, USA',
      'Total Purchases': '$950.50'
    },
    {
      id: '5',
      'Customer Name': 'John Doe',
      'Contact Number': '+1 (555) 456-7890',
      'Address': '654 Pine Rd, Somewhere, USA',
      'Total Purchases': '$5,120.30'
    }
  ];

  const columns = ['Customer Name', 'Contact Number', 'Address', 'Total Purchases'];

  const handleAddCustomer = () => {
    console.log('Add new Customer');
  };

  const handleEditCustomer = (id: string) => {
    console.log('Edit Customer :', id);
  };

  const handleToggleStatus = (id: string) => {
    console.log('Toggle status for:', id);
  };

  return (
    <div className="container mx-auto">
      <TableHeader
        title="Customers"
        buttonText="Add New Customer" 
        onAddClick={handleAddCustomer}
      />
      <DataTable
        columns={columns}
        data={Customers}
        RowComponent={TableRow}
        onEdit={handleEditCustomer}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default Customers;