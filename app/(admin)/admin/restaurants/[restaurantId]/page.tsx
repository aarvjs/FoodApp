"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  GitBranch, 
  UtensilsCrossed, 
  Layers, 
  Tag, 
  Grid3X3, 
  ShoppingBag, 
  Image, 
  Star, 
  BarChart2, 
  Settings, 
  ArrowLeft,
  Store,
  Phone,
  Mail,
  IndianRupee,
  Users
} from "lucide-react";
import { restaurantRepository } from "@/repositories/restaurantRepository";
import { branchRepository } from "@/repositories/branchRepository";
import { menuRepository } from "@/repositories/menuRepository";
import { categoryRepository } from "@/repositories/categoryRepository";
import { orderRepository } from "@/repositories/orderRepository";
import { offerRepository } from "@/repositories/offerRepository";
import { galleryRepository } from "@/repositories/galleryRepository";
import { reviewRepository } from "@/repositories/reviewRepository";
import { tableRepository } from "@/repositories/tableRepository";

import { RestaurantModel } from "@/models/restaurant";
import { BranchModel } from "@/models/branch";
import { MenuItemModel } from "@/models/menuItem";
import { CategoryModel } from "@/models/category";
import { OrderModel } from "@/models/order";
import { OfferModel } from "@/models/offer";
import { GalleryItemModel } from "@/models/gallery";
import { ReviewModel } from "@/models/review";
import { TableModel } from "@/models/table";

import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";

import { OverviewModule } from "./components/OverviewModule";
import { BranchesModule } from "./components/BranchesModule";
import { CategoriesModule } from "./components/CategoriesModule";
import { MenuModule } from "./components/MenuModule";
import { TablesModule } from "./components/TablesModule";
import { OffersModule } from "./components/OffersModule";
import { OrdersModule } from "./components/OrdersModule";
import { CustomersModule } from "./components/CustomersModule";
import { GalleryModule } from "./components/GalleryModule";
import { ReviewsModule } from "./components/ReviewsModule";
import { AnalyticsModule } from "./components/AnalyticsModule";
import { SettingsModule } from "./components/SettingsModule";

type TabType = 
  | "overview" 
  | "branches" 
  | "menu" 
  | "categories" 
  | "tables" 
  | "offers" 
  | "orders" 
  | "customers" 
  | "gallery" 
  | "reviews" 
  | "analytics" 
  | "revenue" 
  | "settings";

export default function RestaurantDetailsPage() {
  const routeParams = useParams();
  const restaurantId = (routeParams?.restaurantId as string) || "";

  const [restaurant, setRestaurant] = useState<RestaurantModel | null>(null);
  const [branches, setBranches] = useState<BranchModel[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [tables, setTables] = useState<TableModel[]>([]);
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [offers, setOffers] = useState<OfferModel[]>([]);
  const [gallery, setGallery] = useState<GalleryItemModel[]>([]);
  const [reviews, setReviews] = useState<ReviewModel[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRestaurantData = async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const rest = await restaurantRepository.getById(restaurantId);
      if (!rest) {
        setError("Restaurant not found.");
        setLoading(false);
        return;
      }
      setRestaurant(rest);

      const branchList = await branchRepository.getByRestaurant(restaurantId);
      setBranches(branchList);

      const menuList = await menuRepository.getByRestaurant(restaurantId);
      setMenuItems(menuList);

      const orderList = await orderRepository.getByRestaurant(restaurantId);
      setOrders(orderList);

      if (branchList.length > 0) {
        const firstBranchId = branchList[0].id;
        const catList = await categoryRepository.getByBranch(firstBranchId);
        setCategories(catList);

        const tblList = await tableRepository.getByBranch(firstBranchId);
        setTables(tblList);

        const offList = await offerRepository.getByBranch(firstBranchId);
        setOffers(offList);

        const galList = await galleryRepository.getByBranch(firstBranchId);
        setGallery(galList);

        const revList = await reviewRepository.getByBranch(firstBranchId);
        setReviews(revList);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load restaurant details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="p-6">
        <ErrorState message={error || "Restaurant could not be loaded."} />
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "branches", label: `Branches (${branches.length})`, icon: GitBranch },
    { id: "categories", label: `Categories (${categories.length})`, icon: Layers },
    { id: "menu", label: `Menu (${menuItems.length})`, icon: UtensilsCrossed },
    { id: "tables", label: `Tables (${tables.length})`, icon: Grid3X3 },
    { id: "offers", label: `Offers (${offers.length})`, icon: Tag },
    { id: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag },
    { id: "customers", label: "Customers", icon: Users },
    { id: "gallery", label: `Gallery (${gallery.length})`, icon: Image },
    { id: "reviews", label: `Reviews (${reviews.length})`, icon: Star },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="h-40 bg-slate-900 relative">
          <img src={restaurant.banner} alt={restaurant.name} className="w-full h-full object-cover opacity-75" />
          <div className="absolute top-4 left-4">
            <Link href="/admin/restaurants" className="px-3 py-1.5 bg-slate-900/80 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-slate-900">
              <ArrowLeft className="w-4 h-4" /> Back to Restaurants
            </Link>
          </div>
          <div className="absolute -bottom-6 left-6 w-20 h-20 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden">
            <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="p-6 pt-9 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{restaurant.name}</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">{restaurant.description}</p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-3 font-semibold">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-600" /> {restaurant.phone}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-emerald-600" /> {restaurant.email}</span>
              <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5 text-emerald-600" /> {branches.length} Branches</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${restaurant.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
              {restaurant.status}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-6 py-2 custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Module Rendering */}
      {activeTab === "overview" && (
        <OverviewModule restaurant={restaurant} onRefresh={loadRestaurantData} />
      )}

      {activeTab === "branches" && (
        <BranchesModule
          restaurantId={restaurantId}
          restaurantName={restaurant.name}
          branches={branches}
          onRefresh={loadRestaurantData}
        />
      )}

      {activeTab === "categories" && (
        <CategoriesModule
          restaurantId={restaurantId}
          branches={branches}
          categories={categories}
          onRefresh={loadRestaurantData}
        />
      )}

      {activeTab === "menu" && (
        <MenuModule
          restaurantId={restaurantId}
          branches={branches}
          categories={categories}
          menuItems={menuItems}
          onRefresh={loadRestaurantData}
        />
      )}

      {activeTab === "tables" && (
        <TablesModule
          restaurantId={restaurantId}
          branches={branches}
          tables={tables}
          onRefresh={loadRestaurantData}
        />
      )}

      {activeTab === "offers" && (
        <OffersModule
          restaurantId={restaurantId}
          branches={branches}
          offers={offers}
          onRefresh={loadRestaurantData}
        />
      )}

      {activeTab === "orders" && (
        <OrdersModule orders={orders} onRefresh={loadRestaurantData} restaurantId={restaurantId} />
      )}

      {activeTab === "customers" && (
        <CustomersModule orders={orders} />
      )}

      {activeTab === "gallery" && (
        <GalleryModule
          restaurantId={restaurantId}
          branches={branches}
          gallery={gallery}
          onRefresh={loadRestaurantData}
        />
      )}

      {activeTab === "reviews" && (
        <ReviewsModule reviews={reviews} />
      )}

      {activeTab === "analytics" && (
        <AnalyticsModule orders={orders} menuItems={menuItems} />
      )}

      {activeTab === "settings" && (
        <SettingsModule restaurant={restaurant} onRefresh={loadRestaurantData} />
      )}
    </div>
  );
}
