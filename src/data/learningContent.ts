export interface GameLearningContent {
  id: string;
  before: {
    title: string;
    concept: string;
    description: string;
    realWorldExample: string;
    instruction: string;
  };
  after: {
    title: string;
    whyItMatters: string;
    commonMistakes: string[];
    relatedLaws: string[];
  };
  hints: {
    level1: string[];
    level2: string[];
    level3: string[];
  };
}

export const learningContentData: Record<string, GameLearningContent> = {
  'whitespace-sim': {
    id: 'whitespace-sim',
    before: {
      title: 'The Law of Proximity',
      concept: 'Whitespace Grouping',
      description: 'Elements placed close to each other are perceived as a related group. Spacing is the most powerful tool for creating visual relationships.',
      realWorldExample: 'Look at any complex dashboard. Instead of drawing boxes around every stat, designers use whitespace to separate distinct data clusters.',
      instruction: 'Drag your cursor to exert gravitational pull. Cluster related components tightly to establish relationships.',
    },
    after: {
      title: 'Proximity Mastered',
      whyItMatters: 'If spacing is ambiguous, cognitive load skyrockets. Clean, generous whitespace allows the eye to quickly scan and understand structure without explicit dividing lines.',
      commonMistakes: [
        'Equal spacing between unrelated groups (Ambiguity).',
        'Not enough breathing room around edge containers.',
        'Using borders instead of whitespace to separate items.'
      ],
      relatedLaws: ['Law of Common Region', 'Law of Similarity', 'Cognitive Load']
    },
    hints: {
      level1: ['Try catching the blue navigation elements first.', 'Drag slowly to form a tight cluster.'],
      level2: ['You have mixed elements! Repel the purple ones away from the blue ones.', 'Keep different colors geographically separated.'],
      level3: ['This is a real wireframe. Pull the sidebar items to the left, and the header to the top.']
    }
  },
  'similarity': {
    id: 'similarity',
    before: { title: 'The Law of Similarity', concept: 'Visual Repetition', description: 'Elements that look similar are perceived to have the same function.', realWorldExample: 'All primary action buttons in an app are usually the same exact color and shape.', instruction: 'Morph the shapes to establish a uniform visual language.' },
    after: { title: 'Consistency Verified', whyItMatters: 'Inconsistent UI styling forces users to relearn your interface on every page.', commonMistakes: ['Changing button colors for no reason.', 'Mixing border-radius randomly.'], relatedLaws: ['Proximity', 'Familiarity'] },
    hints: { level1: ['Make all interactive elements the same color.'], level2: ['Match the border-radius across all cards.'], level3: ['Find the outlier that breaks the pattern.'] }
  },
  'closure-puzzle': {
    id: 'closure-puzzle',
    before: { title: 'The Law of Closure', concept: 'Incomplete Shapes', description: 'The human brain will automatically fill in gaps to perceive a complete object.', realWorldExample: 'Loading skeletons or negative-space logos (like FedEx) use closure to hint at shapes without drawing them.', instruction: 'Reveal just enough of the shape until the brain recognizes it.' },
    after: { title: 'Perception Activated', whyItMatters: 'You do not need to draw every detail. Minimalist UI relies on closure to reduce visual noise.', commonMistakes: ['Over-explaining visual elements.', 'Using too many borders instead of letting the user fill in gaps.'], relatedLaws: ['Simplicity', 'Figure-Ground'] },
    hints: { level1: ['Rub the canvas to reveal the edges.'], level2: ['Follow the unseen outline.'], level3: ['Can you see what it is before fully exposing it?'] }
  },
  'continuity': {
    id: 'continuity',
    before: { title: 'The Law of Continuity', concept: 'Flow Paths', description: 'The eye is compelled to move forward along smooth paths.', realWorldExample: 'Multi-step checkout flows or timeline UI follow a strict linear path.', instruction: 'Draw the path of least resistance for the user.' },
    after: { title: 'Flow Established', whyItMatters: 'Interrupting a user\'s flow causes them to lose context and abandon the task.', commonMistakes: ['Placing CTAs outside the natural reading path.', 'Abrupt angles in wizard flows.'], relatedLaws: ['Fitts Law', 'Hierarchy'] },
    hints: { level1: ['Trace the line.'], level2: ['Avoid the visual blockers.'], level3: ['Create a smooth Bezier curve through the targets.'] }
  },
  'hicks-law': {
    id: 'hicks-law',
    before: { title: 'Hick\'s Law', concept: 'Decision Fatigue', description: 'The time it takes to make a decision increases with the number and complexity of choices.', realWorldExample: 'A menu with 50 items takes exponentially longer to read than a menu with 5 categories of 10 items.', instruction: 'Quickly find the target before decision fatigue overwhelms you.' },
    after: { title: 'Focus Retained', whyItMatters: 'Overwhelming users leads to bounce rates. Always simplify choices.', commonMistakes: ['Mega-menus with no visual hierarchy.', 'Too many primary buttons on one screen.'], relatedLaws: ['Cognitive Load', 'Miller\'s Law'] },
    hints: { level1: ['It\'s in the top right quadrant.'], level2: ['Categorize visually first.'], level3: ['Ignore the noise, focus on the icon shape.'] }
  },
  'mobile-tab': {
    id: 'mobile-tab',
    before: { title: 'Fitts\'s Law', concept: 'Target Acquisition', description: 'The time to acquire a target is a function of the distance to and size of the target.', realWorldExample: 'Floating Action Buttons (FABs) on mobile are huge and placed exactly where the thumb rests.', instruction: 'Strike the targets. Notice how smaller, further targets take exponentially longer.' },
    after: { title: 'Target Acquired', whyItMatters: 'Tiny hitboxes make apps feel unresponsive and frustrating.', commonMistakes: ['Touch targets under 44px.', 'Placing destructive actions too close to primary actions.'], relatedLaws: ['Accessibility', 'Hick\'s Law'] },
    hints: { level1: ['Just tap it.'], level2: ['Wait for it to slow down.'], level3: ['Predict the erratic movement.'] }
  },
  'visual-hierarchy': {
    id: 'visual-hierarchy',
    before: { title: 'Visual Hierarchy', concept: 'Focal Points', description: 'Users don\'t read, they scan. Size, color, and contrast dictate what they see first.', realWorldExample: 'Newspaper headlines dominate the page. The Buy button should dominate the product view.', instruction: 'Manipulate the scales to control the simulated eye-tracking heatmap.' },
    after: { title: 'Attention Directed', whyItMatters: 'If everything screams for attention, nothing gets it.', commonMistakes: ['Making everything bold.', 'Lack of contrast between H1 and body text.'], relatedLaws: ['Contrast', 'Proximity'] },
    hints: { level1: ['Increase the Title size.'], level2: ['Dim the secondary text.'], level3: ['Make the CTA the brightest element on screen.'] }
  },
  'semantic-color': {
    id: 'semantic-color',
    before: { title: 'Semantic Color', concept: 'Psychological Mapping', description: 'Colors have intrinsic behavioral meanings. Red means danger. Green means success.', realWorldExample: 'A destructive "Delete Account" button should never be styled as a friendly green primary action.', instruction: 'Tune the HSL values to match the requested psychological intent.' },
    after: { title: 'Intent Matched', whyItMatters: 'Misusing colors leads to catastrophic user errors.', commonMistakes: ['Using red for positive actions.', 'Using muted grays for active CTAs.'], relatedLaws: ['Accessibility', 'Consistency'] },
    hints: { level1: ['This is a success state. Add more green.'], level2: ['Warning state. Shift hue towards yellow/orange.'], level3: ['Error state. High saturation red required.'] }
  },
  'accessibility': {
    id: 'accessibility',
    before: { title: 'WCAG Accessibility', concept: 'Inclusive Design', description: 'Design must work for everyone, including those with visual, motor, or cognitive impairments.', realWorldExample: 'Colorblind users cannot distinguish a red error state if the only indicator is color. Always use icons too.', instruction: 'Survive the simulator as vision impairments are dynamically applied.' },
    after: { title: 'Contrast Verified', whyItMatters: 'Ignoring accessibility cuts off 15% of your user base and exposes you to legal risk.', commonMistakes: ['Relying ONLY on color for state changes.', 'Low contrast grey-on-grey text.'], relatedLaws: ['Contrast', 'Readability'] },
    hints: { level1: ['Look at the contrast ratio.'], level2: ['Increase the lightness of the background.'], level3: ['Add an icon to supplement the color change.'] }
  },
  'grid-master': {
    id: 'grid-master',
    before: { title: 'Grid Systems', concept: 'Mathematical Alignment', description: 'Grids bring order to chaos. They provide a structural foundation for placing elements predictably.', realWorldExample: 'The 12-column grid is the industry standard for responsive web layouts.', instruction: 'Drag the unstructured blocks to perfectly align with the hidden 12-column magnetic grid.' },
    after: { title: 'Architecture Stabilized', whyItMatters: 'Without a grid, interfaces feel sloppy and disorganized.', commonMistakes: ['Ignoring gutters.', 'Placing child elements off the parent grid.'], relatedLaws: ['Alignment', 'Proximity'] },
    hints: { level1: ['Snap the block to column 2.'], level2: ['Try a 4-4-4 masonry layout.'], level3: ['Align the disparate asymmetrical blocks to share a common baseline.'] }
  },
  'cognitive-load': {
    id: 'cognitive-load',
    before: { title: 'Miller\'s Law', concept: 'Working Memory', description: 'The average person can only keep 7 (plus or minus 2) items in their working memory.', realWorldExample: 'Phone numbers are chunked (555-0192) because trying to remember 5550192 is too difficult.', instruction: 'Drag and categorize the massive unstructured data flood into logical chunks.' },
    after: { title: 'Load Reduced', whyItMatters: 'If you present too much info at once, users freeze. Progressive disclosure is key.', commonMistakes: ['Forms with 20 inputs on one screen.', 'No categorized groupings in massive settings menus.'], relatedLaws: ['Hick\'s Law', 'Simplicity'] },
    hints: { level1: ['Look for the Network settings.'], level2: ['Group the Display items together.'], level3: ['Categorize the remainder into Security.'] }
  },
  'z-index-layering': {
    id: 'z-index-layering',
    before: { title: 'Elevation', concept: 'Z-Index Isolation', description: 'Interfaces aren\'t flat. Depth helps users understand what to focus on and what is in the background.', realWorldExample: 'Modals and dropdowns sit on a higher Z-axis and cast shadows to indicate dominance.', instruction: 'Rotate the 3D space and organize the visual layers into a logical Z-order.' },
    after: { title: 'Depth Established', whyItMatters: 'Improper Z-indexing causes crucial UI to be hidden underneath background decorative elements.', commonMistakes: ['Z-index: 9999 wars.', 'Shadows that don\'t match absolute elevation.'], relatedLaws: ['Visual Hierarchy', 'Lighting'] },
    hints: { level1: ['The modal must be on top.'], level2: ['Background elements belong at Z: 0.'], level3: ['Create a sandwich: Background -> Content -> Overlay.'] }
  },
  'button-logic': {
    id: 'button-logic',
    before: { title: 'Micro-Interactions', concept: 'State Feedback', description: 'Every action must have a reaction. If a user clicks, the UI must immediately acknowledge it.', realWorldExample: 'Buttons change color on hover, shrink on press, and show spinners while loading.', instruction: 'Wire the interactive physics states to the correct button micro-interactions.' },
    after: { title: 'Feedback Loop Closed', whyItMatters: 'If a button does nothing on click, the user will angrily click it 5 more times, causing API spam.', commonMistakes: ['No :hover states.', 'No disabled states during async operations.'], relatedLaws: ['Fitts\' Law', 'System Status'] },
    hints: { level1: ['Connect the Press state.'], level2: ['Wire the Hover scale physics.'], level3: ['Ensure the Disabled state prevents interaction.'] }
  },
  'responsive-design': {
    id: 'responsive-design',
    before: { title: 'Fluidity', concept: 'Responsive Clamps', description: 'Interfaces must stretch, squish, and reflow to fit thousands of different device screens.', realWorldExample: 'Text should smoothly shrink on mobile and grow on desktop using CSS clamp().', instruction: 'Drag the viewport handles. Identify and fix the components that break under pressure.' },
    after: { title: 'Fluidity Achieved', whyItMatters: 'A static design in a fluid world breaks instantly.', commonMistakes: ['Fixed pixel widths for containers.', 'Forgetting to test on very small (320px) screens.'], relatedLaws: ['Accessibility', 'Grid Layouts'] },
    hints: { level1: ['Squish the screen. See what overflows.'], level2: ['Apply a max-width to the container.'], level3: ['Switch the Flexbox to wrap.'] }
  },
  'final-boss': {
    id: 'final-boss',
    before: { title: 'The Architect', concept: 'Unified Integration', description: 'A great interface balances spacing, color, hierarchy, and flow simultaneously.', realWorldExample: 'Apple\'s OS integrates every single GestALT law we\'ve learned into one cohesive engine.', instruction: 'You must apply everything you have learned. The dashboard is fundamentally broken. Fix it.' },
    after: { title: 'System Mastered', whyItMatters: 'You are now an Architect. You perceive the matrix of design.', commonMistakes: ['Thinking rules work in isolation.', 'Forgetting the user.'], relatedLaws: ['All of them.'] },
    hints: { level1: ['Start by aligning the grid.'], level2: ['Fix the visual hierarchy of the typography.'], level3: ['Ensure the semantic colors are accessible.'] }
  },
  'load-reducer': {
    id: 'load-reducer',
    before: { title: 'Cognitive Load Theory', concept: 'Reducing Burden', description: 'Working memory has strict limits (~4 chunks). Overloaded interfaces force users to spend mental effort on navigation instead of their task.', realWorldExample: 'Banks bombard login flows with security info, newsletter signups, and promos. Users abandon before entering credentials.', instruction: 'Remove, hide, or combine elements until cognitive cost drops below the budget.' },
    after: { title: 'Interface Simplified', whyItMatters: 'Every element has a cost. Removing even one unnecessary animation can cut perceived load by 15%.', commonMistakes: ['Killing essential features', 'Confusing "hidden" with "removed"', 'Adding "more" dropdowns that still need decisions.'], relatedLaws: ['Miller\'s Law', 'Hick\'s Law', 'Simplicity'] },
    hints: { level1: ['Animations are expensive. There are 2 to remove.'], level2: ['Decorative images don\'t help signups.'], level3: ['Can you combine "Cancel" and "Reset"?'] }
  },
  'mental-model-mapper': {
    id: 'mental-model-mapper',
    before: { title: 'Mental Models', concept: 'User Expectations', description: 'Users expect UI to match patterns from products they already know. A search icon in an unexpected place breaks their mental model.', realWorldExample: 'Email clients universally put Compose in the top-left. Move it to bottom-right and users will search for 30 seconds.', instruction: 'Predict where functions should live, then redesign the layout to match user expectations.' },
    after: { title: 'Expectation Aligned', whyItMatters: 'Poor mental model fit increases time-to-completion by 5-10x for complex tasks.', commonMistakes: ['Unique navigation (feels clever, frustrates users)', 'Ignoring cultural/domain conventions'], relatedLaws: ['Familiarity', 'Consistency'] },
    hints: { level1: ['Think about other apps you use.'], level2: ['What do users already know?'], level3: ['Match their existing mental models.'] }
  },
  'hicks-law-duel': {
    id: 'hicks-law-duel',
    before: { title: 'Hick\'s Law (Decision Complexity)', concept: 'Choice Overload', description: 'Decision time increases logarithmically with the number of choices: T = b × log₂(n+1). But grouping and hierarchy can flatten this curve.', realWorldExample: 'A 50-item flat menu takes 3-5 seconds to scan. The same items organized into 5 categories: 0.8 seconds.', instruction: 'Design a navigation hierarchy that minimizes decision time while keeping all items discoverable.' },
    after: { title: 'Navigation Optimized', whyItMatters: 'Good information architecture reduces decision fatigue and bounce rates by 40%+.', commonMistakes: ['Creating too many top-level categories', 'Hiding frequently-used options too deep', 'No visual hierarchy between items'], relatedLaws: ['Cognitive Load', 'Visual Hierarchy'] },
    hints: { level1: ['How many top-level items do you need?'], level2: ['Group related items together.'], level3: ['Hick\'s formula: T = 0.166 × log₂(n+1)'] }
  },
  'fitts-law-forge': {
    id: 'fitts-law-forge',
    before: { title: 'Fitts\'s Law (Target Acquisition)', concept: 'Distance & Size Matter', description: 'Time to click a target = a + b × log₂(2D/W). Larger targets and shorter distances = faster interaction.', realWorldExample: 'Mobile FABs (Floating Action Buttons) are huge (56px) and placed where thumbs rest. Required buttons are 44×44px minimum.', instruction: 'Position and size interactive elements to minimize total acquisition time across the entire user flow.' },
    after: { title: 'Interaction Optimized', whyItMatters: 'Poor target sizing makes apps feel slow and frustrating. A 3-step flow with poor layouts can feel like 9 steps.', commonMistakes: ['Tiny hit targets (<30px)', 'Wide-screen desktop buttons shrink to 16px on mobile', 'Primary actions far from rest position'], relatedLaws: ['Accessibility', 'Mobile Design', 'Ergonomics'] },
    hints: { level1: ['Make buttons bigger.'], level2: ['Move them closer together.'], level3: ['Fitts: T = a + b × log₂(2D/W)'] }
  }
};
