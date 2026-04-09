import React from 'react';
import { Rubik } from 'next/font/google';
import { Play } from 'lucide-react';

const rubik = Rubik({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-rubik',
});

const clipPathStyle = {
    clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
};

export default function GameEngine() {
    return (
        <section
            className={`${rubik.variable} w-full bg-[#000000] py-24 md:py-32 text-white border-t border-white/5`}
            style={{ fontFamily: 'var(--font-rubik), sans-serif' }}
        >
            <div className="max-w-[1440px] mx-auto px-8 md:px-16 flex flex-col lg:flex-row items-center gap-16">
                
                {/* Left Side: Text Content */}
                <div className="lg:w-1/2 flex flex-col items-start text-left">
                    <div className="text-[#EE3F2C] font-bold tracking-widest uppercase text-sm mb-4 flex items-center gap-2">
                        <span className="w-8 h-[2px] bg-[#EE3F2C] inline-block"></span>
                        Built-in Game Engine
                    </div>
                    
                    <h2 className="text-[36px] md:text-[52px] leading-[1.05] font-bold uppercase tracking-tight mb-6">
                        Build and Share Your Scenarios
                    </h2>
                    
                    <p className="text-white/60 text-lg leading-relaxed font-medium mb-10 max-w-lg">
                        Don't just play drills—create them. Our powerful in-app game engine lets you design custom maps, place targets, specify movement logic, and dictate spawn rules.
                        <br /><br />
                        Once you've engineered the ultimate challenge, instantly share it with the world for others to play and rank on.
                    </p>

                    <div className="flex items-center gap-6">
                        <button
                            className="bg-[#EE3F2C] text-white px-8 py-4 font-bold uppercase text-sm tracking-wide hover:bg-red-600 transition-colors flex items-center gap-3"
                            style={clipPathStyle}
                        >
                            <Play size={18} fill="currentColor" />
                            Watch tutorial
                        </button>
                        
                        <div className="text-white/40 font-bold uppercase text-xs tracking-widest">
                            No coding required
                        </div>
                    </div>
                </div>

                {/* Right Side: Video */}
                <div className="lg:w-1/2 w-full">
                    <div 
                        className="relative w-full aspect-video bg-white/5 border border-white/10 p-2 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        style={clipPathStyle}
                    >
                        {/* Red glow behind the video container */}
                        <div className="absolute inset-0 bg-[#EE3F2C] opacity-5 blur-3xl rounded-full scale-110 pointer-events-none" />
                        
                        <div className="relative w-full h-full overflow-hidden" style={clipPathStyle}>
                            <video
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                            >
                                <source src="videos/engine.mp4" type="video/mp4" />
                                {/* Fallback graphic if video fails to load visually */}
                                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center -z-10">
                                    <span className="text-white/20 font-bold uppercase tracking-widest text-sm">Engine Footage</span>
                                </div>
                            </video>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
