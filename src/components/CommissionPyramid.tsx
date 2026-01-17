import { motion } from "framer-motion";
import { Crown, Users } from "lucide-react";

const levels = [
  { level: 1, rate: "10%", name: "Venta Directa", color: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200", shadow: "shadow-emerald-500/20" },
  { level: 2, rate: "4%", name: "Equipo Directo", color: "bg-blue-500", text: "text-blue-700", border: "border-blue-200", shadow: "shadow-blue-500/20" },
  { level: 3, rate: "2%", name: "Liderazgo", color: "bg-violet-500", text: "text-violet-700", border: "border-violet-200", shadow: "shadow-violet-500/20" },
  { level: 4, rate: "2%", name: "Desarrollo", color: "bg-amber-500", text: "text-amber-700", border: "border-amber-200", shadow: "shadow-amber-500/20" }, // Consolidated 4-7 for clearer visual
  { level: 5, rate: "1%", name: "Expansion", color: "bg-rose-500", text: "text-rose-700", border: "border-rose-200", shadow: "shadow-rose-500/20" },
];

const CommissionPyramid = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto py-12 md:py-20 select-none">
      {/* Central Axis Line */}
      <div className="absolute left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-amber-400 via-gray-300 to-transparent -translate-x-1/2 hidden md:block opacity-50" />

      {/* Level 1: THE USER (You) */}
      <div className="relative z-20 flex justify-center mb-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="relative bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-amber-100 p-8 text-center min-w-[280px]"
        >
          {/* Crown pulsing */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-amber-300 to-amber-500 p-3 rounded-full shadow-lg shadow-amber-500/40">
            <Crown className="w-8 h-8 text-white fill-white" />
          </div>

          <div className="mt-4 space-y-1">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-[0.2em] mb-2">Tu Posición</div>
            <div className="text-5xl font-bold font-serif text-[#1a472a]">10%</div>
            <div className="text-sm text-muted-foreground font-medium">Comisión Base</div>
          </div>

          {/* Connectors */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center text-gray-300">
            <div className="w-px h-16 bg-gradient-to-b from-amber-200 to-gray-300" />
          </div>
        </motion.div>
      </div>

      {/* Network Structure */}
      <div className="space-y-4 md:space-y-8 relative z-10">

        {/* Level 2 Row */}
        <div className="flex justify-center gap-2 md:gap-16">
          <LevelNode level={levels[1]} count={2} />
        </div>

        {/* Level 3 Row */}
        <div className="flex justify-center gap-1.5 md:gap-8">
          <LevelNode level={levels[2]} count={3} />
        </div>

        {/* Level 4 Row */}
        <div className="flex justify-center gap-1 md:gap-4 overflow-x-auto pb-2 px-2 mask-linear">
          <LevelNode level={levels[3]} count={4} />
        </div>

        {/* Level 5+ Row (Summary) */}
        <div className="flex justify-center gap-2">
          <div className="bg-white/80 backdrop-blur-sm border border-dashed border-gray-300 rounded-2xl px-4 py-2 md:px-6 md:py-3 flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center">
            <span className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] md:text-[10px] text-gray-500">
                  +{i}
                </div>
              ))}
            </span>
            <span className="text-xs md:text-sm font-medium text-gray-600">Niveles 5, 6 y 7 (1% c/u)</span>
            <span className="bg-rose-100 text-rose-700 text-[10px] md:text-xs font-bold px-2 py-1 rounded-md">3% Total</span>
          </div>
        </div>

      </div>

      {/* Floating Total Badge */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-1/2 -right-4 md:right-0 transform -translate-y-1/2 hidden lg:block"
      >
        <div className="bg-[#1a472a] text-white p-6 rounded-l-3xl shadow-2xl border-y border-l border-white/10">
          <div className="flex flex-col items-center gap-2">
            <Users className="w-8 h-8 text-amber-400" />
            <div className="text-4xl font-bold font-serif">21%</div>
            <div className="text-xs uppercase tracking-widest text-white/60">Potencial Total</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const LevelNode = ({ level, count }: { level: any, count: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
          className={`relative group cursor-pointer hover:-translate-y-1 transition-transform duration-300 min-w-[70px] md:min-w-auto`}
        >
          {/* Connecting Line to Parent (Visual approximation) */}
          <div className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 w-px h-6 md:h-8 bg-gray-200 -z-10 group-hover:bg-amber-400 transition-colors" />

          <div className={`bg-white rounded-xl md:rounded-2xl p-2 md:p-6 shadow-lg border ${level.border} ${level.shadow} min-w-[75px] sm:min-w-[90px] md:min-w-[160px] text-center relative overflow-hidden`}>
            {/* Hover Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            <div className={`text-xl md:text-3xl font-bold ${level.text} mb-0.5 md:mb-1`}>{level.rate}</div>
            <div className="text-[9px] md:text-xs text-muted-foreground uppercase tracking-wide font-medium truncate px-1">{level.name}</div>

            {/* Decorative dot */}
            <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full mx-auto mt-2 md:mt-3 ${level.color.replace('bg-', 'bg-')}`} />
          </div>
        </motion.div>
      ))}
    </>
  )
}

export default CommissionPyramid;
