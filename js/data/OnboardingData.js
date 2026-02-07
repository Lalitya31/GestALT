// Sample Onboarding Data based on roadmap.sh UI/UX principles

export const OnboardingData = {
    scenarios: [
        {
            id: 'login_form',
            category: 'Form Design',
            question: 'Which login form follows best practices?',
            options: [
                {
                    id: 1,
                    correct: false,
                    preview: {
                        html: `
                            <div style="padding: 1rem; background: white;">
                                <input type="text" placeholder="email" style="width:100%;padding:5px;margin-bottom:5px;">
                                <input type="password" placeholder="password" style="width:100%;padding:5px;">
                                <button style="padding:5px;margin-top:5px;">login</button>
                            </div>
                        `
                    },
                    issues: ['Poor contrast', 'Small touch targets', 'No proper labels', 'Lowercase labels']
                },
                {
                    id: 2,
                    correct: false,
                    preview: {
                        html: `
                            <div style="padding: 1rem; background: white;">
                                <div style="font-size:10px;color:#999;">Email</div>
                                <input type="text" style="width:100%;padding:3px;border:1px solid #ddd;">
                                <div style="font-size:10px;color:#999;margin-top:5px;">Password</div>
                                <input type="password" style="width:100%;padding:3px;border:1px solid #ddd;">
                                <button style="padding:3px;font-size:10px;margin-top:5px;background:#ccc;">Submit</button>
                            </div>
                        `
                    },
                    issues: ['Text too small', 'Touch targets too small', 'Poor contrast']
                },
                {
                    id: 3,
                    correct: true,
                    preview: {
                        html: `
                            <div style="padding: 1.5rem; background: white;">
                                <label style="display:block;margin-bottom:0.5rem;font-weight:600;font-size:14px;">Email</label>
                                <input type="email" style="width:100%;padding:0.75rem;border:2px solid #ccc;border-radius:6px;font-size:1rem;">
                                <label style="display:block;margin:1rem 0 0.5rem;font-weight:600;font-size:14px;">Password</label>
                                <input type="password" style="width:100%;padding:0.75rem;border:2px solid #ccc;border-radius:6px;font-size:1rem;">
                                <button style="margin-top:1rem;width:100%;padding:0.875rem;background:#6366F1;color:white;border:none;border-radius:6px;font-size:1rem;font-weight:600;cursor:pointer;">Sign In</button>
                            </div>
                        `
                    },
                    principle: 'Fitts\' Law & WCAG Accessibility',
                    explanation: 'This form has adequate touch targets (minimum 44x44px), proper labels for screen readers, good color contrast (4.5:1 ratio), and clear visual hierarchy. The spacing reduces cognitive load and errors.'
                },
                {
                    id: 4,
                    correct: false,
                    preview: {
                        html: `
                            <div style="padding: 1rem; background: white; text-align:center;">
                                <input type="text" placeholder="email/username/phone" style="width:80%;padding:0.5rem;">
                                <br>
                                <input type="password" style="width:80%;padding:0.5rem;margin-top:0.5rem;">
                                <br>
                                <button style="margin-top:0.5rem;padding:0.5rem;background:gray;color:white;">GO</button>
                            </div>
                        `
                    },
                    issues: ['Ambiguous placeholder', 'Poor button label', 'Inconsistent widths', 'No proper labels']
                }
            ],
            reasons: [
                { text: 'It has larger clickable areas for easier interaction', correct: true },
                { text: 'It looks modern and trendy', correct: false },
                { text: 'It uses proper labels and good contrast', correct: true },
                { text: 'It has fancy animations', correct: false },
                { text: 'The spacing reduces cognitive load', correct: true }
            ]
        },
        {
            id: 'button_hierarchy',
            category: 'Visual Hierarchy',
            question: 'Which button layout shows proper visual hierarchy?',
            options: [
                {
                    id: 1,
                    correct: false,
                    preview: {
                        html: `
                            <div style="padding: 1rem; background: white; display:flex; gap:0.5rem;">
                                <button style="padding:0.5rem 1rem;background:blue;color:white;border:none;">Cancel</button>
                                <button style="padding:0.5rem 1rem;background:blue;color:white;border:none;">Delete</button>
                                <button style="padding:0.5rem 1rem;background:blue;color:white;border:none;">Save</button>
                            </div>
                        `
                    },
                    issues: ['All buttons have same visual weight', 'Destructive action not differentiated']
                },
                {
                    id: 2,
                    correct: true,
                    preview: {
                        html: `
                            <div style="padding: 1rem; background: white; display:flex; gap:0.5rem; justify-content:flex-end;">
                                <button style="padding:0.75rem 1.25rem;background:transparent;color:#666;border:1px solid #ccc;border-radius:6px;">Cancel</button>
                                <button style="padding:0.75rem 1.25rem;background:#EF4444;color:white;border:none;border-radius:6px;">Delete</button>
                                <button style="padding:0.75rem 1.25rem;background:#6366F1;color:white;border:none;border-radius:6px;font-weight:600;">Save Changes</button>
                            </div>
                        `
                    },
                    principle: 'Visual Hierarchy & Color Psychology',
                    explanation: 'Primary action (Save) has the most visual weight, destructive action (Delete) uses warning color, and secondary action (Cancel) is visually de-emphasized. This guides user attention and prevents errors.'
                },
                {
                    id: 3,
                    correct: false,
                    preview: {
                        html: `
                            <div style="padding: 1rem; background: white;">
                                <button style="padding:0.5rem;width:100%;background:#6366F1;color:white;border:none;margin-bottom:0.5rem;">Save</button>
                                <button style="padding:0.5rem;width:100%;background:#6366F1;color:white;border:none;margin-bottom:0.5rem;">Delete</button>
                                <button style="padding:0.5rem;width:100%;background:#6366F1;color:white;border:none;">Cancel</button>
                            </div>
                        `
                    },
                    issues: ['No hierarchy', 'Stacked layout unusual for actions', 'Equal emphasis on all actions']
                }
            ],
            reasons: [
                { text: 'The primary action is most prominent', correct: true },
                { text: 'It uses different colors for different action types', correct: true },
                { text: 'All buttons are the same size', correct: false },
                { text: 'Destructive actions are clearly marked', correct: true }
            ]
        }
    ]
};
