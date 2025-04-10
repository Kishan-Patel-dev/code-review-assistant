import { IRead } from "@rocket.chat/apps-engine/definition/accessors";
import * as crypto from "crypto";
import { AppSettingsEnum } from "../settings/settings";

export async function validateGitHubSignature(payload: string, signature: string, read: IRead): Promise<boolean> {
    const secret = await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById(AppSettingsEnum.GITHUB_WEBHOOK_SECRET_ID);

    const hmac = crypto.createHmac("sha256", secret);
    const digest = `sha256=${hmac.update(payload).digest("hex")}`;
    return crypto.timingSafeEqual(Buffer.from(signature || ""), Buffer.from(digest));
}
