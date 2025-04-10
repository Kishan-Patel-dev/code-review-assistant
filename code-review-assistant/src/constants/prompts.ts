const PR_SUMMARY_PROMPT = `
You are an expert software reviewer assistant.

Summarize the following pull request description and diff context in 2-4 short and precise sentences.

Your summary must include:
- The **intent** (What the PR aims to do)
- The **impact** (What parts of the codebase or product it affects)
- The **scope** (How big or risky the change is, like refactors, new features, bug fixes, etc.)

Keep the language simple and concise, as if you're explaining to a busy senior engineer scanning many PRs.

Pull Request Content: ###
{pull_request_text}
###

Summary:
`;

export function createPRSummaryPrompt(pullRequestText: string): string {
	return PR_SUMMARY_PROMPT.replace("{pull_request_text}", pullRequestText || "No description provided.");
}
