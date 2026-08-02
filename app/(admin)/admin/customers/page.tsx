"use client";

import React, { useMemo, useState } from "react";
import { Users, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import {
  enrichCustomers,
  calculateCustomerSummaryStats,
  filterCustomers,
  exportCustomersToCSV,
  EnrichedCustomer,
  CustomerFilters
} from "@/lib/utils/customerHelper";
import { CustomerDashboardSummary } from "@/components/admin/customers/CustomerDashboardSummary";
import { CustomerFilterBar } from "@/components/admin/customers/CustomerFilterBar";
import { CustomerTable } from "@/components/admin/customers/CustomerTable";
import { CustomerDetailsModal } from "@/components/admin/customers/CustomerDetailsModal";

const initialFilterState: CustomerFilters = {
  searchQuery: "",
  city: "ALL",
  state: "ALL",
  status: "ALL",
  registrationDateRange: "ALL",
  restaurantId: "ALL",
  minRevenue: "",
  maxRevenue: "",
  minOrders: "",
  maxOrders: ""
};

export default function SuperAdminCustomersPage() {
  const rawCustomers = useStore((state) => state.customers);
  const rawOrders = useStore((state) => state.orders);
  const restaurants = useStore((state) => state.restaurants);
  const branches = useStore((state) => state.branches);

  // 1. Enrich Customer Records with realtime Orders & Analytics
  const enrichedCustomers = useMemo(() => {
    return enrichCustomers(rawCustomers, rawOrders, restaurants, branches);
  }, [rawCustomers, rawOrders, restaurants, branches]);

  // 2. Summary Dashboard Statistics
  const summaryStats = useMemo(() => {
    return calculateCustomerSummaryStats(enrichedCustomers);
  }, [enrichedCustomers]);

  // 3. Filter Options (Cities & States)
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    enrichedCustomers.forEach((c) => {
      if (c.city) cities.add(c.city);
    });
    return Array.from(cities).sort();
  }, [enrichedCustomers]);

  const availableStates = useMemo(() => {
    const states = new Set<string>();
    enrichedCustomers.forEach((c) => {
      if (c.state) states.add(c.state);
    });
    return Array.from(states).sort();
  }, [enrichedCustomers]);

  // 4. Filters State & Handlers
  const [filters, setFilters] = useState<CustomerFilters>(initialFilterState);
  const [selectedCustomer, setSelectedCustomer] = useState<EnrichedCustomer | null>(null);

  const filteredCustomers = useMemo(() => {
    return filterCustomers(enrichedCustomers, filters);
  }, [enrichedCustomers, filters]);

  const handleExportCSV = () => {
    exportCustomersToCSV(filteredCustomers);
  };

  const handleResetFilters = () => {
    setFilters(initialFilterState);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            Customer Directory
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Super Admin production dashboard for customer profiles, order history, address history & revenue analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200/80 flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Super Admin Access
          </span>
        </div>
      </div>

      {/* Top Section 1: Dashboard Summary Cards */}
      <CustomerDashboardSummary summary={summaryStats} />

      {/* Section 2: Search & Filter Bar */}
      <CustomerFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        onExportCSV={handleExportCSV}
        availableCities={availableCities}
        availableStates={availableStates}
        restaurants={restaurants}
        totalResultsCount={filteredCustomers.length}
      />

      {/* Section 3: Professional Customer Data Table */}
      <CustomerTable
        customers={filteredCustomers}
        onSelectCustomer={(cust) => setSelectedCustomer(cust)}
      />

      {/* Section 4: Customer Details Modal / Slide-over View */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
