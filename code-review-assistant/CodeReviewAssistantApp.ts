import {
    IAppAccessors,
    ILogger,
    IConfigurationExtend,
    IConfigurationModify,
    IHttp,
    IRead,
    IEnvironmentRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";

import { CodeReviewAssistantCommand } from "./src/commands/CodeReviewCommand";
import { settings, AppSettingsEnum } from "./src/settings/settings";
import { GitHubWebhookHandler } from "./src/webhooks/GitHubWebhookHandler";
import { ReviewerAssignment } from "./src/services/ReviewerAssignment";
import { ReminderScheduler } from "./src/reminders/ReminderScheduler";
import { Authentication } from "./src/authentication/authentication";
import { LLMSummaryModule } from "./src/summary/LLMSummaryModule";

export class CodeReviewAssistantApp extends App {
    private webhookHandler: GitHubWebhookHandler;
    private reviewerAssignment: ReviewerAssignment;
    private reminderScheduler: ReminderScheduler;
    private authentication: Authentication;
    private llmSummaryModule: LLMSummaryModule;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        const reader: IRead = accessors.reader;
        const http: IHttp = accessors.http;
        const placeholderModify = undefined as any;
        const placeholderPersistence = undefined as any;

        this.webhookHandler = new GitHubWebhookHandler(reader, placeholderModify, http, logger, placeholderPersistence);
        this.reviewerAssignment = new ReviewerAssignment(reader, placeholderModify, http);
        this.reminderScheduler = new ReminderScheduler(reader, placeholderModify, placeholderPersistence, logger);
        this.authentication = new Authentication(this);
        this.llmSummaryModule = new LLMSummaryModule(reader, ""); // Pass LLM API
    }

    protected async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        const validatedSettings = settings.filter((setting) => setting.required);
        for (const setting of validatedSettings) {
            await configuration.settings.provideSetting(setting);
        }
        configuration.slashCommands.provideSlashCommand(
            new CodeReviewAssistantCommand(this)
        );
    }

    public async onEnable(environment: IEnvironmentRead, configurationModify: IConfigurationModify): Promise<boolean> {
        try {
            const requiredSettings = [
                AppSettingsEnum.GITHUB_WEBHOOK_SECRET_ID,
                AppSettingsEnum.REVIEWER_REMINDER_INTERVAL_ID,
                AppSettingsEnum.LLM_REVIEW_SUMMARY_ENABLED_ID,
            ];
            for (const setting of requiredSettings) {
                const value = await environment.getSettings().getValueById(setting);
                if (!value) {
                    this.getLogger().error(`Missing required setting: ${setting}`);
                    return false;
                }
            }
            this.getLogger().info("All required settings are valid.");
            return true;
        } catch (error) {
            this.getLogger().error("Error during app enablement:", error);
            return false;
        }
    }
}
