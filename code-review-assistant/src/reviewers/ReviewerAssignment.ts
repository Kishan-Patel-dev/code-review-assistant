export class ReviewerAssignment {
    private reviewerScores = {
        "user1": 10,
        "user2": 8,
        "user3": 5,
    };

    public assignReviewer(): string {
        const sortedReviewers = Object.entries(this.reviewerScores).sort(
            (a, b) => b[1] - a[1]
        );
        return sortedReviewers[0][0]; // Return the highest-scoring reviewer
    }
}
