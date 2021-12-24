/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { TaskScheduler } from '../../modules';
import { CommandCategory } from '../system';
import { User, Message, Guild } from 'discord.js';
import { bold, Command, CommandReturn, emboss, IvyEmbedIcons } from '@ilefa/ivy';

export class RerollCommand extends Command {
    
    constructor() {
        super('reroll', `Invalid usage: ${emboss('.reroll')}`, null, null, 'ADMINISTRATOR', false, false, CommandCategory.ADMIN);
    }
    
    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;

        let scheduler = this.engine.moduleManager.require<TaskScheduler>('TaskScheduler');
        if (!scheduler) {
            this.reply(message, this.embeds.build('AF Management', IvyEmbedIcons.ERROR, 'Could not locate the task scheduler.', [], message));
            return CommandReturn.EXIT;
        }

        let task = scheduler.getTaskById('rename');
        if (!task) {
            this.reply(message, this.embeds.build('AF Management', IvyEmbedIcons.ERROR, 'Could not locate the rename task.', [], message));
            return CommandReturn.EXIT;
        }

        scheduler.invokeNow('rename');
        let msg = await this.reply(message, this.embeds.build('AF Management', IvyEmbedIcons.PREFS, 'Rerolling..', [], message));
        this.manager.client.on('guildUpdate', (old, current) => this.renameEventHandler(old, current, msg));
        return CommandReturn.EXIT;
    }

    private renameEventHandler(old: Guild, current: Guild, msg: Message) {
        if (old.name !== current.name)
            msg.edit({ embeds: [this.embeds.build('AF Management', IvyEmbedIcons.PREFS, `Rerolled the server name to ${bold(current.name)}!`)] });
        this.manager.client.removeListener('guildUpdate', this.renameEventHandler);
    }

}