import { Order } from "@/types";

export interface DetailedRevenueMetrics {
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  totalOrdersCount: number;
  completedOrdersCount: number;
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
  rejectedOrdersCount: number;
}

export const revenueService = {
  calculateMetrics: (orders: Order[], branchId?: string): DetailedRevenueMetrics => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Weekly threshold (7 days ago)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // Monthly threshold (30 days ago)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter by branch if branchId provided
    const filteredOrders = branchId
      ? orders.filter((o) => o.branchId === branchId)
      : orders;

    let todayRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;
    let totalRevenue = 0;

    let totalOrdersCount = filteredOrders.length;
    let completedOrdersCount = 0;
    let pendingOrdersCount = 0;
    let cancelledOrdersCount = 0;
    let rejectedOrdersCount = 0;

    filteredOrders.forEach((ord) => {
      const ordDate = ord.createdAt ? new Date(ord.createdAt) : new Date();
      const ordDateStr = ord.createdAt ? ord.createdAt.split("T")[0] : todayStr;

      const isCompleted = ord.status === "DELIVERED" || ord.status === "READY" || ord.status === "ACCEPTED";
      const amount = ord.totalAmount || 0;

      if (ord.status === "DELIVERED" || ord.status === "READY" || ord.status === "ACCEPTED" || ord.status === "PREPARING" || ord.status === "OUT_FOR_DELIVERY") {
        totalRevenue += amount;

        if (ordDateStr === todayStr) {
          todayRevenue += amount;
        }

        if (ordDate >= weekAgo) {
          weeklyRevenue += amount;
        }

        if (ordDate >= monthAgo) {
          monthlyRevenue += amount;
        }
      }

      if (ord.status === "DELIVERED") {
        completedOrdersCount++;
      } else if (ord.status === "CANCELLED") {
        cancelledOrdersCount++;
      } else if (ord.status === "REJECTED") {
        rejectedOrdersCount++;
      } else {
        pendingOrdersCount++;
      }
    });

    return {
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      totalRevenue,
      totalOrdersCount,
      completedOrdersCount,
      pendingOrdersCount,
      cancelledOrdersCount,
      rejectedOrdersCount
    };
  }
};
