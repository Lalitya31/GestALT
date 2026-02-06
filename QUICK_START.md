# GestALT - Quick Start Guide

## 🚀 Running Locally

### Option 1: Simple File Open
1. Navigate to the GestALT folder
2. Double-click `index.html`
3. Your browser will open the application

⚠️ **Note**: Some browsers restrict ES6 modules on `file://` protocol. If you see module errors, use Option 2 or 3.

### Option 2: Using Python HTTP Server
```bash
cd GestALT
python -m http.server 8080
```
Then open: `http://localhost:8080`

### Option 3: Using Node.js
```bash
cd GestALT
npx http-server -p 8080 -o
```

### Option 4: Using Live Server (VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## 📚 Navigation Guide

### Main Pages
- **`index.html`** - Interactive learning platform
- **`ideas.html`** - Philosophy and motivation behind GestALT
- **`architecture.html`** - Technical architecture documentation

### First Time Experience
1. Click **"Begin Experience"** on the hero page
2. View your skill profile (starts at 0%)
3. Click **"Start Challenge"** on the recommended challenge
4. Use property controls to modify UI components
5. Click **"Evaluate Design"** to see perception metrics
6. Read explainability feedback
7. Iterate until success criteria are met
8. Exit challenge and see updated skill profile

---

## 🎯 Understanding the Interface

### Dashboard
- **Skill Metrics**: Visual bars showing your progress in 4 domains
  - Visual Hierarchy
  - Accessibility
  - Form Design
  - Spacing & Rhythm
- **Next Challenge**: Adaptively selected based on your weakest skill

### Challenge Area
- **Canvas** (left): Live preview of UI components
- **Controls** (right): Property editors for selected component
  - Size, typography, colors, spacing
- **Metrics Panel**: Perception analysis results
  - First Attention Probability
  - Hierarchy Strength
  - Cognitive Load
  - Error Likelihood
- **Explainability**: Why the system judged your design

---

## 🧪 Testing the Perception Engine

### Experiment 1: Visual Hierarchy
1. Start "First Attention" challenge
2. **Initially**: All buttons are similar size
3. **Try**: Increase "Sign In" button width to 200px
4. **Try**: Increase font weight to Bold
5. **Evaluate**: See attention probability shift
6. **Learn**: Visual weight = size + contrast + position

### Experiment 2: Accessibility
1. Start "Contrast Crisis" challenge
2. **Initially**: Text has poor contrast (fails WCAG)
3. **Try**: Change text color to #000000 (black)
4. **Evaluate**: See contrast ratio calculation
5. **Learn**: 4.5:1 minimum for normal text

### Experiment 3: Spacing Consistency
1. Start "Rhythm & Consistency" challenge
2. **Initially**: Elements have random margins
3. **Try**: Set all margins to same value (e.g., 16px)
4. **Evaluate**: See spacing consistency score rise
5. **Learn**: Consistent rhythm reduces cognitive load

---

## 🔍 Exploring the Code

### Core Files to Review

#### Perception Engine
```
js/engine/PerceptionEngine.js
```
- `calculateAttentionMap()` - F-pattern + visual weight
- `calculateHierarchyStrength()` - Variance-based scoring
- `evaluateContrast()` - WCAG 2.1 luminance formula

#### Adaptive Learning
```
js/systems/LearningSystem.js
```
- `selectNextChallenge()` - Skill-based routing
- `calculateSkillDelta()` - Performance-based updates

#### Domain Models
```
js/models/User.js         # Skill profiles & history
js/models/Challenge.js    # Evaluation logic
js/models/UIComponent.js  # Visual properties & contrast
```

---

## 📊 Understanding Metrics

### Attention Map
**What it shows**: Probability distribution of where users look first

**Formula**:
```
P(attention) = (visualWeight × position × isolation) / Σ(all components)
```

**Interpretation**:
- 40%+ = Strong attention capture
- 20-40% = Moderate visibility
- <20% = May be overlooked

### Hierarchy Strength
**What it shows**: How clearly importance is communicated

**Formula**:
```
variance(visualWeights) / 2
```

**Interpretation**:
- >0.7 = Excellent hierarchy
- 0.5-0.7 = Good hierarchy
- <0.5 = Weak/flat hierarchy

### Cognitive Load
**What it shows**: Mental effort required to process interface

**Formula**:
```
(elementCount/15 × 0.4) + (uniqueColors/8 × 0.3) + (uniqueSizes/5 × 0.3)
```

**Interpretation**:
- <0.4 = Easy to process
- 0.4-0.7 = Moderate complexity
- >0.7 = High cognitive demand

### Contrast Ratio
**What it shows**: WCAG 2.1 compliance for readability

**Formula**:
```
(lighter + 0.05) / (darker + 0.05)
```

**Requirements**:
- Normal text: 4.5:1 (AA)
- Large text: 3:1 (AA)
- Enhanced: 7:1 (AAA)

---

## 🎨 Design System Reference

### Typography
- **Merienda** - Headings, emotional engagement
- **Work Sans** - Body text, UI labels
- **JetBrains Mono** - Metrics, code displays

### Colors (Calm Perceptual Focus)
```css
--color-deep-charcoal: #121417  /* Text */
--color-soft-paper: #F4F2EE     /* Background */
--color-muted-indigo: #4F5D75   /* Primary actions */
--color-warm-sand: #D6CFC4      /* Borders */
```

### Spacing Scale
```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
```

---

## 🧩 Challenge Library

### Current Challenges

1. **First Attention** (Hierarchy, Difficulty 2)
   - Fix login form so Sign In button captures attention first
   
2. **Visual Weight** (Hierarchy, Difficulty 4)
   - Create clear hierarchy in pricing card
   
3. **Contrast Crisis** (Accessibility, Difficulty 3)
   - Fix color contrast to meet WCAG AA
   
4. **Touch Target Test** (Accessibility, Difficulty 2)
   - Resize buttons to meet 44×44px minimum
   
5. **Rhythm & Consistency** (Spacing, Difficulty 5)
   - Establish consistent spacing in article card

### Adding Custom Challenges

Edit `js/data/ChallengeLibrary.js`:

```javascript
export const ChallengeLibrary = {
  your_challenge: new Challenge('your_challenge', {
    title: 'Your Title',
    description: 'What to fix',
    domain: 'hierarchy', // or 'accessibility', 'forms', 'spacing'
    difficulty: 5,
    estimatedTime: 4,
    components: [
      new UIComponent('id', 'button', {
        x: 100, y: 100, width: 120, height: 44,
        // ... other properties
      })
    ],
    successCriteria: [
      ['hierarchyStrength', '>', 0.6],
      ['contrastCompliance', '==', 1]
    ]
  })
}
```

---

## 🐛 Troubleshooting

### "Module not found" errors
- Ensure you're using a web server, not `file://` protocol
- Check browser console for specific missing files

### Metrics not updating
- Click "Evaluate Design" after making changes
- Check browser console for JavaScript errors

### Skills not persisting
- Ensure localStorage is enabled in browser
- Check for private browsing mode (disables storage)

### Fonts not loading
- Check internet connection (Google Fonts required)
- Wait a few seconds for fonts to download

---

## 📱 Browser Compatibility

### Tested & Supported
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Required Features
- ES6 Modules
- CSS Grid
- localStorage
- Custom Properties (CSS Variables)

---

## 🔮 Next Steps

### For Learners
1. Complete all 5 challenges
2. Read `ideas.html` to understand the philosophy
3. Experiment with different component combinations
4. Try to "break" the perception engine

### For Developers
1. Review `architecture.html` for system design
2. Read `TECHNICAL_DEEP_DIVE.md` for engineering insights
3. Explore the codebase module by module
4. Consider contributing new challenges

### For Evaluators
1. Check domain modeling in `js/models/`
2. Review perception algorithms in `js/engine/`
3. Examine adaptive logic in `js/systems/`
4. Assess separation of concerns

---

## 📄 Documentation Files

- **README.md** - Project overview
- **QUICK_START.md** - This file
- **TECHNICAL_DEEP_DIVE.md** - Engineering depth analysis
- **architecture.html** - Interactive technical docs
- **ideas.html** - Philosophy and motivation

---

## 🤝 Contributing Ideas

While this is a portfolio piece, here are expansion ideas:

### Feature Ideas
- [ ] Heatmap visualization overlay
- [ ] Before/after comparison view
- [ ] Accessibility audit export (PDF)
- [ ] Community challenge library
- [ ] Design system token export
- [ ] Eye-tracking integration

### Technical Improvements
- [ ] TypeScript migration
- [ ] Unit test coverage
- [ ] Performance profiling
- [ ] Web Workers for heavy calculations
- [ ] IndexedDB for richer storage
- [ ] PWA with offline support

---

## 💬 Questions?

This is a demonstration project showing:
- Perception simulation engineering
- Adaptive learning systems
- Accessibility constraint engines
- Clean domain modeling
- Explainable AI principles

**Every design decision is documented.**
**Every calculation is traceable.**
**Every outcome is justified.**

---

**GestALT** - Where Perception Meets Engineering

Happy learning! 🎨🧠
