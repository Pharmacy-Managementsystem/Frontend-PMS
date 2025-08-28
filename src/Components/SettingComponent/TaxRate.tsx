import { DataTable } from '../Table/DataTable';
import { TableHeader } from '../Table/TableHeader';
import { TableRow } from '../Table/TableRow';

const TaxRate = () => {
  // Sample data - in real app this would come from API
  const taxRates = [
    {
      id: '1',
      'Tax Name': 'Standard VAT',
      'Rate %': '20%',
      'Is Default': true,
      'Applies To': 'Sales & Purchases',
      Status: 'Active'
    },
    {
      id: '2',
      'Tax Name': 'Reduced Rate',
      'Rate %': '5%',
      'Is Default': false,
      'Applies To': 'Sales Only',
      Status: 'Active'
    },
    {
      id: '3',
      'Tax Name': 'Zero Rate',
      'Rate %': '0%',
      'Is Default': false,
      'Applies To': 'Specific Products',
      Status: 'Active'
    },
    {
      id: '4',
      'Tax Name': 'Exempt',
      'Rate %': '0%',
      'Is Default': false,
      'Applies To': 'Specific Products',
      Status: 'Inactive'
    }
  ];

  const columns = ['Tax Name', 'Rate %', 'Is Default', 'Applies To', 'Status'];

  const handleAddTax = () => {
    console.log('Add new tax rate');
  };

  const handleEditTax = (id: string) => {
    console.log('Edit tax rate:', id);
  };

  const handleToggleStatus = (id: string) => {
    console.log('Toggle status for:', id);
  };

  return (
    <div className="container mx-auto">
       <TableHeader
            title="Tax Rates"
            buttonText="Add New Tax Rate"
            onAddClick={handleAddTax}
            />
      <DataTable
        columns={columns}
        data={taxRates}
        RowComponent={TableRow}
        onEdit={handleEditTax}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default TaxRate;