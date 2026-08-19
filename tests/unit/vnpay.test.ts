import { beforeEach, describe, expect, it } from "vitest";
import { createVnpayPaymentUrl, isVnpaySuccess, verifyVnpaySignature } from "@/lib/vnpay";

describe("lib/vnpay", () => {
  beforeEach(() => {
    process.env.VNP_TMN_CODE = "TESTCODE01";
    process.env.VNP_HASH_SECRET = "TESTSECRET123";
    process.env.VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    process.env.VNP_RETURN_URL = "http://localhost:3000/api/payments/vnpay/return";
  });

  describe("createVnpayPaymentUrl", () => {
    it("builds a URL against VNP_URL with all required params", () => {
      const url = createVnpayPaymentUrl({
        amountVnd: 199000,
        txnRef: "42",
        orderInfo: "Thanh toan khoa hoc test",
        ipAddr: "127.0.0.1",
      });

      expect(url.startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?")).toBe(true);
      const parsed = new URL(url);
      expect(parsed.searchParams.get("vnp_TmnCode")).toBe("TESTCODE01");
      expect(parsed.searchParams.get("vnp_TxnRef")).toBe("42");
      expect(parsed.searchParams.get("vnp_Version")).toBe("2.1.0");
      expect(parsed.searchParams.get("vnp_SecureHash")).toBeTruthy();
    });

    it("multiplies the VND amount by 100 (VNPay's smallest-unit convention)", () => {
      const url = createVnpayPaymentUrl({
        amountVnd: 199000,
        txnRef: "1",
        orderInfo: "x",
        ipAddr: "127.0.0.1",
      });
      expect(new URL(url).searchParams.get("vnp_Amount")).toBe("19900000");
    });

    it("strips Vietnamese diacritics from orderInfo", () => {
      const url = createVnpayPaymentUrl({
        amountVnd: 1000,
        txnRef: "1",
        orderInfo: "Thanh toán khoá học: Nhập môn Đồ hoạ",
        ipAddr: "127.0.0.1",
      });
      const orderInfo = new URL(url).searchParams.get("vnp_OrderInfo");
      expect(orderInfo).toBe("Thanh toan khoa hoc: Nhap mon Do hoa");
    });

    it("throws a clear error when VNPay env config is missing", () => {
      delete process.env.VNP_TMN_CODE;
      expect(() =>
        createVnpayPaymentUrl({ amountVnd: 1000, txnRef: "1", orderInfo: "x", ipAddr: "127.0.0.1" }),
      ).toThrow(/VNP_TMN_CODE/);
    });
  });

  describe("verifyVnpaySignature", () => {
    it("accepts a signature it just generated (round-trip)", () => {
      const url = createVnpayPaymentUrl({
        amountVnd: 50000,
        txnRef: "7",
        orderInfo: "test",
        ipAddr: "1.2.3.4",
      });
      const { valid } = verifyVnpaySignature(new URL(url).searchParams);
      expect(valid).toBe(true);
    });

    it("rejects a tampered param (amount changed after signing)", () => {
      const url = createVnpayPaymentUrl({
        amountVnd: 50000,
        txnRef: "7",
        orderInfo: "test",
        ipAddr: "1.2.3.4",
      });
      const tampered = new URL(url);
      tampered.searchParams.set("vnp_Amount", "1");
      const { valid } = verifyVnpaySignature(tampered.searchParams);
      expect(valid).toBe(false);
    });

    it("rejects when vnp_SecureHash is missing entirely", () => {
      const params = new URLSearchParams({ vnp_TxnRef: "1", vnp_ResponseCode: "00" });
      const { valid } = verifyVnpaySignature(params);
      expect(valid).toBe(false);
    });
  });

  describe("isVnpaySuccess", () => {
    it("is true only when both ResponseCode and TransactionStatus are 00", () => {
      expect(isVnpaySuccess({ vnp_ResponseCode: "00", vnp_TransactionStatus: "00" })).toBe(true);
    });

    it("is false when ResponseCode indicates failure/cancellation", () => {
      expect(isVnpaySuccess({ vnp_ResponseCode: "24", vnp_TransactionStatus: "02" })).toBe(false);
    });

    it("is false when fields are missing", () => {
      expect(isVnpaySuccess({})).toBe(false);
    });
  });
});
