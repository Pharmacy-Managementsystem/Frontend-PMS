// ContactBaseInfo.tsx
import { ArrowLeft } from "lucide-react";
import { useGet } from "../../../Hook/API/useApiGet";
import { useState, useEffect } from "react";
import { useMutate } from "../../../Hook/API/useApiMutate";
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

// الأنواع المحددة بدقة
type FieldType = 'text' | 'textarea' | 'email' | 'number';

interface FieldConfig {
  label: string;
  type?: FieldType;
  required?: boolean;
}

interface AdditionalFields {
  [key: string]: FieldConfig;
}

interface BaseContactData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  cr?: string;
  land_line?: string;
  tax_number?: string;
  total_due_amount?: number;
  created_at?: string;
  modified_at?: string;
  created_by?: number;
  modified_by?: number | null;
  is_active?: boolean;
  created_by_name?: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface BaseContactInfoProps {
  contactId: string;
  title: string;
  onClose: () => void;
  contactType: 'supplier' | 'customer';
  additionalFields?: AdditionalFields;
}

export default function ContactBaseInfo({ 
  contactId, 
  title, 
  onClose, 
  contactType,
  additionalFields = {}
}: BaseContactInfoProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BaseContactData>>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  const { data: contactData, isLoading, error, refetch } = useGet<BaseContactData>({
    endpoint: `/api/${title}/${contactId}/`,
    queryKey: [title, contactId],
  });

  const { mutate: updateContact, isLoading: isUpdating } = useMutate<Record<string, unknown>>({
    endpoint: contactId ? `/api/${title}/${contactId}/` : '',
    method: 'patch',
    onSuccess: () => {
      setIsEditing(false);
      setHasChanges(false);
      refetch(); 
      queryClient.invalidateQueries({ queryKey: [`all-${contactType}s`] });
    },
   
  });

  const getInitials = (name: string) => {
    if (!name) return "NA";
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    if (contactData && !isEditing) {
      setFormData(contactData);
      setHasChanges(false);
    }
  }, [contactData, isEditing]);

  // Check for changes whenever formData changes
  useEffect(() => {
    if (contactData && isEditing) {
      const changesExist = Object.keys(formData).some(key => 
        formData[key] !== contactData[key]
      );
      setHasChanges(changesExist);
    }
  }, [formData, contactData, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(contactData || {});
    setHasChanges(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(contactData || {});
    setHasChanges(false);
  };

  const handleSave = () => {
    if (!formData || !contactData) return;

    const changedData: Partial<BaseContactData> = {};
    
    Object.keys(formData).forEach(key => {
      if (formData[key] !== contactData[key]) {
        changedData[key] = formData[key];
      }
    });
    
    if (Object.keys(changedData).length > 0) {
      updateContact(changedData);
    } else {
      setIsEditing(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      is_active: !prev.is_active
    }));
  };

  // Validate required fields
  const validateForm = () => {
    const requiredFields = ['name', 'email', 'phone'];
    return requiredFields.every(field => {
      const value = formData[field];
      return value !== undefined && value !== null && value !== '';
    });
  };

  const canSave = hasChanges && validateForm() && !isUpdating;

  if (isLoading) return <div className="p-4">{t('contactInfo.messages.loading')}</div>;
  if (error) return <div className="p-4 text-red-500">{t('contactInfo.messages.errorLoading')}</div>;

  const contact = isEditing ? formData : contactData;

  // الحقول الأساسية المشتركة
  const baseFields: AdditionalFields = {
    name: { 
      label: contactType === 'supplier' ? t('contactInfo.supplierName') : t('contactInfo.customerName'), 
      type: 'text', 
      required: true 
    },
    phone: { 
      label: t('contactInfo.phone'), 
      type: 'text', 
      required: true 
    },
    email: { 
      label: t('contactInfo.email'), 
      type: 'email', 
      required: true 
    },
    address: { 
      label: t('contactInfo.address'), 
      type: 'textarea' 
    },
    cr: { 
      label: t('contactInfo.commercialRegistration'), 
      type: 'text' 
    },
    land_line: { 
      label: t('contactInfo.landLine'), 
      type: 'text' 
    },
    tax_number: { 
      label: t('contactInfo.taxNumber'), 
      type: 'text' 
    },
  };

  // دالة لعرض الحقول الديناميكية
  const renderField = (fieldName: string, config: FieldConfig) => {
    const value = formData?.[fieldName] ?? contactData?.[fieldName] ?? "";
    
    if (isEditing) {
      if (config.type === 'textarea') {
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label={config.label}
            required={config.required}
          />
        );
      } else if (config.type === 'number') {
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => handleInputChange(fieldName, e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label={config.label}
            required={config.required}
          />
        );
      } else {
        return (
          <input
            type={config.type || 'text'}
            value={value as string}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label={config.label}
            required={config.required}
          />
        );
      }
    } else {
      const displayValue = value === null || value === undefined || value === '' ? t('contactInfo.messages.notAvailable') : value;
      return <p className="text-gray-900">{displayValue}</p>;
    }
  };

  return (
    <div>
      {onClose && (
        <div className="flex items-center">
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={t('contactInfo.backTo', { title })}
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" /> 
          </button>
          <h1 className='text-sm text-gray-500'>{t('contactInfo.backTo', { title })}</h1>
        </div>
      )}
      
      <div className="w-full flex flex-col h-full">
        <div className="relative mb-8">
          <div className="absolute inset-x-0 top-16 h-28 bg-blue-50 bg-opacity-10 rounded-xl" />
          <div className="relative flex flex-col items-center pt-2">
            <div className="w-25 h-25 bg-blue-600 rounded-full flex items-center justify-center z-10">
              <span className="text-white text-3xl font-medium">
                {getInitials(contact?.name as string || "")}
              </span>
            </div>
            <h2 className="text-lg py-2 font-bold text-gray-900">{contact?.name || t('contactInfo.messages.noName')}</h2>
          </div>
        </div>

        <div className="shadow flex flex-col w-full bg-white rounded-lg">
          <div className="w-full flex items-center justify-between bg-bgtitle p-2 rounded-t-lg">
            <h2 className="text-lg py-2 font-medium text-gray-900">{t('contactInfo.basicInformation')}</h2>
            <div className="flex items-center gap-3">
              {isEditing && contactType === 'supplier' ? (
                <button
                  onClick={handleToggleStatus}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    contact?.is_active 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {contact?.is_active ? t('contactInfo.status.active') : t('contactInfo.status.inactive')}
                </button>
              ) : contactType === 'supplier' && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  contact?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {contact?.is_active ? t('contactInfo.status.active') : t('contactInfo.status.inactive')}
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* العمود الأول - المعلومات الأساسية */}
              <div className="flex flex-col gap-2">
                {Object.entries(baseFields).slice(0, 4).map(([fieldName, config]) => (
                  <div key={fieldName} className={fieldName === 'address' ? 'md:col-span-2' : ''}>
                    <label className="text-sm text-gray-500">
                      {config.label}
                      {config.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(fieldName, config)}
                  </div>
                ))}
              </div>

              {/* العمود الثاني - المعلومات الإضافية */}
              <div className="flex flex-col gap-2">
                {Object.entries(baseFields).slice(4, 7).map(([fieldName, config]) => (
                  <div key={fieldName}>
                    <label className="text-sm text-gray-500">{config.label}</label>
                    {renderField(fieldName, config)}
                  </div>
                ))}
                
                {/* الحقول الإضافية الخاصة بكل نوع */}
                {Object.entries(additionalFields).map(([fieldName, config]) => (
                  <div key={fieldName}>
                    <label className="text-sm text-gray-500">{config.label}</label>
                    {renderField(fieldName, config)}
                  </div>
                ))}

                <div>
                  <label className="text-sm text-gray-500">{t('contactInfo.totalDueAmount')}</label>
                  <p className="text-gray-900">{contact?.total_due_amount || "0"}</p>
                </div>
              </div>

              {/* العمود الثالث - معلومات النظام */}
              <div className="flex flex-col gap-2">
                {contact?.created_at && (
                  <div>
                    <label className="text-sm text-gray-500">{t('contactInfo.createdAt')}</label>
                    <p className="text-gray-900">{new Date(contact.created_at).toLocaleDateString()}</p>
                  </div>
                )}

                {contact?.modified_at && (
                  <div>
                    <label className="text-sm text-gray-500">{t('contactInfo.lastModified')}</label>
                    <p className="text-gray-900">{new Date(contact.modified_at).toLocaleDateString()}</p>
                  </div>
                )}

                {contact?.created_by_name && (
                  <div>
                    <label className="text-sm text-gray-500">{t('contactInfo.createdBy')}</label>
                    <p className="text-gray-900">{contact.created_by_name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUpdating}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('contactInfo.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? t('contactInfo.saving') : t('contactInfo.saveChanges')}
            </button>
          </div>
        ) : (
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('contactInfo.editInfo', { type: t(`contactInfo.${contactType}`) })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}