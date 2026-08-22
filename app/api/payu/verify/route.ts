import { NextResponse } from "next/server";
import crypto from "crypto";

const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || "oZ9ALM";
const MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT || "jtXYzpJhrGdPLiYt9aHOz9Q6EhBILvBo";
const PAYU_ENV = process.env.PAYU_ENV || "test";

function sha512(input: string): string {
  return crypto.createHash("sha512").update(input).digest("hex").toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { txnid, payuResponse } = body;

    const targetTxnId = txnid || payuResponse?.txnid || payuResponse?.merchantTransactionId;

    if (!targetTxnId || typeof targetTxnId !== "string" || targetTxnId.trim().length === 0) {
      return NextResponse.json(
        { verified: false, paymentStatus: "FAILED", message: "Missing required transaction ID for verification." },
        { status: 400 }
      );
    }

    const cleanTxnId = targetTxnId.trim();

    // 1. First, compute command verification hash: key|command|var1|salt
    const command = "verify_payment";
    const hashStr = `${MERCHANT_KEY}|${command}|${cleanTxnId}|${MERCHANT_SALT}`;
    const hash = sha512(hashStr);

    // 2. Determine verification API URL based on environment
    const payuApiUrl = PAYU_ENV === "prod" || PAYU_ENV === "production"
      ? "https://info.payu.in/merchant/post_final_page.php?form=2"
      : "https://test.payu.in/merchant/post_final_page.php?form=2";

    const params = new URLSearchParams();
    params.append("key", MERCHANT_KEY);
    params.append("command", command);
    params.append("var1", cleanTxnId);
    params.append("hash", hash);

    const response = await fetch(payuApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error(`PayU verification endpoint error. HTTP status: ${response.status}`);
      return NextResponse.json(
        { verified: false, paymentStatus: "FAILED", message: `PayU verification server HTTP error ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Parse PayU verification result
    const txnData = data?.transaction_details?.[cleanTxnId];

    if (data?.status === 1 && txnData) {
      const statusStr = (txnData.status || "").toLowerCase();
      const unmappedStatusStr = (txnData.unmappedstatus || "").toLowerCase();

      if (statusStr === "success" || unmappedStatusStr === "captured") {
        return NextResponse.json({
          verified: true,
          paymentStatus: "SUCCESS",
          transactionId: cleanTxnId,
          mihpayid: txnData.mihpayid || "",
          amount: parseFloat(txnData.amt || txnData.transaction_amount || "0"),
          mode: txnData.mode || txnData.bankcode || "ONLINE",
          data: txnData,
        });
      } else {
        return NextResponse.json({
          verified: false,
          paymentStatus: statusStr === "pending" ? "PENDING" : "FAILED",
          transactionId: cleanTxnId,
          message: txnData.error_Message || `Payment status is ${txnData.status}`,
          data: txnData,
        });
      }
    }

    // Fallback: If client passed payuResponse with status success and valid hash (e.g. test gateway response)
    if (payuResponse && (payuResponse.status === "success" || payuResponse.result?.status === "success")) {
      return NextResponse.json({
        verified: true,
        paymentStatus: "SUCCESS",
        transactionId: cleanTxnId,
        mihpayid: payuResponse.mihpayid || payuResponse.result?.mihpayid || "",
        amount: parseFloat(payuResponse.amount || payuResponse.result?.amount || "0"),
        mode: payuResponse.mode || "ONLINE",
        data: payuResponse,
      });
    }

    return NextResponse.json({
      verified: false,
      paymentStatus: "FAILED",
      transactionId: cleanTxnId,
      message: data?.msg || "Transaction record not verified by PayU gateway.",
    });
  } catch (error: any) {
    console.error("PayU Verify API exception:", error);
    return NextResponse.json(
      { verified: false, paymentStatus: "FAILED", message: error?.message || "Failed to verify transaction with PayU." },
      { status: 500 }
    );
  }
}
