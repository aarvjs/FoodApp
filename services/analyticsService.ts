import { Order, Product } from "@/types";

export interface DashboardAnalytics {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  topSellingItems: { name: string; salesCount: number; revenue: number }[];
}

export const analyticsService = {
  computeDashboardMetrics: (orders: Order[], products: Product[] = []): DashboardAnalytics => {
    const today = new Date().toISOString().split("T")[0];

    let totalRevenue = 0;
    let totalOrders = orders.length;
    let todayOrders = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    const itemSalesMap: Record<string, { name: string; salesCount: number; revenue: number }> = {};

    orders.forEach((order) => {
      const orderDate = order.createdAt ? order.createdAt.split("T")[0] : "";
      
      if (orderDate === today) {
        todayOrders++;
      }

      if (order.status === "DELIVERED" || order.status === "READY") {
        completedOrders++;
        totalRevenue += order.totalAmount || 0;
      } else if (order.status === "CANCELLED") {
        cancelledOrders++;
      } else {
        pendingOrders++;
        totalRevenue += order.totalAmount || 0;
      }

      // Calculate item sales
      order.items?.forEach((item) => {
        const key = item.productName || item.productId;
        if (!itemSalesMap[key]) {
          itemSalesMap[key] = {
            name: item.productName || "Dish Item",
            salesCount: 0,
            revenue: 0
          };
        }
        itemSalesMap[key].salesCount += item.quantity || 1;
        itemSalesMap[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    const topSellingItems = Object.values(itemSalesMap)
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);

    return {
      totalOrders,
      todayOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      topSellingItems
    };
  }
};
