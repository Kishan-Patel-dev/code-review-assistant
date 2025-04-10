import { IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { createPRSummaryPrompt } from "../constants/prompts";

export class LLMSummaryModule {
    constructor(private readonly read: IRead, private readonly apiKey?: string) {}

    public async getSummary(prData: { title: string; description: string; filesChanged: number; diffStats: string }): Promise<string> {
        if (!(await this.isLLMEnabled())) {
            return "LLM integration is disabled. Enable it in the app settings to use this feature.";
        }

        const prompt = createPRSummaryPrompt(prData);

        try {
            if (this.apiKey) {
                console.log("Sending prompt to LLM:", prompt);
                return `🤖 AI Summary (real):\n---\n${prData.title} affects ${prData.filesChanged} files.\n\n(Summary logic here)`;
            } else {
                console.log("Simulating LLM response for prompt:", prompt);
                return `🤖 AI Summary (simulated):\n---\n${prData.title} affects ${prData.filesChanged} files.\n\n(Summary logic here)`;
            }
        } catch (error) {
            console.error("LLM summarization failed:", error);
            return "Failed to generate summary. Please try again later.";
        }
    }

    private async isLLMEnabled(): Promise<boolean> {
        const setting = await this.read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("LLM_REVIEW_SUMMARY_ENABLED_ID");
        return setting === true;
    }
}
