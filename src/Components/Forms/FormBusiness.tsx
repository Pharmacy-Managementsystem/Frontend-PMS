import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Image, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useMutate } from '../../Hook/API/useApiMutate';
import { useGet } from '../../Hook/API/useApiGet';

interface Package {
  id: number;
  name: string;
}

interface PackageResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Package[];
}

interface BusinessResponse {
  id: number;
  name: string;
  contact_number: string;
  alternate_contact_number?: string;
  website?: string;
  package: number;
  package_name?: string; // Add package name field
  currency?: number;
  subscription_status?: string;
  owner_user_email: string;
  owner_user_username: string;
  owner_user_phone_number: string;
  owner_user_address: string;
  branch_name: string;
  branch_address: string;
  branch_contact_number: string;
}

// Schema - package not required in edit mode
const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  contact_number: z.string().min(1, "Contact number is required"),
  alternate_contact_number: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal('')),
  logo: z.instanceof(File).optional(),
  package: z.number().optional(), // Make optional for edit mode
  subscription_status: z.string().optional(),
  owners: z.array(z.object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    phone_number: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
  })).min(1, "At least one owner is required"),
  
});


type BusinessFormValues = z.infer<typeof businessSchema>;

interface FormBusinessProps {
  businessId?: string | null;
  onBack: () => void;
  mode: 'add' | 'edit';
}

const FormBusiness: React.FC<FormBusinessProps> = ({ businessId, onBack, mode }) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema) as unknown as Resolver<BusinessFormValues, unknown>,
    defaultValues: {
      name: '',
      contact_number: '',
      package: 0,
      owners: [{ email: '', username: '', password: '', phone_number: '', address: '' }],
    }
  });

const { data: packageResponse } = useGet<PackageResponse>({
  endpoint: `/api/superadmin/packages/`,
  queryKey: ['packages'],
  enabled: mode === 'add',
});


  // Get business data if editing
  const { data: businessData, isLoading: isLoadingBusiness } = useGet<BusinessResponse>({
    endpoint: businessId ? `/api/superadmin/all-businesses/${businessId}/` : '',
    queryKey: ['business', businessId],
    enabled: !!businessId && mode === 'edit',
  });

  // Create business mutation
  const { mutate: createBusiness, isLoading: isCreating } = useMutate<BusinessFormValues>({
    endpoint: '/api/superadmin/all-businesses/',
    method: 'post',
    onSuccess: () => {
      onBack();
    },
  });

  // Update business mutation
  const { mutate: updateBusiness, isLoading: isUpdating } = useMutate<BusinessFormValues>({
    endpoint: businessId ? `/api/business/settings/business/${businessId}/` : '',
    method: 'patch',
    onSuccess: () => {
      onBack();
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset, control } = form;

  const { fields: ownerFields, append: appendOwner, remove: removeOwner } = useFieldArray({
    control,
    name: "owners"
  });



  // Load business data when editing
  useEffect(() => {
    if (businessData && mode === 'edit') {
      setValue('name', businessData.name);
      setValue('contact_number', businessData.contact_number);
      setValue('alternate_contact_number', businessData.alternate_contact_number || '');
      setValue('website', businessData.website || '');
      setValue('package', businessData.package);
      setValue('subscription_status', businessData.subscription_status || '');
      
      // Set owner data
      setValue('owners', [{
        email: businessData.owner_user_email,
        username: businessData.owner_user_username,
        phone_number: businessData.owner_user_phone_number,
        address: businessData.owner_user_address,
        password: undefined
      }]);
      
      
    }
  }, [businessData, mode, setValue]);

 const onSubmit: SubmitHandler<BusinessFormValues> = (data) => {
  console.log("Form submitted:", data);
  
  if (mode === 'edit') {
    // For edit mode, exclude owner data entirely
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { owners, ...businessData } = data;
    updateBusiness(businessData);
  } else {
    // For add mode, include owner data
    const apiData = {
      ...data,
      owner: data.owners[0], // Take first owner
    };
    // Remove owners property safely
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { owners, ...finalData } = apiData;
    createBusiness(finalData);
  }
};
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue('logo', file);
      
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    reset();
    setLogoPreview(null);
  };

  if (isLoadingBusiness) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Simple Header */}
      <div className="flex items-center gap-4">
        {mode === 'add' && (<button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>)}
        <h1 className='text-2xl font-bold text-gray-900'>
          {mode === 'add' ? 'Create New Business' : 'Update Business'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Business Information Section */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Business Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter business name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                {...register('contact_number')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter contact number"
              />
              {errors.contact_number && (
                <p className="text-red-500 text-xs mt-1">{errors.contact_number.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alternate Contact Number
              </label>
              <input
                {...register('alternate_contact_number')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter alternate contact number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                {...register('website')}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package *
              </label>
              {mode === 'edit' ? (
                // Display package name in edit mode (read-only)
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                  {businessData?.package_name || 'No package assigned'}
                </div>
              ) : (
                // Show select dropdown in create mode
                <select
                  {...register('package', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a package</option>
                  {packageResponse?.results?.map((pak) => (
                    <option key={pak.id} value={pak.id}>
                      {pak.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.package && mode === 'add' && (
                <p className="text-red-500 text-xs mt-1">{errors.package.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Status
              </label>
              {mode === 'edit' ? (
                // Display package name in edit mode (read-only)
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                  {businessData?.subscription_status || '-'}
                </div>
              ) : (
              <select
                {...register('subscription_status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                <option value="">Select a status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
                </select>
              )}
            </div>
          </div>
          
          {/* Logo Upload */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Business Logo" 
                    className="w-16 h-16 rounded-lg object-cover border border-gray-300" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <Image className="text-gray-400 w-6 h-6" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => document.getElementById("logoUploadInput")?.click()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border"
              >
                Upload Logo
              </button>
              <input
                id="logoUploadInput"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
        
        {/* Owners Section */}
        {mode === 'add' && (

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Owners Information</h2>
              <button
                type="button"
                onClick={() => appendOwner({ email: '', username: '', password: '', phone_number: '', address: '' })}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Owner
              </button>
            </div>
          
            <div className="space-y-6">
              {ownerFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-700">Owner #{index + 1}</h3>
                    {ownerFields.length > 1 && (
                      <button
                        type="button"
                        title="Remove Owner"
                        onClick={() => removeOwner(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        {...register(`owners.${index}.email`)}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter owner email"
                      />
                      {errors.owners?.[index]?.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.owners[index]?.email?.message}</p>
                      )}
                    </div>
                  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                      </label>
                      <input
                        {...register(`owners.${index}.username`)}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter username"
                      />
                      {errors.owners?.[index]?.username && (
                        <p className="text-red-500 text-xs mt-1">{errors.owners[index]?.username?.message}</p>
                      )}
                    </div>
                  
                    {mode === 'add' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <input
                          {...register(`owners.${index}.password`)}
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter password"
                        />
                        {errors.owners?.[index]?.password && (
                          <p className="text-red-500 text-xs mt-1">{errors.owners[index]?.password?.message}</p>
                        )}
                      </div>
                    )}
                  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        {...register(`owners.${index}.phone_number`)}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter phone number"
                      />
                      {errors.owners?.[index]?.phone_number && (
                        <p className="text-red-500 text-xs mt-1">{errors.owners[index]?.phone_number?.message}</p>
                      )}
                    </div>
                  
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <input
                        {...register(`owners.${index}.address`)}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter address"
                      />
                      {errors.owners?.[index]?.address && (
                        <p className="text-red-500 text-xs mt-1">{errors.owners[index]?.address?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {mode === 'add' && (<button 
            type="button" 
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
          >
            Clear
          </button>)}
          <button 
            type="submit" 
            disabled={isCreating || isUpdating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating || isUpdating ? 'Processing...' : mode === 'add' ? 'Create Business' : 'Update Business'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormBusiness;