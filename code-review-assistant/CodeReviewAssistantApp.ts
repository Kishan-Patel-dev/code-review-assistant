import {
    IAppAccessors,
    ILogger,
    IConfigurationExtend,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { CodeReviewAssistantCommand } from "./src/commands/CodeReviewCommand";
import { settings } from "./src/settings/settings";
import { GitHubWebhookHandler } from "./src/webhooks/GitHubWebhookHandler";
import { ReviewerReminder } from "./src/reminders/ReviewerReminder";

export class CodeReviewAssistantApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }
    protected async extendConfiguration(
        configuration: IConfigurationExtend
    ): Promise<void> {
        configuration.slashCommands.provideSlashCommand(
            new CodeReviewAssistantCommand(this)
        );
        await Promise.all([
            ...settings.map((setting) =>
                configuration.settings.provideSetting(setting)
            ),
        ]);

        // Register webhook endpoint
        configuration.http.provideApi({
            path: "github-webhook",
            post: async (request, response) => {
                const handler = new GitHubWebhookHandler(
                    this.getAccessors().reader,
                    this.getAccessors().modifier,
                    this.getAccessors().http
                );
                await handler.handleWebhook(request.content, request.headers, request.room, request.user);
                response.setStatusCode(200).end();
            },
        });

        // Schedule periodic reminders
        const reminder = new ReviewerReminder(
            this.getAccessors().reader,
            this.getAccessors().modifier
        );
        setInterval(async () => {
            // Example: Fetch PRs and send reminders
            await reminder.sendReminder(/* room */, /* user */, /* prUrl */);
        }, 3600000); // 1 hour interval
    }
}
