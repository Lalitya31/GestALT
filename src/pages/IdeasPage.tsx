import { motion } from 'framer-motion';

const sections = [
  {
    title: "The Problem with Theory-First Learning",
    content: (
      <>
        <p className="text-white/70 leading-relaxed text-lg mb-4">
          Most UI/UX education begins with documentation. You read about visual hierarchy, 
          whitespace, contrast, and accessibility before ever touching an interface. But 
          <strong className="text-white font-semibold"> UI/UX is not a subject you read about—it's something you perceive</strong>.
        </p>
        <p className="text-white/70 leading-relaxed text-lg mb-6">
          When you look at an interface, your brain doesn't think in principles. It flows along pathways 
          of size, color, and spacing. It builds a mental model before conscious thought. Learning through 
          text reverses this natural sequence. GestALT restores it.
        </p>
        <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-xl font-medium text-white/90 bg-gradient-to-r from-primary/10 to-transparent">
          "You don't learn to see by reading about vision. You learn by looking, adjusting, and noticing what changed."
        </blockquote>
      </>
    )
  },
  {
    title: "Perception as a Simulation, Not Opinion",
    content: (
      <>
        <p className="text-white/70 leading-relaxed text-lg mb-4">
          At the heart of GestALT is a perception simulation engine. This isn't subjective 
          critique—it's a deterministic model of how visual properties influence attention.
        </p>
        <p className="text-white/70 leading-relaxed text-lg mb-4">
          Every UI element you create has measurable properties: size, contrast, position, 
          spacing, semantic role. The engine calculates:
        </p>
        <ul className="space-y-3 mt-6 mb-8 text-white/80 list-disc list-inside marker:text-primary">
          <li><strong className="text-white">First-attention probability</strong> — Where the eye lands first</li>
          <li><strong className="text-white">Visual hierarchy score</strong> — How clearly importance is communicated</li>
          <li><strong className="text-white">Cognitive load</strong> — Mental effort required to process the interface</li>
          <li><strong className="text-white">Error likelihood</strong> — Chance of user confusion or mistakes</li>
        </ul>
        <p className="text-white/70 leading-relaxed text-lg">
          This transforms feedback from <em className="text-white/90">"that doesn't look good"</em> into 
          <em className="text-white/90">"here's why attention fragmented and how to fix it."</em>
        </p>
      </>
    )
  },
  {
    title: "Heart and Soul",
    content: (
      <>
        <p className="text-white/70 leading-relaxed text-lg mb-4">
          Every decision in this project—from the perception engine to the typography—was made with 
          intentionality. GestALT is not just a portfolio piece. It's a statement about how systems 
          can be built to respect how humans actually learn.
        </p>
        <p className="text-white/70 leading-relaxed text-lg mb-4">
          It's a fusion of design sensitivity and engineering rigor. It's an argument that learning 
          platforms should model cognition, not just deliver content. It's proof that software can be 
          both <strong className="text-white text-gradient font-bold drop-shadow-[0_0_10px_rgba(109,40,217,0.8)]">technically sophisticated and deeply human</strong>.
        </p>
        <div className="mt-12 p-8 glass-panel text-center glow-border group transition-all duration-500 hover:shadow-[0_0_40px_rgba(109,40,217,0.3)] hover:scale-[1.01]">
          <p className="text-2xl font-bold tracking-tight text-white mb-2">This is GestALT.</p>
          <p className="text-lg text-white/50">Not a course. Not a tutorial. A <em className="text-primary not-italic font-semibold">perceptual learning system</em>.</p>
        </div>
      </>
    )
  }
];

export default function Ideas() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto pt-32 pb-16"
    >
      <header className="text-center mb-20 space-y-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/20 blur-[120px] rounded-full pointer-events-none -z-10" />
        <h1 className="text-5xl md:text-7xl font-black tracking-tight drop-shadow-lg">
          Ideas Behind <span className="text-gradient">This</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/60 font-medium">
          On perception, learning, and the systems that bridge them
        </p>
      </header>

      <div className="space-y-12">
        {sections.map((section, idx) => (
          <motion.section 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: idx * 0.1, duration: 0.8 }}
            className="glass-card p-8 md:p-12 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-3xl font-bold text-white mb-6 tracking-tight flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm text-primary font-black border border-white/10 shrink-0">
                0{idx + 1}
              </span>
              {section.title}
            </h2>
            <div className="pl-0 md:pl-14">
              {section.content}
            </div>
          </motion.section>
        ))}
      </div>
    </motion.div>
  );
}
