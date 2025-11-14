// AddStock.tsx
import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useGet } from "../../Hook/API/useApiGet";
import { useMutate } from "../../Hook/API/useApiMutate";
import type { 
  Branch, 
  StockPoint, 
  Product, 
  Batch,
  StockTransferRequest 
} from "../../types/stockTransfer";

interface AddStockProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface StockTransferResponse {
  id: number;
}

export default function AddStock({ onClose, onSuccess }: AddStockProps) {
  const [openTab, setOpenTab] = useState(1);
  const [formData, setFormData] = useState<StockTransferRequest>({
    current_branch: 0,
    target_branch: 0,
    current_stock_point: 0,
    target_stock_point: 0,
    request_notes: "",
    items: []
  });
  
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [selectedBatch, setSelectedBatch] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);

  // Fetch branches
  const { data: branchesData } = useGet<{ results: Branch[] }>({
    endpoint: "/api/branch/",
    queryKey: ["branches"],
    params: { minimal: true }
  });

  // Fetch stock points
  const { data: stockPointsData } = useGet<{ results: StockPoint[] }>({
    endpoint: "/api/inventory/stocks/stock-points/",
    queryKey: ["stock-points"]
  });

  // Fetch products
  const { data: productsData } = useGet<{ results: Product[] }>({
    endpoint: "/api/inventory/products/",
    queryKey: ["products"],
  });

  // Create stock transfer mutation
  const createTransferMutation = useMutate<StockTransferResponse, StockTransferRequest>({
    endpoint: "/api/inventory/stocks/transfers/",
    method: "post",
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    invalidate: ["stock-transfers"]
  });

  const branches = branchesData?.results || [];
  const stockPoints = stockPointsData?.results || [];
  const products = useMemo(() => productsData?.results || [], [productsData?.results]);

  useEffect(() => {
    if (selectedProduct) {
      const product = products.find(p => p.id === selectedProduct);
      setAvailableBatches(product?.batches || []);
      setSelectedBatch(0);
    } else {
      setAvailableBatches([]);
      setSelectedBatch(0);
    }
  }, [selectedProduct, products]);

  const activeClasses = "text-blue-600 border-blue-600 bg-blue-50";
  const inactiveClasses = "text-gray-500 hover:text-gray-700 hover:bg-gray-50";

  const tabs = [
    { id: 1, label: "From Branch" },
    { id: 2, label: "From Stock Point" },
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddProduct = () => {
    if (selectedProduct && selectedBatch && quantity > 0) {
      const product = products.find(p => p.id === selectedProduct);
      const batch = availableBatches.find(b => b.id === selectedBatch);

      if (!product || !batch) return;

      const existingProductIndex = formData.items.findIndex(
        item => item.product_batch === selectedBatch
      );

      if (existingProductIndex >= 0) {
        const updatedItems = [...formData.items];
        updatedItems[existingProductIndex].requested_quantity = quantity;
        setFormData(prev => ({ ...prev, items: updatedItems }));
      } else {
        setFormData(prev => ({
          ...prev,
          items: [
            ...prev.items,
            { 
              product_batch: selectedBatch, 
              requested_quantity: quantity,
              product_name: product.commercial_name,
              batch_number: batch.batch_num
            }
          ]
        }));
      }

      setSelectedProduct(0);
      setSelectedBatch(0);
      setQuantity(1);
    }
  };

  const handleRemoveProduct = (productBatchId: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product_batch !== productBatchId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // إنشاء نسخة من البيانات وتنظيفها من القيم الافتراضية (0)
    const cleanedFormData: StockTransferRequest = {
      ...formData,
      items: formData.items
    };

    // إزالة الحقول التي تحتوي على قيمة 0
    if (cleanedFormData.current_branch === 0) {
      delete (cleanedFormData as any).current_branch;
    }
    if (cleanedFormData.target_branch === 0) {
      delete (cleanedFormData as any).target_branch;
    }
    if (cleanedFormData.current_stock_point === 0) {
      delete (cleanedFormData as any).current_stock_point;
    }
    if (cleanedFormData.target_stock_point === 0) {
      delete (cleanedFormData as any).target_stock_point;
    }

    // إذا كانت request_notes فارغة، احذفها أيضاً
    if (!cleanedFormData.request_notes) {
      delete (cleanedFormData as any).request_notes;
    }

    createTransferMutation.mutate(cleanedFormData);
  };

  const getProductBatchInfo = (productBatchId: number) => {
    const item = formData.items.find(item => item.product_batch === productBatchId);
    if (item) {
      return `${item.product_name} - ${item.batch_number}`;
    }
    return "Unknown Product";
  };

  const getMaxQuantity = () => {
    if (selectedBatch) {
      const batch = availableBatches.find(b => b.id === selectedBatch);
      return batch?.batch_size || 0;
    }
    return 0;
  };

  return (
    <div className="flex flex-col gap-6">
      <nav className="mb-4">
        <div className="border-b border-gray-200">
          <ul className="flex -mb-px">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setOpenTab(tab.id)}
                  className={`mr-1 py-3 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                    openTab === tab.id ? activeClasses : inactiveClasses
                  } ${openTab === tab.id ? "border-blue-600" : "border-transparent"}`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <form onSubmit={handleSubmit}>
        <button
          type="button"
          onClick={onClose}
          className="p-2 flex gap-2 items-center"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <h2 className="text-xl font-bold text-gray-800">
            Initiate Stock Transfer
          </h2>
        </button>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Branch
            </label>
            <select
              title="formBranch"
              value={formData.current_branch}
              onChange={(e) => handleInputChange("current_branch", parseInt(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value={0}>Select Source Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          
          {openTab === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Branch
              </label>
              <select
                title="toBranch"
                value={formData.target_branch}
                onChange={(e) => handleInputChange("target_branch", parseInt(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value={0}>Select Target Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stock Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Stock Point
            </label>
            <select
              title="currentStockPoint"
              value={formData.current_stock_point}
              onChange={(e) => handleInputChange("current_stock_point", parseInt(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value={0}>Select Current Stock Point</option>
              {stockPoints.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Stock Point
            </label>
            <select
              title="targetStockPoint"
              value={formData.target_stock_point}
              onChange={(e) => handleInputChange("target_stock_point", parseInt(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value={0}>Select Target Stock Point</option>
              {stockPoints.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Note Field */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Request Notes
          </label>
          <textarea
            value={formData.request_notes || ""}
            onChange={(e) => handleInputChange("request_notes", e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={3}
            placeholder="Add any notes about this transfer request..."
          />
        </div>

        {/* Products Section */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Products
          </label>
          
          {/* Product Selection */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  title="product"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(parseInt(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value={0}>Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.english_name} - {product.arabic_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <select
                  title="batch"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(parseInt(e.target.value))}
                  disabled={!selectedProduct}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value={0}>Select Batch</option>
                  {availableBatches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batch_num} (Exp: {new Date(batch.exp_date).toLocaleDateString()}) - Qty: {batch.batch_size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Quantity
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      const maxQty = getMaxQuantity();
                      setQuantity(value > maxQty ? maxQty : value);
                    }}
                    min="1"
                    max={getMaxQuantity()}
                    disabled={!selectedBatch}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Quantity"
                  />
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    disabled={!selectedBatch || quantity <= 0}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {selectedBatch && (
                  <p className="text-xs text-gray-500 mt-1">
                    Max available: {getMaxQuantity()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Selected Products List */}
          {formData.items.length > 0 && (
            <div className="border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product & Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getProductBatchInfo(item.product_batch)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.requested_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(item.product_batch)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createTransferMutation.isLoading || formData.items.length === 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createTransferMutation.isLoading ? "Creating Transfer..." : "Create Transfer Request"}
          </button>
        </div>
      </form>
    </div>
  );
}