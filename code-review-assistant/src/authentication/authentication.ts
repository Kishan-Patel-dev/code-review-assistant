
// If we can implement jwt using app engine then we can host the the github app in a app engine 

import * as jwt from "jsonwebtoken";
import { notifyMessage } from "../helpers/NotifyMessage";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import {
    IHttp,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";

import { AppSettingsEnum } from "../settings/settings";

export class Authentication {
    private appId: string;
    private appPrivateKey: string;

    constructor(private app: App) {}

    public async generateAccessToken(
        room: IRoom,
        user: IUser,
        read: IRead,
        http: IHttp,
        threadId?: string
    ) {
        const appId = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById(AppSettingsEnum.GITHUB_APP_ID_ID);

        const appPrivateKey = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById(AppSettingsEnum.GITHUB_APP_PRIVATE_KEY_ID);

        // 1. Fixed JWT generation call
        const jwtToken = this.generateJWT(appId, appPrivateKey);

        const url = "https://api.github.com/app/access_tokens";
        const response = await http.post(url, {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
                Accept: "application/vnd.github+json",
            },
        });

        if (response.statusCode !== 200) {
            await notifyMessage(
                room,
                read,
                user,
                `API error: ${response.statusCode}`,
                threadId
            );
            throw new Error(`API error: ${response.statusCode}`);
        }

        // 2. Added response validation
        if (!response.data?.token) {
            await notifyMessage(
                room,
                read,
                user,
                "Invalid token response format",
                threadId
            );
            throw new Error("No token in GitHub response");
        }

        return response.data.token;
    }

    public generateJWT(appId: string, appPrivateKey: string) {
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iat: now - 60, // 1 minute grace period
            exp: now + 600, // 10-minute validity (GitHub requirement)
            iss: appId,
        };
        return jwt.sign(payload, appPrivateKey, { algorithm: "RS256" });
    }
}
