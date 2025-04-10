import { IPersistence } from "@rocket.chat/apps-engine/definition/accessors";

export function getReminderKey(reviewerId: string, prUrl: string): string {
    return `reminder_${reviewerId}_${prUrl}`;
}

export async function isReminderActive(reminderKey: string, persistence: IPersistence): Promise<boolean> {
    const existingReminder = await persistence.readById(reminderKey);
    return !!existingReminder;
}

export async function saveReminder(reminderKey: string, persistence: IPersistence): Promise<void> {
    await persistence.createWithId({ timestamp: Date.now() }, reminderKey);
}

export async function removeReminder(reminderKey: string, persistence: IPersistence): Promise<void> {
    await persistence.removeById(reminderKey);
}
