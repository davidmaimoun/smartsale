export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalRevenue: number;
  topProducts: ProductSale[];
  salesByDay: DailySales[];
  previousPeriodComparison: {
    salesChange: number;
    ordersChange: number;
    revenueChange: number;
  };
}

export interface ProductSale {
  id: number;
  name: string;
  quantity: number;
  revenue: number;
}

export interface DailySales {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

export interface WooCommerceConfig {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface AIInsight {
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actionable: boolean;
}
