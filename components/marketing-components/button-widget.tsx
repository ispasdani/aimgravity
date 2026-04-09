import { Phone } from 'lucide-react';

const ButtonWidget = () => {

    const clipPathStyle = {
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
    };
    return (
        < div className="mt-auto self-start" >
            <div className="backdrop-blur-[40px] backdrop-saturate-[1.8] bg-white/5 border border-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.4)] p-6 md:p-8 relative overflow-hidden" style={clipPathStyle}>
                {/* Diagonal shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/0 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
                    <div>
                        <h3 className="font-bold text-xl uppercase tracking-tight">Book a Free Consultation</h3>
                        <p className="text-white/70 text-sm mt-1.5 font-medium">Talk to our logistics experts today.</p>
                    </div>
                    <button
                        className="bg-white text-[#000000] px-6 py-3 font-bold uppercase text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors"
                        style={clipPathStyle}
                    >
                        <Phone size={18} className="text-[#EE3F2C]" />
                        Book a Call
                    </button>
                </div>
            </div>
        </div >)
}

export default ButtonWidget;