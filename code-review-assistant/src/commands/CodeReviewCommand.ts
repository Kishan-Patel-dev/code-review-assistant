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
import { notifyMessage } from "../helpers/NotifyMessage";
import { RocketChatAssociationRecord, RocketChatAssociationModel } from "@rocket.chat/apps-engine/definition/metadata";import { App } from "@rocket.chat/apps-engine/definition/App";
import { AppSettingsEnum } from "../settings/settings";
import { CodeReviewAssistantApp } from "../../CodeReviewAssistantApp";

export class CodeReviewCommand implements ISlashCommand {
    public command = "cr";
    public i18nParamsExample = "";
    public i18nDescription = "Code review assistant slash command";
    public providesPreview = false;

    constructor(public readonly app: App) {}

    public getHelpText(): string {
        return `
Available commands:
/cr help                 → List available commands
/cr assign               → Force assign reviewers to open PR
/cr summary <PR_URL>     → Generate review summary
/cr review-status <PRID> → View review reminder status
/cr review-config        → View current config settings (admin only)
/cr initialize           → Manually initialize dependencies
        `;
    }

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ): Promise<void> {
        const user: IUser = context.getSender();
        const room: IRoom = context.getRoom();
        const threadId = context.getThreadId();
        const args = context.getArguments();
        const action = args[0]?.toLowerCase();

        if (!action || action === "help") {
            await notifyMessage(room, read, user, this.getHelpText(), threadId);
            return;
        }

        try {
            switch (action) {
                case "summary": {
                    const prUrl = args[1];
                    if (!prUrl) {
                        await notifyMessage(room, read, user, "Please provide a PR URL.", threadId);
                        return;
                    }

                    const app = this.app as CodeReviewAssistantApp;
                    const llmModule = app.getLLMSummaryModule();

                    const summary = await llmModule.getSummary({
                        title: "Example PR Title",
                        description: "Example PR Description",
                        filesChanged: 5,
                        diffStats: "N/A",
                    });

                    await notifyMessage(room, read, user, summary, threadId);
                    break;
                }

                case "review-status": {
                    const prId = args[1];
                    if (!prId) {
                        await notifyMessage(room, read, user, "Please provide a PR ID.", threadId);
                        return;
                    }

                    const key = `reminder_${user.username}_${prId}`;
                    const assoc = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, key);
                    const reminderData = await read.getPersistenceReader().readByAssociation(assoc);

                    const reviewStatus = reminderData.length > 0
                        ? `Status for PR ${prId}: Reviewer assigned. Last reminder sent at ${new Date(
                              (reminderData[0] as { timestamp: number }).timestamp
                          ).toLocaleString()}`
                        : `Status for PR ${prId}: No reminders yet.`;

                    await notifyMessage(room, read, user, reviewStatus, threadId);
                    break;
                }

                case "review-config": {
                    const isAdmin = user.roles?.includes("admin");
                    if (!isAdmin) {
                        await notifyMessage(room, read, user, "You do not have permission to view this.", threadId);
                        return;
                    }

                    const settingsReader = read.getEnvironmentReader().getSettings();
                    const interval = await settingsReader.getValueById(AppSettingsEnum.REVIEWER_REMINDER_INTERVAL_ID);
                    const llmEnabled = await settingsReader.getValueById(AppSettingsEnum.LLM_REVIEW_SUMMARY_ENABLED_ID);

                    const configText = `
🔧 Current Config:
- Reminder Interval: ${interval} hour(s)
- LLM Summary Enabled: ${llmEnabled ? "Yes" : "No"}
                    `;
                    await notifyMessage(room, read, user, configText, threadId);
                    break;
                }

                case "initialize": {
                    const app = this.app as CodeReviewAssistantApp;
                    app.initializeModules(read);
                    await notifyMessage(room, read, user, "✅ Dependencies initialized.", threadId);
                    break;
                }

                default:
                    await notifyMessage(room, read, user, "❓ Unknown command. Use `/cr help` for options.", threadId);
                    break;
            }
        } catch (error) {
            await notifyMessage(room, read, user, `❌ Error: ${error.message}`, threadId);
        }
    }
}
