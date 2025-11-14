// types/stockTransfer.ts
export interface Product {
  id: number;
  arabic_name: string;
  global_code: string;
  show_code: string;
  english_name: string;
  commercial_name: string;
  cost: string;
  company_name: string;
  type_name: string;
  batches: Batch[];
}

export interface Batch {
  id: number;
  batch: number;
  batch_size: number;
  price: string;
  barcode: string;
  batch_num: string;
  exp_date: string;
  cost_price: string;
}

export interface Branch {
  id: number;
  name: string;
}
export interface StockPoint {
  id: number;
  name: string;
}

export interface StockTransferItem {
  product_batch: number;
  requested_quantity: number;
  product_name?: string;
  batch_number?: string;
}

export interface StockTransferRequest {
  current_branch: number;
  target_branch: number;
  current_stock_point: number;
  target_stock_point: number;
  request_notes?: string;
  items: StockTransferItem[];
}