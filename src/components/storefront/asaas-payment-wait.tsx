"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getOrderPaymentStatusForConfirmation } from "@/lib/checkout/actions";

/** Atualiza a página quando o webhook Asaas marca o pagamento. */
export function AsaasPaymentWait({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const stopped = useRef(false);

  useEffect(() => {
    stopped.current = false;
    const tick = async () => {
      if (stopped.current) return;
      const status = await getOrderPaymentStatusForConfirmation(orderNumber);
      if ("paymentVerified" in status && status.paymentVerified) {
        stopped.current = true;
        router.refresh();
      }
    };
    void tick();
    const id = window.setInterval(tick, 4000);
    return () => {
      stopped.current = true;
      window.clearInterval(id);
    };
  }, [orderNumber, router]);

  return null;
}
