import Image from "next/image";
import { storeConfig as config } from "../../../store.config";

/** Cabeçalho da etapa de pagamento — visual Bela de Perfume, não do gateway. */
export function BelaPaymentBrand() {
  return (
    <div className="bela-payment-brand">
      {config.store.logo ? (
        <Image
          src={config.store.logo}
          alt={config.store.name}
          width={160}
          height={48}
          className="bela-payment-brand__logo"
          priority
        />
      ) : (
        <strong className="bela-payment-brand__name">{config.store.name}</strong>
      )}
      <p className="muted bela-payment-brand__tagline">{config.store.tagline}</p>
    </div>
  );
}
