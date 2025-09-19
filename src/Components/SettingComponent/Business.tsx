import React, { useMemo, useState } from 'react';
import { useForm } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Image } from 'lucide-react';
import { useMutate } from '../../Hook/API/useApiMutate';
import { useGet } from '../../Hook/API/useApiGet';
import { jwtDecode } from 'jwt-decode';



interface BusinessDetailsResponse {
  id: number;
  name: string;
  logo?: string;
  website?: string;
  contact_number?: string;
  alternate_contact_number?: string;
  package?: number;
  package_name?: string;
  subscription_status?: 'active' | 'expired' | 'cancelled' | 'suspended' | 'pending';
  owner_user_id?: number;
  owner_user_email?: string;
  owner_user_username?: string;
  owner_user_phone_number?: string;
  owner_user_address?: string;
}

// Schema with proper type inference
const businessSchema = z.object({
  user_id: z.number().optional(),
  name: z.string().min(1, "Business name is required"),
  contact_number: z.string().min(1, "Contact number is required"),
  alternate_contact_number: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal('')),
  logo: z.instanceof(File).optional(),
  package: z.number().min(1, "Package selection is required"),
  currency: z.number().optional().default(0),
  subscription_status: z.string().optional(),
  owner: z.object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone_number: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
  }),
  branch: z.object({
    name: z.string().min(1, "Branch name is required"),
    address: z.string().min(1, "Branch address is required"),
    contact_number: z.string().min(1, "Branch contact number is required"),
  }),
});

// Type inferred from the schema
type BusinessFormValues = z.infer<typeof businessSchema>;

const Business = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Read current user_id from access token
  const currentUserId = useMemo(() => {
    try {
      const token = localStorage.getItem('access');
      if (!token) return undefined;
      const decoded = jwtDecode<{ user_id?: string | number }>(token);
      const id = decoded?.user_id;
      return typeof id === 'string' ? Number(id) : id;
    } catch {
      return undefined;
    }
  }, []);

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema) as unknown as Resolver<BusinessFormValues, unknown>,
    defaultValues: {
      user_id: currentUserId,
      name: '',
      contact_number: '',
      package: 0,
      currency: 0,
      owner: {
        email: '',
        username: '',
        password: '',
        phone_number: '',
        address: ''
      },
      branch: {
        name: '',
        address: '',
        contact_number: ''
      }
    }
  });

  // Business details for current user
  const { data: businessDetails } = useGet<BusinessDetailsResponse>({
    endpoint: `/api/superadmin/all-businesses/${currentUserId ?? ''}/`,
    queryKey: ['business-details', currentUserId],
    enabled: Boolean(currentUserId),
  });

  // Packages list for the select
  // const { data: packagesList } = useGet<PackageResponse>({
  //   endpoint: '/api/superadmin/packages/',
  //   queryKey: ['packages'],
  // });

  // ✅ specify النوع
  const { mutate } = useMutate<BusinessFormValues>({
    endpoint: `/api/business/settings/business/${currentUserId ?? ''}/`,
    method: 'patch',
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset } = form;

  // Populate form when details arrive
  React.useEffect(() => {
    if (!businessDetails) return;
    reset({
      user_id: currentUserId,
      name: businessDetails.name || '',
      contact_number: businessDetails.contact_number || '',
      alternate_contact_number: businessDetails.alternate_contact_number || '',
      website: businessDetails.website || '',
      package: businessDetails.package ?? 0,
      currency: 0,
      subscription_status: businessDetails.subscription_status,
      owner: {
        email: businessDetails.owner_user_email || '',
        username: businessDetails.owner_user_username || '',
        password: '',
        phone_number: businessDetails.owner_user_phone_number || '',
        address: businessDetails.owner_user_address || '',
      },
      branch: {
        name: '',
        address: '',
        contact_number: '',
      },
    })
    if (businessDetails.logo) {
      setLogoPreview(businessDetails.logo)
    }
  }, [businessDetails, currentUserId, reset])

  const onSubmit: SubmitHandler<BusinessFormValues> = (data) => {
    if (!currentUserId) {
      console.error('Missing user id in token');
      return;
    }
    const payload = { ...data, user_id: currentUserId } as BusinessFormValues & { user_id?: number };
    mutate(payload as unknown as Record<string, unknown>);
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

  return (
    <div className='flex flex-col gap-6'>
      <h1 className='text-title font-bold text-2xl'>Create New Business</h1>
      
       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Business Information Section */}
        <div className="bg-white p-6 ">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Business Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                {...register('name')}
                type="text"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
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
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.contact_number 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.website 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
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
              <select
                {...register('package', { valueAsNumber: true })}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.package 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="">Select a package</option>
                {/* {packagesList?.results?.map((pak) => (
                  <option key={pak.id} value={pak.id}>
                    {pak.name}
                  </option>
                ))} */}
              </select>
              {errors.package && (
                <p className="text-red-500 text-xs mt-1">{errors.package.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Status
              </label>
              <select
                {...register('subscription_status')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Logo
            </label>
            <div className="flex items-center">
              <div className="relative">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Business Logo" 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-300" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                    <Image className="text-gray-500 w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="ml-4">
                <button
                  type="button"
                  onClick={() => document.getElementById("logoUploadInput")?.click()}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
                >
                  Upload Logo
                </button>
                <label htmlFor="logoUploadInput" className="sr-only">
                  Upload business logo
                </label>
                <input
                  id="logoUploadInput"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  aria-label="Upload business logo"
                />
              </div>
            </div>
          </div>
        <div className=" mt-3 ">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Owner Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                {...register('owner.email')}
                type="email"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.owner?.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter owner email"
              />
              {errors.owner?.email && (
                <p className="text-red-500 text-xs mt-1">{errors.owner.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                {...register('owner.username')}
                type="text"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.owner?.username 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter username"
              />
              {errors.owner?.username && (
                <p className="text-red-500 text-xs mt-1">{errors.owner.username.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                {...register('owner.password')}
                type="password"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.owner?.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter password"
              />
              {errors.owner?.password && (
                <p className="text-red-500 text-xs mt-1">{errors.owner.password.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                {...register('owner.phone_number')}
                type="text"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.owner?.phone_number 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter phone number"
              />
              {errors.owner?.phone_number && (
                <p className="text-red-500 text-xs mt-1">{errors.owner.phone_number.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                {...register('owner.address')}
                type="text"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.owner?.address 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter address"
              />
              {errors.owner?.address && (
                <p className="text-red-500 text-xs mt-1">{errors.owner.address.message}</p>
              )}
            </div>
          </div>
          </div>
          <div className=" mt-3">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Branch Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name *
              </label>
              <input
                {...register('branch.name')}
                type="text"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.branch?.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter branch name"
              />
              {errors.branch?.name && (
                <p className="text-red-500 text-xs mt-1">{errors.branch.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                {...register('branch.contact_number')}
                type="text"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.branch?.contact_number 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter branch contact number"
              />
              {errors.branch?.contact_number && (
                <p className="text-red-500 text-xs mt-1">{errors.branch.contact_number.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Address *
              </label>
              <input
                {...register('branch.address')}
                type="text"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.branch?.address 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter branch address"
              />
              {errors.branch?.address && (
                <p className="text-red-500 text-xs mt-1">{errors.branch.address.message}</p>
              )}
            </div>
          </div>
        </div>
        </div>
        
        
        
        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
          >
            Clear
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Create Business
          </button>
        </div>
      </form>
    </div>
  );
};

export default Business;