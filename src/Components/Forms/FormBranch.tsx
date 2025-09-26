import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Image } from 'lucide-react';
import { useMutate } from '../../Hook/API/useApiMutate';
import { useGet } from '../../Hook/API/useApiGet';
import { useFieldArray } from "react-hook-form";

const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  mobile: z.string().min(1, "Mobile number is required"),
  address_line: z.string().min(1, "Address is required"),
  tax_rate: z.number().min(0, "Tax rate must be a positive number").optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  website: z.string().url("Invalid website URL").optional().or(z.literal('')),
  logo: z.instanceof(File).optional(),
  country: z.string().min(1, "Country is required"),
  landline: z.string().optional(),
  vat_number: z.string().optional(),
  cr_number: z.string().optional(),
  currencies: z.array(z.object({
  currency: z.number().min(1, "Currency is required"),
  exchange_rate: z.number().min(0, "Exchange rate must be positive"),
  default: z.boolean().default(false)
})).optional(),
  payment_methods: z.array(z.object({
    payment_method: z.number().min(1, "Payment method is required")
  })).optional(),
  customer_fields: z.array(z.object({
    field_key: z.string().min(1, "Field key is required"),
    value: z.string().min(1, "Value is required")
  })).optional()
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface TaxRate {
  id: number; 
  country_tax_rate: string;
}

interface TaxRateResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TaxRate[];
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

interface PaymentMethod {
  id: number;
  name: string;
  code: string;
}

interface CurrencyResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Currency[];
}

interface PaymentMethodResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaymentMethod[];
}

interface BranchResponse {
  id: number;
  name: string;
  mobile: string;
  address_line: string;
  tax_rate?: number;
  email?: string;
  website?: string;
  logo?: string;
  country: string;
  landline?: string;
  vat_number?: string;
  cr_number?: string;
  currencies?: Array<{
    currency: number;
    exchange_rate: number;
    default: boolean;
    currency_details?: Currency;
  }>;
  payment_methods?: Array<{
    payment_method: number;
    payment_method_details?: PaymentMethod;
  }>;
  customer_fields?: Array<{
    field_key: string;
    value: string;
  }>;
}

interface FormBranchProps {
  branchId?: string | null | number;
  onBack: () => void;
  mode: 'add' | 'edit';
}

const FormBranch: React.FC<FormBranchProps> = ({ branchId, onBack, mode }) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string>('');


  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema) as unknown as Resolver<BranchFormValues, unknown>,
    defaultValues: {
      name: '',
      mobile: '',
      address_line: '',
      tax_rate: 0,
      email: '',
      website: '',
      country: '',
      landline: '',
      vat_number: '',
      cr_number: '',
      currencies: [],
      payment_methods: [],
      customer_fields: []
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset, control , watch} = form;
 
  const watchedCountry = watch('country');

  useEffect(() => {
    setSelectedCountry(watchedCountry || '');
  }, [watchedCountry]);
  const { data: currenciesData } = useGet<CurrencyResponse>({
    endpoint: '/api/business/settings/currencies/',
    queryKey: ['currencies'],
    enabled: mode === 'add' || mode === 'edit',
  });

  const { data: taxData } = useGet<TaxRateResponse>({
    endpoint: '/api/business/settings/tax-rates/',
    queryKey: ['taxRates'],
    enabled: mode === 'add' || mode === 'edit',
  });

    const { data: paymentMethodsData, refetch: refetchPaymentMethods } = useGet<PaymentMethodResponse>({
    endpoint: `/api/business/settings/payment-methods/?country__icontains=${selectedCountry}`,
    queryKey: ['payment-methods', selectedCountry],
    enabled: !!selectedCountry && (mode === 'add' || mode === 'edit'),
    });
  
   useEffect(() => {
    if (selectedCountry) {
      refetchPaymentMethods();
    }
  }, [selectedCountry, refetchPaymentMethods]);


  // Get branch data if editing
  const { data: branchData, isLoading: isLoadingBranch } = useGet<BranchResponse>({
    endpoint: branchId ? `/api/branch/${branchId}/` : '',
    queryKey: ['branch', branchId],
    enabled: !!branchId && mode === 'edit',
  });

  const convertFormDataToObject = (formData: FormData): Record<string, unknown> => {
    const object: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      object[key] = value;
    }
    return object;
  };

  const { mutate: createBranch, isLoading: isCreating } = useMutate<Record<string, unknown>>({
    endpoint: '/api/branch/',
    method: 'post',
    onSuccess: () => {
      onBack();
    },
  });

  // Update branch mutation  
  const { mutate: updateBranch, isLoading: isUpdating } = useMutate<Record<string, unknown>>({
    endpoint: branchId ? `/api/branch/${branchId}/` : '',
    method: 'patch',
    onSuccess: () => {
      onBack();
    },
  });

  // Use field arrays for dynamic fields
  const { fields: currencyFields, append: appendCurrency, remove: removeCurrency } = useFieldArray({
    control,
    name: "currencies"
  });

  const { fields: paymentMethodFields, append: appendPaymentMethod, remove: removePaymentMethod } = useFieldArray({
    control,
    name: "payment_methods"
  });

  const { fields: customerFieldFields, append: appendCustomerField, remove: removeCustomerField } = useFieldArray({
    control,
    name: "customer_fields"
  });

  // Load branch data when editing
  useEffect(() => {
    if (branchData && mode === 'edit') {
      setValue('name', branchData.name);
      setValue('mobile', branchData.mobile);
      setValue('address_line', branchData.address_line);
      setValue('tax_rate', branchData.tax_rate || 0);
      setValue('email', branchData.email || '');
      setValue('website', branchData.website || '');
      setValue('country', branchData.country);
      setValue('landline', branchData.landline || '');
      setValue('vat_number', branchData.vat_number || '');
      setValue('cr_number', branchData.cr_number || '');
      setSelectedCountry(branchData.country);
      
      // Set currencies
      if (branchData.currencies) {
        setValue('currencies', branchData.currencies.map(curr => ({
          currency: curr.currency,
          exchange_rate: curr.exchange_rate,
          default: curr.default
        })));
      }
      
      // Set payment methods
      if (branchData.payment_methods) {
        setValue('payment_methods', branchData.payment_methods.map(pm => ({
          payment_method: pm.payment_method
        })));
      }
      
      // Set customer fields
      if (branchData.customer_fields) {
        setValue('customer_fields', branchData.customer_fields);
      }
      
      // Set logo preview if exists
      if (branchData.logo) {
        setLogoPreview(branchData.logo);
      }
    }
  }, [branchData, mode, setValue]);

  const onSubmit: SubmitHandler<BranchFormValues> = (data) => {
    const formData = new FormData();
    
    formData.append('name', data.name);
    formData.append('mobile', data.mobile);
    formData.append('address_line', data.address_line);
    formData.append('country', data.country);
    
    if (data.tax_rate) formData.append('tax_rate', data.tax_rate.toString());
    if (data.email) formData.append('email', data.email);
    if (data.website) formData.append('website', data.website);
    if (data.landline) formData.append('landline', data.landline);
    if (data.vat_number) formData.append('vat_number', data.vat_number);
    if (data.cr_number) formData.append('cr_number', data.cr_number);
    if (data.logo instanceof File) formData.append('logo', data.logo);
    
   if (data.currencies && data.currencies.length > 0) {
  data.currencies.forEach((currency, index) => {
    formData.append(`currencies[${index}]currency`, currency.currency.toString());
    formData.append(`currencies[${index}]exchange_rate`, currency.exchange_rate.toString());
    // استبدال toString() بقيمة boolean مباشرة
    formData.append(`currencies[${index}]default`, currency.default ? "true" : "false");
  });
}
    
    if (data.payment_methods && data.payment_methods.length > 0) {
      data.payment_methods.forEach((method, index) => {
        formData.append(`payment_methods[${index}]payment_method`, method.payment_method.toString());
      });
    }
    
    if (data.customer_fields && data.customer_fields.length > 0) {
      data.customer_fields.forEach((field, index) => {
        formData.append(`custom_fields[${index}]field_key`, field.field_key);
        formData.append(`custom_fields[${index}]value`, field.value);
      });
    }

    // Convert FormData to object
    const requestData: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      // Handle array fields
      if (key.includes('[') && key.includes(']')) {
        const match = key.match(/(\w+)\[(\d+)\](\w+)/);
        if (match) {
          const [, arrayName, index, fieldName] = match;
          if (!requestData[arrayName]) {
            requestData[arrayName] = [];
          }
          if (!(requestData[arrayName] as any[])[Number(index)]) {
            (requestData[arrayName] as any[])[Number(index)] = {};
          }
          (requestData[arrayName] as any[])[Number(index)][fieldName] = value;
        }
      } else {
        requestData[key] = value;
      }
    }

    console.log('Request Data:', requestData);

    if (mode === 'edit') {
      updateBranch(requestData);
    } else {
      createBranch(requestData);
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

  const addCurrency = () => {
    appendCurrency({ currency: 0, exchange_rate: 0, default: false });
  };

  const addPaymentMethod = () => {
    appendPaymentMethod({ payment_method: 0 });
  };

  const addCustomerField = () => {
    appendCustomerField({ field_key: '', value: '' });
  };

  if (isLoadingBranch) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className='text-2xl font-bold text-gray-900'>
          {mode === 'add' ? 'Create New Branch' : 'Update Branch'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name *
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter branch name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                {...register('mobile')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter mobile number"
              />
              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Landline
              </label>
              <input
                {...register('landline')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter landline number"
              />
            </div>
            
            <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Country *
        </label>
        <input
          {...register('country')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter country"
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setValue('payment_methods', []);
          }}
        />
        {errors.country && (
          <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
        )}
      </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line *
              </label>
              <input
                {...register('address_line')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter address"
              />
              {errors.address_line && (
                <p className="text-red-500 text-xs mt-1">{errors.address_line.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate
              </label>
              <select
                {...register('tax_rate', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="0">Select tax rate</option>
                {taxData?.results?.map((tax) => (
                  <option key={tax.id} value={tax.id}>
                    {tax.country_tax_rate}
                  </option>
                ))}
              </select>
              {errors.tax_rate && (
                <p className="text-red-500 text-xs mt-1">{errors.tax_rate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
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
                VAT Number
              </label>
              <input
                {...register('vat_number')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter VAT number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CR Number
              </label>
              <input
                {...register('cr_number')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter CR number"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Branch Logo</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Branch Logo" 
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
              aria-label='Upload Branch Logo'
            />
          </div>
        </div>

        {/* Currencies Section */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Currencies</h2>
            <button
              type="button"
              onClick={addCurrency}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Add Currency
            </button>
          </div>
          
          <div className="space-y-4">
            {currencyFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Currency {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeCurrency(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency *
                    </label>
                    <select
                      {...register(`currencies.${index}.currency`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select currency</option>
                      {currenciesData?.results?.map((currency) => (
                        <option key={currency.id} value={currency.id}>
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exchange Rate *
                    </label>
                    <input
                      {...register(`currencies.${index}.exchange_rate`, { valueAsNumber: true })}
                      type="number"
                      step="0.0001"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.0000"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register(`currencies.${index}.default`)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Default</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Payment Methods</h2>
            <button
              type="button"
              onClick={addPaymentMethod}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Add Payment Method
            </button>
          </div>
          
          <div className="space-y-4">
            {paymentMethodFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      {...register(`payment_methods.${index}.payment_method`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select payment method</option>
                      {paymentMethodsData?.results?.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removePaymentMethod(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Fields Section */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Customer Fields</h2>
            <button
              type="button"
              onClick={addCustomerField}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Add Customer Field
            </button>
          </div>
          
          <div className="space-y-4">
            {customerFieldFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Key *
                    </label>
                    <input
                      {...register(`customer_fields.${index}.field_key`)}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter field key"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value *
                    </label>
                    <input
                      {...register(`customer_fields.${index}.value`)}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter value"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeCustomerField(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
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
            disabled={isCreating || isUpdating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating || isUpdating ? 'Processing...' : mode === 'add' ? 'Create Branch' : 'Update Branch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormBranch;