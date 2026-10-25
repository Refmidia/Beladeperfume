import { ViewAllButton } from "@/components/home/ViewAllButton";
import { BestSellers } from "@/components/home/BestSellers";
import { CategoryBanners } from "@/components/home/CategoryBanners";
import { FragranceFinder } from "@/components/home/FragranceFinder";
import { FragranceFamilies } from "@/components/home/FragranceFamilies";
import { ProductOfMonthBanner } from "@/components/home/ProductOfMonthBanner";
import { WhyUs } from "@/components/home/WhyUs";
import { Stats } from "@/components/home/Stats";

export default function HomePage() {
  return (
    <>
      {/* Ver Todos */}
      <ViewAllButton />
      
      {/* Best Sellers */}
      <BestSellers />
      
      {/* Ver Todos Button */}
      <ViewAllButton />
      
      {/* Category Banners */}
      <CategoryBanners />
      
      {/* Fragrance Finder */}
      <FragranceFinder />
      
      {/* Fragrance Families */}
      <FragranceFamilies />
      
      {/* Perfume do Mês Banner */}
      <ProductOfMonthBanner />
      
      {/* Why Us */}
      <WhyUs />
      
      {/* Stats */}
      <Stats />
    </>
  );
}
