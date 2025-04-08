import { IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { notifyMessage } from "../helpers/NotifyMessage";

export class ReviewerReminder {
    constructor(private read: IRead, private modify: IModify) {}

    public async sendReminder(room: any, user: any, prUrl: string): Promise<void> {
        await notifyMessage(
            room,
            this.read,
            user,
            `Reminder: Please review the PR: ${prUrl}`
        );
    }
}
