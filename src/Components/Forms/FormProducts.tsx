import React, {  useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useMutate } from '../../Hook/API/useApiMutate';
import { useGet } from '../../Hook/API/useApiGet';
import { useFieldArray } from "react-hook-form";
import ReusableForm from './ReusableForm';


const ProductSchema = z.object({
  arabic_name: z.string().min(1, "Arabic name is required"),
  english_name: z.string().min(1, "English name is required"),
  commercial_name: z.string(),
  global_code: z.string(),
  short_code: z.string().min(1),
  description: z.string().optional(),
  cost: z.string().min(1,"Cost must be a valid number"),
  is_expirable: z.boolean().default(false),
  has_label: z.boolean().default(false),
  is_discountable: z.boolean().default(false),
  max_discount: z.number().min(0, "Max discount must be a positive number"),
  company: z.number().min(1, "Company is required"),
  type: z.number().min(1, "Type is required"),
  units: z.array(z.object({
    unit: z.number().min(1, "Unit is required"),
    quantity_per_parent: z.number(),
    is_main_unit: z.boolean().default(false)
  })).min(1, "At least one unit is required"),
  batches: z.array(z.object({
    batch_num: z.string().min(1, "Batch number is required"),
    batch_size: z.number().min(0, "Batch size must be positive"),
    exp_date: z.string().or(z.date()),
    price: z.string().or(z.number()).refine(val => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num);
    }, "Price must be a valid number"),
    apply_price_to_old_batches: z.boolean().default(false)
  })).min(1, "At least one batch is required") 
});


type ProductFormValues = z.infer<typeof ProductSchema>;

interface Unit {
  id: number;
  name: string;
  parent_name?: string;
}

interface ProductType {
  id: number;
  name: string;
  parent_name?: string;
}

interface Company {
  id: number;
  name: string;
}

interface UnitsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Unit[];
}

interface TypeResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductType[];
}

interface CompaniesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Company[];
}

interface ProductResponse {
  id: number;
  arabic_name: string;
  english_name: string;
  commercial_name: string;
  global_code: string;
  short_code: string;
  description?: string;
  cost:  string;
  is_expirable: boolean;
  has_label: boolean;
  is_discountable: boolean;
  max_discount: number;
  company: number;
  type: number;
  units: Array<{
    unit: number;
    quantity_per_parent: number;
    is_main_unit: boolean;
    unit_details?: Unit;
  }>;
  batches?: Array<{
    batch_num: string;
    batch_size: number;
    exp_date: string;
    price: number | string;
    apply_price_to_old_batches: boolean;
  }>;
}
interface FormProductsProps {
  productId?: string | null | number;
  onBack: () => void;
  mode: 'add' | 'edit';
}

const FormProducts: React.FC<FormProductsProps> = ({ productId, onBack, mode }) => {
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);
  const [createCompany, setCreateCompany] = useState(false);
    const [isCreateUnitModalOpen, setIsCreateUnitModalOpen] = useState(false);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema) as unknown as Resolver<ProductFormValues, unknown>,
    defaultValues: {
      arabic_name: '',
      english_name: '',
      commercial_name: '',
      global_code: '',
      short_code: '',
      description: '',
      cost: '',
      is_expirable: false,
      has_label: false,
      is_discountable: false,
      max_discount: 0,
      company: 0,
      type: 0,
      units: [{ unit: 0, quantity_per_parent: 1, is_main_unit: true }],
      // التعديل هنا: إضافة batch افتراضي
      batches: [{ 
        batch_num: '', 
        batch_size: 0, 
        exp_date: new Date().toISOString().split('T')[0], 
        price: 0, 
        apply_price_to_old_batches: false 
      }]
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset, control } = form;
  // جلب البيانات من الـ APIs
  const { data: companiesData } = useGet<CompaniesResponse>({
    endpoint: '/api/inventory/products/companies/',
    queryKey: ['companies'],
    enabled: mode === 'add' || mode === 'edit',
  });

   
  const { data: typesData , refetch } = useGet<TypeResponse>({
    endpoint: '/api/inventory/products/types/',
    queryKey: ['product-types'],
    enabled: mode === 'add' || mode === 'edit',
  });

  const { data: unitsData , refetch: refetchUnits } = useGet<UnitsResponse>({
    endpoint: '/api/inventory/products/units/',
    queryKey: ['units'],
    enabled: mode === 'add' || mode === 'edit',
  });

  const { data: productData, isLoading: isLoadingProduct } = useGet<ProductResponse>({
    endpoint: productId ? `/api/inventory/products/${productId}/` : '',
    queryKey: ['product', productId],
    enabled: !!productId && mode === 'edit',
  });

  const { mutate: createProduct, isLoading: isCreating } = useMutate<Record<string, unknown>>({
    endpoint: '/api/inventory/products/',
    method: 'post',
    onSuccess: () => {
      onBack();
    },
  });

  const { mutate: updateProduct, isLoading: isUpdating } = useMutate<Record<string, unknown>>({
    endpoint: productId ? `/api/inventory/products/${productId}/` : '',
    method: 'patch',
    onSuccess: () => {
      onBack();
    },
  });
       const typeFields = [
    { name: "name", label: "Type Name", type: "text", required: true },
    {
      name: "parent",
      label: "Parent Type (Optional)",
      type: "select",
      required: false,
      options: typesData?.results
        ?.filter(type => !type.parent_name) // فقط الأنواع الرئيسية
        ?.map((type) => ({
          value: type.id,
          label: type.name
        })) || []
    }
  ];
       const companyFields = [
    { name: "name", label: " Company Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: false },
    { name: "address", label: "Address", type: "text", required: false },
    { name: "phone_number", label: "Phone Number", type: "text", required: false },
  ];

    const unitcreateFields = [
    { name: "name", label: "Unit Name", type: "text", required: true },
    {
      name: "parent",
      label: "Parent Unit (Optional)",
      type: "select",
      required: false,
      options: unitsData?.results
        ?.filter(unit => !unit.parent_name) // فقط الوحدات الرئيسية
        ?.map((unit) => ({
          value: unit.id,
          label: unit.name
        })) || []
    }
  ];
 const handleCreateTypeSuccess = () => {
    setIsCreateTypeModalOpen(false);
    refetch(); 
  };
 const handleCreateCompanySuccess = () => {
    setCreateCompany(false);
    refetch(); 
  };
    const handleCreateUnitSuccess = () => {
    setIsCreateUnitModalOpen(false);
    refetchUnits(); // إعادة جلب بيانات الوحدات لتحديث القائمة
  };
  // Use field arrays للوحدات والbatches
  const { fields: unitFields, append: appendUnit, remove: removeUnit } = useFieldArray({
    control,
    name: "units"
  });

  const { fields: batchFields, append: appendBatch, remove: removeBatch } = useFieldArray({
    control,
    name: "batches"
  });

  // تحميل بيانات المنتج في حالة التعديل
  useEffect(() => {
    if (productData && mode === 'edit') {
      setValue('arabic_name', productData.arabic_name);
      setValue('english_name', productData.english_name);
      setValue('commercial_name', productData.commercial_name);
      setValue('global_code', productData.global_code);
      setValue('short_code', productData.short_code);
      setValue('description', productData.description || '');
      setValue('cost', productData.cost);
      setValue('is_expirable', productData.is_expirable);
      setValue('has_label', productData.has_label);
      setValue('is_discountable', productData.is_discountable);
      setValue('max_discount', productData.max_discount);
      setValue('company', productData.company);
      setValue('type', productData.type);
      
      // Set units
      if (productData.units) {
        setValue('units', productData.units);
      }
      
      // Set batches
      if (productData.batches) {
        setValue('batches', productData.batches);
      }
      
    
    }
  }, [productData, mode, setValue]);

  const onSubmit: SubmitHandler<ProductFormValues> = (data) => {
    const requestData = {
      ...data,
      // تحويل cost و price من string إلى number إذا لزم الأمر
      cost: typeof data.cost === 'string' ? parseFloat(data.cost) : data.cost,
      units: data.units.map(unit => ({
        ...unit,
        quantity_per_parent: Number(unit.quantity_per_parent)
      })),
      batches: data.batches?.map(batch => ({
        ...batch,
        batch_size: Number(batch.batch_size),
        price: typeof batch.price === 'string' ? parseFloat(batch.price) : batch.price
      }))
    };

    console.log('Request Data:', requestData);

    if (mode === 'edit') {
      updateProduct(requestData);
    } else {
      createProduct(requestData);
    }
  };


  const handleReset = () => {
    reset();
  };

  const addUnit = () => {
    appendUnit({ unit: 0, quantity_per_parent: 1, is_main_unit: false });
  };

  const addBatch = () => {
    appendBatch({ 
      batch_num: '', 
      batch_size: 0, 
      exp_date: new Date().toISOString().split('T')[0], 
      price: 0, 
      apply_price_to_old_batches: false 
    });
  };

  if (isLoadingProduct) {
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
          {mode === 'add' ? 'Create New Product' : 'Update Product'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arabic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arabic Name *
              </label>
              <input
                {...register('arabic_name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Arabic name"
              />
              {errors.arabic_name && (
                <p className="text-red-500 text-xs mt-1">{errors.arabic_name.message}</p>
              )}
            </div>
            
            {/* English Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Name *
              </label>
              <input
                {...register('english_name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter English name"
              />
              {errors.english_name && (
                <p className="text-red-500 text-xs mt-1">{errors.english_name.message}</p>
              )}
            </div>
            
            {/* Commercial Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commercial Name *
              </label>
              <input
                {...register('commercial_name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter commercial name"
              />
              {errors.commercial_name && (
                <p className="text-red-500 text-xs mt-1">{errors.commercial_name.message}</p>
              )}
            </div>
            
            {/* Global Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Global Code *
              </label>
              <input
                {...register('global_code')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter global code"
              />
              {errors.global_code && (
                <p className="text-red-500 text-xs mt-1">{errors.global_code.message}</p>
              )}
            </div>
            
            {/* Short Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Code *
              </label>
              <input
                {...register('short_code')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter short code"
              />
              {errors.short_code && (
                <p className="text-red-500 text-xs mt-1">{errors.short_code.message}</p>
              )}
            </div>
            
            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost *
              </label>
              <input
                {...register('cost')}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              {errors.cost && (
                <p className="text-red-500 text-xs mt-1">{errors.cost.message}</p>
              )}
            </div>
            
            {/* Company - Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <select
                {...register('company', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                  if (e.target.value === "-1") {
                    setCreateCompany(true);
                  }
                }}
              >
                <option value="0">Select company</option>
                {companiesData?.results?.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
                 <option value="-1" className="text-blue-600 font-medium border-t border-gray-200 mt-1 pt-1">
                  + Add new company
                </option>
              </select>
              {errors.company && (
                <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>
              )}
            </div>
            
            {/* Type - Select */}
           

         <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                {...register('type', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  if (e.target.value === "-1") {
                    setIsCreateTypeModalOpen(true);
                  }
                }}
              >
                <option value="0">Select type</option>
                {typesData?.results?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.parent_name ? `${type.parent_name} - ${type.name}` : type.name}
                  </option>
                ))}
                {/* زر الإضافة داخل القائمة */}
                <option value="-1" className="text-blue-600 font-medium border-t border-gray-200 mt-1 pt-1">
                  + Add new type
                </option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
              )}
            </div>


            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product description"
              />
            </div>
          </div>
        </div>

        {/* Product Settings Section */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Product Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Expirable */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('is_expirable')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Is Expirable</span>
              </label>
            </div>
            
            {/* Has Label */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('has_label')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Has Label</span>
              </label>
            </div>
            
            {/* Discountable */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('is_discountable')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Is Discountable</span>
              </label>
            </div>
            
            {/* Max Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Discount
              </label>
              <input
                {...register('max_discount', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              {errors.max_discount && (
                <p className="text-red-500 text-xs mt-1">{errors.max_discount.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Units Section */}
         <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Units</h2>
            <button
              type="button"
              onClick={addUnit}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Add Unit
            </button>
          </div>
          
          <div className="space-y-4">
            {unitFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Unit {index + 1}</h3>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeUnit(index)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Unit Select مع إضافة خيار إنشاء وحدة جديدة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      {...register(`units.${index}.unit`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        if (e.target.value === "-1") {
                          setIsCreateUnitModalOpen(true);
                        }
                      }}
                    >
                      <option value="0">Select unit</option>
                      {unitsData?.results?.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.parent_name ? `${unit.parent_name} - ${unit.name}` : unit.name}
                        </option>
                      ))}
                      {/* زر الإضافة داخل القائمة */}
                      <option value="-1" className="text-blue-600 font-medium border-t border-gray-200 mt-1 pt-1">
                        + Add new unit
                      </option>
                    </select>
                    {errors.units?.[index]?.unit && (
                      <p className="text-red-500 text-xs mt-1">{errors.units[index]?.unit?.message}</p>
                    )}
                  </div>
                  
                  {/* Quantity per Parent */}
                  {index > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity per Parent *
                      </label>
                      <input
                        {...register(`units.${index}.quantity_per_parent`, { valueAsNumber: true })}
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1"
                      />
                    </div>
                  )}
                  
                  {/* Main Unit */}
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register(`units.${index}.is_main_unit`)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Main Unit</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Batches Section */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Batches </h2>
            {mode === 'edit' && (

            <button
              type="button"
              onClick={addBatch}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Add Batch
            </button>
            )}
          </div>
          
          <div className="space-y-4">
            {batchFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Batch {index + 1}</h3>
                  {index > 0  && (
                    <button
                      type="button"
                      onClick={() => removeBatch(index)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Batch Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Number *
                    </label>
                    <input
                      {...register(`batches.${index}.batch_num`)}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter batch number"
                    />
                    {errors.batches?.[index]?.batch_num && (
                      <p className="text-red-500 text-xs mt-1">{errors.batches[index]?.batch_num?.message}</p>
                    )}
                  </div>
                  
                  {/* Batch Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      {...register(`batches.${index}.batch_size`, { valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                    {errors.batches?.[index]?.batch_size && (
                      <p className="text-red-500 text-xs mt-1">{errors.batches[index]?.batch_size?.message}</p>
                    )}
                  </div>
                  
                  {/* Expiration Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Date *
                    </label>
                    <input
                      {...register(`batches.${index}.exp_date`)}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      {...register(`batches.${index}.price`)}
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                    {errors.batches?.[index]?.price && (
                      <p className="text-red-500 text-xs mt-1">{errors.batches[index]?.price?.message}</p>
                    )}
                  </div>
                  
                  {/* Apply to Old Batches */}
                  {index > 0 && (
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register(`batches.${index}.apply_price_to_old_batches`)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Apply price to Old Batches</span>
                    </label>
                  </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {errors.batches && (
            <p className="text-red-500 text-xs mt-2">{errors.batches.message}</p>
          )}
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
            {isCreating || isUpdating ? 'Processing...' : mode === 'add' ? 'Create Product' : 'Update Product'}
          </button>
        </div>
      </form>

      {isCreateTypeModalOpen && (
        <ReusableForm
          title="Create New Product Type"
          fields={typeFields}
          endpoint="/api/inventory/products/types/"
          method="post"
          onClose={() => setIsCreateTypeModalOpen(false)}
          onSuccess={handleCreateTypeSuccess}
          submitButtonText="Create Type"
        />
      )}
      {createCompany && (
        <ReusableForm
          title="Create company "
          fields={companyFields}
          endpoint="/api/inventory/products/companies/"
          method="post"
          onClose={() => setCreateCompany(false)}
          onSuccess={handleCreateCompanySuccess}
          submitButtonText="Create company"
        />
      )}
       {isCreateUnitModalOpen && (
        <ReusableForm
          title="Create New Unit"
          fields={unitcreateFields}
          endpoint="/api/inventory/products/units/"
          method="post"
          onClose={() => setIsCreateUnitModalOpen(false)}
          onSuccess={handleCreateUnitSuccess}
          submitButtonText="Create Unit"
        />
      )}
    </div>
  );
};

export default FormProducts;