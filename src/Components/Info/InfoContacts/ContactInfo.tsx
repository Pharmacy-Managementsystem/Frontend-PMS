import { ArrowLeft } from "lucide-react";
import { useGet } from "../../../Hook/API/useApiGet";

interface ContactData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  business?: number;
  cr?: string;
  land_line?: string;
  tax_number?: string;
  total_due_amount?: number;
  created_at?: string;
  modified_at?: string;
  created_by?: number;
  modified_by?: number | null;
  is_active?: boolean;
  mailline?: string;
  tax_name?: string;
  idc?: string;
  idc_attachment?: string | null;
  custom_fields?: any[];
}

// تغيير واجهة DataResponse لتعكس الهيكل الفعلي للبيانات
// type DataResponse = ContactData; // أو إزالة الواجهة تماماً

export default function ContactInfo({ contactInfo, title, onClose }: { contactInfo: any, title: string, onClose: () => void }) {
  const { data: contactData, isLoading, error } = useGet<ContactData>({ // استخدام ContactData مباشرة
    endpoint: `/api/${title}/${contactInfo}/`,
    queryKey: [title, contactInfo],
  });

  console.log("Contact Data:", contactData); // للت debugging
  
  // استخراج الحروف الأولى من الاسم لعرضها في الصورة الرمزية
  const getInitials = (name: string) => {
    if (!name) return "NA";
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading data</div>;

  const contact = contactData; // استخدام contactData مباشرة دون .data

  return (
    <div>
      {onClose && (
        <div className="flex items-center">
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={`Back to ${title}`}
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" /> 
          </button>
          <h1 className='text-sm text-gray-500'>Back to {title}</h1>
        </div>
      )}
      
      <div className="w-full flex flex-col h-full">
        <div className="relative mb-8">
          <div className="absolute inset-x-0 top-16 h-28 bg-blue-50 bg-opacity-10 rounded-xl" />
          <div className="relative flex flex-col items-center pt-2">
            <div className="w-25 h-25 bg-blue-600 rounded-full flex items-center justify-center z-10">
              <span className="text-white text-3xl font-medium">
                {getInitials(contact?.name || "")}
              </span>
            </div>
            <h2 className="text-lg py-2 font-bold text-gray-900">{contact?.name || "No Name"}</h2>
          </div>
        </div>

        <div className="shadow flex flex-col w-full bg-white rounded-lg">
          <div className="w-full bg-bgtitle p-2 rounded-t-lg">
            <h2 className="text-lg py-2 font-medium text-gray-900">Basic Information</h2>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-gray-900">{contact?.email || "N/A"}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="text-gray-900">{contact?.phone || "N/A"}</p>
              </div>

              {contact?.land_line && (
                <div>
                  <label className="text-sm text-gray-500">Land Line</label>
                  <p className="text-gray-900">{contact.land_line}</p>
                </div>
              )}
              
              {contact?.address && contact.address !== "string" && (
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="text-gray-900">{contact.address}</p>
                </div>
              )}
              
              {/* حقول خاصة بـ supplier */}
              {title === 'supplier' && (
                <>
                  {contact?.tax_number && contact.tax_number !== "string" && (
                    <div>
                      <label className="text-sm text-gray-500">Tax Number</label>
                      <p className="text-gray-900">{contact.tax_number}</p>
                    </div>
                  )}
                  
                  {contact?.cr && contact.cr !== "string" && (
                    <div>
                      <label className="text-sm text-gray-500">Commercial Registration</label>
                      <p className="text-gray-900">{contact.cr}</p>
                    </div>
                  )}

                  {contact?.total_due_amount !== undefined && (
                    <div>
                      <label className="text-sm text-gray-500">Total Due Amount</label>
                      <p className="text-gray-900">{contact.total_due_amount.toLocaleString()}</p>
                    </div>
                  )}
                </>
              )}
              
              {/* حقول خاصة بـ customer */}
              {title === 'customer' && contact?.idc && (
                <div>
                  <label className="text-sm text-gray-500">IDC</label>
                  <p className="text-gray-900">{contact.idc}</p>
                </div>
              )}
              
              {contact?.created_at && (
                <div>
                  <label className="text-sm text-gray-500">Created At</label>
                  <p className="text-gray-900">{new Date(contact.created_at).toLocaleDateString()}</p>
                </div>
              )}

              {contact?.modified_at && (
                <div>
                  <label className="text-sm text-gray-500">Last Modified</label>
                  <p className="text-gray-900">{new Date(contact.modified_at).toLocaleDateString()}</p>
                </div>
              )}
              
              {contact?.is_active !== undefined && (
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p className={`inline-block px-2 py-1 rounded text-xs ${contact.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {contact.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}