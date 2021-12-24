/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { CommandCategory } from '../system';
import { TaskScheduler } from '../../modules';
import { Command, CommandReturn, emboss, IvyEmbedIcons } from '@ilefa/ivy';

export class DinnerHallSyncCommand extends Command {

    constructor() {
        super('dhsync', `Invalid usage: ${emboss('.dhsync')}`, null, [], 'ADMINISTRATOR', false, false, CommandCategory.ADMIN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;

        let scheduler = this.engine.moduleManager.require<TaskScheduler>('TaskScheduler');
        if (!scheduler) {
            this.reply(message, this.embeds.build('Blueplate Management', IvyEmbedIcons.ERROR, 'Could not locate the task scheduler.', [], message));
            return CommandReturn.EXIT;
        }

        let task = scheduler.getTaskById('rename');
        if (!task) {
            this.reply(message, this.embeds.build('Blueplate Management', IvyEmbedIcons.ERROR, 'Could not locate the rename task.', [], message));
            return CommandReturn.EXIT;
        }

        scheduler.invokeNow('blueplate');
        let msg = await this.reply(message, this.embeds.build('Blueplate Management', IvyEmbedIcons.PREFS, 'Syncing menus, one moment please..', [], message));
        this.manager.client.once('blueplateSync', () => {
            msg.edit({ embeds: [this.embeds.build('Blueplate Management', IvyEmbedIcons.PREFS, 'Menus synced.', [], message)] });
        });

        return CommandReturn.EXIT;
    }

}