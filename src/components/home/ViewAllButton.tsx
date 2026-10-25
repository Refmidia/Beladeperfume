import Link from "next/link";

export function ViewAllButton() {
  return (
    <div className="bg-bg-cream py-6 px-4">
      <Link
        href="/catalogo"
        className="block w-full py-3.5 text-center border border-gold text-gold text-[13px] tracking-[0.15em] font-medium rounded-lg hover:bg-gold hover:text-bg-dark transition-colors"
      >
        VER TODOS OS PRODUTOS
      </Link>
    </div>
  );
}
