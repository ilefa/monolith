/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { EmbedIconType } from '../../../util';
import { CommandComponent, CommandReturn } from '@ilefa/ivy';
import { BirthdayManager, TaskScheduler } from '../../../modules';

export class ForceBirthdayAnnouncementCommand extends CommandComponent<BirthdayManager> {

    constructor() {
        super('announce', 'announce', 'ADMINISTRATOR');
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        let scheduler = this.host.engine.moduleManager.require<TaskScheduler>('TaskScheduler');
        if (!scheduler) {
            this.host.reply(message, this.host.embeds.build('Birthday Management', EmbedIconType.ERROR, 'Could not locate the task scheduler.', [], message));
            return CommandReturn.EXIT;
        }

        let task = scheduler.getTaskById('birthday');
        if (!task) {
            this.host.reply(message, this.host.embeds.build('Birthday Management', EmbedIconType.ERROR, 'Could not locate the rename task.', [], message));
            return CommandReturn.EXIT;
        }

        scheduler.invokeNow('birthday');
        this.host.reply(message, this.host.embeds.build('Birthday Management', EmbedIconType.BIRTHDAY, 'Birthday announcements have been forced.', [], message));
        return CommandReturn.EXIT;
    }

}