# GestALT - Interactive UI/UX Learning Platform ✨

**An alternative to theory-first design education**

Learn through perception, interaction, and measurable feedback—not through passive reading.

---

## 🎯 What is GestALT?

GestALT is a comprehensive learning platform that teaches UI/UX design through hands-on interaction:
- **Creative Login**: Design your own interface in 5 seconds
- **Pattern Recognition**: Learn by identifying good design before studying theory
- **Interactive Challenges**: Fix real UI problems with instant feedback
- **Data-Driven Progress**: Track improvement with computed metrics
- **Personalized Learning**: Adaptive recommendations based on your mistakes

---

## 🎨 Design System

### Typography
- **Fraunces** (serif) → Branding, headings, titles
- **Inter** (sans-serif) → Body text, UI elements
- **JetBrains Mono** (monospace) → Scores, metrics, timers

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Black | `#0A0A0A` | Primary text |
| Off-White | `#F8F8F8` | Background |
| Electric Indigo | `#6366F1` | Primary actions, brand |
| Muted Green | `#4ADE80` | Success, correct answers |
| Amber | `#F59E0B` | Warnings, hints |
| Red | `#EF4444` | Errors, incorrect answers |

---

## 🚀 How to Use

### Quick Start
1. Open `index.html` in your browser (Chrome, Firefox, Safari, or Edge)
2. Progress through the learning flow:
   - **Creative Login** → **Onboarding** → **Challenges** → **Results** → **Dashboard**

### No Installation Required
- Pure vanilla JavaScript
- No frameworks or build tools
- No server needed
- Works offline

---

## 📱 The Learning Flow

### 1. Creative Login
**Make something in 5 seconds**

- Enter your name in an editable heading
- Drag email field to the correct position
- Place and format a CTA button yourself
- Get instant UI/UX evaluation

**What You Learn**: Hierarchy, placement, formatting basics

---

### 2. Onboarding
**Pattern recognition, not theory-first**

- See 4 UI designs (3 flawed, 1 correct)
- Choose the correct one
- Explain WHY it's correct
- Discover the design principle behind it

**What You Learn**: Visual pattern recognition, design intuition

---

### 3. Challenge Screen
**Fix real UI problems**

**Layout**:
- **Left**: Toolbox (Layout, Typography, Color, Interaction tools)
- **Center**: Editable UI canvas with flawed elements  
- **Bottom**: Timer, Clue button (3 max), Submit

**Interaction**:
- Click elements to select them
- Edit properties (font size, padding, colors, labels)
- Use tools to fix spacing, contrast, hierarchy issues
- Get hints when stuck

**What You Learn**: Practical problem-solving, accessibility, WCAG standards

---

### 4. Results Screen
**Understand WHY your changes work**

Displays:
- **Attention Heatmap**: Where users' eyes naturally go
- **Final Score**: 0-100 based on weighted criteria
- **XP Progress Bar**: Visual level progression
- **4 Key Metrics**:
  - Cognitive Load Reduced (%)
  - Constraint Improvement (accessibility, WCAG)
  - Time Taken
  - Improvement vs. Previous Attempts
- **Theory Explanations**: Fitts' Law, Gestalt Principles, WCAG, Visual Hierarchy

**What You Learn**: The "WHY" behind design decisions

---

### 5. Dashboard
**Track your progress**

Shows:
- **Stats**: Total XP, Lessons Completed, Current Streak
- **Progress Bars**: Visual Hierarchy, Accessibility, Decision Speed, Cognitive Load
- **Lessons**: Completed challenges with scores and theory links
- **Recommendations**: Personalized next steps based on your weaknesses
- **Insights**:
  - 💪 Strengths: What you're good at
  - 📈 Improvements: Areas showing progress
  - 🎯 Focus Areas: What needs work

**What You Learn**: Your learning journey, patterns, areas for growth

---

## 🎓 Scoring System

### NOT Points for Being Right
Points awarded for **learning-focused criteria**:

1. **Reducing Cognitive Load** (35% weight)
   - Larger, readable fonts (16px+)
   - Adequate padding (12px+)
   - Clear labels with proper capitalization
   - Visual boundaries

2. **Improving Constraints** (30% weight)
   - WCAG touch targets (44×44px minimum)
   - Color contrast ratios (4.5:1 for text)
   - Proper labels for screen readers
   - Accessibility compliance

3. **Improvement Over Previous** (20% weight)
   - Compare to YOUR past attempts
   - Reward learning from mistakes

4. **Efficiency** (15% weight)
   - Time management (not harshly penalized)
   - Strategic clue usage (clues are learning tools)

### Formula
```
finalScore = (cognitiveLoad × 0.35) + (constraints × 0.30) + 
             (improvement × 0.20) + (efficiency × 0.15)
XP = finalScore × 10
```

---

## 🧠 Learning Features

### Mistake Tracing
Tracks your error patterns:
- Font sizes too small
- Insufficient spacing/padding
- Poor color contrast
- Improper capitalization
- Missing labels

### Adaptive Recommendations
Based on your data:
- **Weak stats** → Targeted practice challenges
- **Frequent mistakes** → Focused exercises
- **Untouched areas** → Exploration prompts

### Computed Progress
Not just "challenges completed":
- **Aggregate metrics** from all attempts
- **Skill percentages** based on actual performance
- **Trend analysis** (improving vs. plateauing)

---

## 🏗️ Technical Architecture

### Pure Vanilla JavaScript
- ES6 modules
- No frameworks (React, Vue, etc.)
- No build tools (Webpack, Vite, etc.)
- No dependencies

### File Structure
```
GestALT/
├── index.html                    # All 5 pages in one file
├── styles/
│   ├── main.css                 # Design system, base styles
│   ├── app.css                  # All page-specific styles
│   └── landing.css              # Legacy (optional)
├── js/
│   ├── app.js                   # Main application controller
│   ├── engine/
│   │   └── PerceptionEngine.js  # Attention flow calculations
│   ├── systems/
│   │   ├── ScoringSystem.js     # Points calculation logic
│   │   ├── ProgressTracker.js   # User analytics & insights
│   │   └── LearningSystem.js    # Adaptive challenge selection
│   ├── data/
│   │   ├── OnboardingData.js    # Onboarding scenarios
│   │   └── ChallengeData.js     # Challenge library
│   └── models/
│       ├── User.js              # User data model
│       ├── Challenge.js         # Challenge model
│       └── UIComponent.js       # UI element model
```

### Data Storage
- **localStorage** for persistence
- **JSON serialization** of user data
- **No server or database** required

---

## 📚 Learning Content

Based on [roadmap.sh](https://roadmap.sh) UI/UX Frontend Development:

### Challenge Categories
1. **Form Design**: Labels, inputs, validation, Fitts' Law
2. **Layout & Spacing**: Gestalt principles, white space, proximity
3. **Accessibility**: WCAG 2.1, contrast, touch targets, screen readers
4. **Visual Hierarchy**: Emphasis, color psychology, typography
5. **Typography**: Font sizing, line-height, readability

### Design Theories Covered
- **Fitts' Law**: Larger targets are easier to click
- **Gestalt Principles**: Proximity, similarity, closure
- **WCAG Guidelines**: Accessibility standards
- **Visual Hierarchy**: Emphasis and attention flow
- **Color Theory**: Contrast, meaning, accessibility

---

## 🛠️ Customization

### Add Your Own Challenges
Edit `js/data/ChallengeData.js`:
```javascript
{
  id: 'ch_004',
  title: 'Fix Navigation Menu',
  category: 'Layout & Spacing',
  difficulty: 'Intermediate',
  initialState: { /* elements */ },
  successCriteria: { /* requirements */ },
  theories: [ /* related theories */ ],
  hints: [ /* clue texts */ ]
}
```

### Adjust Scoring Weights
Edit `js/systems/ScoringSystem.js`:
```javascript
this.weights = {
    cognitiveLoad: 0.35,    // Change to adjust importance
    constraints: 0.30,
    improvement: 0.20,
    efficiency: 0.15
};
```

### Customize Colors
Edit `styles/main.css`:
```css
:root {
    --color-primary: #6366F1;      /* Change primary color */
    --color-success: #4ADE80;      /* Change success color */
    /* ... */
}
```

---

## 📖 Documentation

- **[SYSTEM_GUIDE.md](./SYSTEM_GUIDE.md)**: Complete system documentation
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)**: Development guide
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)**: Feature checklist

---

## 🌐 Browser Support

**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Requirements**:
- JavaScript enabled
- localStorage enabled
- ES6 module support

---

## 🎯 Philosophy

### Theory AFTER Experience
Traditional: Read → Memorize → Try to apply

GestALT: Experience → Fix → Understand WHY

### Constraints Over Freedom
Open-ended "design something" is paralyzing for beginners.

Focused problems with measurable outcomes build competence.

### Feedback Over Grades
Not "You got 70%"

Instead: "Cognitive load reduced by 65% because you increased font size, which makes text easier to process. This relates to readability research showing 16px minimum for body text."

### Improvement Over Perfection
Points for getting better than YOUR previous attempts.

Learning from mistakes is encouraged and rewarded.

---

## 🚧 Future Enhancements

- [ ] Real roadmap.sh API integration
- [ ] Export/import progress data
- [ ] Community challenge sharing
- [ ] Multi-screen flow challenges
- [ ] Responsive design challenges
- [ ] Animation & transition evaluation
- [ ] AI-powered contextual hints
- [ ] Dark mode theme
- [ ] Mobile app version

---

## 🙏 Credits

- **Design Principles**: Industry standards (WCAG, Nielsen Norman Group)
- **Learning Path**: Inspired by roadmap.sh
- **Typography**: Google Fonts (Fraunces, Inter, JetBrains Mono)

---

## 📄 License

Educational project - open for learning and extension.

---

## 🚀 Get Started Now

```bash
# No installation needed!
# Just open the file:
index.html
```

**That's it!** Your learning journey begins with the creative login.

---

**GestALT**: Where perception meets practice, and learning happens through doing, not just reading.

Built with ❤️ using vanilla web technologies.
