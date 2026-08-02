"use client";

import React, { useState } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Phone,
  MapPin,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  UserX,
  User
} from "lucide-react";
import { EnrichedCustomer } from "@/lib/utils/customerHelper";

interface CustomerTableProps {
  customers: EnrichedCustomer[];
  onSelectCustomer: (customer: EnrichedCustomer) => void;
}

type SortField = "name" | "registeredDate" | "totalOrders" | "totalSpent" | "lastOrderDate" | "status" | "assignedRestaurantCount";
type SortOrder = "asc" | "desc";

export function CustomerTable({ customers, onSelectCustomer }: CustomerTableProps) {
  const [sortField, setSortField] = useState<SortField>("totalSpent");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Track failed image URLs so fallbacks render cleanly
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleImageError = (customerId: string) => {
    setFailedImages((prev) => ({ ...prev, [customerId]: true }));
  };

  // Sort logic
  const sortedCustomers = [...customers].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === "registeredDate" || sortField === "lastOrderDate") {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    }

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = (bVal || "").toLowerCase();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination calculation
  const totalPages = Math.ceil(sortedCustomers.length / rowsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * rowsPerPage;
  const paginatedCustomers = sortedCustomers.slice(startIndex, startIndex + rowsPerPage);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 text-emerald-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-emerald-600" />
    );
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap min-w-[1100px]">
          <thead className="bg-slate-50/90 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 sticky top-0">
            <tr>
              <th className="px-4 py-3.5">Profile Photo</th>

              <th
                onClick={() => handleSort("name")}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Customer Name</span>
                  {renderSortIcon("name")}
                </div>
              </th>

              <th className="px-4 py-3.5">Mobile Number</th>

              <th
                onClick={() => handleSort("registeredDate")}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Registered Date</span>
                  {renderSortIcon("registeredDate")}
                </div>
              </th>

              <th className="px-4 py-3.5">Current Saved Address</th>

              <th className="px-4 py-3.5">City</th>

              <th className="px-4 py-3.5">State</th>

              <th
                onClick={() => handleSort("totalOrders")}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Total Orders</span>
                  {renderSortIcon("totalOrders")}
                </div>
              </th>

              <th
                onClick={() => handleSort("totalSpent")}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Total Amount Spent</span>
                  {renderSortIcon("totalSpent")}
                </div>
              </th>

              <th
                onClick={() => handleSort("lastOrderDate")}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Order Date</span>
                  {renderSortIcon("lastOrderDate")}
                </div>
              </th>

              <th
                onClick={() => handleSort("status")}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon("status")}
                </div>
              </th>

              <th
                onClick={() => handleSort("assignedRestaurantCount")}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Restaurants</span>
                  {renderSortIcon("assignedRestaurantCount")}
                </div>
              </th>

              <th className="px-4 py-3.5 text-right pr-6">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium">
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-4 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserX className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-semibold">No customers match the current filter criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((cust) => {
                const hasValidImage = cust.profileImage && !failedImages[cust.id];
                return (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* 1. Profile Photo */}
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/20 bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs font-black text-xs uppercase">
                        {hasValidImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={cust.profileImage}
                            alt={cust.name}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(cust.id)}
                          />
                        ) : (
                          <span>{cust.name ? cust.name.substring(0, 2) : "CU"}</span>
                        )}
                      </div>
                    </td>

                    {/* 2. Customer Name */}
                    <td className="px-4 py-3 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      <div>{cust.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">ID: {cust.id}</div>
                    </td>

                    {/* 3. Mobile Number */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-800 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {cust.phone}
                      </div>
                    </td>

                    {/* 4. Registered Date */}
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {cust.registeredDate ? new Date(cust.registeredDate).toLocaleDateString() : "N/A"}
                      </div>
                    </td>

                    {/* 5. Current Saved Address */}
                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="flex items-center gap-1 text-slate-700 truncate" title={cust.currentSavedAddress}>
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.currentSavedAddress}</span>
                      </div>
                    </td>

                    {/* 6. City */}
                    <td className="px-4 py-3 font-semibold text-slate-800">{cust.city}</td>

                    {/* 7. State */}
                    <td className="px-4 py-3 text-slate-600">{cust.state}</td>

                    {/* 8. Total Orders */}
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-xs">
                        {cust.totalOrders} orders
                      </span>
                    </td>

                    {/* 9. Total Amount Spent */}
                    <td className="px-4 py-3 font-black text-emerald-600 text-xs">
                      ₹{cust.totalSpent.toLocaleString()}
                    </td>

                    {/* 10. Last Order Date */}
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString() : "Never"}
                    </td>

                    {/* 11. Status (Active / Inactive) */}
                    <td className="px-4 py-3">
                      {cust.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px] uppercase border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full text-[10px] uppercase border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* 12. Assigned Restaurant Count */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-slate-700 font-semibold text-xs">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {cust.assignedRestaurantCount} Rest.
                      </span>
                    </td>

                    {/* 13. Action (View Details) */}
                    <td className="px-4 py-3 text-right pr-6">
                      <button
                        onClick={() => onSelectCustomer(cust)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ml-2 text-slate-500">
            Showing {sortedCustomers.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + rowsPerPage, sortedCustomers.length)} of {sortedCustomers.length} customers
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={validCurrentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 font-bold text-slate-800">
            Page {validCurrentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={validCurrentPage === totalPages || totalPages === 0}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
