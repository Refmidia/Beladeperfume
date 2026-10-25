import { Hero } from "@/components/home/Hero";
import { BestSellers } from "@/components/home/BestSellers";
import { CategoryBanners } from "@/components/home/CategoryBanners";
import { NewArrivals } from "@/components/home/NewArrivals";
import { ReadyToShip } from "@/components/home/ReadyToShip";
import { PreOrder } from "@/components/home/PreOrder";
import { FragranceQuiz } from "@/components/home/FragranceQuiz";
import { Benefits } from "@/components/home/Benefits";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BestSellers />
      <CategoryBanners />
      <NewArrivals />
      <ReadyToShip />
      <PreOrder />
      <FragranceQuiz />
      <Benefits />
    </>
  );
}
