import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { notifyMessage } from "../helpers/NotifyMessage";
import { ReminderScheduler } from "../reminders/ReminderScheduler";
import { AppSettingsEnum } from "../settings/settings";
import { LLMSummaryModule } from "../summary/LLMSummaryModule"; // Standardized name

export class CodeReviewAssistantCommand implements ISlashCommand {
    public command = "cr";
    public i18nParamsExample = "";
    public i18nDescription = "";
    public providesPreview = false;

    constructor(public readonly app: App) {}

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<void> {
        const user: IUser = context.getSender();
        const room: IRoom = context.getRoom();
        const threadId = context.getThreadId();
        const args = context.getArguments();
        const action = args[0];

        switch (action) {
            case "hello":
                await notifyMessage(
                    room,
                    read,
                    user,
                    "Hi, your Rocket.Chat app is working!"
                );
                break;

            case "help":
                const helpMessage = `
Available commands:
/cr help             → List available commands
/cr assign           → Force assign reviewers to open PR
/cr summary <PR>     → Generate review summary (mock)
/cr review-status <PR> → View review status for a given pull request
/cr review-config    → View current configuration settings (admin-only)
                `;
                await notifyMessage(room, read, user, helpMessage);
                break;

            case "summary":
                const prUrl = args[1];
                if (!prUrl) {
                    await notifyMessage(room, read, user, "Please provide a PR URL.", threadId);
                    return;
                }

                const llmSummaryModule = new LLMSummaryModule(read);
                const summary = await llmSummaryModule.getSummary({
                    title: "Example PR Title",
                    description: "Example PR Description",
                    filesChanged: 5,
                    diffStats: "N/A",
                });

                await notifyMessage(room, read, user, summary, threadId);
                break;

            case "review-status":
                const prId = args[1];
                if (!prId) {
                    await notifyMessage(room, read, user, "Please provide a PR ID.", threadId);
                    return;
                }

                // Simulate fetching review status
                const reminderKey = `reminder_${user.username}_${prId}`;
                const reminderData = await persis.readById(reminderKey);

                const reviewStatus = reminderData
                    ? `Status for PR ${prId}: Assigned Reviewer - [ReviewerName]. Last reminder sent at ${new Date(
                          reminderData.timestamp
                      ).toLocaleString()}.`
                    : `Status for PR ${prId}: No reminders sent yet.`;

                await notifyMessage(room, read, user, reviewStatus, threadId);
                break;

            case "review-config":
                // Check if the user is an admin
                const isAdmin = await read.getUserReader().isUserAdmin(user);
                if (!isAdmin) {
                    await notifyMessage(
                        room,
                        read,
                        user,
                        "You do not have permission to view or modify configuration settings.",
                        threadId
                    );
                    return;
                }

                const reminderInterval = await read
                    .getEnvironmentReader()
                    .getSettings()
                    .getValueById(AppSettingsEnum.REVIEWER_REMINDER_INTERVAL_ID);
                const llmEnabled = await read
                    .getEnvironmentReader()
                    .getSettings()
                    .getValueById(AppSettingsEnum.LLM_REVIEW_SUMMARY_ENABLED_ID);

                const configMessage = `
Current Configuration:
- Reminder Interval: ${reminderInterval} hours
- LLM Review Summary Enabled: ${llmEnabled ? "Yes" : "No"}
                `;
                await notifyMessage(room, read, user, configMessage, threadId);
                break;

            default:
                await notifyMessage(room, read, user, "Unknown command. Use `/cr help` for a list of commands.", threadId);
                break;
        }
    }
}
