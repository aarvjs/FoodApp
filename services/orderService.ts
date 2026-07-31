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
import { Order, OrderStatus } from "@/types";

const COLLECTION_NAME = "orders";

export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Order));
    } catch (e) {
      console.warn("getOrders error:", e);
      return [];
    }
  },

  subscribeToOrders: (callback: (orders: Order[]) => void, onError?: (err: any) => void) => {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Order));
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (orders):", err.message);
        if (onError) onError(err);
      }
    );
  },

  subscribeToBranchOrders: (branchId: string, callback: (orders: Order[]) => void, onError?: (err: any) => void) => {
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
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Order));
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (branchOrders):", err.message);
        if (onError) onError(err);
      }
    );
  },

  addOrder: async (data: Partial<Order>): Promise<Order> => {
    const docRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();
    const orderNum = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    const subtotal = data.subtotal || data.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    const tax = data.tax ?? Math.round(subtotal * 0.05);
    const deliveryFee = data.deliveryFee ?? 40;
    const totalAmount = data.totalAmount ?? (subtotal + tax + deliveryFee);

    const newOrder: Order = {
      id: docRef.id,
      orderNumber: data.orderNumber || orderNum,
      restaurantId: data.restaurantId || "",
      branchId: data.branchId || "",
      branchName: data.branchName || "Main Branch",
      customerName: data.customerName || "Walk-in Customer",
      customerPhone: data.customerPhone || "+91 9876543210",
      customerAddress: data.customerAddress || "Location Address",
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

  /**
   * Update order status with optional preparation time and rejection reason, emitting in-app notification document
   */
  updateOrderStatus: async (
    id: string, 
    status: OrderStatus, 
    estimatedPrepMinutes?: number, 
    rejectionReason?: string
  ): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    let payload: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (estimatedPrepMinutes !== undefined) {
      payload.estimatedPrepMinutes = estimatedPrepMinutes;
    }
    if (rejectionReason !== undefined) {
      payload.rejectionReason = rejectionReason;
    }

    await updateDoc(docRef, payload);

    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const orderData = snap.data();
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
      }
    } catch (e) {
      console.warn("Failed to create notification document:", e);
    }
  },

  deleteOrder: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
