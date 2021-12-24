/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { EmbedIconType } from '../../util';
import { CommandCategory } from '../system';
import { Message, TextChannel, User } from 'discord.js';
import { Command, CommandReturn, emboss } from '@ilefa/ivy';

export class PurgeCommand extends Command {
    
    constructor() {
        super('purge', `Invalid usage: ${emboss('.purge <amount>')}`, null, [], 'ADMINISTRATOR', true, false, CommandCategory.ADMIN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1)
            return CommandReturn.HELP_MENU;

        let amount = parseInt(args[0]);
        if (isNaN(amount)) {
            this.reply(message, this.embeds.build('Message Purge', EmbedIconType.MESSAGE, `Invalid amount: ${emboss(args[0])}`, [], message));
            return CommandReturn.EXIT;
        }

        let channel = message.channel as TextChannel;
        await channel.bulkDelete(amount);
        let msg = await this.reply(message, this.embeds.build('Message Purge', EmbedIconType.MESSAGE, `Purged ${emboss(amount)} messages!`, [], message));
        setTimeout(() => msg.delete(), 2000);
        return CommandReturn.EXIT;
    }

}