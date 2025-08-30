
const dropdownContent = {
  management: ['Business Management','User Management', 'Branches Management', 'Package Management'],
  settings: ['Business', 'Branches', 'Payment Methods', 'Tax Rates', 'Currencies'],
  contacts: ['Customers', 'Suppliers']
} as const;

type DropdownContentKeys = keyof typeof dropdownContent;

interface MinNavProps {
  navItems: DropdownContentKeys;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MinNav({ 
  navItems, 
  activeTab, 
  onTabChange 
}: MinNavProps) {
  const items = dropdownContent[navItems];

  return (
    <div>
        <div className='top-16 left-0 sticky right-0 z-40 mt-8'>
          <div className="max-w-screen-xl mx-auto">
            <div className='flex flex-wrap md-nowrap items-center justify-center space-x-12 h-16 border-b border-gray-200'> 
            {items.map((item, index) => (
              <div 
                key={index}
                className='flex items-center cursor-pointer'
                onClick={() => onTabChange(item)}
              >
                <span className={`text-sm font-medium capitalize pb-3 px-6 ${activeTab === item 
                  ? 'text-black border-b-1 border-primary' 
                  : 'text-gray-500 hover:text-primary'}`}>
                  {item}
                </span>
              </div>
            ))}
            </div>
          </div>
        </div>
    </div>
  )
}