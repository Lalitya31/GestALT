// Challenge Data - Based on roadmap.sh UI/UX Frontend Development path

export const ChallengeData = {
    challenges: [
        {
            id: 'ch_001',
            title: 'Fix the Registration Form',
            category: 'Form Design',
            difficulty: 'Beginner',
            estimatedTime: '5-8 minutes',
            description: 'This registration form has multiple UI/UX issues. Fix them using the toolbox.',
            
            initialState: {
                elements: [
                    {
                        id: 'label_name',
                        type: 'label',
                        html: '<div class="ui-element" data-element-id="label_name" style="font-size:11px;color:#999;margin-bottom:2px;">name</div>',
                        issues: ['font-too-small', 'poor-contrast', 'no-capitalization'],
                        correct: {
                            fontSize: '14px',
                            color: '#374151',
                            text: 'Name:'
                        }
                    },
                    {
                        id: 'input_name',
                        type: 'input',
                        html: '<input class="ui-element" data-element-id="input_name" type="text" style="width:100%;padding:4px;font-size:13px;border:1px solid #ddd;margin-bottom:8px;">',
                        issues: ['padding-too-small', 'font-too-small'],
                        correct: {
                            padding: '12px',
                            fontSize: '16px',
                            border: '2px solid #D1D5DB'
                        }
                    },
                    {
                        id: 'label_email',
                        type: 'label',
                        html: '<div class="ui-element" data-element-id="label_email" style="font-size:11px;color:#999;margin-bottom:2px;">email address</div>',
                        issues: ['font-too-small', 'poor-contrast', 'no-capitalization'],
                        correct: {
                            fontSize: '14px',
                            color: '#374151',
                            text: 'Email Address:'
                        }
                    },
                    {
                        id: 'input_email',
                        type: 'input',
                        html: '<input class="ui-element" data-element-id="input_email" type="email" style="width:100%;padding:4px;font-size:13px;border:1px solid #ddd;margin-bottom:8px;">',
                        issues: ['padding-too-small', 'font-too-small'],
                        correct: {
                            padding: '12px',
                            fontSize: '16px',
                            border: '2px solid #D1D5DB'
                        }
                    },
                    {
                        id: 'button_submit',
                        type: 'button',
                        html: '<button class="ui-element" data-element-id="button_submit" style="padding:6px 12px;background:#999;color:#fff;border:none;font-size:12px;cursor:pointer;">submit</button>',
                        issues: ['padding-too-small', 'poor-color', 'font-too-small', 'poor-label'],
                        correct: {
                            padding: '14px 28px',
                            background: '#6366F1',
                            fontSize: '16px',
                            text: 'Create Account'
                        }
                    }
                ]
            },
            
            successCriteria: {
                minScore: 70,
                required: [
                    'All labels properly capitalized',
                    'Input fields have adequate padding (12px+)',
                    'Button is prominent and clearly labeled',
                    'Font sizes are readable (14px+)'
                ]
            },
            
            theories: [
                {
                    name: 'WCAG 2.1 - Touch Targets',
                    description: 'Interactive elements should be at least 44x44 pixels to accommodate different users and prevent errors.',
                    reference: 'https://www.w3.org/WAI/WCAG21/Understanding/target-size.html'
                },
                {
                    name: 'Fitts\' Law',
                    description: 'The time to acquire a target is a function of the distance to and size of the target. Larger buttons are easier to click.',
                    reference: 'https://lawsofux.com/fittss-law/'
                },
                {
                    name: 'Visual Hierarchy',
                    description: 'Proper capitalization, sizing, and contrast create clear visual hierarchy that guides user attention.',
                    reference: 'https://www.nngroup.com/articles/visual-hierarchy-ux-definition/'
                }
            ],
            
            hints: [
                'Start with the button - make it stand out as the primary action',
                'Labels should be capitalized and have proper punctuation',
                'Input fields need larger padding and better borders for accessibility'
            ]
        },
        
        {
            id: 'ch_002',
            title: 'Improve Card Layout Spacing',
            category: 'Layout & Spacing',
            difficulty: 'Intermediate',
            estimatedTime: '8-10 minutes',
            description: 'This card layout feels cramped. Improve the spacing and hierarchy.',
            
            initialState: {
                elements: [
                    {
                        id: 'card_title',
                        type: 'heading',
                        html: '<h3 class="ui-element" data-element-id="card_title" style="font-size:16px;margin:0;margin-bottom:4px;">Product Name</h3>',
                        issues: ['insufficient-margin', 'font-too-small'],
                        correct: {
                            fontSize: '20px',
                            marginBottom: '12px'
                        }
                    },
                    {
                        id: 'card_price',
                        type: 'text',
                        html: '<p class="ui-element" data-element-id="card_price" style="font-size:18px;margin:0;margin-bottom:4px;font-weight:700;">$99</p>',
                        issues: ['insufficient-spacing'],
                        correct: {
                            marginBottom: '16px'
                        }
                    },
                    {
                        id: 'card_description',
                        type: 'text',
                        html: '<p class="ui-element" data-element-id="card_description" style="font-size:13px;margin:0;line-height:1.2;margin-bottom:6px;">This is a brief description of the product that explains its features.</p>',
                        issues: ['font-too-small', 'line-height-too-tight'],
                        correct: {
                            fontSize: '15px',
                            lineHeight: '1.6',
                            marginBottom: '20px'
                        }
                    },
                    {
                        id: 'card_button',
                        type: 'button',
                        html: '<button class="ui-element" data-element-id="card_button" style="padding:8px 12px;background:#6366F1;color:#fff;border:none;width:100%;font-size:13px;">Add to Cart</button>',
                        issues: ['padding-insufficient'],
                        correct: {
                            padding: '12px 24px',
                            fontSize: '15px'
                        }
                    }
                ]
            },
            
            successCriteria: {
                minScore: 70,
                required: [
                    'Adequate spacing between elements',
                    'Readable font sizes throughout',
                    'Proper line-height for text content',
                    'Button has sufficient padding'
                ]
            },
            
            theories: [
                {
                    name: 'Law of Proximity (Gestalt)',
                    description: 'Objects near each other are perceived as related. Proper spacing creates visual groupings and hierarchy.',
                    reference: 'https://lawsofux.com/law-of-proximity/'
                },
                {
                    name: 'White Space',
                    description: 'White space (negative space) improves readability and draws attention to important elements.',
                    reference: 'https://www.nngroup.com/articles/whitespace-principles-ux-design/'
                }
            ],
            
            hints: [
                'Increase spacing between distinct groups of information',
                'Improve line-height for better readability',
                'Give the button more breathing room with padding'
            ]
        },
        
        {
            id: 'ch_003',
            title: 'Fix Color Contrast Issues',
            category: 'Accessibility',
            difficulty: 'Intermediate',
            estimatedTime: '6-8 minutes',
            description: 'This interface has poor color contrast. Fix it to meet WCAG AA standards.',
            
            initialState: {
                elements: [
                    {
                        id: 'heading',
                        type: 'heading',
                        html: '<h2 class="ui-element" data-element-id="heading" style="color:#999;font-size:24px;margin-bottom:16px;">Important Notice</h2>',
                        issues: ['poor-contrast'],
                        correct: {
                            color: '#1F2937'  // 4.5:1 contrast ratio
                        }
                    },
                    {
                        id: 'body_text',
                        type: 'text',
                        html: '<p class="ui-element" data-element-id="body_text" style="color:#AAA;font-size:14px;line-height:1.6;">This is some important information that users need to read carefully.</p>',
                        issues: ['poor-contrast', 'font-too-small'],
                        correct: {
                            color: '#374151',
                            fontSize: '16px'
                        }
                    },
                    {
                        id: 'link',
                        type: 'link',
                        html: '<a href="#" class="ui-element" data-element-id="link" style="color:#B8B8FF;text-decoration:none;">Learn More</a>',
                        issues: ['poor-contrast', 'no-underline'],
                        correct: {
                            color: '#4F46E5',
                            textDecoration: 'underline'
                        }
                    }
                ]
            },
            
            successCriteria: {
                minScore: 80,
                required: [
                    'All text meets WCAG AA contrast ratio (4.5:1)',
                    'Links are clearly identifiable',
                    'Text is readable at specified sizes'
                ]
            },
            
            theories: [
                {
                    name: 'WCAG 2.1 - Contrast (Minimum)',
                    description: 'Text must have a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.',
                    reference: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html'
                },
                {
                    name: 'Color Accessibility',
                    description: 'Color should not be the only means of conveying information. Use text, icons, or patterns as well.',
                    reference: 'https://www.nngroup.com/articles/color-accessibility/'
                }
            ],
            
            hints: [
                'Check contrast ratios - text should be much darker',
                'Links need to be distinguishable from regular text',
                'Consider users with visual impairments'
            ]
        }
    ],
    
    // Get challenge by difficulty
    getChallengesByDifficulty(difficulty) {
        return this.challenges.filter(ch => ch.difficulty === difficulty);
    },
    
    // Get challenge by category
    getChallengesByCategory(category) {
        return this.challenges.filter(ch => ch.category === category);
    },
    
    // Get random challenge
    getRandomChallenge() {
        return this.challenges[Math.floor(Math.random() * this.challenges.length)];
    },
    
    // Get next recommended challenge based on user progress
    getRecommendedChallenge(userProgress) {
        // Simple logic: recommend based on weakest stat
        const weakestStat = Object.entries(userProgress.stats)
            .sort((a, b) => a[1] - b[1])[0];
        
        const categoryMap = {
            'hierarchy': 'Layout & Spacing',
            'accessibility': 'Accessibility',
            'decisionSpeed': 'Form Design',
            'cognitiveLoad': 'Visual Hierarchy'
        };
        
        const recommendedCategory = categoryMap[weakestStat[0]] || 'Form Design';
        const categoryالlenges = this.getChallengesByCategory(recommendedCategory);
        
        return categoryالlenges[0] || this.challenges[0];
    }
};
