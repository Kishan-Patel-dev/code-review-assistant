interface ReviewerMetrics {
    expertise: number; // 0 to 100
    prActivity: number; // 0 to 100
    quality: number; // 0 to 100
    responseTime: number; // Average response time in hours
    activeReviews: number; // Number of active reviews
}

export class ReviewerEngine {
    private maxActiveReviews = 5; // Maximum active reviews allowed per reviewer

    constructor(private readonly scoringWeights = { expertise: 0.3, prActivity: 0.3, quality: 0.2, responseTime: 0.2 }) {}

    // Calculate the score for a reviewer based on weighted metrics
    public calculateScore(metrics: ReviewerMetrics): number {
        const { expertise, prActivity, quality, responseTime } = this.scoringWeights;

        // Exponential decay for response time
        const responseTimeScore = 10 * Math.exp(-0.1 * metrics.responseTime);

        // Weighted scoring formula
        const baseScore =
            expertise * metrics.expertise +
            prActivity * metrics.prActivity +
            quality * metrics.quality +
            responseTime * responseTimeScore;

        // Penalize reviewers with too many active reviews
        return metrics.activeReviews < this.maxActiveReviews ? baseScore : 0;
    }

    // Assign the best reviewer based on calculated scores
    public assignReviewer(
        reviewers: { id: string; metrics: ReviewerMetrics }[],
        fallbackReviewers: string[]
    ): string | null {
        const scoredReviewers = reviewers.map((r) => ({
            id: r.id,
            score: this.calculateScore(r.metrics),
        }));

        // Sort reviewers by score in descending order
        scoredReviewers.sort((a, b) => b.score - a.score);

        // Select the top reviewer with a valid score
        const topReviewer = scoredReviewers.find((r) => r.score > 0);

        if (topReviewer) {
            return topReviewer.id;
        }

        // Fallback to a predefined list of reviewers if no suitable candidate is found
        console.log("No suitable reviewer found. Falling back to predefined reviewers.");
        return fallbackReviewers.length > 0 ? fallbackReviewers[0] : null;
    }
}

// Factory pattern to allow swapping or extending scoring strategies
export class ReviewerScoringFactory {
    public static getStrategy(strategy: string): ReviewerEngine {
        if (strategy === "expertise") {
            return new ReviewerEngine();
        }
        throw new Error(`Scoring strategy "${strategy}" not implemented.`);
    }
}
