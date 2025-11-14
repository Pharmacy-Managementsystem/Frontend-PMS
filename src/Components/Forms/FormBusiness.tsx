
// import React, { useState, useEffect } from 'react';
// import { useForm } from "react-hook-form";
// import type { SubmitHandler, Resolver } from "react-hook-form";
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { Image, ArrowLeft } from 'lucide-react';
// import { useMutate } from '../../Hook/API/useApiMutate';
// import { useGet } from '../../Hook/API/useApiGet';

// interface Package {
//   id: number;
//   name: string;
// }

// interface PackageResponse {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: Package[];
// }

// interface BusinessResponse {
//   id: number;
//   name: string;
//   contact_number: string;
//   alternate_contact_number?: string;
//   website?: string;
//   package: number;
//   currency?: number;
//   subscription_status?: string;
//   owner_user_email: string;
//   owner_user_username: string;
//   owner_user_phone_number: string;
//   owner_user_address: string;
//   branch_name: string;
//   branch_address: string;
//   branch_contact_number: string;
// }

// // Schema with proper type inference
// const businessSchema = z.object({
//   name: z.string().min(1, "Business name is required"),
//   contact_number: z.string().min(1, "Contact number is required"),
//   alternate_contact_number: z.string().optional(),
//   website: z.string().url("Invalid website URL").optional().or(z.literal('')),
//   logo: z.instanceof(File).optional(),
//   package: z.number().min(1, "Package selection is required"),
//   currency: z.number().optional().default(0),
//   subscription_status: z.string().optional(),
//   owner: z.object({
//     email: z.string().email("Invalid email address"),
//     username: z.string().min(1, "Username is required"),
//     password: z.string().min(6, "Password must be at least 6 characters").optional(),
//     phone_number: z.string().min(1, "Phone number is required"),
//     address: z.string().min(1, "Address is required"),
//   }),
//   branch: z.object({
//     name: z.string().min(1, "Branch name is required"),
//     address: z.string().min(1, "Branch address is required"),
//     contact_number: z.string().min(1, "Branch contact number is required"),
//   }),
// });

// // Type inferred from the schema
// type BusinessFormValues = z.infer<typeof businessSchema>;

// interface FormBusinessProps {
//   businessId?: string | null;
//   onBack: () => void;
//   mode: 'add' | 'edit';
// }

// const FormBusiness: React.FC<FormBusinessProps> = ({ businessId, onBack, mode }) => {
//   const [logoPreview, setLogoPreview] = useState<string | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);

//   const form = useForm<BusinessFormValues>({
//     resolver: zodResolver(businessSchema) as unknown as Resolver<BusinessFormValues, unknown>,
//     defaultValues: {
//       name: '',
//       contact_number: '',
//       package: 0,
//       currency: 0,
//       owner: {
//         email: '',
//         username: '',
//         password: '',
//         phone_number: '',
//         address: ''
//       },
//       branch: {
//         name: '',
//         address: '',
//         contact_number: ''
//       }
//     }
//   });

//   const { data: packageResponse } = useGet<PackageResponse>({
//     endpoint: `/api/superadmin/packages/`,
//     queryKey: ['packages'],
//   });

//   // Get business data if editing
//   const { data: businessData, isLoading: isLoadingBusiness } = useGet<BusinessResponse>({
//     endpoint: businessId ? `/api/superadmin/all-businesses/${businessId}/` : '',
//     queryKey: ['business', businessId],
//     enabled: !!businessId && mode === 'edit',
//   });

//   // Create business mutation
//   const { mutate: createBusiness, isLoading: isCreating } = useMutate<BusinessFormValues>({
//     endpoint: '/api/superadmin/all-businesses/',
//     method: 'post',
//     onSuccess: () => {
//       onBack();
//     },
//   });

//   // Update business mutation
//   const { mutate: updateBusiness, isLoading: isUpdating } = useMutate<BusinessFormValues>({
//     endpoint: businessId ? `/api/superadmin/all-businesses/${businessId}/` : '',
//     method: 'patch',
//     onSuccess: () => {
//       onBack();
//     },
//   });

//   const { register, handleSubmit, formState: { errors }, setValue, reset } = form;

//   // Load business data when editing
//   useEffect(() => {
//     if (businessData && mode === 'edit') {
//       setValue('name', businessData.name);
//       setValue('contact_number', businessData.contact_number);
//       setValue('alternate_contact_number', businessData.alternate_contact_number || '');
//       setValue('website', businessData.website || '');
//       setValue('package', businessData.package);
//       setValue('currency', businessData.currency || 0);
//       setValue('subscription_status', businessData.subscription_status || '');
//       setValue('owner.email', businessData.owner_user_email);
//       setValue('owner.username', businessData.owner_user_username);
//       setValue('owner.phone_number', businessData.owner_user_phone_number);
//       setValue('owner.address', businessData.owner_user_address);
//       setValue('branch.name', businessData.branch_name);
//       setValue('branch.address', businessData.branch_address);
//       setValue('branch.contact_number', businessData.branch_contact_number);
//     }
//   }, [businessData, mode, setValue]);

//   const onSubmit: SubmitHandler<BusinessFormValues> = (data) => {
//     console.log("Form submitted:", data);
    
//     if (mode === 'edit') {
//       updateBusiness(data);
//     } else {
//       createBusiness(data);
//     }
//   };

//   const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setValue('logo', file);
      
//       const reader = new FileReader();
//       reader.onload = () => {
//         if (typeof reader.result === 'string') {
//           setLogoPreview(reader.result);
//         }
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleReset = () => {
//     reset();
//     setLogoPreview(null);
//   };

//   const handleEdit = () => {
//     setIsEditMode(true);
//   };

//   if (isLoadingBusiness) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className='flex flex-col gap-6'>
//       <div className="flex items-center gap-4">
//         <button
//           onClick={onBack}
//           className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//           aria-label="Go back"
//           title="Go back"
//         >
//           <ArrowLeft className="w-5 h-5" />
//         </button>
//         <h1 className='text-title font-bold text-2xl'>
//           {mode === 'edit' ? 'Business Information' : 'Create New Business'}
//         </h1>
//       </div>
      
//       {mode === 'edit' && !isEditMode && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <div className="flex justify-between items-center">
//             <p className="text-blue-800">Viewing business information. Click Edit to make changes.</p>
//             <button
//               onClick={handleEdit}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//             >
//               Edit Business
//             </button>
//           </div>
//         </div>
//       )}
      
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//         {/* Business Information Section */}
//         <div className="bg-white p-6 rounded-lg ">
//           <h2 className="text-xl font-semibold mb-4 text-gray-800">Business Information</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Business Name *
//               </label>
//               <input
//                 {...register('name')}
//                 type="text"
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   errors.name 
//                     ? 'border-red-500 focus:ring-red-500' 
//                     : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
//                 } ${mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//                 placeholder="Enter business name"
//               />
//               {errors.name && (
//                 <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
//               )}
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Contact Number *
//               </label>
//               <input
//                 {...register('contact_number')}
//                 type="text"
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   errors.contact_number 
//                     ? 'border-red-500 focus:ring-red-500' 
//                     : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
//                 } ${mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//                 placeholder="Enter contact number"
//               />
//               {errors.contact_number && (
//                 <p className="text-red-500 text-xs mt-1">{errors.contact_number.message}</p>
//               )}
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Alternate Contact Number
//               </label>
//               <input
//                 {...register('alternate_contact_number')}
//                 type="text"
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                   mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
//                 }`}
//                 placeholder="Enter alternate contact number"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Website
//               </label>
//               <input
//                 {...register('website')}
//                 type="url"
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   errors.website 
//                     ? 'border-red-500 focus:ring-red-500' 
//                     : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
//                 } ${mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//                 placeholder="https://example.com"
//               />
//               {errors.website && (
//                 <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>
//               )}
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Package *
//               </label>
//               <select
//                 {...register('package', { valueAsNumber: true })}
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   errors.package 
//                     ? 'border-red-500 focus:ring-red-500' 
//                     : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
//                 } ${mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//               >
//                 <option value="">Select a package</option>
//                 {packageResponse?.results?.map((pak) => (
//                   <option key={pak.id} value={pak.id}>
//                     {pak.name}
//                   </option>
//                 ))}
//               </select>
//               {errors.package && (
//                 <p className="text-red-500 text-xs mt-1">{errors.package.message}</p>
//               )}
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Subscription Status
//               </label>
//               <select
//                 {...register('subscription_status')}
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                   mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
//                 }`}
//               >
//                 <option value="active">Active</option>
//                 <option value="expired">Expired</option>
//                 <option value="cancelled">Cancelled</option>
//                 <option value="suspended">Suspended</option>
//                 <option value="pending">Pending</option>
//               </select>
//             </div>
//           </div>
          
//           <div className="mt-6">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Business Logo
//             </label>
//             <div className="flex items-center">
//               <div className="relative">
//                 {logoPreview ? (
//                   <img 
//                     src={logoPreview} 
//                     alt="Business Logo" 
//                     className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-300" 
//                   />
//                 ) : (
//                   <div className="w-16 h-16 rounded-2xl bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
//                     <Image className="text-gray-500 w-6 h-6" />
//                   </div>
//                 )}
//               </div>

//               <div className="ml-4">
//                 <button
//                   type="button"
//                   disabled={mode === 'edit' && !isEditMode}
//                   onClick={() => document.getElementById("logoUploadInput")?.click()}
//                   className={`px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium ${
//                     mode === 'edit' && !isEditMode ? 'opacity-50 cursor-not-allowed' : ''
//                   }`}
//                 >
//                   Upload Logo
//                 </button>
//                 <label htmlFor="logoUploadInput" className="sr-only">
//                   Upload business logo
//                 </label>
//                 <input
//                   id="logoUploadInput"
//                   type="file"
//                   accept="image/*"
//                   onChange={handleLogoChange}
//                   className="hidden"
//                   aria-label="Upload business logo"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <div className="mt-3">
//           <h2 className="text-xl font-semibold mb-4 text-gray-800">Owner Information</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email *
//               </label>
//               <input
//                 {...register('owner.email')}
//                 type="email"
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   errors.owner?.email 
//                     ? 'border-red-500 focus:ring-red-500' 
//                     : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
//                 } ${mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//                 placeholder="Enter owner email"
//               />
//               {errors.owner?.email && (
//                 <p className="text-red-500 text-xs mt-1">{errors.owner.email.message}</p>
//               )}
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Username *
//               </label>
//               <input
//                 {...register('owner.username')}
//                 type="text"
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   errors.owner?.username 
//                     ? 'border-red-500 focus:ring-red-500' 
//                     : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
//                 } ${mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//                 placeholder="Enter username"
//               />
//               {errors.owner?.username && (
//                 <p className="text-red-500 text-xs mt-1">{errors.owner.username.message}</p>
//               )}
//             </div>
            
//             {mode === 'add' && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Password *
//                 </label>
//                 <input
//                   {...register('owner.password')}
//                   type="password"
//                   className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                     errors.owner?.password 
//                       ? 'border-red-500 focus:ring-red-500' 
//                       : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
//                   }`}
//                   placeholder="Enter password"
//                 />
//                 {errors.owner?.password && (
//                   <p className="text-red-500 text-xs mt-1">{errors.owner.password.message}</p>
//                 )}
//               </div>
//             )}
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Phone Number *
//               </label>
//               <input
//                 {...register('owner.phone_number')}
//                 type="text"
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   errors.owner?.phone_number 
//                     ? 'border-red-500 focus:ring-red-500' 
//                     : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
//                 } ${mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//                 placeholder="Enter phone number"
//               />
//               {errors.owner?.phone_number && (
//                 <p className="text-red-500 text-xs mt-1">{errors.owner.phone_number.message}</p>
//               )}
//             </div>
            
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Address *
//               </label>
//               <input
//                 {...register('owner.address')}
//                 type="text"
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   errors.owner?.address 
//                     ? 'border-red-500 focus:ring-red-500' 
//                     : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
//                 } ${mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//                 placeholder="Enter address"
//               />
//               {errors.owner?.address && (
//                 <p className="text-red-500 text-xs mt-1">{errors.owner.address.message}</p>
//               )}
//             </div>
//           </div>
//         </div>
        
//         <div className="mt-3">
//           <h2 className="text-xl font-semibold mb-4 text-gray-800">Branch Information</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Branch Name *
//               </label>
//               <input
//                 {...register('branch.name')}
//                 type="text"
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   errors.branch?.name 
//                     ? 'border-red-500 focus:ring-red-500' 
//                     : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
//                 } ${mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//                 placeholder="Enter branch name"
//               />
//               {errors.branch?.name && (
//                 <p className="text-red-500 text-xs mt-1">{errors.branch.name.message}</p>
//               )}
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Contact Number *
//               </label>
//               <input
//                 {...register('branch.contact_number')}
//                 type="text"
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   errors.branch?.contact_number 
//                     ? 'border-red-500 focus:ring-red-500' 
//                     : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
//                 } ${mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//                 placeholder="Enter branch contact number"
//               />
//               {errors.branch?.contact_number && (
//                 <p className="text-red-500 text-xs mt-1">{errors.branch.contact_number.message}</p>
//               )}
//             </div>
            
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Branch Address *
//               </label>
//               <input
//                 {...register('branch.address')}
//                 type="text"
//                 disabled={mode === 'edit' && !isEditMode}
//                 className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   errors.branch?.address 
//                     ? 'border-red-500 focus:ring-red-500' 
//                     : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
//                 } ${mode === 'edit' && !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//                 placeholder="Enter branch address"
//               />
//               {errors.branch?.address && (
//                 <p className="text-red-500 text-xs mt-1">{errors.branch.address.message}</p>
//               )}
//             </div>
//           </div>
//         </div>
        
//         <div className="flex justify-end space-x-4">
//           <button 
//             type="button" 
//             onClick={handleReset}
//             className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
//           >
//             Clear
//           </button>
//           <button 
//             type="submit" 
//             disabled={isCreating || isUpdating}
//             className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isCreating || isUpdating ? 'Processing...' : mode === 'edit' ? 'Update Business' : 'Create Business'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default FormBusiness;




import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Image, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useMutate } from "../../Hook/API/useApiMutate";
import { useGet } from "../../Hook/API/useApiGet";
import { useTranslation } from "react-i18next";

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
  package_name?: string;
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
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  logo: z.instanceof(File).optional(),
  package: z.number().optional(), // Make optional for edit mode
  subscription_status: z.string().optional(),
  owners: z
    .array(
      z.object({
        email: z.string().email("Invalid email address"),
        username: z.string().min(1, "Username is required"),
        password: z
          .string()
          .min(6, "Password must be at least 6 characters")
          .optional(),
        phone_number: z.string().min(1, "Phone number is required"),
        address: z.string().min(1, "Address is required"),
      }),
    )
    .min(1, "At least one owner is required"),
  branches: z
    .array(
      z.object({
        name: z.string().min(1, "Branch name is required"),
        address: z.string().min(1, "Branch address is required"),
        contact_number: z.string().min(1, "Branch contact number is required"),
      }),
    )
    .min(1, "At least one branch is required"),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

interface FormBusinessProps {
  businessId?: string | null;
  onBack: () => void;
  mode: "add" | "edit";
}

const FormBusiness: React.FC<FormBusinessProps> = ({
  businessId,
  onBack,
  mode,
}) => {
  const { t } = useTranslation();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema) as unknown as Resolver<
      BusinessFormValues,
      unknown
    >,
    defaultValues: {
      name: "",
      contact_number: "",
      package: 0,
      owners: [
        {
          email: "",
          username: "",
          password: "",
          phone_number: "",
          address: "",
        },
      ],
      branches: [
        {
          name: "",
          address: "",
          contact_number: "",
        },
      ],
    },
  });

  const { data: packageResponse } = useGet<PackageResponse>({
    endpoint: `/api/superadmin/packages/`,
    queryKey: ["packages"],
    enabled: mode === "add",
  });

  // Get business data if editing
  const { data: businessData, isLoading: isLoadingBusiness } =
    useGet<BusinessResponse>({
      endpoint: businessId ? `/api/business/settings/business/` : "",
      queryKey: ["business", businessId],
      enabled: !!businessId && mode === "edit",
    });

  // Create business mutation
  const { mutate: createBusiness, isLoading: isCreating } =
    useMutate<BusinessFormValues>({
      endpoint: "/api/superadmin/all-businesses/",
      method: "post",
      onSuccess: () => {
        onBack();
      },
    });

  // Update business mutation
  const { mutate: updateBusiness, isLoading: isUpdating } =
    useMutate<BusinessFormValues>({
      endpoint: businessId ? `/api/business/settings/business/` : "",
      method: "patch",
      onSuccess: () => {
        onBack();
      },
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
  } = form;

  const {
    fields: ownerFields,
    append: appendOwner,
    remove: removeOwner,
  } = useFieldArray({
    control,
    name: "owners",
  });

  const {
    fields: branchFields,
    append: appendBranch,
    remove: removeBranch,
  } = useFieldArray({
    control,
    name: "branches",
  });

  // Load business data when editing
  useEffect(() => {
    if (businessData && mode === "edit") {
      setValue("name", businessData.name);
      setValue("contact_number", businessData.contact_number);
      setValue(
        "alternate_contact_number",
        businessData.alternate_contact_number || "",
      );
      setValue("website", businessData.website || "");
      setValue("package", businessData.package);
      setValue("subscription_status", businessData.subscription_status || "");

      // Set owner data
      setValue("owners", [
        {
          email: businessData.owner_user_email,
          username: businessData.owner_user_username,
          phone_number: businessData.owner_user_phone_number,
          address: businessData.owner_user_address,
          password: undefined,
        },
      ]);

      // Set branch data
      setValue("branches", [
        {
          name: businessData.branch_name,
          address: businessData.branch_address,
          contact_number: businessData.branch_contact_number,
        },
      ]);
    }
  }, [businessData, mode, setValue]);

const onSubmit: SubmitHandler<BusinessFormValues> = (data) => {
  console.log("Form submitted:", data);

  if (mode === "edit") {
    const {  ...businessData } = data;
    updateBusiness(businessData);
  } else {
    const apiData = {
      ...data,
      owner: data.owners[0],
      branch: {
        name: data.branches[0].name,
        mobile: data.branches[0].contact_number,
        address_line: data.branches[0].address,
      },
    };
    const {  ...finalData } = apiData;
    createBusiness(finalData);
  }
};


  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue("logo", file);

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
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
    <div className="flex flex-col gap-6">
      {/* Simple Header */}
      <div className="flex items-center gap-4">
        {mode === "add" && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={t("formBusiness.goBack")}
            title={t("formBusiness.goBack")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "add"
            ? t("formBusiness.createNewBusiness")
            : t("formBusiness.updateBusiness")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Business Information Section */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            {t("formBusiness.businessInformation")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("formBusiness.businessName")} *
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t("formBusiness.enterBusinessName")}
                title={t("formBusiness.businessName")}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("formBusiness.contactNumber")} *
              </label>
              <input
                {...register("contact_number")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t("formBusiness.enterContactNumber")}
                title={t("formBusiness.contactNumber")}
              />
              {errors.contact_number && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.contact_number.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("formBusiness.alternateContactNumber")}
              </label>
              <input
                {...register("alternate_contact_number")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t("formBusiness.enterAlternateContact")}
                title={t("formBusiness.alternateContactNumber")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("formBusiness.website")}
              </label>
              <input
                {...register("website")}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t("formBusiness.enterWebsite")}
                title={t("formBusiness.website")}
              />
              {errors.website && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.website.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("formBusiness.package")} *
              </label>
              {mode === "edit" ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                  {businessData?.package_name ||
                    t("formBusiness.noPackageAssigned")}
                </div>
              ) : (
                <select
                  {...register("package", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  title={t("formBusiness.package")}
                >
                  <option value="">{t("formBusiness.selectPackage")}</option>
                  {packageResponse?.results?.map((pak) => (
                    <option key={pak.id} value={pak.id}>
                      {pak.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.package && mode === "add" && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.package.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("formBusiness.subscriptionStatus")}
              </label>
              {mode === "edit" ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                  {businessData?.subscription_status || "-"}
                </div>
              ) : (
                <select
                  {...register("subscription_status")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  title={t("formBusiness.subscriptionStatus")}
                >
                  <option value="">{t("formBusiness.selectStatus")}</option>
                  <option value="active">{t("formBusiness.active")}</option>
                  <option value="expired">{t("formBusiness.expired")}</option>
                  <option value="cancelled">
                    {t("formBusiness.cancelled")}
                  </option>
                  <option value="suspended">
                    {t("formBusiness.suspended")}
                  </option>
                  <option value="pending">{t("formBusiness.pending")}</option>
                </select>
              )}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("formBusiness.businessLogo")}
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
                onClick={() =>
                  document.getElementById("logoUploadInput")?.click()
                }
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border"
              >
                {t("formBusiness.uploadLogo")}
              </button>
              <input
                id="logoUploadInput"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                aria-label={t("formBusiness.businessLogo")}
                title={t("formBusiness.businessLogo")}
              />
            </div>
          </div>
        </div>

        {/* Owners Section */}
        {mode === "add" && (
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("formBusiness.ownersInformation")}
              </h2>
              <button
                type="button"
                onClick={() =>
                  appendOwner({
                    email: "",
                    username: "",
                    password: "",
                    phone_number: "",
                    address: "",
                  })
                }
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t("formBusiness.addOwner")}
              </button>
            </div>

            <div className="space-y-6">
              {ownerFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-700">
                      {t("formBusiness.owner")} #{index + 1}
                    </h3>
                    {ownerFields.length > 1 && (
                      <button
                        type="button"
                        title={t("formBusiness.removeOwner")}
                        onClick={() => removeOwner(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        aria-label={t("formBusiness.removeOwner")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("formBusiness.email")} *
                      </label>
                      <input
                        {...register(`owners.${index}.email`)}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t("formBusiness.enterOwnerEmail")}
                        title={t("formBusiness.email")}
                      />
                      {errors.owners?.[index]?.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.owners[index]?.email?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("formBusiness.username")} *
                      </label>
                      <input
                        {...register(`owners.${index}.username`)}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t("formBusiness.enterUsername")}
                        title={t("formBusiness.username")}
                      />
                      {errors.owners?.[index]?.username && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.owners[index]?.username?.message}
                        </p>
                      )}
                    </div>

                    {mode === "add" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("formBusiness.password")} *
                        </label>
                        <input
                          {...register(`owners.${index}.password`)}
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={t("formBusiness.enterPassword")}
                          title={t("formBusiness.password")}
                        />
                        {errors.owners?.[index]?.password && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.owners[index]?.password?.message}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("formBusiness.phoneNumber")} *
                      </label>
                      <input
                        {...register(`owners.${index}.phone_number`)}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t("formBusiness.enterPhoneNumber")}
                        title={t("formBusiness.phoneNumber")}
                      />
                      {errors.owners?.[index]?.phone_number && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.owners[index]?.phone_number?.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("formBusiness.address")} *
                      </label>
                      <input
                        {...register(`owners.${index}.address`)}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t("formBusiness.enterAddress")}
                        title={t("formBusiness.address")}
                      />
                      {errors.owners?.[index]?.address && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.owners[index]?.address?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Branches Section */}
        {mode === "add" && (
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("formBusiness.branchesInformation")}
              </h2>
              <button
                type="button"
                onClick={() =>
                  appendBranch({
                    name: "",
                    address: "",
                    contact_number: "",
                  })
                }
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t("formBusiness.addBranch")}
              </button>
            </div>

            <div className="space-y-6">
              {branchFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-700">
                      {t("formBusiness.branch")} #{index + 1}
                    </h3>
                    {branchFields.length > 1 && (
                      <button
                        type="button"
                        title={t("formBusiness.removeBranch")}
                        onClick={() => removeBranch(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        aria-label={t("formBusiness.removeBranch")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("formBusiness.branchName")} *
                      </label>
                      <input
                        {...register(`branches.${index}.name`)}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t("formBusiness.enterBranchName")}
                        title={t("formBusiness.branchName")}
                      />
                      {errors.branches?.[index]?.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.branches[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("formBusiness.branchContactNumber")} *
                      </label>
                      <input
                        {...register(`branches.${index}.contact_number`)}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t("formBusiness.enterBranchContact")}
                        title={t("formBusiness.branchContactNumber")}
                      />
                      {errors.branches?.[index]?.contact_number && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.branches[index]?.contact_number?.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("formBusiness.branchAddress")} *
                      </label>
                      <input
                        {...register(`branches.${index}.address`)}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t("formBusiness.enterBranchAddress")}
                        title={t("formBusiness.branchAddress")}
                      />
                      {errors.branches?.[index]?.address && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.branches[index]?.address?.message}
                        </p>
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
          {mode === "add" && (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
            >
              {t("formBusiness.clear")}
            </button>
          )}
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating || isUpdating
              ? t("formBusiness.processing")
              : mode === "add"
                ? t("formBusiness.createBusiness")
                : t("formBusiness.updateBusiness")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormBusiness;