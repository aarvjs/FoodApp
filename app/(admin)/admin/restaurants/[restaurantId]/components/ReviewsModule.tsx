"use client";

import React, { useState } from "react";
import { Star, MessageSquare, Trash2, Send } from "lucide-react";
import { ReviewModel } from "@/models/review";

interface ReviewsModuleProps {
  reviews: ReviewModel[];
}

export function ReviewsModule({ reviews }: ReviewsModuleProps) {
  return (
    <div className="space-y-6 text-xs">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Customer Ratings & Reviews ({reviews.length})
        </h2>
        <p className="text-xs text-slate-500">Monitor feedback, customer satisfaction & reply to reviews</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">{rev.customerName}</h4>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{rev.rating}.0</span>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">{rev.comment}</p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400 font-medium">
              <span>{rev.createdAt?.split("T")[0] || "Recent Review"}</span>
              <button className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Reply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
