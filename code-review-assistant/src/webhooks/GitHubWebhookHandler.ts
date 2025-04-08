import { IHttp, IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { AppSettingsEnum } from "../settings/settings";
import { notifyMessage } from "../helpers/NotifyMessage";
import * as crypto from "crypto";

export class GitHubWebhookHandler {
    constructor(private read: IRead, private modify: IModify, private http: IHttp) {}

    private async validateRequest(payload: string, signature: string): Promise<boolean> {
        const secret = await this.read
            .getEnvironmentReader()
            .getSettings()
            .getValueById(AppSettingsEnum.GITHUB_WEBHOOK_SECRET_ID);

        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(payload);
        const digest = `sha256=${hmac.digest("hex")}`;
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    }

    public async handleWebhook(payload: any, headers: any, room: any, user: any): Promise<void> {
        const signature = headers["x-hub-signature-256"];
        const isValid = await this.validateRequest(JSON.stringify(payload), signature);

        if (!isValid) {
            await notifyMessage(room, this.read, user, "Invalid webhook signature.");
            throw new Error("Invalid webhook signature.");
        }

        const event = payload.action;
        const prTitle = payload.pull_request?.title;
        const prUrl = payload.pull_request?.html_url;

        if (event === "opened" || event === "review_requested") {
            await notifyMessage(
                room,
                this.read,
                user,
                `New PR Event: ${event}\nTitle: ${prTitle}\nURL: ${prUrl}`
            );
            // Call reviewer assignment logic here
        } else if (event === "review_submitted") {
            await notifyMessage(
                room,
                this.read,
                user,
                `Review submitted for PR: ${prTitle}\nURL: ${prUrl}`
            );
        }
    }
}
