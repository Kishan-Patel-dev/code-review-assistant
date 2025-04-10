import { IHttp, IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { ReviewerScoringFactory } from "../reviewers/ReviewerEngine";

export class ReviewerAssignment {
    constructor(
        private readonly read: IRead,
        private readonly modify: IModify,
        private readonly http: IHttp
    ) {}

    public async assign(
        repo: string,
        prNumber: number,
        author: string
    ): Promise<void> {
        console.log(`Assigning reviewers for PR #${prNumber} in repo ${repo}, author: ${author}`);

        // Mock data for reviewers
        const reviewers = [
            { id: "reviewer1", metrics: { expertise: 80, prActivity: 70, quality: 90, responseTime: 5, activeReviews: 2 } },
            { id: "reviewer2", metrics: { expertise: 60, prActivity: 85, quality: 75, responseTime: 3, activeReviews: 4 } },
            { id: "reviewer3", metrics: { expertise: 90, prActivity: 60, quality: 80, responseTime: 8, activeReviews: 1 } },
        ];

        // Select scoring strategy (e.g., expertise)
        const scoringStrategy = await this.read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("reviewer_scoring_method");

        const reviewerEngine = ReviewerScoringFactory.getStrategy(scoringStrategy || "expertise");

        // Calculate the best reviewer
        const bestReviewer = reviewerEngine.assignReviewer(reviewers);

        if (bestReviewer) {
            console.log(`Best reviewer selected: ${bestReviewer}`);
            // Simulate assigning the reviewer (e.g., call GitHub API)
            await this.http.post(`https://api.github.com/repos/${repo}/pulls/${prNumber}/requested_reviewers`, {
                headers: {
                    Authorization: `Bearer <your-github-token>`,
                    Accept: "application/vnd.github.v3+json",
                },
                data: {
                    reviewers: [bestReviewer],
                },
            });
        } else {
            console.log("No suitable reviewer found.");
        }
    }
}
