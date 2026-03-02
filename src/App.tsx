import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Battery, 
  Zap, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Terminal,
  Activity,
  Microchip,
  Settings,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ReactMarkdown from "react-markdown";
import { generateHardwareDesign, generateHardwareImage, type DesignOutput } from "./services/gemini";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_SCHEMATIC_PROMPT = `Act as an expert electronic hardware engineer. I need a complete circuit schematic design for a generic vape pen/pod system using standard hobbyist components. The system is powered by a 3.7V 600mAh Li-ion battery.

Please provide the detailed pin-to-pin wiring connections for the following modules:
1. A USB-C input connected to a TP4056/LTC4054 charging IC to safely charge the battery.
2. A small Microcontroller (like ATtiny85) powered by the battery.
3. A manual tactile push-button OR an electret microphone (acting as an air-pressure sensor) connected to the MCU input pin.
4. An SMD LED with a 330-ohm resistor connected to an MCU output pin for activity indication.
5. An AO3400 N-Channel MOSFET. The Gate is driven by the MCU, the Source is connected to Ground, and the Drain is connected to a 1.2-ohm heating coil (Atomizer). The other end of the coil goes to V-BAT.

Include safety considerations like pull-down resistors for the MOSFET gate and bypass capacitors. Format the response as a clear logical netlist and step-by-step schematic connection guide.`;

const DEFAULT_IMAGE_PROMPT = `A high-quality, hyper-realistic exploded view 3D render of a modern sleek vape pen device. The image showcases the internal electronic components clearly: a 600mAh cylindrical lithium-ion battery, a small green printed circuit board (PCB) featuring a USB-C charging port, a glowing blue indicator LED, a microchip, and an air-pressure sensor. Above the battery, show a copper atomizer heating coil wrapped in cotton. Cyberpunk technical lighting, studio photography, sharp focus, 8k resolution, blueprint aesthetic elements in the background, unreal engine 5 render.`;

export default function App() {
  const [activeTab, setActiveTab] = useState<"schematic" | "bom" | "visual">("schematic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [designData, setDesignData] = useState<DesignOutput | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const [design, image] = await Promise.all([
        generateHardwareDesign(DEFAULT_SCHEMATIC_PROMPT),
        generateHardwareImage(DEFAULT_IMAGE_PROMPT)
      ]);
      setDesignData(design);
      setGeneratedImage(image);
    } catch (err) {
      setError("Failed to generate design. Please check your API key and try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E0E0E0] font-sans selection:bg-emerald-500/30">
      {/* Header / Top Rail */}
      <header className="h-14 border-b border-white/5 bg-[#0D0D0F]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Cpu className="w-5 h-5 text-black" />
          </div>
          <h1 className="font-mono text-sm font-bold tracking-widest uppercase">
            Vape-HW <span className="text-emerald-500">v1.0.4</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-white/60 uppercase tracking-tighter">System Ready</span>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-md font-bold text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              isGenerating && "animate-pulse"
            )}
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {isGenerating ? "PROCESSING..." : "GENERATE DESIGN"}
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Project Info */}
        <div className="lg:col-span-3 space-y-6">
          <section className="bg-[#121214] border border-white/5 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 mb-4 text-emerald-500">
              <Info className="w-4 h-4" />
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest">Project Specs</h2>
            </div>
            <div className="space-y-4">
              <SpecItem label="Power Source" value="3.7V 600mAh Li-ion" icon={<Battery className="w-3 h-3" />} />
              <SpecItem label="Charging" value="USB-C / TP4056" icon={<Zap className="w-3 h-3" />} />
              <SpecItem label="Controller" value="ATtiny85 / CH32V003" icon={<Microchip className="w-3 h-3" />} />
              <SpecItem label="Output" value="AO3400 MOSFET" icon={<Activity className="w-3 h-3" />} />
              <SpecItem label="Load" value="1.2Ω Heating Coil" icon={<Settings className="w-3 h-3" />} />
            </div>
          </section>

          <section className="bg-[#121214] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 text-white/40">
              <Terminal className="w-4 h-4" />
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest">System Logs</h2>
            </div>
            <div className="font-mono text-[10px] space-y-2 text-white/30 h-48 overflow-y-auto custom-scrollbar">
              <p>[09:21:04] Initializing hardware engine...</p>
              <p>[09:21:05] Loading EasyEDA component library...</p>
              <p>[09:21:06] Ready for input.</p>
              {isGenerating && <p className="text-emerald-500/50">[09:21:10] Generating schematic netlist...</p>}
              {designData && <p className="text-emerald-500">[09:21:15] Schematic generated successfully.</p>}
              {error && <p className="text-red-500">[ERROR] {error}</p>}
            </div>
          </section>
        </div>

        {/* Center Content - Tabs & View */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-lg border border-white/5 w-fit">
            <TabButton 
              active={activeTab === "schematic"} 
              onClick={() => setActiveTab("schematic")}
              icon={<FileText className="w-4 h-4" />}
              label="Schematic"
            />
            <TabButton 
              active={activeTab === "bom"} 
              onClick={() => setActiveTab("bom")}
              icon={<Layers className="w-4 h-4" />}
              label="BOM List"
            />
            <TabButton 
              active={activeTab === "visual"} 
              onClick={() => setActiveTab("visual")}
              icon={<ImageIcon className="w-4 h-4" />}
              label="Visualization"
            />
          </div>

          <div className="bg-[#121214] border border-white/5 rounded-2xl min-h-[600px] shadow-2xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!designData && !isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <Cpu className="w-10 h-10 text-white/20" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Active Design</h3>
                  <p className="text-white/40 max-w-md text-sm">
                    Click the "Generate Design" button to start the AI-powered hardware design process for your vape pod system.
                  </p>
                </motion.div>
              ) : isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[#121214]/80 backdrop-blur-sm z-10"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-2 border-emerald-500/20 rounded-full animate-ping" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                  </div>
                  <p className="mt-8 font-mono text-xs tracking-widest text-emerald-500 animate-pulse">
                    CALCULATING NETLIST & TRACES...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 h-full overflow-y-auto custom-scrollbar"
                >
                  {activeTab === "schematic" && (
                    <div className="prose prose-invert prose-emerald max-w-none">
                      <div className="text-sm leading-relaxed text-white/80">
                        <ReactMarkdown>
                          {designData?.schematic || ""}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {activeTab === "bom" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-white/30 border-b border-white/5">
                        <div className="col-span-4">Component</div>
                        <div className="col-span-4">Description</div>
                        <div className="col-span-2">Package</div>
                        <div className="col-span-1">Qty</div>
                        <div className="col-span-1">LCSC</div>
                      </div>
                      {designData?.bom.map((item, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx} 
                          className="grid grid-cols-12 gap-4 px-4 py-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg border border-white/5 transition-colors items-center"
                        >
                          <div className="col-span-4 font-bold text-sm text-emerald-400">{item.item}</div>
                          <div className="col-span-4 text-xs text-white/60">{item.description}</div>
                          <div className="col-span-2 font-mono text-[10px] text-white/40">{item.package}</div>
                          <div className="col-span-1 font-mono text-xs">{item.quantity}</div>
                          <div className="col-span-1 font-mono text-[10px] text-emerald-500/70">{item.lcscPartNumber || "N/A"}</div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeTab === "visual" && (
                    <div className="space-y-6">
                      <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl aspect-video">
                        {generatedImage ? (
                          <>
                            <img 
                              src={generatedImage} 
                              alt="PCB Visualization" 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                              <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-bold text-xs hover:bg-emerald-500 transition-colors">
                                <Download className="w-4 h-4" />
                                DOWNLOAD RENDER
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-white/10" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 bg-white/[0.02] rounded-xl border border-white/5">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white/40 mb-3">Visualization Prompt</h4>
                        <p className="text-xs text-white/60 italic leading-relaxed">
                          "{DEFAULT_IMAGE_PROMPT}"
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  );
}

function SpecItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-white/40 group-hover:text-emerald-500 transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">{label}</span>
      </div>
      <span className="text-xs font-bold text-white/80">{value}</span>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all",
        active 
          ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
          : "text-white/40 hover:text-white/80 hover:bg-white/5"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
