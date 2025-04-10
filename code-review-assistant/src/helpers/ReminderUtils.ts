import { IPersistence, IPersistenceRead } from "@rocket.chat/apps-engine/definition/accessors";
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';

export function getReminderKey(reviewerId: string, prUrl: string): string {
    return `reminder_${reviewerId}_${prUrl}`;
}

export async function isReminderActive(reminderKey: string, persistenceRead: IPersistenceRead): Promise<boolean> {
    const assoc = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, reminderKey);
    const [existingReminder] = await persistenceRead.readByAssociation(assoc);
    return !!existingReminder;
}

export async function saveReminder(reminderKey: string, persistence: IPersistence): Promise<void> {
    const assoc = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, reminderKey);
    await persistence.createWithAssociation({ timestamp: Date.now() }, assoc);
}

export async function removeReminder(reminderKey: string, persistence: IPersistence): Promise<void> {
    const assoc = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, reminderKey);
    await persistence.removeByAssociation(assoc);
}
