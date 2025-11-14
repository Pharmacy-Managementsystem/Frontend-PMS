import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft } from "lucide-react";
import { useMutate } from "../../Hook/API/useApiMutate";
import { useGet } from "../../Hook/API/useApiGet";
import { useFieldArray } from "react-hook-form";
import ReusableForm from "./ReusableForm";
import { SquareChartGantt, Trash2, Shuffle } from "lucide-react";
import { useTranslation } from "react-i18next";
import FormBatch from "./FormBatch";

const ProductSchema = z.object({
  arabic_name: z.string().min(1, "Arabic name is required"),
  english_name: z.string().min(1, "English name is required"),
  commercial_name: z.string(),
  global_code: z.string(),
  short_code: z.string().optional(),
  description: z.string().optional(),
  cost: z.string().min(1, "Cost must be a valid number"),
  is_expirable: z.boolean().default(false),
  has_label: z.boolean().default(false),
  is_discountable: z.boolean().default(false),
  max_discount: z.number().min(0, "Max discount must be a positive number"),
  company: z.number().min(1, "Company is required"),
  type: z.number().min(1, "Type is required"),
  units: z
    .array(
      z.object({
        unit: z.number().min(1, "Unit is required"),
        quantity_per_parent: z.number(),
        is_main_unit: z.boolean().default(false),
        retail_price: z.string().optional(), 
      }),
    )
    .min(1, "At least one unit is required"),
  batches: z
    .array(
      z.object({
        id: z.number().optional(),
        batch: z.number().optional(), // ← إضافة هذا الحقل
        batch_num: z.string(),
        batch_size: z.number().min(0, "Batch size must be positive"),
        exp_date: z.string().or(z.date()),
        price: z
          .string()
          .or(z.number())
          .refine((val) => {
            const num = typeof val === "string" ? parseFloat(val) : val;
            return !isNaN(num);
          }, "Price must be a valid number"),
        barcode: z.string().optional(), 
        apply_price_to_old_batches: z.boolean().default(false),
        discount: z.string().optional(), 
        tax_rate: z.number().optional(), 
      }),
    )
    .min(1, "At least one batch is required"),
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
  cost: string;
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
    id: number;
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
  mode: "add" | "edit";
}

const FormProducts: React.FC<FormProductsProps> = ({
  productId,
  onBack,
  mode,
}) => {
  const { t } = useTranslation();

  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);
  const [createCompany, setCreateCompany] = useState(false);
  const [isCreateUnitModalOpen, setIsCreateUnitModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [selectedBatchSize, setSelectedBatchSize] = useState<number | string>(
    "",
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema) as unknown as Resolver<
      ProductFormValues,
      unknown
    >,
    defaultValues: {
      arabic_name: "",
      english_name: "",
      commercial_name: "",
      global_code: "",
      short_code: "",
      description: "",
      cost: "",
      is_expirable: false,
      has_label: false,
      is_discountable: false,
      max_discount: 0,
      company: 0,
      type: 0,
      units: [{ unit: 0, quantity_per_parent: 1, is_main_unit: true }],
      batches: [
        {
          batch_num: "",
          batch_size: 0,
          exp_date: new Date().toISOString().split("T")[0],
          price: 0,
          apply_price_to_old_batches: false,
        },
      ],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = form;

  // جلب البيانات من الـ APIs
  const { data: companiesData } = useGet<CompaniesResponse>({
    endpoint: "/api/inventory/products/companies/",
    queryKey: ["companies"],
    enabled: mode === "add" || mode === "edit",
  });

  const { data: typesData, refetch: refetchTypes } = useGet<TypeResponse>({
    endpoint: "/api/inventory/products/types/",
    queryKey: ["product-types"],
    enabled: mode === "add" || mode === "edit",
  });

  const { data: unitsData, refetch: refetchUnits } = useGet<UnitsResponse>({
    endpoint: "/api/inventory/products/units/",
    queryKey: ["units"],
    enabled: mode === "add" || mode === "edit",
  });

  const { data: productData, isLoading: isLoadingProduct } =
    useGet<ProductResponse>({
      endpoint: productId ? `/api/inventory/products/${productId}/` : "",
      queryKey: ["product", productId],
      enabled: !!productId && mode === "edit",
    });

  const { mutate: createProduct, isLoading: isCreating } = useMutate<
    Record<string, unknown>
  >({
    endpoint: "/api/inventory/products/",
    method: "post",
    onSuccess: () => {
      onBack();
    },
  });

  const { mutate: updateProduct, isLoading: isUpdating } = useMutate<
    Record<string, unknown>
  >({
    endpoint: productId ? `/api/inventory/products/${productId}/` : "",
    method: "patch",
    onSuccess: () => {
      onBack();
    },
  });

  const handleViewBatchDetails = (batchId: number, batchSize: number) => {
    const batch = productData?.batches?.find((b) => b.id === batchId);

    if (batch) {
      setSelectedBatchId(batchId);
      setSelectedBatchSize(batchSize);
      setBatchModalOpen(true);
    }
  };
  const typeFields = [
    {
      name: "name",
      label: t("productsForm.typeName"),
      type: "text",
      required: true,
    },
    {
      name: "parent",
      label: t("productsForm.parentType"),
      type: "select",
      required: false,
      options:
        typesData?.results
          ?.filter((type) => !type.parent_name)
          ?.map((type) => ({
            value: type.id,
            label: type.name,
          })) || [],
    },
  ];

  const companyFields = [
    {
      name: "name",
      label: t("productsForm.companyName"),
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: t("productsForm.email"),
      type: "email",
      required: false,
    },
    {
      name: "address",
      label: t("productsForm.address"),
      type: "text",
      required: false,
    },
    {
      name: "phone_number",
      label: t("productsForm.phoneNumber"),
      type: "text",
      required: false,
    },
  ];

  const unitcreateFields = [
    {
      name: "name",
      label: t("productsForm.unitName"),
      type: "text",
      required: true,
    },
    {
      name: "parent",
      label: t("productsForm.parentUnit"),
      type: "select",
      required: false,
      options:
        unitsData?.results
          ?.filter((unit) => !unit.parent_name)
          ?.map((unit) => ({
            value: unit.id,
            label: unit.name,
          })) || [],
    },
  ];

  const handleCreateTypeSuccess = () => {
    setIsCreateTypeModalOpen(false);
    refetchTypes();
  };

  const handleCreateCompanySuccess = () => {
    setCreateCompany(false);
    // إعادة جلب بيانات الشركات
  };

  const handleCreateUnitSuccess = () => {
    setIsCreateUnitModalOpen(false);
    refetchUnits();
  };

  // Use field arrays للوحدات والbatches
  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit,
  } = useFieldArray({
    control,
    name: "units",
  });

  const {
    fields: batchFields,
    append: appendBatch,
    remove: removeBatch,
  } = useFieldArray({
    control,
    name: "batches",
  });

  // تحميل بيانات المنتج في حالة التعديل
  useEffect(() => {
    if (productData && mode === "edit") {
      const resetData = {
        arabic_name: productData.arabic_name,
        english_name: productData.english_name,
        commercial_name: productData.commercial_name,
        global_code: productData.global_code,
        short_code: productData.short_code,
        description: productData.description || "",
        cost: productData.cost,
        is_expirable: productData.is_expirable,
        has_label: productData.has_label,
        is_discountable: productData.is_discountable,
        max_discount: productData.max_discount,
        company: productData.company,
        type: productData.type,
        units: productData.units,
        batches: productData.batches || [
          {
            batch_num: "",
            batch_size: 0,
            exp_date: new Date().toISOString().split("T")[0],
            price: 0,
            apply_price_to_old_batches: false,
          },
        ],
      };

      reset(resetData);
    }
  }, [productData, mode, reset]);

  const onSubmit: SubmitHandler<ProductFormValues> = (data) => {
  if (mode === "add") {
    const requestData = {
      ...data,
      cost: typeof data.cost === "string" ? parseFloat(data.cost) : data.cost,
      units: data.units.map((unit) => ({
        ...unit,
        quantity_per_parent: Number(unit.quantity_per_parent),
        retail_price: typeof unit.retail_price === "string" 
          ? parseFloat(unit.retail_price) 
          : unit.retail_price, 
      })),
      batches: data.batches?.map((batch) => ({
        batch_num: batch.batch_num,
        batch_size: Number(batch.batch_size),
        exp_date: batch.exp_date,
        price: typeof batch.price === "string"
          ? parseFloat(batch.price)
          : batch.price,
        barcode: batch.barcode, 
        apply_price_to_old_batches: batch.apply_price_to_old_batches,
        discount: batch.discount , 
        tax_rate: batch.tax_rate ,
        // ملاحظة: لا تبعت batch و id في حالة الـ add
      })),
    };

    console.log("Request Data:", requestData);
    createProduct(requestData);
  
    } else if (mode === "edit" && productData) {
      const changedFields: Partial<ProductFormValues> = {};

      const basicFields: (keyof ProductFormValues)[] = [
        "arabic_name",
        "english_name",
        "commercial_name",
        "global_code",
        "short_code",
        "description",
        "is_expirable",
        "has_label",
        "is_discountable",
        "max_discount",
        "company",
        "type",
      ];

      basicFields.forEach((field) => {
        if (data[field] !== productData[field]) {
          changedFields[field] = data[field] as never;
        }
      });

      const currentCost =
        typeof data.cost === "string" ? parseFloat(data.cost) : data.cost;
      const originalCost =
        typeof productData.cost === "string"
          ? parseFloat(productData.cost)
          : productData.cost;

      if (currentCost !== originalCost) {
        changedFields.cost = currentCost.toString();
      }

      const unitsChanged =
        JSON.stringify(data.units) !== JSON.stringify(productData.units);
      if (unitsChanged) {
        changedFields.units = data.units.map((unit) => ({
          ...unit,
          quantity_per_parent: Number(unit.quantity_per_parent),
        }));
      }

      const originalBatches = productData.batches || [];
      const batchesChanged =
        JSON.stringify(data.batches) !== JSON.stringify(originalBatches);
      if (batchesChanged) {
        changedFields.batches = data.batches?.map((batch) => ({
          ...batch,
          batch_size: Number(batch.batch_size),
          price:
            typeof batch.price === "string"
              ? parseFloat(batch.price)
              : batch.price,
        }));
      }

      // ابعت بس إذا في حقول اتغيرت
      if (Object.keys(changedFields).length > 0) {
        console.log("Changed Fields:", changedFields);
        updateProduct(changedFields);
      } else {
        console.log("No changes detected");
        alert(t("productsForm.noChanges"));
      }
    }
  };

 const addUnit = () => {
  appendUnit({ 
    unit: 0, 
    quantity_per_parent: 1, 
    is_main_unit: false,
    retail_price: "" 
  });
};

  const addBatch = () => {
  appendBatch({
    batch_num: "",
    batch_size: 0,
    exp_date: new Date().toISOString().split("T")[0],
    price: 0,
    barcode: "", // ← إضافة هذا الحقل
    apply_price_to_old_batches: false,
    discount: "", // ← إضافة هذا الحقل
    tax_rate: 0, // ← إضافة هذا الحقل
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={t("common.goBack")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "add"
            ? t("productsForm.createProduct")
            : t("productsForm.updateProduct")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            {t("productsForm.basicInformation")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arabic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("productsForm.arabicName")} *
              </label>
              <input
                {...register("arabic_name")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t("productsForm.enterArabicName")}
              />
              {errors.arabic_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.arabic_name.message}
                </p>
              )}
            </div>

            {/* English Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("productsForm.englishName")} *
              </label>
              <input
                {...register("english_name")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t("productsForm.enterEnglishName")}
              />
              {errors.english_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.english_name.message}
                </p>
              )}
            </div>

            {/* Commercial Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("productsForm.commercialName")} *
              </label>
              <input
                {...register("commercial_name")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t("productsForm.enterCommercialName")}
              />
              {errors.commercial_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.commercial_name.message}
                </p>
              )}
            </div>

            {/* Global Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("productsForm.globalCode")} *
              </label>
              <input
                {...register("global_code")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t("productsForm.enterGlobalCode")}
              />
              {errors.global_code && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.global_code.message}
                </p>
              )}
            </div>

            {/* Short Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("productsForm.shortCode")} *
              </label>
              <input
                {...register("short_code")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t("productsForm.enterShortCode")}
              />
              {errors.short_code && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.short_code.message}
                </p>
              )}
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("productsForm.cost")} *
              </label>
              <input
                {...register("cost")}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              {errors.cost && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.cost.message}
                </p>
              )}
            </div>

            {/* Company - Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("productsForm.company")} *
              </label>
              <select
                {...register("company", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  if (e.target.value === "-1") {
                    setCreateCompany(true);
                  }
                }}
              >
                <option value="0">{t("productsForm.selectCompany")}</option>
                {companiesData?.results?.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
                <option
                  value="-1"
                  className="text-blue-600 font-medium border-t border-gray-200 mt-1 pt-1"
                >
                  + {t("productsForm.addNewCompany")}
                </option>
              </select>
              {errors.company && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.company.message}
                </p>
              )}
            </div>

            {/* Type - Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("productsForm.type")} *
              </label>
              <select
                {...register("type", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  if (e.target.value === "-1") {
                    setIsCreateTypeModalOpen(true);
                  }
                }}
              >
                <option value="0">{t("productsForm.selectType")}</option>
                {typesData?.results?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.parent_name
                      ? `${type.parent_name} - ${type.name}`
                      : type.name}
                  </option>
                ))}
                <option
                  value="-1"
                  className="text-blue-600 font-medium border-t border-gray-200 mt-1 pt-1"
                >
                  + {t("productsForm.addNewType")}
                </option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("productsForm.description")}
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t("productsForm.enterDescription")}
              />
            </div>
          </div>
        </div>

        {/* Product Settings Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            {t("productsForm.productSettings")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Expirable */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("is_expirable")}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t("productsForm.isExpirable")}
                </span>
              </label>
            </div>

            {/* Has Label */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("has_label")}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t("productsForm.hasLabel")}
                </span>
              </label>
            </div>

            {/* Discountable */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("is_discountable")}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t("productsForm.isDiscountable")}
                </span>
              </label>
            </div>

            {/* Max Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("productsForm.maxDiscount")}
              </label>
              <input
                {...register("max_discount", { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              {errors.max_discount && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.max_discount.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Units Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {t("productsForm.units")}
            </h2>
            <button
              type="button"
              onClick={addUnit}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              {t("productsForm.addUnit")}
            </button>
          </div>

          <div className="space-y-4">
            {unitFields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">
                    {t("productsForm.unit")} {index + 1}
                  </h3>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeUnit(index)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      {t("productsForm.remove")}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Unit Select مع إضافة خيار إنشاء وحدة جديدة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("productsForm.unit")} *
                    </label>
                    <select
                      {...register(`units.${index}.unit`, {
                        valueAsNumber: true,
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        if (e.target.value === "-1") {
                          setIsCreateUnitModalOpen(true);
                        }
                      }}
                    >
                      <option value="0">{t("productsForm.selectUnit")}</option>
                      {unitsData?.results?.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.parent_name
                            ? `${unit.parent_name} - ${unit.name}`
                            : unit.name}
                        </option>
                      ))}
                      <option
                        value="-1"
                        className="text-blue-600 font-medium border-t border-gray-200 mt-1 pt-1"
                      >
                        + {t("productsForm.addNewUnit")}
                      </option>
                    </select>
                    {errors.units?.[index]?.unit && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.units[index]?.unit?.message}
                      </p>
                    )}
                  </div>

                  {/* Quantity per Parent */}
                  {index > 0 && (
                    <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("productsForm.retailPrice")} *
                      </label>
                      <input
                        {...register(`units.${index}.retail_price`)}
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                      
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("productsForm.quantityPerParent")} *
                      </label>
                      <input
                        {...register(`units.${index}.quantity_per_parent`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1"
                      />
                    </div>
                    </>
                  )}

                  {/* Main Unit */}
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register(`units.${index}.is_main_unit`)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {t("productsForm.mainUnit")}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Batches Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {t("productsForm.batches")}
              </h2>
            </div>
            <button
              type="button"
              onClick={addBatch}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t("productsForm.addBatch")}
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-2 text-left text-sm font-semibold text-gray-700">
                    {t("productsForm.batchNumber")}
                  </th>
                  <th className="py-4 px-2 text-left text-sm font-semibold text-gray-700">
                    {t("productsForm.quantity")}
                  </th>
                  <th className="py-4 px-2 text-left text-sm font-semibold text-gray-700">
                    {t("productsForm.expirationDate")}
                  </th>
                  <th className="py-4 px-2 text-left text-sm font-semibold text-gray-700">
                    {t("productsForm.price")}
                  </th>
                  <th className="py-4 px-2 text-left text-sm font-semibold text-gray-700">
                    {t("productsForm.barcode")}
                  </th>
                  <th className="py-4 px-2 text-left text-sm font-semibold text-gray-700">
                    {t("productsForm.discount")}
                  </th>
                  <th className="py-4 px-2 text-left text-sm font-semibold text-gray-700">
                    {t("productsForm.taxRate")}
                  </th>
                  <th className="py-4 px-2 text-left text-sm font-semibold text-gray-700">
                    {t("productsForm.applyToOld")}
                  </th>
                  <th className="py-4 px-2 text-left text-sm font-semibold text-gray-700">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {batchFields.map((field, index) => (
                  <tr
                    key={field.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    {/* Batch Number */}
                    <td className="py-4 px-2">
                      <div className="relative">
                        <input
                          {...register(`batches.${index}.batch_num`)}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder={t("productsForm.enterBatchNumber")}
                        />
                        {errors.batches?.[index]?.batch_num && (
                          <p className="text-red-500 text-xs mt-1 absolute">
                            {errors.batches[index]?.batch_num?.message}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-4 px-2">
                      <div className="relative">
                        <input
                          {...register(`batches.${index}.batch_size`, {
                            valueAsNumber: true,
                          })}
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="0"
                        />
                        {errors.batches?.[index]?.batch_size && (
                          <p className="text-red-500 text-xs mt-1 absolute">
                            {errors.batches[index]?.batch_size?.message}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Expiration Date */}
                    <td className="py-4 px-2">
                      <div className="relative">
                        <input
                          {...register(`batches.${index}.exp_date`)}
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700"
                        />
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-2">
                      <div className="relative">
                        <div className="relative">
                          <input
                            {...register(`batches.${index}.price`)}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="0.00"
                          />
                        </div>
                        {errors.batches?.[index]?.price && (
                          <p className="text-red-500 text-xs mt-1 absolute">
                            {errors.batches[index]?.price?.message}
                          </p>
                        )}
                      </div>
                    </td>

                    
                     <td className="py-4 px-2">
                        <div className="relative">
                          <input
                            {...register(`batches.${index}.barcode`)}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="py-4 px-2">
                        <div className="relative">
                          <input
                            {...register(`batches.${index}.discount`)}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="0.00"
                          />
                        </div>
                      </td>

                      {/* Tax Rate */}
                      <td className="py-4 px-2">
                        <div className="relative">
                          <input
                            {...register(`batches.${index}.tax_rate`, { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="0"
                          />
                        </div>
                      </td>
                        <td className="py-4 px-2">
                      <label className="flex items-center justify-center">
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...register(
                              `batches.${index}.apply_price_to_old_batches`,
                            )}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                      </label>
                    </td>
                    {/* Actions */}
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        {/* زر عرض تفاصيل الـ Batch */}
                        <button
                          type="button"
                          title="Distribution to branches"
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => {
                            const batchId = form.getValues(
                              `batches.${index}.id`,
                            );
                            const batchSize = form.getValues(
                              `batches.${index}.batch_size`,
                            );
                            if (batchId) {
                              handleViewBatchDetails(batchId, batchSize);
                            }
                          }}
                        >
                          <Shuffle className="w-5 h-5" />
                        </button>

                        {/* زر الحذف */}
                        {batchFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBatch(index)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t("productsForm.removeBatch")}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {batchFields.length === 0 && (
              <div className="text-center py-12">
                <SquareChartGantt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  {t("productsForm.noBatchesAdded")}
                </p>
                <button
                  type="button"
                  onClick={addBatch}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {t("productsForm.addFirstBatch")}
                </button>
              </div>
            )}
          </div>

          {errors.batches && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">
                {errors.batches.message}
              </p>
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
          >
            {t("form.cancel")}
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating || isUpdating
              ? t("form.processing")
              : mode === "add"
                ? t("productsForm.createProduct")
                : t("productsForm.updateProduct")}
          </button>
        </div>
      </form>

      {isCreateTypeModalOpen && (
        <ReusableForm
          title={t("productsForm.createProductType")}
          fields={typeFields}
          endpoint="/api/inventory/products/types/"
          method="post"
          onClose={() => setIsCreateTypeModalOpen(false)}
          onSuccess={handleCreateTypeSuccess}
          submitButtonText={t("productsForm.createType")}
        />
      )}
      {createCompany && (
        <ReusableForm
          title={t("productsForm.createCompany")}
          fields={companyFields}
          endpoint="/api/inventory/products/companies/"
          method="post"
          onClose={() => setCreateCompany(false)}
          onSuccess={handleCreateCompanySuccess}
          submitButtonText={t("productsForm.createCompany")}
        />
      )}
      {isCreateUnitModalOpen && (
        <ReusableForm
          title={t("productsForm.createNewUnit")}
          fields={unitcreateFields}
          endpoint="/api/inventory/products/units/"
          method="post"
          onClose={() => setIsCreateUnitModalOpen(false)}
          onSuccess={handleCreateUnitSuccess}
          submitButtonText={t("productsForm.createUnit")}
        />
      )}
      {batchModalOpen && selectedBatchId && selectedBatchSize && (
        <FormBatch
          id={selectedBatchId}
          q={selectedBatchSize}
          onBack={() => setBatchModalOpen(false)}
        />
      )}
    </div>
  );
};

export default FormProducts;
