import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkText?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionTitle({
  title,
  subtitle,
  href,
  linkText = "Ver Todos",
  className,
  align = "center",
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "mb-6 sm:mb-8",
        align === "center" && "text-center",
        className
      )}
    >
      {subtitle && (
        <span className="text-gold text-xs sm:text-sm font-medium tracking-[0.15em] uppercase mb-2 block">
          {subtitle}
        </span>
      )}
      
      <div
        className={cn(
          "flex items-end gap-4",
          align === "center" ? "justify-center" : "justify-between"
        )}
      >
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground">
          {title}
        </h2>
        
        {href && align === "left" && (
          <Link
            href={href}
            className="hidden sm:inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-gold transition-colors group"
          >
            {linkText}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {href && align === "center" && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-gold transition-colors mt-4 group"
        >
          {linkText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
