import React, { useState, useEffect } from "react";
import { FaPen, FaSave, FaTimes } from "react-icons/fa";
import { useGet } from "../../Hook/API/useApiGet";
import { useMutate } from "../../Hook/API/useApiMutate";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TypeOrUnitData {
  id: number;
  parent: number | null;
  parent_name?: string;
  name: string;
  children_count: number;
  level?: number;
  created_at: string;
  created_by_username: string;
  modified_at: string;
}

interface ViewTypeOrUnitProps {
  itemId: number;
  itemType: "unit" | "type";
  onBack: () => void;
}

interface UpdateTypeOrUnitData {
  name: string;
  parent?: number | null;
}

const ViewTypeOrUnit: React.FC<ViewTypeOrUnitProps> = ({
  itemId,
  itemType,
  onBack,
}) => {
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    parent: null as number | null,
  });

  const endpoint = `/api/inventory/products/${itemType}s/${itemId}/`;
  const allItemsEndpoint = `/api/inventory/products/${itemType}s/`;

  // جلب بيانات العنصر
  const {
    data: itemData,
    isLoading,
    error,
    refetch,
  } = useGet<TypeOrUnitData>({
    endpoint,
    queryKey: [`${itemType}-item`, itemId],
  });

  // جلب كل العناصر لنفس النوع (لاختيار ال parent)
  const { data: allItemsResponse } = useGet<{
    count: number;
    results: TypeOrUnitData[];
  }>({
    endpoint: allItemsEndpoint,
    queryKey: [`all-${itemType}s`],
  });

  // Mutation for updating item
  const updateMutation = useMutate<TypeOrUnitData, UpdateTypeOrUnitData>({
    endpoint,
    method: "patch",
    invalidate: [`${itemType}-item`],
  });

  useEffect(() => {
    if (itemData) {
      setFormData({
        name: itemData.name,
        parent: itemData.parent,
      });
    }
  }, [itemData]);

  // Handle form input changes
  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | null,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      const updateData: UpdateTypeOrUnitData = {
        name: formData.name,
      };

      // Only include parent if it's different from the original
      if (formData.parent !== itemData?.parent) {
        updateData.parent = formData.parent;
      }

      await updateMutation.mutateAsync(updateData);
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Handle cancel editing
  const handleCancelEditing = () => {
    // Reset to original data
    if (itemData) {
      setFormData({
        name: itemData.name,
        parent: itemData.parent,
      });
    }
    setIsEditing(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get available parent options (exclude current item and its children)
  const getParentOptions = () => {
    if (!allItemsResponse?.results) return [];

    return allItemsResponse.results.filter(
      (item) =>
        item.id !== itemId && // exclude self
        (!itemData ||
          item.level === undefined ||
          itemData.level === undefined ||
          item.level < itemData.level),
    );
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !itemData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="p-6 bg-white rounded-lg shadow-lg text-center">
          <p className="text-red-500 mb-4">
            {t("viewTypeOrUnit.errorLoading", {
              itemType: t(`viewTypeOrUnit.${itemType}`),
            })}
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t("viewTypeOrUnit.backToList")}
          </button>
        </div>
      </div>
    );
  }

  const parentOptions = getParentOptions();
  const displayName =
    itemType === "unit" ? t("viewTypeOrUnit.unit") : t("viewTypeOrUnit.type");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="p-6 relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={t("viewTypeOrUnit.backTo", { displayName })}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {itemData.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaPen className="h-4 w-4" />
                <span>{t("viewTypeOrUnit.edit", { displayName })}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancelEditing}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FaTimes className="h-4 w-4" />
                  <span>{t("viewTypeOrUnit.cancel")}</span>
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={updateMutation.isPending}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <FaSave className="h-4 w-4" />
                  <span>
                    {updateMutation.isPending
                      ? t("viewTypeOrUnit.saving")
                      : t("viewTypeOrUnit.saveChanges")}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {t("viewTypeOrUnit.basicInformation")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t("viewTypeOrUnit.name")}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("viewTypeOrUnit.enterName", {
                        displayName: displayName.toLowerCase(),
                      })}
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-md">
                      {itemData.name}
                    </p>
                  )}
                </div>

                {/* Parent Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t("viewTypeOrUnit.parent")}
                  </label>
                  {isEditing ? (
                    <select
                      title="Parent"
                      value={formData.parent || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "parent",
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t("viewTypeOrUnit.noParent")}</option>
                      {parentOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-md">
                      {itemData.parent_name || t("viewTypeOrUnit.noParent")}
                    </p>
                  )}
                </div>

                {/* Children Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t("viewTypeOrUnit.childrenCount")}
                  </label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {itemData.children_count}
                  </p>
                </div>

                {/* Level (for types only) */}
                {itemType === "type" && itemData.level !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {t("viewTypeOrUnit.level")}
                    </label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md">
                      {itemData.level}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {t("viewTypeOrUnit.metadata")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t("viewTypeOrUnit.createdBy")}
                  </label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {itemData.created_by_username}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t("viewTypeOrUnit.createdAt")}
                  </label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {formatDate(itemData.created_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t("viewTypeOrUnit.lastModified")}
                  </label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {formatDate(itemData.modified_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t("viewTypeOrUnit.id")}
                  </label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {itemData.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTypeOrUnit;
