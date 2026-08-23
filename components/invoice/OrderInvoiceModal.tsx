"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Printer, Download, Eye, FileText } from "lucide-react";
import { OrderInvoiceView } from "./OrderInvoiceView";
import { getOrGenerateInvoiceNumber } from "@/lib/utils/invoiceUtils";

interface OrderInvoiceModalProps {
  order: any;
  branch?: any;
  restaurant?: any;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  branch,
  restaurant,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!order || !mounted) return null;

  const invoiceNum = getOrGenerateInvoiceNumber(order);
  const elementId = `invoice-print-area-${order.id}`;

  /**
   * Print ONLY the selected order by opening a dedicated, completely isolated
   * print popup window containing strictly this single invoice's HTML.
   */
  const handlePrint = () => {
    const invoiceElement = document.getElementById(elementId);
    if (!invoiceElement) {
      window.print();
      return;
    }

    const printContent = invoiceElement.outerHTML;
    const printWindow = window.open("", "_blank", "width=850,height=950");

    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${invoiceNum}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                background-color: #ffffff !important;
                color: #0f172a !important;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                margin: 0;
                padding: 16px;
              }
              @media print {
                body {
                  padding: 0;
                  margin: 0;
                }
                .no-print {
                  display: none !important;
                }
              }
            </style>
          </head>
          <body>
            <div style="max-width: 800px; margin: 0 auto;">
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
      // Fallback if popup blocked
      window.print();
    }
  };

  /**
   * Download PDF containing ONLY the selected order by cloning
   * its invoice DOM tree into a dedicated off-screen container.
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
        // Create an isolated container with strictly this order's invoice clone
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "-9999px";
        container.style.width = "800px";
        container.style.backgroundColor = "#ffffff";
        container.style.padding = "20px";

        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.border = "none";
        clone.style.boxShadow = "none";
        clone.style.maxWidth = "100%";
        clone.style.margin = "0";

        container.appendChild(clone);
        document.body.appendChild(container);

        const opt = {
          margin: 8,
          filename: `Invoice-${invoiceNum}.pdf`,
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
      console.warn("PDF download fallback:", err);
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };

  const modalContent = (
    <div
      id="single-print-portal"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      {/* Fallback CSS to hide everything except single-print-portal during standard browser print */}
      <style jsx global>{`
        @media print {
          body > *:not(#single-print-portal) {
            display: none !important;
          }
          #single-print-portal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
          }
          #single-print-portal .print-hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Action Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print-hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Order Bill / Tax Invoice</h2>
              <p className="text-[11px] text-slate-400 font-mono">{invoiceNum}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-amber-400" /> View Bill
            </span>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Bill
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloading ? "Generating PDF..." : "Download PDF"}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100 flex-1">
          <OrderInvoiceView
            order={order}
            branch={branch}
            restaurant={restaurant}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
