import { pay, getPaymentStatus } from "@base-org/account";
import { useState, useCallback } from "react";

export type PaymentStatus = "idle" | "pending" | "completed" | "failed";

export interface PaymentResult {
  id: string;
  status: PaymentStatus;
}

// Recipient wallet — set VITE_PAYMENT_ADDRESS in .env to override
const RECIPIENT =
  import.meta.env.VITE_PAYMENT_ADDRESS ?? "0x2211d1D0020DAEA8039E46Cf1367962070d77DA9";

export function useBasePay() {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerPayment = useCallback(async (amount = "1.00", testnet = false) => {
    setStatus("pending");
    setError(null);
    try {
      const payment = await pay({
        amount,
        to: RECIPIENT,
        testnet,
      });

      setTxId(payment.id);

      // Verify on-chain
      const { status: onchainStatus } = await getPaymentStatus({
        id: payment.id,
        testnet,
      });

      const final: PaymentStatus = onchainStatus === "completed" ? "completed" : "failed";
      setStatus(final);
      return { id: payment.id, status: final };
    } catch (err: any) {
      setStatus("failed");
      setError(err?.message ?? "Payment failed");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setTxId(null);
    setError(null);
  }, []);

  return { status, txId, error, triggerPayment, reset };
}
