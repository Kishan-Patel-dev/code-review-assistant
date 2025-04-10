import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { IRead, IModify, IHttp } from "@rocket.chat/apps-engine/definition/accessors";

export class ReviewerAssignment {
    public async assignReviewers(
        args: string[],
        room: IRoom,
        sender: IUser,
        read: IRead,
        modify: IModify,
        http: IHttp
    ): Promise<void> {
        // Mock implementation for assigning reviewers
        const reviewers = args.join(", ");
        const message = `Reviewers assigned: ${reviewers}`;
        const builder = modify.getCreator().startMessage().setText(message).setRoom(room).setSender(sender);
        await modify.getCreator().finish(builder);
    }
}