// Domain Model: User
export class User {
    constructor(id = 'user_' + Date.now()) {
        this.id = id;
        this.skillProfile = {
            hierarchy: 0,
            accessibility: 0,
            forms: 0,
            spacing: 0
        };
        this.decisionHistory = [];
        this.completedChallenges = [];
        this.currentStreak = 0;
        this.totalTime = 0;
        this.hintUsage = {
            total: 0,
            byChallenge: {}
        };
    }

    updateSkill(domain, delta) {
        this.skillProfile[domain] = Math.max(0, Math.min(100, this.skillProfile[domain] + delta));
    }

    recordDecision(decision) {
        this.decisionHistory.push(decision);
    }

    completeChallenge(challengeId, performance) {
        this.completedChallenges.push({
            id: challengeId,
            timestamp: Date.now(),
            performance
        });
    }

    getWeakestSkill() {
        return Object.entries(this.skillProfile)
            .sort((a, b) => a[1] - b[1])[0][0];
    }

    getStrongestSkill() {
        return Object.entries(this.skillProfile)
            .sort((a, b) => b[1] - a[1])[0][0];
    }

    serialize() {
        return JSON.stringify(this);
    }

    static deserialize(data) {
        const parsed = JSON.parse(data);
        const user = new User(parsed.id);
        Object.assign(user, parsed);
        return user;
    }
}
