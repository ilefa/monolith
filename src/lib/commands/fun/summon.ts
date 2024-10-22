/*
 * Copyright (c) 2022 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { User, Message } from 'discord.js';
import { CommandCategory } from '../system';
import { asMention, Command, CommandReturn, findUser } from '@ilefa/ivy';

export class SummonCommand extends Command {
    
    constructor() {
        super('summon', 'you have been chosen.', null, [], 'ADMINISTRATOR', true, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (args.length < 1)
            return CommandReturn.EXIT;

        let target = await findUser(message, args[0], null);
        if (!target)
            return CommandReturn.EXIT;

        let timeout = -1;
        if (args.length === 2 && !isNaN(parseInt(args[1])))
            timeout = parseInt(args[1]);

        if (timeout > 10000)
            timeout = -1;
            
        let msg = await this.reply(message, asMention(target));
        if (timeout !== -1)
            setTimeout(() => msg.delete(), timeout);
        
        return CommandReturn.EXIT;
    }

}