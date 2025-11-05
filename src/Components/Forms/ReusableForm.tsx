import { useForm } from "react-hook-form";
import { useMutate } from "../../Hook/API/useApiMutate";
import { useEffect, useRef, useState } from "react";
import { Loader2, X, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
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
  placeholder?: string;
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
      const section = data.section as string;
      const subsection = data.subsection as string;
      const action = data.action as string;

      if (section && subsection && action) {
        formData["name"] = `${section}.${subsection}.${action}`;
      }
    } else {
      fields.forEach((field) => {
        const value = data[field.name];

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

  const getInputClassName = (hasError: boolean, type?: string) => {
    const baseClasses = "block w-full rounded-lg shadow-sm transition-all duration-200 sm:text-sm p-3 ";
    
    if (hasError) {
      return baseClasses + "border-2 border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200 pr-10";
    }
    
    return baseClasses + "border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 " + 
           (type === "password" ? "pr-10" : "");
  };

  const renderField = (field: FormField) => {
    if (field.type === "select") {
      return (
        <select
          id={field.name}
          className={getInputClassName(!!errors[field.name])}
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
          className={getInputClassName(!!errors[field.name])}
          {...register(field.name, {
            required: field.required
              ? t("form.fieldRequired", { field: field.label })
              : false,
          })}
          size={4}
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
          placeholder={field.placeholder}
          className={getInputClassName(!!errors[field.name])}
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
        <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
          <div className="flex items-center h-5 mt-0.5">
            <input
              id={field.name}
              type="checkbox"
              className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition duration-200 ${
                errors[field.name] ? "border-red-300" : "border-gray-300"
              }`}
              {...register(field.name)}
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.placeholder && (
              <p className="text-xs text-gray-500 mt-1">{field.placeholder}</p>
            )}
          </div>
        </div>
      );
    }

    if (field.type === "password") {
      return (
        <div className="relative">
          <input
            id={field.name}
            type={showPassword[field.name] ? "text" : "password"}
            placeholder={field.placeholder}
            className={getInputClassName(!!errors[field.name], "password")}
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
            className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200"
            onClick={() => togglePasswordVisibility(field.name)}
          >
            {showPassword[field.name] ? (
              <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
            ) : (
              <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
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
        placeholder={field.placeholder}
        className={getInputClassName(!!errors[field.name])}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300">
      <div className="p-0 relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              type="button"
              aria-label="close modal"
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={`${
                    field.name === "description" ||
                    field.type === "checkbox" ||
                    field.type === "password" ||
                    field.type === "multiselect"
                      ? "md:col-span-2"
                      : ""
                  }`}
                >
                  <div className="space-y-2">
                    {field.type !== "checkbox" && (
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium text-gray-700  items-center"
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                    )}

                    {renderField(field)}

                    {errors[field.name] && (
                      <div className="flex items-center space-x-1 mt-1">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600">
                          {errors[field.name]?.message?.toString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {t("form.errorTitle")}
                  </p>
                  <p className="text-sm text-red-700 mt-1">{error.message}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 mt-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                className="px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 focus:scale-105"
                onClick={onClose}
              >
                {t("form.cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 focus:scale-105 ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    {t("form.processing")}
                  </>
                ) : (
                  <>
                    <Check className="-ml-1 mr-2 h-4 w-4" />
                    {submitButtonText}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}