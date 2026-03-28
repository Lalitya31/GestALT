import React from 'react';
import { motion } from 'framer-motion';

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 overflow-x-auto font-mono text-sm text-green-400 my-6 shadow-inner">
    <pre><code>{children}</code></pre>
  </div>
);

const MetricBlock = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="glass-panel p-6 border-l-4 border-l-accent my-6 group hover:border-l-primary transition-colors">
    <h4 className="text-white font-bold mb-3">{title}</h4>
    <div className="font-mono text-sm text-white/80 leading-relaxed">
      {children}
    </div>
  </div>
);

export default function Architecture() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-5xl mx-auto pt-32 pb-16"
    >
      <header className="text-center mb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/20 blur-[130px] rounded-full pointer-events-none -z-10" />
        <h1 className="text-5xl md:text-7xl font-black tracking-tight drop-shadow-lg text-white mb-4" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}>
          System <span className="text-gradient">Architecture</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/60 font-medium" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}>
          Under the Hood of GestALT's Perception Simulation
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-16">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary text-sm font-black border border-primary/40">1</span>
              Perception Simulation Engine
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              The perception engine is the technical differentiator. It models user attention using measurable visual properties rather than subjective opinions.
            </p>

            <MetricBlock title="Visual Weight Calculation">
              visualWeight = (sizeWeight + contrastWeight + positionWeight) × semanticMultiplier<br/><br/>
              where:<br/>
              • sizeWeight = (width × height) / 10000<br/>
              • contrastWeight = contrastRatio / 21  // WCAG max<br/>
              • positionWeight = (1 - y/1000) × 0.3  // F-pattern bias<br/>
              • semanticMultiplier = &#123;primary: 1.5, secondary: 1.0, normal: 0.7&#125;
            </MetricBlock>

            <MetricBlock title="Attention Probability Distribution">
              P(attention | component) = (visualWeight × positionFactor × isolationFactor) / Σ(all components)<br/><br/>
              positionFactor = (xFactor × 0.4) + (yFactor × 0.6)<br/>
              xFactor = max(0, 1 - x/800)  // Left bias<br/>
              yFactor = max(0, 1 - y/600)  // Top bias<br/>
              <br/>
              isolationFactor = max(0.3, 1 - (nearbyCount × 0.1))
            </MetricBlock>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary text-sm font-black border border-primary/40">2</span>
              Accessibility Constraint Engine
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Compliance is calculated in real-time as a first-class citizen of the perception simulation.
            </p>
            <MetricBlock title="Hit Target Validation">
              For all interactive elements (button, input):<br/>
              • Minimum width: 44px<br/>
              • Minimum height: 44px<br/>
              <br/>
              Compliance = (compliant elements) / (total interactive elements)
            </MetricBlock>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary text-sm font-black border border-primary/40">3</span>
              Domain Model Architecture
            </h2>
            <CodeBlock>
{`User
├─ skillProfile: {hierarchy, accessibility, forms, spacing}
├─ decisionHistory: Decision[]
├─ completedChallenges: {id, timestamp, performance}[]
├─ currentStreak: number
└─ hintUsage: {total, byChallenge}

Challenge
├─ domain: string
├─ difficulty: 1-10
├─ components: UIComponent[]
├─ successCriteria: [metric, operator, threshold][]
└─ evaluate(components, engine): Outcome`}
            </CodeBlock>
          </motion.section>

        </div>

        {/* Sidebar for secondary architecture concepts */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-6 sticky top-32">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-4">Engineering Tradeoffs</h3>
            <ul className="space-y-6">
              <li>
                <h4 className="text-primary font-semibold mb-1">Why Pure Frontend?</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Zero deployment friction, client-side ML reduces complexity, and localStorage is completely sufficient for tracking single-user learning profiles.
                </p>
              </li>
              <li>
                <h4 className="text-primary font-semibold mb-1">Deterministic Over ML</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Every output is traceable to a research-backed rule (WCAG, F-pattern). This provides true educational value, avoiding "black-box" conclusions.
                </p>
              </li>
              <li>
                <h4 className="text-primary font-semibold mb-1">Future Scaling</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  PostgreSQL backend capability designed for cross-device sync, A/B testing, and real-time multiplayer collaborative challenges.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
