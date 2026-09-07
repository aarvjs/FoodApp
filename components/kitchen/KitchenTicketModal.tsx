"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Printer, Download, UtensilsCrossed } from "lucide-react";
import { KitchenOrderTicketView } from "./KitchenOrderTicketView";

interface KitchenTicketModalProps {
  order: any;
  branch?: any;
  onClose: () => void;
}

export const KitchenTicketModal: React.FC<KitchenTicketModalProps> = ({
  order,
  branch,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!order || !mounted) return null;

  const orderNum = order.orderNumber || order.id;
  const elementId = `kot-print-area-${order.id}`;

  /**
   * Print ONLY the selected kitchen order ticket by opening a dedicated,
   * isolated print popup window containing strictly this single KOT's HTML.
   */
  const handlePrint = () => {
    const kotElement = document.getElementById(elementId);
    if (!kotElement) {
      window.print();
      return;
    }

    const printContent = kotElement.outerHTML;
    const printWindow = window.open("", "_blank", "width=700,height=900");

    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>KOT - ${orderNum}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
              body {
                background-color: #ffffff !important;
                color: #0f172a !important;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                margin: 0;
                padding: 16px;
              }
              @media print {
                body {
                  padding: 0;
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            <div style="max-width: 600px; margin: 0 auto;">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 400);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  /**
   * Download Kitchen Ticket as PDF
   */
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      if (typeof window !== "undefined" && !(window as any).html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const element = document.getElementById(elementId);
      if (element && (window as any).html2pdf) {
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "-9999px";
        container.style.width = "650px";
        container.style.backgroundColor = "#ffffff";
        container.style.padding = "20px";

        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.border = "2px solid #0f172a";
        clone.style.boxShadow = "none";
        clone.style.maxWidth = "100%";
        clone.style.margin = "0";

        container.appendChild(clone);
        document.body.appendChild(container);

        const opt = {
          margin: 8,
          filename: `KOT-${orderNum}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        await (window as any).html2pdf().set(opt).from(container).save();
        document.body.removeChild(container);
      } else {
        handlePrint();
      }
    } catch (err) {
      console.warn("KOT PDF download fallback:", err);
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };

  const modalContent = (
    <div
      id="kot-print-portal"
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Action Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Kitchen Order Ticket (KOT)</h2>
              <p className="text-[11px] text-slate-400 font-mono">Order #{orderNum}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Order Ticket
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloading ? "Downloading..." : "Download KOT (PDF)"}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100 flex-1">
          <KitchenOrderTicketView order={order} branch={branch} />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
