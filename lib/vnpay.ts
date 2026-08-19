import crypto from "node:crypto";

type VnpParams = Record<string, string>;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatVnpDate(date: Date): string {
  return (
    String(date.getFullYear()) +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

function stripDiacritics(s: string): string {
  return s
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Sort keys, drop empty values, encodeURIComponent each value with space -> '+' (VNPay's exact convention). */
function sortAndEncode(params: VnpParams): VnpParams {
  const keys = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== "")
    .sort();
  const sorted: VnpParams = {};
  for (const key of keys) {
    sorted[key] = encodeURIComponent(params[key]).replace(/%20/g, "+");
  }
  return sorted;
}

function toQueryString(params: VnpParams): string {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

function hmacSha512(secret: string, data: string): string {
  return crypto.createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex");
}

export function createVnpayPaymentUrl(opts: {
  amountVnd: number;
  txnRef: string;
  orderInfo: string;
  ipAddr: string;
}): string {
  const tmnCode = process.env.VNP_TMN_CODE;
  const hashSecret = process.env.VNP_HASH_SECRET;
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;
  if (!tmnCode || !hashSecret || !vnpUrl || !returnUrl) {
    throw new Error("Thiếu cấu hình VNPay (VNP_TMN_CODE/VNP_HASH_SECRET/VNP_URL/VNP_RETURN_URL).");
  }

  const params: VnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: opts.txnRef,
    vnp_OrderInfo: stripDiacritics(opts.orderInfo).slice(0, 255),
    vnp_OrderType: "other",
    vnp_Amount: String(Math.round(opts.amountVnd * 100)),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: opts.ipAddr,
    vnp_CreateDate: formatVnpDate(new Date()),
  };

  const sorted = sortAndEncode(params);
  const signData = toQueryString(sorted);
  const secureHash = hmacSha512(hashSecret, signData);

  return `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;
}

export function verifyVnpaySignature(query: URLSearchParams): { valid: boolean; params: VnpParams } {
  const hashSecret = process.env.VNP_HASH_SECRET;
  const raw: VnpParams = {};
  for (const [k, v] of query.entries()) raw[k] = v;

  if (!hashSecret) return { valid: false, params: raw };

  const receivedHash = raw["vnp_SecureHash"];
  const toVerify = { ...raw };
  delete toVerify["vnp_SecureHash"];
  delete toVerify["vnp_SecureHashType"];

  const sorted = sortAndEncode(toVerify);
  const signData = toQueryString(sorted);
  const computedHash = hmacSha512(hashSecret, signData);

  return { valid: Boolean(receivedHash) && receivedHash === computedHash, params: raw };
}

export function isVnpaySuccess(params: VnpParams): boolean {
  return params.vnp_ResponseCode === "00" && params.vnp_TransactionStatus === "00";
}
