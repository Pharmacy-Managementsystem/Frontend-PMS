import { DataTable } from '../Table/DataTable';
import { TableHeader } from '../Table/TableHeader';
import { TableRow } from '../Table/TableRow';

const PaymentMethods = () => {
  // Sample data - in real app this would come from API
  const PaymentMethods = [
    {
      id: '1',
      'Method Name': 'Credit Card',
      Provider: 'Visa',
      'Transaction Fee': '2.5%',
      'Is Default': true,
      Status: 'Active'
    },
    {
      id: '2',
      'Method Name': 'PayPal',
      Provider: 'PayPal Inc.',
      'Transaction Fee': '3.0%',
      'Is Default': false,
      Status: 'Active'
    },
    {
      id: '3',
      'Method Name': 'Bank Transfer',
      Provider: 'SWIFT',
      'Transaction Fee': '1.0%',
      'Is Default': false,
      Status: 'Inactive'
    }
  ];

  const columns = ['Method Name', 'Provider', 'Transaction Fee', 'Is Default', 'Status'];

  const handleAddMethod = () => {
    console.log('Add new payment method');
  };

  const handleEditMethod = (id: string) => {
    console.log('Edit payment method:', id);
  };

  const handleToggleStatus = (id: string) => {
    console.log('Toggle status for:', id);
  };

  return (
    <div className="container mx-auto">
      <TableHeader
        title="Payment Methods"
        buttonText="Add New Payment Method" 
        onAddClick={handleAddMethod}
      />
      <DataTable
        columns={columns}
        data={PaymentMethods}
        RowComponent={TableRow}
        onEdit={handleEditMethod}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default PaymentMethods;