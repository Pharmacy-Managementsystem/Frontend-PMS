import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import { useGet } from "../../Hook/API/useApiGet";
import { useMutate } from "../../Hook/API/useApiMutate";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

interface BatchBranch {
  id: number;
  product_batch: string;
  branch: string;
  batch_num: string;
  branch_name: string;
  quantity: number;
  stock_point: string;
  stock_point_name: string;
  is_active: boolean;
  created_at: string;
  modified_at: string;
  created_by: string;
  modified_by: string;
}

interface BatchBranchRequest {
  branch: number;
  quantity: number;
  stock_point?: number;
  is_active: boolean;
}

interface BranchRow extends BatchBranchRequest {
  id: number | string;
  existing?: boolean;
}

interface Branch {
  id: number;
  name: string;
}

interface StockPoint {
  id: number;
  name: string;
}

interface BranchesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Branch[];
}

interface StockPointsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StockPoint[];
}

interface BatchBranchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BatchBranch[];
}

interface CreateBatchBranchRequest {
  branches: BatchBranchRequest[];
}

interface BatchProps {
  id: number;
  q?: number | string;
  onBack: () => void;
}

const FormBatch: React.FC<BatchProps> = ({ id, q, onBack }) => {
  const { t } = useTranslation();
  const [branches, setBranches] = useState<BranchRow[]>([
    {
      id: Date.now(),
      branch: 0,
      quantity: 0,
      stock_point: undefined,
      is_active: true,
    },
  ]);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const {
    data: productBatchBranchesResponse,
    isLoading,
    error,
    refetch,
  } = useGet<BatchBranchResponse>({
    endpoint: `/api/inventory/products/product-batch-branches/?product_batch=${id}`,
    queryKey: ["product-batch-branches", id],
  });

  const { data: stockPointsResponse } = useGet<StockPointsResponse>({
    endpoint: `/api/inventory/stocks/stock-points/`,
    queryKey: ["all-stock-points"],
  });

  const { data: branchResponse } = useGet<BranchesResponse>({
    endpoint: `/api/branch/?minimal=true`,
    queryKey: ["all-branches"],
  });

  const createBatchBranch = useMutate<
    BatchBranchResponse,
    CreateBatchBranchRequest
  >({
    endpoint: `/api/inventory/products/product-batch-branches/${id}/`,
    method: "patch",
    invalidate: ["product-batch-branches", id],
    onSuccess: () => {
      refetch();
      setBranches([
        {
          id: Date.now(),
          branch: 0,
          quantity: 0,
          stock_point: undefined,
          is_active: true,
        },
      ]);
      Swal.fire({
        icon: "success",
        title: t("batchDistribution.success"),
        text: t("batchDistribution.distributionSaved"),
        confirmButtonColor: "#3b82f6",
      });
    },
  });

  useEffect(() => {
    if (productBatchBranchesResponse?.results) {
      const existingBranches: BranchRow[] =
        productBatchBranchesResponse.results.map((item) => ({
          id: item.id,
          branch: parseInt(item.branch),
          quantity: item.quantity,
          stock_point: item.stock_point
            ? parseInt(item.stock_point)
            : undefined,
          is_active: item.is_active,
          existing: true,
        }));

      setBranches(
        existingBranches.length > 0
          ? existingBranches
          : [
              {
                id: Date.now(),
                branch: 0,
                quantity: 0,
                stock_point: undefined,
                is_active: true,
              },
            ],
      );
    }
  }, [productBatchBranchesResponse]);

  useEffect(() => {
    const total = branches.reduce(
      (sum, branch) => sum + (Number(branch.quantity) || 0),
      0,
    );
    setTotalQuantity(total);
  }, [branches]);

  const handleBranchChange = (
    id: number | string,
    field: keyof BatchBranchRequest,
    value: number | boolean | undefined,
  ) => {
    setBranches((prev) =>
      prev.map((branch) =>
        branch.id === id ? { ...branch, [field]: value } : branch,
      ),
    );
  };

  const handleAddRow = () => {
    setBranches((prev) => [
      ...prev,
      {
        id: Date.now(),
        branch: 0,
        quantity: 0,
        stock_point: undefined,
        is_active: true,
      },
    ]);
  };

  const handleSave = async () => {
    const validBranches = branches.filter(
      (branch) => branch.branch && branch.quantity > 0,
    );

    if (validBranches.length === 0) {
      Swal.fire({
        icon: "warning",
        title: t("batchDistribution.noBranches"),
        text: t("batchDistribution.addAtLeastOne"),
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (totalQuantity > Number(q)) {
      Swal.fire({
        icon: "error",
        title: t("batchDistribution.quantityExceeded"),
        text: t("batchDistribution.totalExceedsBatch", {
          total: totalQuantity,
          batch: q,
        }),
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    // If quantity is less than batch size, show confirmation
    if (totalQuantity < Number(q)) {
      const result = await Swal.fire({
        icon: "question",
        title: t("batchDistribution.incompleteDistribution"),
        html: t("batchDistribution.partialDistributionMessage", {
          distributed: totalQuantity,
          total: q,
          remaining: Number(q) - totalQuantity,
        }),
        showCancelButton: true,
        confirmButtonText: t("batchDistribution.yesSave"),
        cancelButtonText: t("form.cancel"),
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#6b7280",
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    const branchData: CreateBatchBranchRequest = {
      branches: validBranches.map(({  ...rest }) => ({
        ...rest,
        stock_point: rest.stock_point || undefined,
      })),
    };

    createBatchBranch.mutate(branchData);
  };

  const remainingQuantity = Number(q) - totalQuantity;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-500 mb-4">
            {t("batchDistribution.errorLoading")}
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t("batchDistribution.backToBatch")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="p-6 relative bg-white rounded-lg shadow-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {t("batchDistribution.title")}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-600">
                {t("batchDistribution.batchSize")}:{" "}
              </span>
              <span className="font-semibold">{q}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">
                {t("batchDistribution.distributed")}:{" "}
              </span>
              <span
                className={`font-semibold ${totalQuantity > Number(q) ? "text-red-600" : "text-blue-600"}`}
              >
                {totalQuantity}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">
                {t("batchDistribution.remaining")}:{" "}
              </span>
              <span
                className={`font-semibold ${remainingQuantity === 0 ? "text-green-600" : remainingQuantity < 0 ? "text-red-600" : "text-gray-600"}`}
              >
                {remainingQuantity}
              </span>
            </div>
            <button
              title={t("batchDistribution.back")}
              type="button"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 p-2"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Add Row Button */}
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <FaPlus className="w-4 h-4" />
            {t("batchDistribution.addBranch")}
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                    #
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                    {t("batchDistribution.branchName")}
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                    {t("productsForm.quantity")}
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                    {t("batchDistribution.stockPointName")}
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                    {t("batchDistribution.active")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {branches.map((branch, index) => (
                  <tr
                    key={branch.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="text-gray-700">{index + 1}</span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        title={t("batchDistribution.branch")}
                        value={branch.branch || ""}
                        onChange={(e) =>
                          handleBranchChange(
                            branch.id,
                            "branch",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">
                          {t("batchDistribution.selectBranch")}
                        </option>
                        {branchResponse?.results?.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        min="0"
                        value={branch.quantity || ""}
                        onChange={(e) =>
                          handleBranchChange(
                            branch.id,
                            "quantity",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <select
                        title={t("batchDistribution.stockPoint")}
                        value={branch.stock_point || ""}
                        onChange={(e) =>
                          handleBranchChange(
                            branch.id,
                            "stock_point",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">
                          {t("batchDistribution.optional")}
                        </option>
                        {stockPointsResponse?.results?.map((sp) => (
                          <option key={sp.id} value={sp.id}>
                            {sp.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <label className="flex items-center justify-center">
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input
                            title={t("batchDistribution.status")}
                            type="checkbox"
                            checked={branch.is_active}
                            onChange={(e) =>
                              handleBranchChange(
                                branch.id,
                                "is_active",
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {branches.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm mb-4">
                  {t("batchDistribution.noBranchesAdded")}
                </p>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {t("batchDistribution.addFirstBranch")}
                </button>
              </div>
            )}
          </div>

          {/* Validation Message */}
          {totalQuantity > Number(q) && (
            <div className="mt-4 p-3 rounded-lg border bg-red-50 border-red-200">
              <p className="text-sm font-medium text-red-600">
                {t("batchDistribution.totalExceedsBatch", {
                  total: totalQuantity,
                  batch: q,
                })}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 mt-4 border-t">
          <button
            onClick={handleSave}
            disabled={totalQuantity > Number(q)}
            className="flex items-center px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaPlus className="mr-2" />
            {t("batchDistribution.saveDistribution")}
          </button>

          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            {t("form.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormBatch;
