# GestALT - Complete System Guide

## Overview

GestALT is now a comprehensive, learning-focused UI/UX education platform with the following flow:

**Creative Login → Onboarding → Challenges → Results → Dashboard**

---

## Design System

### Typography
- **Branding**: Fraunces (serif) - Used for headings, titles, and brand elements
- **Body**: Inter (sans-serif) - Used for all body text, descriptions, and UI elements
- **Scores/Metrics**: JetBrains Mono (monospace) - Used for scores, timers, and numerical data

### Color Palette

#### Base Colors
- **Black**: `#0A0A0A` - Primary text
- **Off-White**: `#F8F8F8` - Main background

#### Primary Accent
- **Electric Indigo**: `#6366F1` - Primary actions, focus states, brand color

#### Semantic Colors
- **Success/Muted Green**: `#4ADE80` - Success messages, correct answers
- **Warning/Amber**: `#F59E0B` - Warnings, hints, clues  - **Error/Red**: `#EF4444` - Errors, incorrect answers

---

## Application Flow

### 1. Creative Login (Landing Page)

**Concept**: Users create their own login in 5 seconds by interacting with the page.

**Elements**:
- Editable heading where user types their name
- Draggable email input element
- Draggable and formattable CTA button
- Drop zones for email and button placement

**Evaluation**:
- Name completeness
- Email placement (hierarchy check)
- Button placement and formatting
- Overall UI/UX compliance

**Scoring**:
- Pass threshold: 60/100
- Points awarded for proper hierarchy, contrast, and element placement
- Suggestions given for improvements

**Learning Outcome**: Immediate hands-on experience with UI composition and hierarchy

---

### 2. Onboarding Page

**Concept**: Learn the system through pattern recognition, not theory-first.

**Flow**:
1. Show 4 UI options (3 flawed, 1 correct)
2. User selects the correct UI
3. User explains WHY it's correct (multiple choice)
4. System reveals the related UI/UX principle

**Example Scenarios**:
- Login form design (Fitts' Law, WCAG)
- Button hierarchy (Visual hierarchy, Color psychology)
- Card layouts (Gestalt principles)

**Learning Outcome**: Users learn by identifying good design first, then understanding the theory behind it

---

### 3. Challenge Screen

**Layout**:
- **Left**: Toolbox with categorized tools
  - Layout (Spacing, Alignment, Grid)
  - Typography (Size, Weight, Line Height)
  - Color (Contrast, Hierarchy)
  - Interaction (Button Size, Touch Targets)
- **Center**: UI Canvas with flawed elements
- **Bottom**: Timer, Clue button (3 clues), Submit button

**Interaction**:
1. User clicks on UI elements to select them
2. Property editor appears with controls
3. User modifies properties using toolbox and editor
4. All changes are tracked with timestamps
5. Clues available to guide (but reduce efficiency score)

**Elements Can Be Modified**:
- Font sizes
- Padding and spacing
- Colors and contrast
- Text content and labels
- Borders and visual emphasis

**Challenge Types**:
- Form design fixes
- Spacing improvements
- Color contrast corrections
- Button hierarchy adjustments

---

### 4. Results Screen

**Displays**:

#### Heatmap
- Visual representation of attention flow
- Shows where users' eyes would naturally go

#### Score Breakdown
- **Final Score**: 0-100 based on weighted criteria
- **XP Gained**: Score × 10
- **XP Progress Bar**: Visual progress to next level

#### Metrics Cards
1. **Cognitive Load Reduced** (%)
   - How much easier is the UI to process
   
2. **Constraint Improvement** (%)
   - Accessibility & usability compliance (WCAG, touch targets)
   
3. **Time Taken** (MM:SS)
   - Decision speed measurement
   
4. **Improvement** (%)
   - Compared to previous attempts at same challenge

#### Theory Explanations
- Each action is backed by a theory/law
- Displayed after completion:
  - Fitts' Law
  - Gestalt Principles
  - WCAG Guidelines
  - Visual Hierarchy principles
  - Color Theory

**Learning Outcome**: Understanding not just WHAT was wrong, but WHY the changes matter

---

### 5. Dashboard

**Sections**:

#### Header Stats
- Total XP
- Lessons Completed
- Current Streak (daily learning)

#### Progress Metrics
Visual progress bars for:
- **Visual Hierarchy**: Understanding of emphasis and order
- **Accessibility**: WCAG compliance and inclusive design
- **Decision Speed**: How quickly user makes correct decisions
- **Cognitive Load Management**: Ability to simplify interfaces

#### Lessons Grid
Cards showing:
- Lesson title
- Score achieved
- Link to related theory/principle

#### Recommendations
Personalized next steps based on:
- Mistake tracing (common errors)
- Weak stat areas
- Learning patterns

**Each recommendation shows**:
- What to learn next
- Why it's recommended (based on user history)

#### Insights
Three categories:
1. **Strengths**: What user is good at
2. **Improvements**: Areas showing progress
3. **Focus Areas**: What needs work

**Data Source**: All insights computed from:
- Challenge performance
- Modification patterns
- Time efficiency
- Mistake frequency

---

## Scoring System (Backend Logic)

### Point Distribution Philosophy
**NOT** for being right. Points awarded for:

1. **Reducing Cognitive Load** (35% weight)
   - Readable font sizes (16px+)
   - Adequate padding (12px+)
   - Clear labels and capitalization
   - Visual boundaries

2. **Improving Constraints** (30% weight)
   - WCAG touch targets (44x44px minimum)
   - Color contrast ratios (4.5:1 for text)
   - Proper labeling for screen readers
   - Accessibility compliance

3. **Improvement Over Previous** (20% weight)
   - Compared to user's own past attempts
   - Encourages learning from mistakes

4. **Efficiency** (15% weight)
   - Time taken (not penalized harshly - learning takes time)
   - Clue usage (clues are okay, they're learning tools)

### Formulas

```javascript
finalScore = (
  cognitiveLoadReduction × 0.35 +
  constraintImprovement × 0.30 +
  improvementScore × 0.20 +
  efficiencyScore × 0.15
)

XP = finalScore × 10
```

---

## Progress Tracking

### Tracked Data
- Challenge attempts with full modification history
- Timestamp of each action
- Mistake patterns (e.g., "font too small" repeated 5 times)
- Strengths identified (e.g., "good at accessibility")
- Daily streak
- Level and XP

### Mistake Tracing
Tracks:
- `font_size_too_small`: User frequently doesn't increase font enough
- `insufficient_spacing`: Padding issues
- `improper_capitalization`: Label formatting
- `poor_contrast`: Color issues

### Recommendations Engine
**Logic**:
1. Find weakest stat → recommend related category
2. Find frequent mistakes (count ≥ 3) → suggest focused practice
3. Find untouched categories → encourage exploration

### Insights Generation
**Strengths**: Stats > 70%
**Improvements**: Recent average > overall average
**Focus Areas**: Stats < 60% OR frequent mistakes

---

## Content Structure (Based on roadmap.sh)

### Categories
1. **Form Design**
   - Input fields, labels, validation
   - Theories: Fitts' Law, WCAG

2. **Layout & Spacing**
   - Cards, grids, white space
   - Theories: Gestalt (Proximity), White Space principles

3. **Accessibility**
   - Contrast, touch targets, screen readers
   - Theories: WCAG 2.1, Color accessibility

4. **Visual Hierarchy**
   - Button emphasis, typography, color weight
   - Theories: Visual hierarchy, Color psychology

5. **Typography**
   - Font sizing, line-height, hierarchy
   - Theories: Typography best practices

---

## Key Features

### Gamification (Learning-Focused)
- **NOT dopamine-driven**: No arbitrary points or badges
- **XP**: Reflects actual progress and understanding
- **Streaks**: Encourage consistent practice
- **Levels**: Based on total XP, shows growth

### Adaptive Learning
- Challenge recommendations based on weak areas
- Difficulty adjusts based on performance
- Personalized insights from mistake patterns

### Stateful Progress
- All data stored in localStorage
- Persistent across sessions
- Export/import capability (future)

### Conditional Content Unlocking
- Advanced challenges unlock after fundamentals
- Theory reveals only AFTER interaction
- Progressive difficulty curve

### Computed Progress
- NOT just "X challenges completed"
- Stats based on actual skill improvements
- Aggregate performance metrics

---

## Technical Architecture

### File Structure
```
GestALT/
├── index.html                 # Main HTML with all page structures
├── styles/
│   ├── main.css              # Design system & base styles
│   ├── app.css               # All page-specific styles
│   └── landing.css           # Legacy landing styles
├── js/
│   ├── app.js                # Main application controller
│   ├── engine/
│   │   └── PerceptionEngine.js
│   ├── systems/
│   │   ├── LearningSystem.js
│   │   ├── ScoringSystem.js
│   │   └── ProgressTracker.js
│   ├── data/
│   │   ├── OnboardingData.js
│   │   └── ChallengeData.js
│   └── models/
│       ├── Challenge.js
│       ├── User.js
│       └── UIComponent.js
```

### State Management
- `userData`: User profile, stats, XP, streak
- `challengeState`: Current challenge, modifications, time, clues
- `challengeResults`: Scores, metrics, theories to display
- All persisted to localStorage

---

## Usage

### Running the Application
1. Open `index.html` in a browser
2. Start with the creative login
3. Progress through onboarding
4. Complete challenges
5. View results and dashboard

### Development
- Pure vanilla JavaScript (ES6 modules)
- No build tools required
- All data structures in JS files
- LocalStorage for persistence

---

## Learning Philosophy

### Theory AFTER Experience
Users don't start with "Here's Fitts' Law". They:
1. See/Experience the problem
2. Try to fix it
3. THEN learn why their solution works (or doesn't)

### Constraints Over Freedom
Not an open canvas. Specific problems with specific metrics.
This focuses learning and provides measurable outcomes.

### Feedback Over Grades
Not "You got 70%". It's:
- "Cognitive load reduced by 65%"
- "Here's why this change matters"
- "This relates to Fitts' Law because..."

### Improvement Over Perfection
Points for getting better than your previous attempt.
Encourages iteration and learning from mistakes.

---

## Future Enhancements

1. **More Challenges**: Expand challenge library
2. **Real Roadmap.sh Integration**: Pull actual content from roadmap.sh API
3. **Export Progress**: Allow users to export learning data
4. **Peer Comparison**: Anonymous aggregate stats
5. **Advanced Scenarios**: Multi-screen flows, responsive design
6. **AI Hints**: Context-aware suggestions based on modification history
7. **Theory Library**: Full reference guide unlocked as user progresses

---

## Credits

- Design principles: Based on industry standards (WCAG, Gestalt, etc.)
- Learning path: Inspired by roadmap.sh UI/UX path
- Typography: Google Fonts (Fraunces, Inter, JetBrains Mono)

---

**This is GestALT**: Where perception meets practice, and learning happens through doing.
