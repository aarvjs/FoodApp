"use client";

import { useEffect } from "react";
import { auth } from "@/firebase/config";
import { useStore } from "@/lib/store/useStore";
import { 
  restaurantService, 
  branchService, 
  menuService, 
  categoryService, 
  offerService, 
  orderService, 
  customerService, 
  tableService 
} from "@/services";

export function useFirestoreRealtime(userRole?: string, targetBranchId?: string) {
  const user = useStore((state) => state.user);
  const selectedBranchId = useStore((state) => state.selectedBranchId);

  const activeBranchId = targetBranchId || selectedBranchId || user?.assignedBranchId || user?.branchId;

  const setRestaurants = useStore((state) => state.setRestaurants);
  const setBranches = useStore((state) => state.setBranches);
  const setCategories = useStore((state) => state.setCategories);
  const setProducts = useStore((state) => state.setProducts);
  const setOrders = useStore((state) => state.setOrders);
  const setOffers = useStore((state) => state.setOffers);
  const setCustomers = useStore((state) => state.setCustomers);
  const setTables = useStore((state) => state.setTables);
  const setTableBookings = useStore((state) => state.setTableBookings);

  useEffect(() => {
    // Only subscribe to live Firestore snapshots when an active user session exists
    if (!user && !auth.currentUser) {
      return;
    }

    const unsubRestaurants = restaurantService.subscribeToRestaurants((items) => {
      setRestaurants(items);
    });

    const unsubBranches = branchService.subscribeToBranches((items) => {
      setBranches(items);
    });

    let unsubCategories: (() => void) | undefined;
    let unsubProducts: (() => void) | undefined;
    let unsubOrders: (() => void) | undefined;
    let unsubOffers: (() => void) | undefined;
    let unsubTables: (() => void) | undefined;
    let unsubBookings: (() => void) | undefined;

    if (activeBranchId) {
      // CLEAR old branch items before loading new branch data
      setCategories([]);
      setProducts([]);
      setOrders([]);
      setOffers([]);
      setTables([]);
      setTableBookings([]);

      unsubCategories = categoryService.subscribeToBranchCategories(activeBranchId, (items) => {
        setCategories(items);
      });

      unsubProducts = menuService.subscribeToBranchMenuItems(activeBranchId, (items) => {
        setProducts(items);
      });

      unsubOrders = orderService.subscribeToBranchOrders(activeBranchId, (items) => {
        setOrders(items);
      });

      unsubOffers = offerService.subscribeToBranchOffers(activeBranchId, (items) => {
        setOffers(items);
      });

      unsubTables = tableService.subscribeToBranchTables(activeBranchId, (items) => {
        setTables(items);
      });

      unsubBookings = tableService.subscribeToBranchBookings(activeBranchId, (items) => {
        setTableBookings(items);
      });
    } else {
      unsubCategories = categoryService.subscribeToCategories((items) => {
        setCategories(items);
      });

      unsubProducts = menuService.subscribeToMenuItems((items) => {
        setProducts(items);
      });

      unsubOrders = orderService.subscribeToOrders((items) => {
        setOrders(items);
      });

      unsubOffers = offerService.subscribeToOffers((items) => {
        setOffers(items);
      });

      unsubTables = tableService.subscribeToTables((items) => {
        setTables(items);
      });

      unsubBookings = tableService.subscribeToBookings((items) => {
        setTableBookings(items);
      });
    }

    const unsubCustomers = customerService.subscribeToCustomers((items) => {
      setCustomers(items);
    });

    return () => {
      unsubRestaurants?.();
      unsubBranches?.();
      unsubCategories?.();
      unsubProducts?.();
      unsubOrders?.();
      unsubOffers?.();
      unsubCustomers?.();
      unsubTables?.();
      unsubBookings?.();
    };
  }, [user, userRole, activeBranchId, setRestaurants, setBranches, setCategories, setProducts, setOrders, setOffers, setCustomers, setTables, setTableBookings]);
}
