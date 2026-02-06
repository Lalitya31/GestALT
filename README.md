# GestALT
An alternative where design is seen, not read.
GestALT is an alternative, perception-driven learning platform for UI/UX education. It addresses a fundamental limitation in how design is commonly taught: beginners are often introduced to UI/UX through theory-heavy documentation and static explanations, even though design itself is inherently visual, experiential, and interactive.

GestALT replaces passive, theory-first learning with an interactive system where users learn by observing, manipulating, and experiencing the consequences of design decisions.

## Motivation

Traditional UI/UX learning relies heavily on:
1. written theory
2. design laws explained in isolation
3. examples without interaction
   
This approach often overwhelms beginners and fails to reflect how design decisions are actually made in practice. GestALT exists as an alternative—one that treats perception as the primary learning medium and interaction as the primary teacher.

## Core Concept

At its core, GestALT is a game-based learning system, but not in a superficial or gamified sense. The platform is built on the idea that meaningful design understanding emerges from working within constraints and responding to feedback, rather than memorizing principles.
Users are presented with intentionally flawed or incomplete interfaces and asked to improve them. Instead of being taught rules upfront, users:

= make design decisions first

= observe the outcomes of those decisions

= reflect on why those outcomes occurred

Learning happens through cause and effect, not instruction alone.

### Perception Simulation Engine

The central technical component of GestALT is a perception simulation engine.Rather than evaluating designs subjectively, the system models how users are likely to perceive an interface based on measurable properties, including:
+ element size

+ visual contrast

+ spacing and alignment

+ placement and hierarchy

Each UI element is represented as structured data rather than static visuals. When a learner modifies an interface, the engine recalculates metrics such as:

- attention flow

- visual hierarchy strength

- cognitive load

This transforms feedback from opinion-based critique into deterministic, explainable evaluation.

### Stateful Learning & Adaptation

GestALT is designed as a stateful system, not a collection of isolated lessons.
For each user, the platform maintains a learning profile that tracks:
> design decisions made
> recurring mistakes
> time taken to respond
> reliance on hints or guidance

Using this data, the system adapts future challenges by:
- increasing difficulty in areas of demonstrated strength
- reinforcing concepts where users struggle
- adjusting feedback depth and verbosity
- This adaptive behavior reflects real-world system design concerns such as state management, personalization, and data-driven decision making.

### System Architecture & Domain Modeling

From a software engineering perspective, GestALT emphasizes clear domain modeling and separation of concerns.
Core domain concepts include:
1. Users
2. Challenges
3. UI Components
4. Perception Metrics
5. Decisions

### Outcomes

These entities are explicitly defined and connected, allowing the system to scale in complexity without becoming brittle. The frontend functions as a visualization and interaction layer, not as the source of business logic.
> Explainability by Design
> Explainability is a first-class goal of the system.
For every evaluation, GestALT exposes: which visual principles were violated ; which rules were triggered ; how specific changes affected perception metrics
This mirrors real engineering systems where understanding why a system behaves a certain way is as important as the result itself.

### Accessibility as a Constraint
Accessibility is treated as a core system constraint, not a checklist.

GestALT enforces **rules** related to:
- color contrast
- hit target size
- keyboard navigation paths
In advanced challenges, learners must balance aesthetic choices against accessibility requirements, reflecting real-world product tradeoffs faced by designers and engineers.

### Why GestALT?

GestALT is an alternative to theory-first design education. It treats perception as something that can be simulated, tested, and refined through interaction, rather than explained solely through documentation.

As a project, GestALT demonstrates:
- perception-driven UX thinking
- system-level software design
- rule-based evaluation
- adaptive learning logic
- explainable decision systems
It is intended to function not only as a learning platform, but also as a serious software engineering portfolio project, showcasing depth beyond surface-level UI design.
