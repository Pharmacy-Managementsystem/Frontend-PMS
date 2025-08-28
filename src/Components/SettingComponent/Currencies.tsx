import { DataTable } from '../Table/DataTable';
import { TableHeader } from '../Table/TableHeader';
import { TableRow } from '../Table/TableRow';

const Currencies = () => {
  // Sample data - in real app this would come from API
  const Currencies = [
    {
      id: '1',
      'Currency Name': 'US Dollar',
      'Currency Code': 'USD',
      Symbol: '$',
      'Exchange Rate': 1,
      'Is Default': true,
      Status: 'Active'
    },
    {
      id: '2',
      'Currency Name': 'Euro',
      'Currency Code': 'EUR',
      Symbol: '€',
      'Exchange Rate': 0.91,
      'Is Default': false,
      Status: 'Active'
    },
    {
      id: '3',
      'Currency Name': 'British Pound',
      'Currency Code': 'GBP',
      Symbol: '£',
      'Exchange Rate': 0.78,
      'Is Default': false,
      Status: 'Active'
    },
    {
      id: '4',
      'Currency Name': 'Japanese Yen',
      'Currency Code': 'JPY',
      Symbol: '¥',
      'Exchange Rate': 147.52,
      'Is Default': false,
      Status: 'Inactive'
    }
  ];

  const columns = ['Currency Name', 'Currency Code', 'Symbol', 'Exchange Rate', 'Is Default', 'Status'];

  const handleAddCurrency = () => {
    console.log('Add new currency');
  };

  const handleEditCurrency = (id: string) => {
    console.log('Edit currency:', id);
  };

  const handleToggleStatus = (id: string) => {
    console.log('Toggle status for:', id);
  };

  return (
    <div className="container mx-auto">
      <TableHeader
        title="Currencies"
        buttonText="Add New Currency"
        onAddClick={handleAddCurrency}
      />
      
      <DataTable
        columns={columns}
        data={Currencies}
        RowComponent={TableRow}
        onEdit={handleEditCurrency}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default Currencies;