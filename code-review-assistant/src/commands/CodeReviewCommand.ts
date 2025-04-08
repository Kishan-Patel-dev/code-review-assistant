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
import { App } from "@rocket.chat/apps-engine/definition/App";
import { notifyMessage } from "../helpers/NotifyMessage";
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
        const user = context.getSender();
        const room = context.getRoom();
        const threadId = context.getThreadId();
        const args = context.getArguments();
        const action = args[0];

        switch (action) {
            case "hello":
                await notifyMessage(
                    room,
                    read,
                    user,
                    "Hi your rocket app is working"
                );
                break;
            case "help":
                const helpMessage = `
Available commands:
/cr help             → List available commands
/cr assign           → Force assign reviewers to open PR
/cr summary <pr>     → Generate review summary (mock)
                `;
                await notifyMessage(room, read, user, helpMessage);
                break;
        }
    }
}
