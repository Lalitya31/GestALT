// Perception Simulation Engine - The core differentiator
export class PerceptionEngine {
    constructor() {
        this.attentionWeights = {
            size: 0.3,
            contrast: 0.25,
            position: 0.2,
            color: 0.15,
            isolation: 0.1
        };
    }

    analyze(components) {
        const attentionMap = this.calculateAttentionMap(components);
        const hierarchyStrength = this.calculateHierarchyStrength(components);
        const cognitiveLoad = this.calculateCognitiveLoad(components);
        const errorLikelihood = this.calculateErrorLikelihood(components);
        
        // Accessibility metrics
        const contrastResults = this.evaluateContrast(components);
        const hitTargetResults = this.evaluateHitTargets(components);
        const keyboardNav = this.evaluateKeyboardNavigation(components);

        return {
            attentionMap,
            hierarchyStrength,
            cognitiveLoad,
            errorLikelihood,
            firstAttentionCorrect: this.checkFirstAttention(attentionMap, components),
            
            // Accessibility
            contrastCompliance: contrastResults.compliance,
            failingContrasts: contrastResults.failing,
            hitTargetCompliance: hitTargetResults.compliance,
            smallTargets: hitTargetResults.small,
            keyboardNavigable: keyboardNav.navigable,
            
            // Spacing metrics
            spacingConsistency: this.calculateSpacingConsistency(components),
            visualNoise: this.calculateVisualNoise(components)
        };
    }

    calculateAttentionMap(components) {
        const map = components.map(comp => {
            const weight = comp.getVisualWeight();
            const position = this.getPositionFactor(comp);
            const isolation = this.getIsolationFactor(comp, components);
            
            return {
                componentId: comp.id,
                attentionProbability: weight * position * isolation,
                visualWeight: weight
            };
        });

        // Normalize probabilities to sum to 1
        const total = map.reduce((sum, item) => sum + item.attentionProbability, 0);
        return map.map(item => ({
            ...item,
            attentionProbability: item.attentionProbability / total
        })).sort((a, b) => b.attentionProbability - a.attentionProbability);
    }

    getPositionFactor(component) {
        // F-pattern: top-left gets highest weight
        const x = component.properties.x;
        const y = component.properties.y;
        const xFactor = Math.max(0, 1 - x / 800);
        const yFactor = Math.max(0, 1 - y / 600);
        return (xFactor * 0.4 + yFactor * 0.6);
    }

    getIsolationFactor(component, allComponents) {
        // Components with more whitespace around them get more attention
        const nearbyComponents = allComponents.filter(c => 
            c.id !== component.id && 
            this.getDistance(component, c) < 200
        );
        return Math.max(0.3, 1 - (nearbyComponents.length * 0.1));
    }

    getDistance(comp1, comp2) {
        const dx = comp1.properties.x - comp2.properties.x;
        const dy = comp1.properties.y - comp2.properties.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    calculateHierarchyStrength(components) {
        if (components.length < 2) return 1;

        // Calculate weight distribution variance
        const weights = components.map(c => c.getVisualWeight());
        const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
        const variance = weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length;
        
        // Higher variance = stronger hierarchy
        // Normalize to 0-1 range
        return Math.min(1, variance / 2);
    }

    calculateCognitiveLoad(components) {
        // Factors: number of elements, visual complexity, inconsistency
        const elementCount = components.length;
        const countLoad = Math.min(1, elementCount / 15); // 15+ elements = high load
        
        // Color variety increases load
        const uniqueColors = new Set(components.map(c => c.properties.color)).size;
        const colorLoad = Math.min(1, uniqueColors / 8);
        
        // Font size variety
        const uniqueSizes = new Set(components.map(c => c.properties.fontSize)).size;
        const sizeLoad = Math.min(1, uniqueSizes / 5);
        
        return (countLoad * 0.4 + colorLoad * 0.3 + sizeLoad * 0.3);
    }

    calculateErrorLikelihood(components) {
        let errorScore = 0;
        
        // Check for elements that are too close
        for (let i = 0; i < components.length; i++) {
            for (let j = i + 1; j < components.length; j++) {
                const dist = this.getDistance(components[i], components[j]);
                if (dist < 50 && components[i].type === 'button' && components[j].type === 'button') {
                    errorScore += 0.2; // Buttons too close = mis-click risk
                }
            }
        }
        
        // Check for low contrast interactive elements
        components.forEach(comp => {
            if (comp.type === 'button' || comp.type === 'input') {
                if (comp.getContrast() < 3) {
                    errorScore += 0.15;
                }
            }
        });
        
        return Math.min(1, errorScore);
    }

    checkFirstAttention(attentionMap, components) {
        // Check if the element with highest attention is marked as primary
        if (attentionMap.length === 0) return false;
        const topComponent = components.find(c => c.id === attentionMap[0].componentId);
        return topComponent && topComponent.properties.semanticRole === 'primary';
    }

    evaluateContrast(components) {
        const failing = [];
        
        components.forEach(comp => {
            const contrast = comp.getContrast();
            const required = comp.properties.fontSize >= 18 || comp.properties.fontWeight >= 700 ? 3 : 4.5;
            
            if (contrast < required) {
                failing.push({
                    id: comp.id,
                    actual: contrast.toFixed(2),
                    required: required,
                    difference: (required - contrast).toFixed(2)
                });
            }
        });
        
        return {
            compliance: components.length === 0 ? 1 : (components.length - failing.length) / components.length,
            failing
        };
    }

    evaluateHitTargets(components) {
        const small = [];
        const MIN_SIZE = 44;
        
        components.forEach(comp => {
            if (comp.type === 'button' || comp.type === 'input') {
                if (comp.properties.width < MIN_SIZE || comp.properties.height < MIN_SIZE) {
                    small.push({
                        id: comp.id,
                        width: comp.properties.width,
                        height: comp.properties.height,
                        deficitX: Math.max(0, MIN_SIZE - comp.properties.width),
                        deficitY: Math.max(0, MIN_SIZE - comp.properties.height)
                    });
                }
            }
        });
        
        const interactive = components.filter(c => c.type === 'button' || c.type === 'input');
        return {
            compliance: interactive.length === 0 ? 1 : (interactive.length - small.length) / interactive.length,
            small
        };
    }

    evaluateKeyboardNavigation(components) {
        // Simple check: are interactive elements ordered logically?
        const interactive = components
            .filter(c => c.type === 'button' || c.type === 'input')
            .sort((a, b) => {
                if (Math.abs(a.properties.y - b.properties.y) < 50) {
                    return a.properties.x - b.properties.x;
                }
                return a.properties.y - b.properties.y;
            });
        
        // Check if semantic flow matches visual flow
        const primaryIndex = interactive.findIndex(c => c.properties.semanticRole === 'primary');
        const navigable = primaryIndex === -1 || primaryIndex <= interactive.length / 2;
        
        return {
            navigable,
            tabOrder: interactive.map(c => c.id)
        };
    }

    calculateSpacingConsistency(components) {
        if (components.length < 2) return 1;
        
        const margins = components.map(c => c.properties.margin);
        const paddings = components.map(c => c.properties.padding);
        
        const marginVariance = this.getVariance(margins);
        const paddingVariance = this.getVariance(paddings);
        
        // Lower variance = better consistency
        return Math.max(0, 1 - (marginVariance + paddingVariance) / 200);
    }

    calculateVisualNoise(components) {
        // Multiple factors contribute to visual noise
        const densityNoise = Math.min(1, components.length / 20);
        const colorNoise = Math.min(1, new Set(components.map(c => c.properties.color)).size / 10);
        
        return (densityNoise + colorNoise) / 2;
    }

    getVariance(values) {
        if (values.length === 0) return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    }
}
