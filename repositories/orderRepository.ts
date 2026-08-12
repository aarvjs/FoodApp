import { db } from "@/firebase/config";
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";
import { OrderModel, OrderStatusType } from "@/models/order";

const COLLECTION_NAME = "orders";

export const orderRepository = {
  async getByBranch(branchId: string): Promise<OrderModel[]> {
    if (!branchId) return [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where("branchId", "==", branchId)
      );
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as OrderModel));
    } catch (e) {
      console.warn("orderRepository.getByBranch error:", e);
      return [];
    }
  },

  subscribeByBranch(branchId: string, callback: (orders: OrderModel[]) => void, onError?: (err: any) => void) {
    if (!branchId) {
      callback([]);
      return () => {};
    }
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("branchId", "==", branchId)
    );
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as OrderModel));
        callback(items);
      },
      (err) => {
        console.warn("orderRepository.subscribeByBranch notice:", err.message);
        if (onError) onError(err);
      }
    );
  },

  async getByRestaurant(restaurantId: string): Promise<OrderModel[]> {
    if (!restaurantId) return [];
    try {
      const q1 = query(
        collection(db, COLLECTION_NAME),
        where("restaurantId", "==", restaurantId)
      );
      const snap1 = await getDocs(q1);
      const orders1 = snap1.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as OrderModel));

      const q2 = query(
        collection(db, COLLECTION_NAME),
        where("branchId", "==", restaurantId)
      );
      const snap2 = await getDocs(q2);
      const orders2 = snap2.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as OrderModel));

      const map = new Map<string, OrderModel>();
      orders1.forEach((o) => map.set(o.id, o));
      orders2.forEach((o) => map.set(o.id, o));

      const merged = Array.from(map.values());
      merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return merged;
    } catch (e) {
      console.warn("orderRepository.getByRestaurant error:", e);
      return [];
    }
  },

  subscribeByRestaurant(
    restaurantId: string,
    callback: (orders: OrderModel[]) => void,
    onError?: (err: any) => void
  ) {
    if (!restaurantId) {
      callback([]);
      return () => {};
    }

    let orders1: OrderModel[] = [];
    let orders2: OrderModel[] = [];

    const mergeAndEmit = () => {
      const map = new Map<string, OrderModel>();
      orders1.forEach((o) => map.set(o.id, o));
      orders2.forEach((o) => map.set(o.id, o));
      const merged = Array.from(map.values());
      merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(merged);
    };

    const q1 = query(
      collection(db, COLLECTION_NAME),
      where("restaurantId", "==", restaurantId)
    );

    const q2 = query(
      collection(db, COLLECTION_NAME),
      where("branchId", "==", restaurantId)
    );

    const unsub1 = onSnapshot(
      q1,
      (snap) => {
        orders1 = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as OrderModel));
        mergeAndEmit();
      },
      (err) => {
        console.warn("orderRepository.subscribeByRestaurant q1 notice:", err.message);
        if (onError) onError(err);
      }
    );

    const unsub2 = onSnapshot(
      q2,
      (snap) => {
        orders2 = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as OrderModel));
        mergeAndEmit();
      },
      (err) => {
        console.warn("orderRepository.subscribeByRestaurant q2 notice:", err.message);
      }
    );

    return () => {
      unsub1();
      unsub2();
    };
  },

  async create(data: Partial<OrderModel>): Promise<OrderModel> {
    if (!data.branchId || !data.restaurantId) {
      throw new Error("orderRepository.create: branchId and restaurantId are mandatory.");
    }

    const docRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();
    const orderNum = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    const subtotal = data.subtotal || data.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    const tax = data.tax ?? Math.round(subtotal * 0.05);
    const deliveryFee = data.deliveryFee ?? 40;
    const totalAmount = data.totalAmount ?? (subtotal + tax + deliveryFee);

    const newOrder: OrderModel = {
      id: docRef.id,
      orderNumber: data.orderNumber || orderNum,
      restaurantId: data.restaurantId,
      branchId: data.branchId, // STRICT MANDATORY OWNERSHIP
      branchName: data.branchName || "Branch",
      customerName: data.customerName || "Customer",
      customerPhone: data.customerPhone || "+91 9876543210",
      customerAddress: data.customerAddress || "",
      items: data.items || [],
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      paymentStatus: data.paymentStatus || "PAID",
      paymentMethod: data.paymentMethod || "UPI",
      orderType: data.orderType || "DELIVERY",
      status: data.status || "PENDING",
      estimatedPrepMinutes: data.estimatedPrepMinutes || 20,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, newOrder);
    return newOrder;
  },

  async updateStatus(
    id: string, 
    status: OrderStatusType, 
    estimatedPrepMinutes?: number, 
    rejectionReason?: string
  ): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error("Order not found.");
    }
    const currentData = snap.data();
    if ((currentData.status || "").toUpperCase() === "CANCELLED") {
      throw new Error("This order has already been cancelled and cannot be updated.");
    }

    let payload: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (estimatedPrepMinutes !== undefined) payload.estimatedPrepMinutes = estimatedPrepMinutes;
    if (rejectionReason !== undefined) payload.rejectionReason = rejectionReason;

    await updateDoc(docRef, payload);

    try {
      const orderData = currentData;
      const customerId = orderData.customerId || orderData.userId;
      const orderNum = orderData.orderNumber || id;
      if (customerId) {
        let title = `Order Status Updated`;
        let body = `Your order #${orderNum} status is now ${status.replace(/_/g, ' ')}.`;

        if (status === 'ACCEPTED') {
          title = 'Order Accepted! 🍳';
          body = `Your order #${orderNum} has been accepted. Estimated prep time: ${estimatedPrepMinutes || 20} mins.`;
        } else if (status === 'PREPARING') {
          title = 'Kitchen Preparing Your Order 👨‍🍳';
          body = `The chef is now preparing your meal for order #${orderNum}.`;
        } else if (status === 'READY') {
          title = 'Order Ready! 📦';
          body = `Your order #${orderNum} is ready and waiting for pickup/dispatch.`;
        } else if (status === 'OUT_FOR_DELIVERY') {
          title = 'Out for Delivery! 🛵';
          body = `Your order #${orderNum} is on the way. Our rider will reach you soon!`;
        } else if (status === 'DELIVERED') {
          title = 'Order Delivered! 🎉';
          body = `Your order #${orderNum} has been delivered. Bon appétit!`;
        } else if (status === 'REJECTED') {
          title = 'Order Rejected ❌';
          body = `Order #${orderNum} was rejected. Reason: ${rejectionReason || 'Kitchen busy'}`;
        } else if (status === 'CANCELLED') {
          title = 'Order Cancelled ⚠️';
          body = `Order #${orderNum} has been cancelled.`;
        }

        const notifRef = doc(collection(db, "notifications"));
        await setDoc(notifRef, {
          id: notifRef.id,
          userId: customerId,
          orderId: id,
          title,
          body,
          type: 'delivery',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Failed to generate notification record:", e);
    }
  },

  async cancelOrder(
    id: string,
    cancelledBy: "customer" | "admin" | "branch_manager" | string,
    cancellationReason: string,
    cancellationNote?: string
  ): Promise<{ success: boolean; message?: string }> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return { success: false, message: "Order not found." };
    }
    const orderData = snap.data();
    const currentStatus = (orderData.status || "").toUpperCase();

    if (currentStatus === "CANCELLED") {
      return { success: false, message: "This order has already been cancelled." };
    }
    if (currentStatus === "DELIVERED" || currentStatus === "COMPLETED") {
      return { success: false, message: "Delivered or completed orders cannot be cancelled." };
    }

    const now = new Date().toISOString();
    const payload: any = {
      status: "CANCELLED",
      cancelledBy,
      cancellationReason,
      cancellationNote: cancellationNote || "",
      cancelledAt: now,
      updatedAt: now
    };

    if (orderData.paymentStatus === "PAID") {
      payload.paymentStatus = "REFUNDED";
    }

    await updateDoc(docRef, payload);

    try {
      const customerId = orderData.customerId || orderData.userId;
      const orderNum = orderData.orderNumber || id;
      if (customerId) {
        const notifRef = doc(collection(db, "notifications"));
        await setDoc(notifRef, {
          id: notifRef.id,
          userId: customerId,
          orderId: id,
          title: "Order Cancelled ⚠️",
          body: `Order #${orderNum} has been cancelled by ${cancelledBy.replace(/_/g, " ")}. Reason: ${cancellationReason}`,
          type: "delivery",
          read: false,
          createdAt: now
        });
      }
    } catch (e) {
      console.warn("Failed to create cancellation notification:", e);
    }

    return { success: true };
  },

  async deleteOrder(id: string): Promise<{ success: boolean; message?: string }> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return { success: false, message: "Order not found." };
    }
    const currentData = snap.data();
    if ((currentData.status || "").toUpperCase() !== "CANCELLED") {
      return { success: false, message: "Only cancelled orders can be deleted." };
    }
    await deleteDoc(docRef);
    return { success: true };
  }
};
