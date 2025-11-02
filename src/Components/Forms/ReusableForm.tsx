import { useForm } from "react-hook-form";
import { useMutate } from "../../Hook/API/useApiMutate";
import { useEffect, useRef, useState } from "react";
import { Loader2, X, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: SelectOption[];
}

interface ReusableFormProps {
  fields: FormField[];
  title: string;
  endpoint: string;
  method: "post" | "put" | "patch";
  onSuccess?: <T = unknown>(data: T) => void;
  onClose?: () => void;
  submitButtonText?: string;
  initialValues?: Record<string, string | number | boolean | null | undefined>;
}

export default function ReusableForm({
  fields,
  title,
  endpoint,
  method,
  onSuccess,
  onClose,
  submitButtonText = "Submit",
  initialValues = {},
}: ReusableFormProps) {
  const { t } = useTranslation();

  const prevInitialValues = useRef(initialValues);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: initialValues,
  });

  useEffect(() => {
    const hasChanged =
      JSON.stringify(prevInitialValues.current) !==
      JSON.stringify(initialValues);

    if (hasChanged) {
      reset(initialValues);
      prevInitialValues.current = initialValues;
    }
  }, [initialValues, reset]);

  const { mutate, isLoading, error } = useMutate({
    endpoint,
    method,
    onSuccess,
  });

  const onSubmit = (data: Record<string, unknown>) => {
    const formData: Record<
      string,
      string | number | boolean | File | string[]
    > = {};

    // ✅ معالجة خاصة لإنشاء الـ permission
    if (title.toLowerCase().includes("permission")) {
      // جمع section و subsection و action في قيمة واحدة
      const section = data.section as string;
      const subsection = data.subsection as string;
      const action = data.action as string;

      if (section && subsection && action) {
        formData["name"] = `${section}.${subsection}.${action}`;
      }
    } else {
      // المعالجة العادية لباقي الحقول
      fields.forEach((field) => {
        const value = data[field.name];

        // ✅ التعديل الجديد: لا ترسل الحقول الفارغة إذا كانت غير مطلوبة
        if (
          field.required ||
          (value !== undefined && value !== null && value !== "" && value !== 0)
        ) {
          if (field.type === "multiselect") {
            if (Array.isArray(value)) {
              formData[field.name] = value;
            } else if (value) {
              formData[field.name] = [value.toString()];
            } else {
              formData[field.name] = [];
            }
          } else if (field.type === "checkbox") {
            formData[field.name] = Boolean(value);
          } else if (value !== undefined && value !== null) {
            if (field.type === "number") {
              formData[field.name] =
                typeof value === "number" ? value : Number(value);
            } else if (field.type === "file") {
              if (value instanceof FileList && value.length > 0) {
                formData[field.name] = value[0];
              }
            } else if (typeof value === "string" || typeof value === "number") {
              // ✅ لا ترسل الحقول الفارغة إذا كانت غير مطلوبة
              if (field.required || (value !== "" && value !== 0)) {
                formData[field.name] = value;
              }
            } else if (field.required) {
              formData[field.name] = field.type === "number" ? 0 : "";
            }
          } else if (field.required) {
            formData[field.name] = field.type === "number" ? 0 : "";
          }
        }
      });
    }

    console.log("Submitting form data:", formData);
    mutate(formData);
  };

  // ... باقي الكود بدون تغيير ...
  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    const value = e.target.value;
    if (value === "" || !isNaN(Number(value))) {
      setValue(fieldName, value, { shouldValidate: true });
    }
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const renderField = (field: FormField) => {
    if (field.type === "select") {
      return (
        <select
          id={field.name}
          className={`block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors[field.name] ? "border-red-300" : "border-gray-300"
          }`}
          {...register(field.name, {
            required: field.required
              ? t("form.fieldRequired", { field: field.label })
              : false,
          })}
        >
          <option value="">
            {field.required
              ? `${t("form.select", { field: field.label })} *`
              : t("form.select", { field: field.label })}
          </option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === "multiselect") {
      return (
        <select
          id={field.name}
          multiple
          className={`block w-full  rounded-md border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors[field.name] ? "border-red-300" : "border-gray-300"
          }`}
          {...register(field.name, {
            required: field.required
              ? t("form.fieldRequired", { field: field.label })
              : false,
          })}
          size={3}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
    if (field.name === "description") {
      return (
        <textarea
          id={field.name}
          rows={4}
          className={`block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors[field.name] ? "border-red-300" : "border-gray-300"
          }`}
          {...register(field.name, {
            required: field.required
              ? t("form.fieldRequired", { field: field.label })
              : false,
          })}
        />
      );
    }

    if (field.type === "checkbox") {
      return (
        <div className="flex items-center">
          <input
            id={field.name}
            type="checkbox"
            className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
              errors[field.name] ? "border-red-300" : "border-gray-300"
            }`}
            {...register(field.name)}
          />
          <label
            htmlFor={field.name}
            className="ml-2 block text-sm text-gray-700"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      );
    }

    if (field.type === "password") {
      return (
        <div className="relative">
          <input
            id={field.name}
            type={showPassword[field.name] ? "text" : "password"}
            className={`block w-full rounded-md shadow-sm sm:text-sm p-3 pr-10 ${
              errors[field.name]
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
            {...register(field.name, {
              required: field.required
                ? t("form.fieldRequired", { field: field.label })
                : false,
              minLength: field.required
                ? {
                    value: 6,
                    message: t("form.passwordMinLength"),
                  }
                : undefined,
            })}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => togglePasswordVisibility(field.name)}
          >
            {showPassword[field.name] ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
      );
    }

    // ✅ باقي أنواع الحقول
    return (
      <input
        id={field.name}
        type={field.type || "text"}
        className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
          errors[field.name]
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        }`}
        {...register(field.name, {
          required: field.required
            ? t("form.fieldRequired", { field: field.label })
            : false,
          valueAsNumber: field.type === "number",
          validate: (value) => {
            if (field.required && !value && value !== 0) {
              return t("form.fieldRequired", { field: field.label });
            }
            if (
              field.type === "number" &&
              isNaN(Number(value)) &&
              field.required
            ) {
              return t("form.validNumber");
            }
            return true;
          },
        })}
        onChange={(e) => {
          if (field.type === "number") {
            handleNumberChange(e, field.name);
          }
        }}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="p-6 relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 px-6 border-b border-gray-100">
          {title}
        </h2>
        <X
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer hover:text-gray-700"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`${
                  field.name === "description"
                    ? "md:col-span-2"
                    : field.type === "checkbox"
                      ? "md:col-span-2"
                      : field.type === "password"
                        ? "md:col-span-2"
                        : ""
                }`}
              >
                <div className="space-y-2">
                  {field.type !== "checkbox" && (
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                  )}

                  {renderField(field)}

                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[field.name]?.message?.toString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onClose}
            >
              {t("form.cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  {t("form.processing")}
                </>
              ) : (
                submitButtonText
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error.message}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
