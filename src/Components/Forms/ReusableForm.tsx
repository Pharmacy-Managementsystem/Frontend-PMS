// ReusableForm.tsx
import { useForm } from 'react-hook-form';
import { useMutate } from '../../Hook/API/useApiMutate';
import { useEffect, useState } from 'react';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';

interface FormField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}

interface ReusableFormProps {
  fields: FormField[];
  endpoint: string;
  method: 'post' | 'put' | 'patch';
  onSuccess?: <T = unknown>(data: T) => void;
  onClose?: () => void;
  submitButtonText?: string;
  initialValues?: Record<string, string | number | boolean | null | undefined>;
}

export default function ReusableForm({
  fields,
  endpoint,
  method,
  onSuccess,
  onClose,
  submitButtonText = 'Submit',
  initialValues = {}
}: ReusableFormProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: initialValues
  });

  // Reset form when initialValues change
  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const { mutate, isLoading, errorMessage } = useMutate({
    endpoint,
    method,
    onSuccess
  });

  const onSubmit = (data: Record<string, unknown>) => {
    const formData: Record<string, string | number | File> = {};
    
    fields.forEach(field => {
      const value = data[field.name];
      
      if (value !== undefined && value !== null) {
        if (field.type === 'number') {
          formData[field.name] = typeof value === 'number' ? value : Number(value);
        } else if (field.type === 'file') {
          // Handle file uploads if needed
          if (value instanceof FileList && value.length > 0) {
            formData[field.name] = value[0];
          }
        } else if (typeof value === 'string' || typeof value === 'number') {
          formData[field.name] = value;
        } else if (field.required) {
          formData[field.name] = field.type === 'number' ? 0 : '';
        }
      } else if (field.required) {
        formData[field.name] = field.type === 'number' ? 0 : '';
      }
    });
    
    console.log('Submitting form data:', formData);
    mutate(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue('logo', file as any, { shouldValidate: true });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = e.target.value;
    if (value === '' || !isNaN(Number(value))) {
      setValue(fieldName, value, { shouldValidate: true });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100">
        {submitButtonText.includes('Create') ? 'Create New Package' : 'Edit Package'}
      </h2>
      <X onClick={onClose} className="absolute top-4 right-4 cursor-pointer" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div 
              key={field.name} 
              className={field.name === 'description' ? 'md:col-span-2' : ''}
            >
              {field.name === 'logo' ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required }
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer">
                        <div className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          {previewImage ? 'Change' : 'Upload'}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[field.name]?.message?.toString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.name === 'description' ? (
                    <textarea
                      id={field.name}
                      rows={4}
                      className={`block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        errors[field.name] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      {...register(field.name, { 
                        required: field.required ? `${field.label} is required` : false
                      })}
                    />
                  ) : (
                    <input
                      id={field.name}
                      type={field.type || 'text'}
                      className={`block w-full rounded-md shadow-sm sm:text-sm  p-5 ${
                        errors[field.name] 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      {...register(field.name, { 
                        required: field.required ? `${field.label} is required` : false,
                        valueAsNumber: field.type === 'number',
                        validate: (value) => {
                          if (field.required && !value && value !== 0) {
                            return `${field.label} is required`;
                          }
                          if (field.type === 'number' && isNaN(Number(value)) && field.required) {
                            return 'Please enter a valid number';
                          }
                          return true;
                        }
                      })}
                      onChange={(e) => {
                        if (field.type === 'number') {
                          handleNumberChange(e, field.name);
                        }
                      }}
                    />
                  )}
                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[field.name]?.message?.toString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 mt-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Processing...
              </>
            ) : (
              submitButtonText
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}