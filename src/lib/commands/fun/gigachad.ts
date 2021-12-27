/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { User, Message } from 'discord.js';
import { CommandCategory } from '../system';
import { Command, CommandReturn } from '@ilefa/ivy';

export class GigachadCommand extends Command {
    
    constructor() {
        super('gigachad', 'ahhhhhhhh', null, [], 'SEND_MESSAGES', false, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        this.reply(message, `https://c.tenor.com/epNMHGvRyHcAAAAS/gigachad-chad.gif`);
        return CommandReturn.EXIT;
    }

}