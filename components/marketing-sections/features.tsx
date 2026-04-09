import React from 'react';
import { Target, Keyboard, Map, Layers, Settings2, Trophy, Activity, Zap } from 'lucide-react';
import { Rubik } from 'next/font/google';

const rubik = Rubik({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-rubik',
});

const clipPathStyle = {
    clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
};

const features = [
    {
        icon: Target,
        title: "Multiple Drill Types",
        description: "Master every aspect of your aim with specialized routines for flicking, tracking, target switching, and raw speed.",
    },
    {
        icon: Settings2,
        title: "1:1 Game Simulation",
        description: "Match your exact sensitivity, FOV, aspect ratio, and even movement and weapon feel from today's top competitive shooters.",
    },
    {
        icon: Layers,
        title: "Massive Scenario Library",
        description: "Never run out of content with tens of thousands of custom scenarios, routines, and user-generated playlists to explore.",
    },
    {
        icon: Map,
        title: "Scenario Control",
        description: "Design your perfect training ground. Create custom maps, define enemy spawn behaviors, and build situations that mirror real in-game pressure.",
    },
    {
        icon: Trophy,
        title: "Benchmarking & Ranking",
        description: "Track your progress with global leaderboards, detailed benchmark-style playlists, and standardized performance tiers.",
    },
    {
        icon: Keyboard,
        title: "Universal Input Support",
        description: "Native support for mouse & keyboard, as well as controller aiming with customizable deadzones and response curves.",
    },
    {
        icon: Activity,
        title: "AI-Driven Analytics",
        description: "Identify your exact weaknesses. Our AI analyzes your crosshair pathing and reaction times to suggest personalized improvement routines.",
    },
    {
        icon: Zap,
        title: "Real-Time Feedback",
        description: "Get instant micro-adjustments and statistical overlays while you play, ensuring your practice is always perfectly optimized.",
    }
];

export default function Features() {
    return (
        <section
            className={`${rubik.variable} relative w-full bg-[#0a0a0a] py-24 md:py-32 text-white border-t border-white/10`}
            style={{ fontFamily: 'var(--font-rubik), sans-serif' }}
        >
            <div className="max-w-[1440px] mx-auto px-8 md:px-16">
                
                {/* Header */}
                <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="text-[#EE3F2C] font-bold tracking-widest uppercase text-sm mb-4">
                            The Ultimate Aim Trainer
                        </div>
                        <h2 className="text-[36px] md:text-[52px] leading-[1.1] font-bold uppercase tracking-tight">
                            Elevate your mechanics
                        </h2>
                    </div>
                    <p className="text-white/60 text-lg max-w-md font-medium leading-relaxed">
                        AimGravity gives you the absolute best tools, data, and scenarios to push your mechanical skill past human limits.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <div 
                            key={idx}
                            className="group relative backdrop-blur-sm bg-white/[0.03] border border-white/10 p-8 transition-all duration-300 hover:bg-white/[0.08] hover:border-[#EE3F2C]/50"
                            style={clipPathStyle}
                        >
                            {/* Accent line on hover */}
                            <div className="absolute top-0 left-0 w-0 h-1 bg-[#EE3F2C] transition-all duration-500 group-hover:w-full" />
                            
                            <div className="mb-6 inline-flex items-center justify-center w-14 h-14 bg-black/50 border border-white/10 text-[#EE3F2C] group-hover:scale-110 transition-transform duration-500" style={clipPathStyle}>
                                <feature.icon size={24} strokeWidth={2} />
                            </div>
                            
                            <h3 className="text-xl font-bold uppercase tracking-tight mb-3">
                                {feature.title}
                            </h3>
                            
                            <p className="text-white/60 text-sm leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
