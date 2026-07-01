import crypto from "crypto";

const SANDBOX_BASE = "https://api-sandbox.doku.com";
const PROD_BASE = "https://api.doku.com";
const CHECKOUT_PATH = "/checkout/v1/payment";

export interface CheckoutRequest {
  amount: number;
  invoiceNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  paymentDueDate?: number;
  callbackUrl?: string;
  lineItems?: Array<{
    id?: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
}

export interface CheckoutResponse {
  paymentUrl: string;
  sessionId: string;
  tokenId: string;
  expiredDate: string;
}

export interface DokuNotification {
  originalPartnerReferenceNo?: string;
  originalReferenceNo?: string;
  originalExternalId?: string;
  latestTransactionStatus?: string;
  transactionStatusDesc?: string;
  amount?: { value: string; currency: string };
}

function getBaseUrl(clientId: string): string {
  return clientId.startsWith("BRN-") ? PROD_BASE : SANDBOX_BASE;
}

function generateCheckoutSignature(
  clientId: string,
  requestId: string,
  timestamp: string,
  body: string,
  secretKey: string,
  endpointPath: string
): string {
  const digest = crypto.createHash("sha256").update(body).digest("base64");
  const components = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${timestamp}`,
    `Request-Target:${endpointPath}`,
    `Digest:${digest}`,
  ];
  const stringToSign = components.join("\n");
  const hmac = crypto.createHmac("sha256", secretKey).update(stringToSign).digest("base64");
  return `HMACSHA256=${hmac}`;
}

export function verifyNotificationSignature(
  body: Record<string, unknown>,
  headers: { "x-signature"?: string; "x-timestamp"?: string; "x-partner-id"?: string },
  endpointPath: string,
  secretKey: string,
  accessToken?: string
): boolean {
  const signature = headers["x-signature"];
  const timestamp = headers["x-timestamp"];
  if (!signature || !timestamp) return false;

  const bodyStr = JSON.stringify(body);
  const bodyHash = crypto.createHash("sha256").update(bodyStr).digest("hex").toLowerCase();

  const token = accessToken || "";
  const stringToSign = `POST:${endpointPath}:${token}:${bodyHash}:${timestamp}`;
  const computed = crypto.createHmac("sha512", secretKey).update(stringToSign).digest("base64");

  return signature === computed;
}

export async function createCheckoutPayment(params: {
  clientId: string;
  secretKey: string;
  request: CheckoutRequest;
  notificationUrl?: string;
}): Promise<{ paymentUrl: string | null; error?: string }> {
  const { clientId, secretKey, request, notificationUrl } = params;

  if (!clientId || !secretKey) {
    return { paymentUrl: null, error: "Doku credentials not configured" };
  }

  const baseUrl = getBaseUrl(clientId);
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  const body: Record<string, unknown> = {
    order: {
      amount: request.amount,
      invoice_number: request.invoiceNumber,
      currency: "IDR",
      ...(request.callbackUrl ? { callback_url: request.callbackUrl, auto_redirect: true } : {}),
      ...(request.lineItems?.length
        ? { line_items: request.lineItems.map((li) => ({ id: li.id || crypto.randomUUID().slice(0, 8), name: li.name, price: li.price, quantity: li.quantity, category: li.category || "others" })) }
        : {}),
    },
    payment: {
      payment_due_date: request.paymentDueDate || 60,
    },
    customer: {
      id: request.customer.id.slice(0, 50),
      name: request.customer.name,
      email: request.customer.email,
      ...(request.customer.phone ? { phone: request.customer.phone } : {}),
    },
    ...(notificationUrl ? { additional_info: { override_notification_url: notificationUrl } } : {}),
  };

  const bodyStr = JSON.stringify(body);
  const signature = generateCheckoutSignature(clientId, requestId, timestamp, bodyStr, secretKey, CHECKOUT_PATH);

  try {
    const res = await fetch(`${baseUrl}${CHECKOUT_PATH}`, {
      method: "POST",
      headers: {
        "Client-Id": clientId,
        "Request-Id": requestId,
        "Request-Timestamp": timestamp,
        Signature: signature,
        "Content-Type": "application/json",
      },
      body: bodyStr,
    });

    const json = await res.json();

    if (!res.ok) {
      const errs = json.error_messages || [json.error?.message || json.message || `HTTP ${res.status}`];
      return { paymentUrl: null, error: Array.isArray(errs) ? errs.join(", ") : String(errs) };
    }

    const paymentUrl = json.response?.payment?.url;
    if (!paymentUrl) {
      return { paymentUrl: null, error: "No payment URL in response" };
    }

    return { paymentUrl };
  } catch (e: any) {
    return { paymentUrl: null, error: `Network error: ${e.message || "unknown"}` };
  }
}
