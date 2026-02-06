// Challenge Library - Predefined challenges
import { Challenge } from '../models/Challenge.js';
import { UIComponent } from '../models/UIComponent.js';

export const ChallengeLibrary = {
    // HIERARCHY CHALLENGES
    hierarchy_1: new Challenge('hierarchy_1', {
        title: 'First Attention',
        description: 'Adjust this login form so users notice the sign-in button first',
        domain: 'hierarchy',
        difficulty: 2,
        estimatedTime: 3,
        components: [
            new UIComponent('heading', 'heading', {
                x: 100, y: 80, width: 300, height: 40,
                fontSize: 24, fontWeight: 600,
                color: '#121417', backgroundColor: '#F4F2EE',
                content: 'Welcome Back',
                semanticRole: 'normal'
            }),
            new UIComponent('email', 'input', {
                x: 100, y: 150, width: 300, height: 45,
                fontSize: 16, fontWeight: 400,
                color: '#121417', backgroundColor: '#FFFFFF',
                content: 'Email',
                semanticRole: 'normal'
            }),
            new UIComponent('password', 'input', {
                x: 100, y: 210, width: 300, height: 45,
                fontSize: 16, fontWeight: 400,
                color: '#121417', backgroundColor: '#FFFFFF',
                content: 'Password',
                semanticRole: 'normal'
            }),
            new UIComponent('signin', 'button', {
                x: 100, y: 280, width: 140, height: 42,
                fontSize: 16, fontWeight: 500,
                color: '#F4F2EE', backgroundColor: '#4F5D75',
                content: 'Sign In',
                semanticRole: 'primary'
            }),
            new UIComponent('forgot', 'button', {
                x: 260, y: 280, width: 140, height: 42,
                fontSize: 16, fontWeight: 400,
                color: '#4F5D75', backgroundColor: '#F4F2EE',
                content: 'Forgot Password',
                semanticRole: 'secondary'
            })
        ],
        goal: 'Make the Sign In button capture attention first',
        successCriteria: [
            ['hierarchyStrength', '>', 0.5],
            ['firstAttentionCorrect', '==', true]
        ]
    }),

    hierarchy_2: new Challenge('hierarchy_2', {
        title: 'Visual Weight',
        description: 'Create clear visual hierarchy in this pricing card',
        domain: 'hierarchy',
        difficulty: 4,
        estimatedTime: 5,
        components: [
            new UIComponent('plan', 'heading', {
                x: 150, y: 100, width: 200, height: 30,
                fontSize: 18, fontWeight: 500,
                color: '#121417', backgroundColor: '#F4F2EE',
                content: 'Professional',
                semanticRole: 'secondary'
            }),
            new UIComponent('price', 'heading', {
                x: 150, y: 140, width: 200, height: 50,
                fontSize: 32, fontWeight: 700,
                color: '#121417', backgroundColor: '#F4F2EE',
                content: '$49/mo',
                semanticRole: 'primary'
            }),
            new UIComponent('feature1', 'text', {
                x: 150, y: 210, width: 200, height: 25,
                fontSize: 14, fontWeight: 400,
                color: '#121417', backgroundColor: '#F4F2EE',
                content: '✓ Unlimited projects',
                semanticRole: 'normal'
            }),
            new UIComponent('feature2', 'text', {
                x: 150, y: 240, width: 200, height: 25,
                fontSize: 14, fontWeight: 400,
                color: '#121417', backgroundColor: '#F4F2EE',
                content: '✓ Priority support',
                semanticRole: 'normal'
            }),
            new UIComponent('cta', 'button', {
                x: 150, y: 290, width: 200, height: 44,
                fontSize: 16, fontWeight: 600,
                color: '#F4F2EE', backgroundColor: '#4F5D75',
                content: 'Get Started',
                semanticRole: 'primary'
            })
        ],
        goal: 'Ensure price is most prominent, then CTA, then features',
        successCriteria: [
            ['hierarchyStrength', '>', 0.65],
            ['cognitiveLoad', '<', 0.5]
        ]
    }),

    // ACCESSIBILITY CHALLENGES
    accessibility_1: new Challenge('accessibility_1', {
        title: 'Contrast Crisis',
        description: 'Fix the color contrast issues in this alert message',
        domain: 'accessibility',
        difficulty: 3,
        estimatedTime: 4,
        components: [
            new UIComponent('alert', 'text', {
                x: 100, y: 100, width: 400, height: 80,
                fontSize: 16, fontWeight: 400,
                color: '#8B8B8B', backgroundColor: '#D6CFC4',
                content: 'Your session will expire in 5 minutes',
                semanticRole: 'primary'
            }),
            new UIComponent('dismiss', 'button', {
                x: 340, y: 190, width: 80, height: 35,
                fontSize: 14, fontWeight: 500,
                color: '#A0A0A0', backgroundColor: '#C0C0C0',
                content: 'Dismiss',
                semanticRole: 'secondary'
            })
        ],
        goal: 'Achieve WCAG AA contrast compliance (4.5:1 for normal text)',
        successCriteria: [
            ['contrastCompliance', '==', 1]
        ]
    }),

    accessibility_2: new Challenge('accessibility_2', {
        title: 'Touch Target Test',
        description: 'Make these mobile navigation buttons accessible',
        domain: 'accessibility',
        difficulty: 2,
        estimatedTime: 3,
        components: [
            new UIComponent('home', 'button', {
                x: 50, y: 400, width: 35, height: 35,
                fontSize: 14, fontWeight: 400,
                color: '#F4F2EE', backgroundColor: '#4F5D75',
                content: 'Home',
                semanticRole: 'normal'
            }),
            new UIComponent('search', 'button', {
                x: 150, y: 400, width: 35, height: 35,
                fontSize: 14, fontWeight: 400,
                color: '#F4F2EE', backgroundColor: '#4F5D75',
                content: 'Search',
                semanticRole: 'normal'
            }),
            new UIComponent('profile', 'button', {
                x: 250, y: 400, width: 35, height: 35,
                fontSize: 14, fontWeight: 400,
                color: '#F4F2EE', backgroundColor: '#4F5D75',
                content: 'Profile',
                semanticRole: 'normal'
            })
        ],
        goal: 'Meet minimum touch target size of 44×44px',
        successCriteria: [
            ['hitTargetCompliance', '==', 1]
        ]
    }),

    // SPACING CHALLENGES
    spacing_1: new Challenge('spacing_1', {
        title: 'Rhythm & Consistency',
        description: 'Create consistent spacing in this card layout',
        domain: 'spacing',
        difficulty: 5,
        estimatedTime: 6,
        components: [
            new UIComponent('title', 'heading', {
                x: 120, y: 80, width: 260, height: 30,
                fontSize: 20, fontWeight: 600,
                color: '#121417', backgroundColor: '#F4F2EE',
                margin: 15, padding: 12,
                content: 'Article Title',
                semanticRole: 'primary'
            }),
            new UIComponent('meta', 'text', {
                x: 120, y: 120, width: 260, height: 20,
                fontSize: 14, fontWeight: 400,
                color: '#4F5D75', backgroundColor: '#F4F2EE',
                margin: 8, padding: 4,
                content: 'Published 2 days ago',
                semanticRole: 'normal'
            }),
            new UIComponent('body', 'text', {
                x: 120, y: 155, width: 260, height: 60,
                fontSize: 16, fontWeight: 400,
                color: '#121417', backgroundColor: '#F4F2EE',
                margin: 20, padding: 8,
                content: 'This is the article preview text...',
                semanticRole: 'normal'
            }),
            new UIComponent('read', 'button', {
                x: 120, y: 235, width: 120, height: 40,
                fontSize: 15, fontWeight: 500,
                color: '#F4F2EE', backgroundColor: '#4F5D75',
                margin: 12, padding: 10,
                content: 'Read More',
                semanticRole: 'secondary'
            })
        ],
        goal: 'Establish consistent spacing rhythm',
        successCriteria: [
            ['spacingConsistency', '>', 0.7],
            ['visualNoise', '<', 0.4]
        ]
    })
};

export function getAllChallenges() {
    return Object.values(ChallengeLibrary);
}

export function getChallengeById(id) {
    return ChallengeLibrary[id];
}
