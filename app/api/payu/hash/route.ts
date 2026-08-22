import { NextResponse } from "next/server";
import crypto from "crypto";

const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || "oZ9ALM";
const MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT || "jtXYzpJhrGdPLiYt9aHOz9Q6EhBILvBo";

function sha512(input: string): string {
  return crypto.createHash("sha512").update(input).digest("hex").toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const hashName = (body.hashName || body.name || "").toString();
    const hashString = (body.hashString || "").toString();
    const postSalt = (body.postSalt || "").toString();
    const txnid = (body.txnid || "").toString();
    const amount = (body.amount || "").toString();
    const productinfo = (body.productinfo || "").toString();
    const firstname = (body.firstname || "").toString();
    const email = (body.email || "").toString();
    const udf1 = (body.udf1 || "").toString();
    const udf2 = (body.udf2 || "").toString();
    const udf3 = (body.udf3 || "").toString();
    const udf4 = (body.udf4 || "").toString();
    const udf5 = (body.udf5 || "").toString();
    const command = (body.command || "").toString();
    const var1 = (body.var1 || "").toString();

    // Safe dev logging (Requirement #4 - never print Merchant Salt or Client Secret)
    console.log(`[PayU Hash API] Request: hashName=${hashName}, hashStringLength=${hashString.length}, txnid=${txnid || "N/A"}`);

    let computedHash = "";

    if (hashString && hashString.length > 0) {
      // 1. Primary Rule: Use exact hashString supplied by PayU SDK
      let strToHash = hashString;

      // Append Merchant Salt if not already appended
      if (!strToHash.endsWith(MERCHANT_SALT)) {
        if (strToHash.endsWith("|")) {
          strToHash = strToHash + MERCHANT_SALT;
        } else {
          strToHash = strToHash + "|" + MERCHANT_SALT;
        }
      }

      // Handle postSalt if provided according to PayU spec
      if (postSalt && postSalt.length > 0) {
        if (!strToHash.endsWith(postSalt)) {
          if (strToHash.endsWith("|")) {
            strToHash = strToHash + postSalt;
          } else {
            strToHash = strToHash + "|" + postSalt;
          }
        }
      }

      computedHash = sha512(strToHash);
    } else if (hashName === "payment_hash" || (txnid && amount && productinfo && firstname)) {
      // 2. Fallback Payment Hash Template: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
      const rawString = `${MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${MERCHANT_SALT}`;
      computedHash = sha512(rawString);
    } else if (command || hashName) {
      // 3. Fallback Command Hash Template: key|command|var1|SALT
      const cmdName = command || hashName;
      const rawString = `${MERCHANT_KEY}|${cmdName}|${var1}|${MERCHANT_SALT}`;
      computedHash = sha512(rawString);
    } else {
      return NextResponse.json(
        { status: "error", message: "Insufficient parameters for PayU hash generation." },
        { status: 400 }
      );
    }

    console.log(`[PayU Hash API] Generated hash for ${hashName}: true`);

    const responseData: Record<string, string> = {
      status: "success",
      hash: computedHash,
    };

    if (hashName) {
      responseData[hashName] = computedHash;
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("[PayU Hash API] Exception:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to generate PayU hash." },
      { status: 500 }
    );
  }
}
