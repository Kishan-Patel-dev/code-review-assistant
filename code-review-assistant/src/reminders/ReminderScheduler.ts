import { IModify, IRead, IPersistence, ILogger } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { AppSettingsEnum } from "../settings/settings";
import { notifyMessage } from "../helpers/NotifyMessage";
import { getReminderKey, isReminderActive, saveReminder, removeReminder } from "../helpers/ReminderUtils";

export class ReminderScheduler {
    private reminderInterval: number = 3600000; // Default to 1 hour in milliseconds

    constructor(
        private readonly read: IRead,
        private readonly modify: IModify,
        private readonly persistence: IPersistence,
        private readonly logger: ILogger
    ) {}

    public async scheduleReminder(reviewerId: string, prUrl: string, room: IRoom, user: IUser): Promise<void> {
        const intervalSetting = await this.read
            .getEnvironmentReader()
            .getSettings()
            .getValueById(AppSettingsEnum.REVIEWER_REMINDER_INTERVAL_ID);

        this.reminderInterval = intervalSetting * 3600000;

        const reminderKey = getReminderKey(reviewerId, prUrl);
        if (await isReminderActive(reminderKey, this.persistence)) {
            this.logger.info(`[Reminder] Reminder already scheduled for reviewer: ${reviewerId}, PR: ${prUrl}`);
            return;
        }

        this.logger.info(`[Reminder] Scheduling reminder for reviewer: ${reviewerId}, PR: ${prUrl}`);
        await saveReminder(reminderKey, this.persistence);

        const jobId = `reminder_${reviewerId}_${prUrl}`;
        await this.modify.getScheduler().scheduleOnce({
            id: jobId,
            when: new Date(Date.now() + this.reminderInterval),
            data: { reviewerId, prUrl, roomId: room.id, userId: user.id },
        });
    }

    public async cancelReminder(reviewerId: string, prUrl: string): Promise<void> {
        const reminderKey = getReminderKey(reviewerId, prUrl);
        this.logger.info(`[Reminder] Cancelling reminder for reviewer: ${reviewerId}, PR: ${prUrl}`);
        await removeReminder(reminderKey, this.persistence);

        const jobId = `reminder_${reviewerId}_${prUrl}`;
        await this.modify.getScheduler().cancelJob(jobId);
    }

    public async processReminderJob(data: { reviewerId: string; prUrl: string; roomId: string; userId: string }): Promise<void> {
        const { reviewerId, prUrl, roomId, userId } = data;

        const room = await this.read.getRoomReader().getById(roomId);
        const user = await this.read.getUserReader().getById(userId);

        if (!room || !user) {
            this.logger.error(`[Reminder] Invalid room or user for reminder job: ${JSON.stringify(data)}`);
            return;
        }

        const reminderKey = getReminderKey(reviewerId, prUrl);
        if (!(await isReminderActive(reminderKey, this.persistence))) {
            this.logger.info(`[Reminder] Reminder cancelled for reviewer: ${reviewerId}, PR: ${prUrl}`);
            return;
        }

        await notifyMessage(room, this.read, user, `Reminder: Please review the PR: ${prUrl}`);
        this.logger.info(`[Reminder] Reminder sent for reviewer: ${reviewerId}, PR: ${prUrl}`);

        await this.scheduleReminder(reviewerId, prUrl, room, user);
    }
}
