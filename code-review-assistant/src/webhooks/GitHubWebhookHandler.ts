import { IHttp, IRead, IModify, ILogger } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { validateGitHubSignature } from "../helpers/GitHubUtils";
import { notifyMessage } from "../helpers/NotifyMessage";
import { ReviewerAssignment } from "../services/ReviewerAssignment";
import { ReminderScheduler } from "../reminders/ReminderScheduler";
import { LLMSummaryModule } from "../summary/LLMSummaryModule"; // Standardized name

export class GitHubWebhookHandler {
    constructor(
        private readonly read: IRead,
        private readonly modify: IModify,
        private readonly http: IHttp,
        private readonly logger: ILogger
    ) {}

    /**
     * Handles incoming GitHub webhook events.
     * Validates the webhook signature and processes the event based on its type.
     * 
     * @param payload - The webhook payload sent by GitHub.
     * @param headers - The headers of the webhook request.
     * @param room - The Rocket.Chat room where the event is processed.
     * @param user - The Rocket.Chat user who triggered the event.
     */
    public async handleWebhook(payload: any, headers: any, room: IRoom, user: IUser): Promise<void> {
        const signature = headers["x-hub-signature-256"];
        const rawPayload = JSON.stringify(payload);

        try {
            if (!validateGitHubSignature(rawPayload, signature, this.read)) {
                await notifyMessage(room, this.read, user, "Invalid webhook signature.");
                this.logger.error("[ReviewAssistant] Invalid webhook signature.");
                throw new Error("Invalid webhook signature.");
            }

            const eventType = headers["x-github-event"];
            const action = payload.action;

            this.logger.info(`[ReviewAssistant] Webhook Received: Event: ${eventType}, Action: ${action}`);

            if (eventType === "pull_request") {
                await this.handlePullRequestEvent(payload, room, user);
            } else if (eventType === "pull_request_review") {
                await this.handlePullRequestReviewEvent(payload, room, user);
            } else {
                this.logger.warn(`[ReviewAssistant] Unhandled Event: ${eventType}`);
            }
        } catch (error) {
            this.logger.error(`[ReviewAssistant] Webhook Error: ${error.message}`, error);
            await notifyMessage(room, this.read, user, "An error occurred while processing the webhook.");
        }
    }

    /**
     * Processes pull request events (e.g., opened, reopened, review requested).
     * 
     * @param payload - The webhook payload for the pull request event.
     * @param room - The Rocket.Chat room where the event is processed.
     * @param user - The Rocket.Chat user who triggered the event.
     */
    private async handlePullRequestEvent(payload: any, room: IRoom, user: IUser): Promise<void> {
        // Extracted logic for pull_request events
        const action = payload.action;
        const prTitle = payload.pull_request.title;
        const prUrl = payload.pull_request.html_url;
        const repo = payload.repository.full_name;
        const prNumber = payload.pull_request.number;
        const author = payload.pull_request.user.login;

        this.logger.info(`[ReviewAssistant] Pull Request Event: Action: ${action}, PR: ${prTitle}, Repo: ${repo}`);

        if (action === "opened" || action === "reopened") {
            await notifyMessage(
                room,
                this.read,
                user,
                `New PR ${action === "opened" ? "Opened" : "Reopened"}\nTitle: ${prTitle}\nURL: ${prUrl}`
            );
            await ReviewerAssignment.assign(repo, prNumber, author, this.read, this.modify, this.http);

            const reminderScheduler = new ReminderScheduler(this.read, this.modify, this.http, this.logger);
            await reminderScheduler.scheduleReminder(author, prUrl, room, user);
        } else if (action === "review_requested") {
            await notifyMessage(
                room,
                this.read,
                user,
                `Review requested for PR: ${prTitle}\nURL: ${prUrl}`
            );
        }

        const llmSummaryModule = new LLMSummaryModule(this.read);
        const summary = await llmSummaryModule.getSummary({
            title: prTitle,
            description: payload.pull_request.body || "",
            filesChanged: payload.pull_request.changed_files || 0,
            diffStats: "N/A",
        });
        this.logger.info(`[ReviewAssistant] Summary Generated: ${summary}`);
    }

    /**
     * Processes pull request review events (e.g., review submitted).
     * 
     * @param payload - The webhook payload for the pull request review event.
     * @param room - The Rocket.Chat room where the event is processed.
     * @param user - The Rocket.Chat user who triggered the event.
     */
    private async handlePullRequestReviewEvent(payload: any, room: IRoom, user: IUser): Promise<void> {
        // Extracted logic for pull_request_review events
        const action = payload.action;
        const prTitle = payload.pull_request.title;
        const prUrl = payload.pull_request.html_url;

        this.logger.info(`[ReviewAssistant] Pull Request Review Event: Action: ${action}, PR: ${prTitle}`);

        if (action === "submitted") {
            await notifyMessage(
                room,
                this.read,
                user,
                `Review submitted for PR: ${prTitle}\nURL: ${prUrl}`
            );

            const reminderScheduler = new ReminderScheduler(this.read, this.modify, this.http, this.logger);
            await reminderScheduler.cancelReminder(payload.pull_request.user.login, prUrl);

            const llmSummaryModule = new LLMSummaryModule(this.read);
            const summary = await llmSummaryModule.getSummary({
                title: prTitle,
                description: payload.pull_request.body || "",
                filesChanged: payload.pull_request.changed_files || 0,
                diffStats: "N/A",
            });
            this.logger.info(`[ReviewAssistant] Summary Generated: ${summary}`);
        }
    }
}
