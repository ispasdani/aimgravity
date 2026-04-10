
import { Rubik } from 'next/font/google';
import VideoBackground from '../marketing-components/video-background';

const rubik = Rubik({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-rubik',
});

const clipPathStyle = {
    clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
};

export default function Hero() {
    return (
        <section
            className={`${rubik.variable} relative h-[60vh] w-full bg-[#000000] overflow-hidden text-white`}
            style={{ fontFamily: 'var(--font-rubik), sans-serif' }}
        >
            {/* Video Background */}
            <VideoBackground />

            {/* Main Content Wrapper */}
            <div className="relative z-10 flex flex-col h-full p-8 md:p-16 max-w-[1440px] mx-auto">

                {/* Header */}
                <header className="flex justify-between items-center w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 2L2 16L16 30L30 16L16 2Z" className="stroke-white" strokeWidth="2.5" strokeLinejoin="round" />
                            <path d="M16 10L10 16L16 22L22 16L16 10Z" className="fill-white" />
                        </svg>
                        <span className="text-2xl font-bold uppercase tracking-[-0.04em]">aimgravity                                         </span>
                    </div>

                    {/* Links */}
                    <nav className="hidden md:flex items-center gap-10 font-medium text-sm">
                        <a href="#" className="hover:text-[#EE3F2C] transition-colors uppercase tracking-wide">Home</a>
                        <a href="#" className="hover:text-[#EE3F2C] transition-colors uppercase tracking-wide">About</a>
                        <a href="#" className="hover:text-[#EE3F2C] transition-colors uppercase tracking-wide">Contact Us</a>
                    </nav>

                    {/* Contact Button */}
                    <button
                        className="hidden md:block bg-[#EE3F2C] text-white px-7 py-3 font-bold uppercase text-sm tracking-wide hover:bg-red-600 transition-colors"
                        style={clipPathStyle}
                    >
                        Contact Us
                    </button>
                </header>

                {/* Main Hero Content (Upper Third) */}
                <div className="flex-grow flex flex-col justify-start pt-[12vh]">
                    <h1 className="text-[42px] leading-[1.05] md:text-[64px] font-bold uppercase tracking-[-0.04em] max-w-3xl">
                        Swift and Simple Transport
                    </h1>
                    <div className="mt-8">
                        <button
                            className="bg-[#EE3F2C] text-white px-8 py-4 font-bold uppercase text-sm tracking-wide hover:bg-red-600 transition-colors"
                            style={clipPathStyle}
                        >
                            Get Started
                        </button>
                    </div>
                </div>



            </div>
        </section>
    );
}
