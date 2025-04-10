import {
    IConfigurationExtend,
    ILogger,
    IRead,
    IHttp,
    IModify,
    IPersistence,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { LLMSummaryModule } from "./src/summary/LLMSummaryModule";
export class CodeReviewAssistantApp extends App {
    private llmModule: LLMSummaryModule;

    constructor(info: IAppInfo, logger: ILogger) {
        super(info, logger);
    }

    public initializeModules(read: IRead): void {
        const apiKey = process.env.LLM_API_KEY || ""; // or fetch from settings if dynamic
        this.llmModule = new LLMSummaryModule(read, apiKey);
    }

    public getLLMSummaryModule(): LLMSummaryModule {
        return this.llmModule;
    }
}
