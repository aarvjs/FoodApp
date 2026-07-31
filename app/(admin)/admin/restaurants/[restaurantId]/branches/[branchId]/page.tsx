"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Store, 
  UtensilsCrossed, 
  Layers, 
  Grid3X3, 
  ShoppingBag, 
  Tag, 
  Users, 
  Truck, 
  Image, 
  BarChart2, 
  Settings, 
  ArrowLeft,
  Clock,
  Plus,
  Edit3,
  Trash2
} from "lucide-react";
import { branchRepository } from "@/repositories/branchRepository";
import { menuRepository } from "@/repositories/menuRepository";
import { categoryRepository } from "@/repositories/categoryRepository";
import { tableRepository } from "@/repositories/tableRepository";
import { orderRepository } from "@/repositories/orderRepository";
import { offerRepository } from "@/repositories/offerRepository";
import { galleryRepository } from "@/repositories/galleryRepository";
import { reviewRepository } from "@/repositories/reviewRepository";

import { BranchModel } from "@/models/branch";
import { MenuItemModel } from "@/models/menuItem";
import { CategoryModel } from "@/models/category";
import { TableModel, TableBookingModel } from "@/models/table";
import { OrderModel } from "@/models/order";
import { OfferModel } from "@/models/offer";
import { GalleryItemModel } from "@/models/gallery";
import { ReviewModel } from "@/models/review";

import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

type BranchTab = 
  | "overview" 
  | "menu" 
  | "categories" 
  | "tables" 
  | "orders" 
  | "offers" 
  | "gallery" 
  | "reviews" 
  | "analytics" 
  | "settings";

export default function BranchDashboardPage() {
  const routeParams = useParams();
  const restaurantId = (routeParams?.restaurantId as string) || "";
  const branchId = (routeParams?.branchId as string) || "";

  const [branch, setBranch] = useState<BranchModel | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [tables, setTables] = useState<TableModel[]>([]);
  const [tableBookings, setTableBookings] = useState<TableBookingModel[]>([]);
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [offers, setOffers] = useState<OfferModel[]>([]);
  const [gallery, setGallery] = useState<GalleryItemModel[]>([]);
  const [reviews, setReviews] = useState<ReviewModel[]>([]);

  const [activeTab, setActiveTab] = useState<BranchTab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!branchId) return;

    async function loadBranchData() {
      setLoading(true);
      setError(null);
      try {
        const b = await branchRepository.getById(branchId);
        if (!b) {
          setError("Branch not found.");
          setLoading(false);
          return;
        }
        setBranch(b);

        // Fetch everything scoped strictly to THIS branchId!
        const menuList = await menuRepository.getByBranch(branchId);
        setMenuItems(menuList);

        const catList = await categoryRepository.getByBranch(branchId);
        setCategories(catList);

        const tableList = await tableRepository.getByBranch(branchId);
        setTables(tableList);

        const bookingList = await tableRepository.getBookingsByBranch(branchId);
        setTableBookings(bookingList);

        const orderList = await orderRepository.getByBranch(branchId);
        setOrders(orderList);

        const offerList = await offerRepository.getByBranch(branchId);
        setOffers(offerList);

        const galList = await galleryRepository.getByBranch(branchId);
        setGallery(galList);

        const revList = await reviewRepository.getByBranch(branchId);
        setReviews(revList);

      } catch (err: any) {
        setError(err.message || "Failed to load branch dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadBranchData();
  }, [branchId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="p-6">
        <ErrorState message={error || "Branch details could not be loaded."} />
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Store },
    { id: "menu", label: `Menu (${menuItems.length})`, icon: UtensilsCrossed },
    { id: "categories", label: `Categories (${categories.length})`, icon: Layers },
    { id: "tables", label: `Tables (${tables.length})`, icon: Grid3X3 },
    { id: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag },
    { id: "offers", label: `Offers (${offers.length})`, icon: Tag },
    { id: "gallery", label: `Gallery (${gallery.length})`, icon: Image },
    { id: "reviews", label: `Reviews (${reviews.length})`, icon: BarChart2 },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/admin/restaurants/${restaurantId}`} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Restaurant
            </Link>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30">
              Branch Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{branch.name}</h1>
          <p className="text-slate-300 text-xs mt-1">
            {branch.location?.formattedAddress || "Location Address"} • Manager: <strong>{branch.managerName}</strong> ({branch.managerEmail})
          </p>
        </div>

        <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/20 text-right">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Branch Status</span>
          <span className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider">{branch.status}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto bg-white border border-slate-200/80 rounded-2xl p-2 shadow-sm custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as BranchTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Branch Menu Items</span>
            <p className="text-2xl font-black text-slate-900">{menuItems.length}</p>
          </div>
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Branch Categories</span>
            <p className="text-2xl font-black text-slate-900">{categories.length}</p>
          </div>
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Dining Tables</span>
            <p className="text-2xl font-black text-slate-900">{tables.length}</p>
          </div>
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total Branch Orders</span>
            <p className="text-2xl font-black text-emerald-600">{orders.length}</p>
          </div>
        </div>
      )}

      {/* Tab 2: Menu */}
      {activeTab === "menu" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Branch Menu Items ({menuItems.length})</h2>
          </div>

          {menuItems.length === 0 ? (
            <EmptyState title="No Branch Items" description="Add menu items to this branch." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="h-36 bg-slate-100 rounded-xl overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                  <p className="text-slate-500 line-clamp-1">{item.description}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-bold">
                    <span className="text-emerald-600 text-sm">₹{item.offerPrice || item.price}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] uppercase">{item.foodType}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Tables */}
      {activeTab === "tables" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {tables.map((t) => (
            <div key={t.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between font-black text-sm text-slate-900">
                <span>{t.tableNumber}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] uppercase">{t.status}</span>
              </div>
              <p className="text-slate-500">Capacity: <strong>{t.capacity} Persons</strong> ({t.type || "Indoor"})</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
