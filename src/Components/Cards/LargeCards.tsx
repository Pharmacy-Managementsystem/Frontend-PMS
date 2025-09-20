import { Check, Edit, Trash2 } from 'lucide-react'

interface LargeCardProps {
  name: string;
  tag: string;
  tagType: string;
  price: number;
  button: string[];
  id: number;
  max_branches: number;
  max_owners: number;
  max_users: number;
  description: string;
  billing_cycle_days: number;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

export default function LargeCard({
  name,
  price,
  button,
  id,
  max_branches,
  max_owners,
  max_users,
  description,
  billing_cycle_days,
  onEditClick,
  onDeleteClick
}: LargeCardProps) {
  
 

  const getButtonIcon = (btnText: string) => {
    switch(btnText.toLowerCase()) {
      case 'edit':
        return <Edit size={16} />;
      case 'delete':
        return <Trash2 size={16} />;
      default:
        return null;
    }
  }

  const getButtonStyle = (btnText: string) => {
    if (btnText.toLowerCase() === 'delete') {
      return "flex items-center  gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-sm transition-colors";
    }
    return "flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm transition-colors";
  }

  const handleButtonClick = (btnText: string) => {
    switch(btnText.toLowerCase()) {
      case 'edit':
        onEditClick?.();
        break;
      case 'delete':
        onDeleteClick?.();
        break;
      default:
        break;
    }
  }

  return (
    
    <div key={id} className="h-full">
      <article className="flex  justify-between h-full bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 w-full">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200`}>
                    {description}
                  </span>
                
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-4">{price}</p>
            </div>
          </div>
          <ul className="space-y-3  text-sm text-gray-700">
              <li  className="flex items-start gap-2">
                <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>{max_owners} Owners</span>
                </li>
              <li  className="flex items-start gap-2">
                <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>{max_branches} Branches</span>
            </li>
              <li  className="flex items-start gap-2">
                <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>{max_users} Users</span>
            </li>
              <li  className="flex items-start gap-2">
                <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>{billing_cycle_days} Billing Cycle</span>
            </li>
              <li  className="flex items-start gap-2">
                <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>{description}</span>
             </li>
          </ul>
        </div>

        <div className="flex items-start  gap-2 ">
          {button.map((btn, index) => (
            <button 
              key={index}
              className={`${getButtonStyle(btn)} cursor-pointer `}
              onClick={() => handleButtonClick(btn)}
            >
              {getButtonIcon(btn)}
              <span>{btn}</span>
            </button>
          ))}
        </div>
      </article>
    </div>
  )
}