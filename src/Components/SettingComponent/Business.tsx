// src/Components/SettingComponent/Business.tsx
import React, { useState } from 'react';
import { useForm} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Image } from 'lucide-react';

// Define validation schema with Zod
const businessSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  logo: z.instanceof(File).optional(),
  defaultCurrency: z.string().min(1, "Currency is required"),
  timeZone: z.string().min(1, "Time zone is required"),
  stockAccountingMethod: z.string().min(1, "Accounting method is required"),
  dateFormat: z.string().min(1, "Date format is required"),
  quantityPrecision: z.number().min(0).max(5),
  enableLoyalty: z.boolean(),
  enableSMS: z.boolean(),
  enableEmail: z.boolean(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  defaultProfitPercent: z.number().min(0).max(100),
  currencySymbolPlacement: z.string().min(1, "Symbol placement is required"),
  financialYearStartMonth: z.string().min(1, "Start month is required"),
  transactionEditDays: z.number().min(0),
  timeFormat: z.string().min(1, "Time format is required"),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

const Business = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: 'PharmaCorp Ltd.',
      defaultCurrency: 'USD - US Dollar',
      timeZone: 'UTC (GMT+0)',
      stockAccountingMethod: 'FFD (First in, First out)',
      dateFormat: 'MM/DD/YYYY',
      quantityPrecision: 2,
      enableLoyalty: false,
      enableSMS: false,
      enableEmail: false,
      startDate: '2023-01-01',
      defaultProfitPercent: 25,
      currencySymbolPlacement: 'Before Amount ($100)',
      financialYearStartMonth: 'July',
      transactionEditDays: 7,
      timeFormat: '12-hour (1:30 PM)',
    }
  });

  const onSubmit = (data: BusinessFormValues) => {
    console.log('Form submitted:', data);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue('logo', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <h1 className='text-title font-bold text-2xl'>Business Setting</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-label mb-2">
                Business Name
              </label>
              <input
                {...register('businessName')}
                type="text"
                className={`w-full px-4 py-2 border-b outline-none rounded-md ${
                  errors.businessName 
                    ? 'border-b-red-500 focus:ring-red-500' 
                    : 'border-b-gray-300 focus:ring-blue-500 focusborder-b-blue-500'
                }`}
              />
              {errors.businessName && (
                <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>
              )}
            </div>
            
            {/* Logo Upload */}
            <div className="mb-6">
              <label htmlFor="logoUploadInput" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Logo
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
                    className="text-lg text-label  font-medium hover:bg-gray-300 px-4 py-2 rounded-md shadow-2xl"
                  >
                    Change
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

            
            {/* Default Currency */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-label mb-2">
                Default Currency
              </label>
              <select
                {...register('defaultCurrency')}
                className={`w-full px-4 py-2 border-b outline-none rounded-md ${
                  errors.defaultCurrency 
                    ? 'border-b-red-500 focus:ring-red-500' 
                    : 'border-b-gray-300 focus:ring-blue-500 focus:border-b-blue-500'
                }`}
              >
                <option>USD - US Dollar</option>
                <option>EUR - Euro</option>
                <option>GBP - British Pound</option>
                <option>JPY - Japanese Yen</option>
              </select>
              {errors.defaultCurrency && (
                <p className="text-red-500 text-xs mt-1">{errors.defaultCurrency.message}</p>
              )}
            </div>
            
            {/* Time Zone */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-label mb-2">
                Time Zone
              </label>
              <select
                {...register('timeZone')}
                className={`w-full px-4 py-2 border-b outline-none rounded-md ${
                  errors.timeZone 
                    ? 'border-b-red-500 focus:ring-red-500' 
                    : 'border-b-gray-300 focus:ring-blue-500 focus:border-b-blue-500'
                }`}
              >
                <option>UTC (GMT+0)</option>
                <option>EST (GMT-5)</option>
                <option>CST (GMT-6)</option>
                <option>PST (GMT-8)</option>
              </select>
              {errors.timeZone && (
                <p className="text-red-500 text-xs mt-1">{errors.timeZone.message}</p>
              )}
            </div>
            
          
            
           
            
          

           
            
            {/* Checkboxes */}
            <div className="space-y-3 mt-8"> 
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  {...register('enableSMS')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="smsNotifications" className="ml-2 text-lg text-label">
                  Enable SMS Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  {...register('enableEmail')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 text-lg text-label">
                  Enable Email Notifications
                </label>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div>
            {/* Start Date */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-label mb-2">
                Start Date
              </label>
              <input
                {...register('startDate')}
                type="date"
                className={`w-full px-4 py-2 border-b outline-none rounded-md ${
                  errors.startDate 
                    ? 'border-b-red-500 focus:ring-red-500' 
                    : 'border-b-gray-300 focus:ring-blue-500 focus:border-b-blue-500'
                }`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
              )}
            </div>
            
     
            
            {/* Financial Year Start Month */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-label mb-2">
                Financial Year Start Month
              </label>
              <select
                {...register('financialYearStartMonth')}
                className={`w-full px-4 py-2 border-b outline-none rounded-md ${
                  errors.financialYearStartMonth 
                    ? 'border-b-red-500 focus:ring-red-500' 
                    : 'border-b-gray-300 focus:ring-blue-500 focus:border-b-blue-500'
                }`}
              >
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
              {errors.financialYearStartMonth && (
                <p className="text-red-500 text-xs mt-1">{errors.financialYearStartMonth.message}</p>
              )}
            </div>
            
             {/* Date Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-label mb-2">
                Date Format
              </label>
              <select
                {...register('dateFormat')}
                className={`w-full px-4 py-2 border-b outline-none rounded-md ${
                  errors.dateFormat 
                    ? 'border-b-red-500 focus:ring-red-500' 
                    : 'border-b-gray-300 focus:ring-blue-500 focus:border-b-blue-500'
                }`}
              >
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
              {errors.dateFormat && (
                <p className="text-red-500 text-xs mt-1">{errors.dateFormat.message}</p>
              )}
            </div>
            
            {/* Time Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-label mb-2">
                Time Format
              </label>
              <select
                {...register('timeFormat')}
                className={`w-full px-4 py-2 border-b outline-none rounded-md ${
                  errors.timeFormat 
                    ? 'border-b-red-500 focus:ring-red-500' 
                    : 'border-b-gray-300 focus:ring-blue-500 focus:border-b-blue-500'
                }`}
              >
                <option>12-hour (1:30 PM)</option>
                <option>24-hour (13:30)</option>
              </select>
              {errors.timeFormat && (
                <p className="text-red-500 text-xs mt-1">{errors.timeFormat.message}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="mt-8 flex justify-end">
          <button 
            type="button" 
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-3"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Upload Setting
          </button>
        </div>
      </form>
    </div>
  );
};

export default Business;