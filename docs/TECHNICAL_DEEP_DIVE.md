# GestALT - Technical Deep Dive for Engineers

## What Makes This an SWE-Level Project?

Most UI/UX learning platforms are content delivery systems. GestALT is a **perception simulation engine** with a pedagogical layer.

---

## 1. The Perception Engine (Core Differentiator)

### Not Subjective Critique - Deterministic Modeling

```javascript
// Every UI element has measurable properties
class UIComponent {
  properties = {
    size: (width, height),
    position: (x, y),
    color: (fg, bg),
    typography: (fontSize, fontWeight),
    semanticRole: ('primary' | 'secondary' | 'normal')
  }
  
  // Visual weight drives attention
  getVisualWeight() {
    return (sizeWeight + contrastWeight + positionWeight) × semanticMultiplier
  }
}
```

### Attention Flow Calculation

```
For each component:
  1. Calculate visual weight
  2. Apply F-pattern position bias (top-left favored)
  3. Factor in whitespace isolation
  4. Normalize to probability distribution

Result: [
  {componentId: 'signin', probability: 0.42},
  {componentId: 'heading', probability: 0.31},
  ...
]
```

**This is not a quiz.** This is a **physics simulation for visual perception.**

---

## 2. Adaptive Learning System (State + Logic)

### Not Linear Progression - Skill-Based Routing

```javascript
class LearningSystem {
  selectNextChallenge(user, challenges) {
    // 1. Identify user's weakest skill
    const weakDomain = argmin(user.skillProfile)
    
    // 2. 70% chance to reinforce weakness, 30% for variety
    const pool = Math.random() < 0.7 
      ? challenges.filter(c => c.domain === weakDomain)
      : challenges.filter(c => c.domain !== weakDomain)
    
    // 3. Match difficulty to current skill level
    const targetDiff = Math.ceil((user.skillProfile[weakDomain] / 100) × 10)
    
    // 4. Select closest match
    return pool.reduce((best, curr) => 
      Math.abs(curr.difficulty - targetDiff) < Math.abs(best.difficulty - targetDiff)
        ? curr : best
    )
  }
}
```

**This is adaptive AI**, not a static lesson plan.

---

## 3. Accessibility as Constraint Engine

### Not a Checklist - Real-Time Validation

```javascript
// WCAG 2.1 Relative Luminance (actual formula)
getLuminance(color) {
  const [r, g, b] = hexToRgb(color).map(val => {
    val = val / 255
    return val <= 0.03928 
      ? val / 12.92 
      : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Contrast ratio calculation
getContrast() {
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)
}

// Fail if below threshold
required = fontSize >= 18 || fontWeight >= 700 ? 3.0 : 4.5
passing = contrast >= required
```

**This enforces standards**, not suggestions.

---

## 4. Explainability Layer (System Intelligence)

### Not "Good/Bad" - Traceable Reasoning

```javascript
generateExplanation(metrics, passed) {
  const explanations = []
  
  if (metrics.hierarchyStrength < 0.6) {
    explanations.push({
      issue: 'Weak Visual Hierarchy',
      reason: `Hierarchy strength: ${metrics.hierarchyStrength * 100}%`,
      suggestion: 'Increase size or weight difference between primary and secondary',
      ruleTriggered: 'HIERARCHY_THRESHOLD_0.6'
    })
  }
  
  if (metrics.contrastCompliance < 1) {
    explanations.push({
      issue: 'Insufficient Color Contrast',
      reason: `${metrics.failingContrasts.length} elements fail WCAG AA`,
      details: metrics.failingContrasts.map(f => 
        `${f.id}: ${f.actual} (needs ${f.required})`
      ),
      suggestion: 'Increase contrast between text and background',
      wcagReference: '1.4.3 Contrast (Minimum)'
    })
  }
  
  return explanations
}
```

**Every judgment is justified** with data and rules.

---

## 5. Domain Modeling (Clean Architecture)

### Not Spaghetti - Explicit Entities

```
┌─────────────────────────────────────────────┐
│  User                                       │
│  ├─ skillProfile: Map<Domain, 0-100>       │
│  ├─ decisionHistory: Decision[]            │
│  └─ completedChallenges: {id, perf}[]      │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  LearningSystem                             │
│  ├─ selectNextChallenge(user): Challenge   │
│  ├─ recordDecision(decision): void         │
│  └─ updateSkill(domain, delta): void       │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Challenge                                  │
│  ├─ components: UIComponent[]              │
│  ├─ successCriteria: Criterion[]           │
│  └─ evaluate(engine): Outcome              │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  PerceptionEngine                           │
│  ├─ analyze(components): Metrics           │
│  ├─ calculateAttentionMap()                │
│  ├─ calculateHierarchyStrength()           │
│  └─ evaluateAccessibility()                │
└─────────────────────────────────────────────┘
```

**Separation of concerns** enables testability and scalability.

---

## 6. Engineering Decisions (Justifications)

### Why Pure Frontend?
- ✅ Zero deployment friction
- ✅ No auth/server complexity
- ✅ Demonstrates algorithmic thinking without infrastructure
- ✅ Portfolio piece should run immediately

### Why Deterministic Over ML?
- ✅ **Explainability** - Users learn rules, not black boxes
- ✅ **Predictability** - Same input = same output
- ✅ **No training data** - Based on research (WCAG, Gestalt, F-pattern)
- ✅ Educational value higher than accuracy

### Why localStorage?
- ✅ Single-user context (no collaboration needed yet)
- ✅ Persistent across sessions
- ✅ Demonstrates state management without backend
- ✅ Can migrate to IndexedDB or API later

---

## 7. Code Quality Indicators

### Modular Architecture
```
js/
├── models/          # Domain entities
├── engine/          # Core algorithms
├── systems/         # Business logic
├── ui/              # Presentation layer
└── data/            # Content/config
```

### Pure Functions (Testable)
```javascript
// No side effects - deterministic
function calculateHierarchyStrength(components) {
  const weights = components.map(c => c.getVisualWeight())
  return variance(weights) / 2
}

// Easy to unit test
expect(calculateHierarchyStrength([c1, c2])).toBe(0.65)
```

### Type Safety (via JSDoc or TypeScript migration)
```javascript
/**
 * @param {UIComponent[]} components
 * @param {PerceptionEngine} engine
 * @returns {Outcome}
 */
evaluate(components, engine) { ... }
```

---

## 8. What This Demonstrates

### Technical Skills
- ✅ Algorithm design (perception simulation)
- ✅ Data modeling (domain entities)
- ✅ State management (user profiles)
- ✅ Real-time validation (accessibility)
- ✅ Adaptive systems (learning AI)

### Software Engineering Maturity
- ✅ Separation of concerns
- ✅ Explainability as design goal
- ✅ Standards compliance (WCAG)
- ✅ Scalable architecture
- ✅ Clean code practices

### Product Thinking
- ✅ User-centered design
- ✅ Feedback loops
- ✅ Progressive disclosure
- ✅ Cognitive scaffolding

---

## 9. Portfolio Impact

### What Reviewers See

**Junior Dev**: "Nice UI project"
**Senior Dev**: "Wait, this models perception? That's simulation engineering."
**Tech Lead**: "Domain modeling, adaptive logic, explainability... this is systems design."
**Hiring Manager**: "This person thinks beyond features—they build intelligent systems."

### Differentiators
- 🚀 Not CRUD - **Simulation**
- 🚀 Not static - **Adaptive**
- 🚀 Not subjective - **Deterministic**
- 🚀 Not tutorial - **Experience**
- 🚀 Not portfolio filler - **Research demonstration**

---

## 10. Future Scaling (Architecture Ready)

```javascript
// Backend integration points already defined
class ChallengeAPI {
  async evaluate(components) {
    // Could move perception calc to server
    return fetch('/api/challenges/evaluate', {
      method: 'POST',
      body: JSON.stringify({ components })
    })
  }
}

// Multi-user ready
class UserService {
  async syncProfile(userId) {
    // localStorage → PostgreSQL migration path clear
  }
}

// Analytics pipeline
class AnalyticsEngine {
  trackDecision(userId, decision) {
    // Aggregate learning patterns across users
  }
}
```

---

## Bottom Line

**GestALT is not a learning platform that uses engineering.**

**GestALT is an engineering project that teaches learning.**

The code simulates perception.
The architecture models cognition.
The system adapts to users.

This is **software engineering at the intersection of UX, education, and systems thinking.**

---

Built with intentionality. Every line justified. Every decision documented.

**This is what SWE-level means.**
