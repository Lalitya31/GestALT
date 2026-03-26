/**
 * GestALT Perception Engine
 * Simulates real-world UI/UX laws mathematically to provide real-time evaluation.
 */

export interface UIElementProps {
  fontSize: number;
  padding: number;
  borderRadius: number;
  background: string;
  color: string;
  borderWidth: number;
  text: string;
}

export interface EvaluationResult {
  score: number; // 0 to 100
  issues: string[];
  suggestions: string[];
  metrics: {
    contrast: number; // Ratio e.g. 4.5
    fittsLawTarget: number; // Height estimate
    hierarchy: number; // Size/weight contrast
  };
}

// --- COLOR MATH ---
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function getLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function calculateContrast(hex1: string, hex2: string) {
  const color1 = hexToRgb(hex1);
  const color2 = hexToRgb(hex2);
  const l1 = getLuminance(color1.r, color1.g, color1.b);
  const l2 = getLuminance(color2.r, color2.g, color2.b);
  const lightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (lightest + 0.05) / (darkest + 0.05);
}

// --- ENGINE RULES ---

/**
 * Evaluates the entire form or a specific element mathematically.
 */
export const PerceptionEngine = {
  
  evaluateButton: (props: UIElementProps): EvaluationResult => {
    let score = 100;
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // 1. Accessibility (WCAG Contrast)
    // The button background vs text color
    const contrastRatio = calculateContrast(props.background, props.color);
    if (contrastRatio < 3.0) {
      score -= 30;
      issues.push(`Critical: Very low contrast (${contrastRatio.toFixed(1)}:1).`);
      suggestions.push("Increase contrast between button background and text to at least 4.5:1.");
    } else if (contrastRatio < 4.5) {
      score -= 10;
      issues.push(`Warning: Mediocre contrast (${contrastRatio.toFixed(1)}:1).`);
      suggestions.push("Aim for a contrast ratio above 4.5:1 for WCAG AA compliance.");
    }

    // 2. Fitts' Law (Touch Targets)
    // Estimate target hit area: fontSize (approx line-height) + padding * 2
    const targetHeight = props.fontSize + (props.padding * 2);
    if (targetHeight < 40) {
      score -= 25;
      issues.push(`Usability: Fitts' law violation. Target height is only ${targetHeight}px.`);
      suggestions.push("Increase padding to make the touch target at least 44px tall.");
    } else if (targetHeight < 48) {
      score -= 5;
    }

    // 3. Clear Call-to-Action
    if (props.text.toLowerCase().trim() === 'submit' || props.text.toLowerCase().trim() === 'go') {
      score -= 10;
      issues.push("Cognitive: 'Submit' is a generic label.");
      suggestions.push("Use an action-oriented label like 'Create Account' or 'Sign Up'.");
    }

    // Determine final score bounds
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      issues,
      suggestions,
      metrics: {
        contrast: Number(contrastRatio.toFixed(2)),
        fittsLawTarget: targetHeight,
        hierarchy: 100 // Default for standalone
      }
    };
  },

  evaluateHierarchy: (label: UIElementProps, input: UIElementProps, button: UIElementProps) => {
    // Evaluates the relationship between elements.
    let hierarchyScore = 100;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Is the button visually distinct from the input?
    if (button.background === input.background) {
      hierarchyScore -= 20;
      issues.push("Visual Hierarchy: Button resembles an input field.");
      suggestions.push("Give the primary button a distinct, solid background color.");
    }

    // Is the label clearly distinct from user input text?
    if (label.fontSize > input.fontSize) {
      hierarchyScore -= 10;
      issues.push("Visual Hierarchy: Label is prominent but input text is smaller.");
    }
    
    if (label.color === '#ffffff') { // If it's pure white, it might bleed into primary text
       hierarchyScore -= 5;
    }

    return { hierarchyScore, issues, suggestions };
  }
};
