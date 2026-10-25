"use client";

const stats = [
  { value: "250+", label: "FRAGRÂNCIAS" },
  { value: "3", label: "QUIOSQUES" },
  { value: "10k+", label: "CLIENTES FELIZES" },
];

export function Stats() {
  return (
    <section className="bg-bg-dark py-10">
      <div className="container-shop">
        <div className="grid grid-cols-2 gap-6">
          {stats.slice(0, 2).map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-[36px] text-text-light">
                {stat.value}
              </p>
              <p className="text-gold-muted text-[10px] tracking-[0.15em] uppercase mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <p className="font-serif text-[36px] text-text-light">
            {stats[2].value}
          </p>
          <p className="text-gold-muted text-[10px] tracking-[0.15em] uppercase mt-1">
            {stats[2].label}
          </p>
        </div>
      </div>
    </section>
  );
}
