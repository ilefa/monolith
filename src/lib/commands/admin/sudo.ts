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

import { 
    CommandReturn, 
    emboss,
    IvyEmbedIcons,
    findUser,
    Command
} from '@ilefa/ivy';

export class SudoCommand extends Command {

    constructor() {
        super('sudo', `Invalid usage: ${emboss('.sudo <@mention | id> <command> [..args]')}`, null, [], 'SUPER_PERMS', true, false, CommandCategory.ADMIN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (args.length < 2)
            return CommandReturn.HELP_MENU;

        const target = await findUser(message, args.shift(), null);
        if (!target) {
            this.reply(message, this.embeds.build('Monolith Management', IvyEmbedIcons.TEST, `ERROR: User not found.`, [], message));
            return CommandReturn.EXIT;       
        }

        const commandMessage = `.${args.join(' ')}`;
        message.author = target;
        message.content = commandMessage;
        this.manager.handle(target, message);

        return CommandReturn.EXIT;
    }

}