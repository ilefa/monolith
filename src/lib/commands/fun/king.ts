/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { CommandCategory } from '../system';
import { User, Message, Permissions } from 'discord.js';
import { Command, CommandReturn, emboss } from '@ilefa/ivy';

export class KingCommand extends Command {
    
    constructor() {
        super('king', `Invalid usage: ${emboss('.king <emote>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false, false, CommandCategory.FUN);
    }
    
    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1)
            return CommandReturn.HELP_MENU;
        
        message.channel.send(`King ${args[0].trim()}:\n\n` 
            + `      :crown:\n` 
            + `      ${args[0].trim()}\n` 
            + `:muscle::shirt::muscle:\n`
            + `      :jeans:\n`
            + ` :foot::foot:\n\n` 
        );

        return CommandReturn.EXIT;
    }

}