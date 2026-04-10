'use client'

import Hero from "@/components/marketing-sections/hero";
import Features from "@/components/marketing-sections/features";
import GameEngine from "@/components/marketing-sections/game-engine";
import Pricing from "@/components/marketing-sections/pricing";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
    const tasks = useQuery(api.tasks.get);
    return (
        <main>
            <Hero />
            <Features />
            <GameEngine />
            <Pricing />
            {tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)}
        </main>
    );
}
