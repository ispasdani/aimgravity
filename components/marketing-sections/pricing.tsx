'use client';

import React, { useState } from 'react';
import { Check, Zap, Shield, Target, Trophy } from 'lucide-react';
import { Rubik } from 'next/font/google';

const rubik = Rubik({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-rubik',
});

const clipPathStyle = {
    clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
};

type BillingCycle = '1m' | '3m' | '6m';

export default function Pricing() {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('1m');

    const prices = {
        '1m': 8.99,
        '3m': 6.99,
        '6m': 4.99,
    };

    const billingText = {
        '1m': 'Billed monthly',
        '3m': 'Billed $20.97 every 3 months',
        '6m': 'Billed $29.94 every 6 months',
    };

    const savings = {
        '1m': null,
        '3m': 'Save 22%',
        '6m': 'Save 44%',
    };

    const freeFeatures = [
        "Access to Basic Scenarios",
        "Limited Benchmark Access",
        "Community Playlists",
        "Basic Aim Statistics",
        "Cross-Platform Support",
    ];

    const proFeatures = [
        "All AimGravity Scenarios",
        "Full Benchmark Suite",
        "AI-Driven Analytics",
        "Custom Scenario Builder",
        "Advanced Input Simulation",
        "Global Leaderboard Access",
        "Priority Engine Updates",
        "Private Training Rooms",
    ];

    return (
        <section
            className={`${rubik.variable} relative w-full bg-[#0a0a0a] py-24 md:py-32 text-white border-t border-white/10`}
            style={{ fontFamily: 'var(--font-rubik), sans-serif' }}
            id="pricing"
        >
            <div className="max-w-[1440px] mx-auto px-8 md:px-16">
                
                {/* Header */}
                <div className="mb-16 md:mb-20 text-center">
                    <div className="text-[#EE3F2C] font-bold tracking-widest uppercase text-sm mb-4">
                        Investment in Excellence
                    </div>
                    <h2 className="text-[36px] md:text-[52px] leading-[1.1] font-bold uppercase tracking-tight mb-8">
                        Choose your training tier
                    </h2>

                    {/* Billing Toggle */}
                    <div className="inline-flex p-1 bg-white/[0.03] border border-white/10 backdrop-blur-sm relative" style={clipPathStyle}>
                        {(['1m', '3m', '6m'] as BillingCycle[]).map((cycle) => (
                            <button
                                key={cycle}
                                onClick={() => setBillingCycle(cycle)}
                                className={`relative z-10 px-6 py-2 text-sm font-bold uppercase tracking-wide transition-colors duration-300 ${
                                    billingCycle === cycle ? 'text-white' : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                {cycle === '1m' ? '1 Month' : cycle === '3m' ? '3 Months' : '6 Months'}
                                {billingCycle === cycle && (
                                    <div 
                                        className="absolute inset-0 bg-[#EE3F2C] -z-10 transition-all duration-300"
                                        style={clipPathStyle}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    
                    {/* Free Plan */}
                    <div 
                        className="group relative backdrop-blur-sm bg-white/[0.03] border border-white/10 p-10 transition-all duration-300 hover:border-white/20"
                        style={clipPathStyle}
                    >
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Recruit</h3>
                            <p className="text-white/40 text-sm font-medium">Fundamental training for all</p>
                        </div>

                        <div className="mb-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold">$0</span>
                                <span className="text-white/40 uppercase text-sm font-bold tracking-wider">/ Lifetime</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-12">
                            {freeFeatures.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <Check className="text-white/20" size={18} />
                                    <span className="text-white/60 text-sm font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            className="w-full py-4 border border-white/20 text-white font-bold uppercase text-sm tracking-widest hover:bg-white/10 transition-colors"
                            style={clipPathStyle}
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div 
                        className="group relative backdrop-blur-sm bg-white/[0.05] border border-[#EE3F2C]/30 p-10 transition-all duration-300 hover:border-[#EE3F2C]/60 overflow-hidden"
                        style={clipPathStyle}
                    >
                        {/* Elite Badge */}
                        <div className="absolute top-0 right-0">
                            <div className="bg-[#EE3F2C] text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-2 rotate-45 translate-x-[28%] translate-y-[50%]">
                                RECOMMENDED
                            </div>
                        </div>

                        <div className="mb-8 relative">
                            <h3 className="text-2xl font-bold uppercase tracking-tight mb-2 text-[#EE3F2C]">Elite</h3>
                            <p className="text-white/60 text-sm font-medium">Professional grade performance</p>
                            
                            {savings[billingCycle] && (
                                <span className="absolute top-0 right-0 bg-[#EE3F2C]/10 text-[#EE3F2C] border border-[#EE3F2C]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={clipPathStyle}>
                                    {savings[billingCycle]}
                                </span>
                            )}
                        </div>

                        <div className="mb-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold transition-all duration-300">${prices[billingCycle]}</span>
                                <span className="text-white/40 uppercase text-sm font-bold tracking-wider">/ Month</span>
                            </div>
                            <p className="text-white/30 text-xs mt-2 font-medium uppercase tracking-wider transition-all duration-300">
                                {billingText[billingCycle]}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                            {proFeatures.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EE3F2C]/10 flex items-center justify-center">
                                        <Zap className="text-[#EE3F2C]" size={12} fill="currentColor" />
                                    </div>
                                    <span className="text-white/80 text-sm font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            className="w-full py-4 bg-[#EE3F2C] text-white font-bold uppercase text-sm tracking-widest hover:bg-red-600 transition-colors shadow-[0_0_30px_rgba(238,63,44,0.2)]"
                            style={clipPathStyle}
                        >
                            Upgrade to Elite
                        </button>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-20 flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:opacity-50 transition-opacity duration-500">
                   <div className="flex items-center gap-2 font-bold uppercase tracking-tighter text-xl">
                       <Shield size={24} /> SECURE PAYMENT
                   </div>
                   <div className="flex items-center gap-2 font-bold uppercase tracking-tighter text-xl">
                       <Target size={24} /> INSTANT ACCESS
                   </div>
                   <div className="flex items-center gap-2 font-bold uppercase tracking-tighter text-xl">
                       <Trophy size={24} /> PRO PERFORMANCE
                   </div>
                </div>

            </div>
        </section>
    );
}
