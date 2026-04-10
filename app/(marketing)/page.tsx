import Hero from "@/components/marketing-sections/hero";
import Features from "@/components/marketing-sections/features";
import GameEngine from "@/components/marketing-sections/game-engine";
import Pricing from "@/components/marketing-sections/pricing";

export default function Home() {
    return (
        <main>
            <Hero />
            <Features />
            <GameEngine />
            <Pricing />
        </main>
    );
}
