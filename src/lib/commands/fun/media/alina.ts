/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { CommandCategory } from '../../system';
import { Command, CommandReturn } from '@ilefa/ivy';

export class AlinaCommand extends Command {
    
    constructor() {
        super('alina', 'go to sleep alina!', null, [], 'SEND_MESSAGES', false, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        this.reply(message, 'https://c.tenor.com/fc2oFSLukicAAAAC/go-to-sleep-hey-alina-go-to-fucking-sleep.gif');
        return CommandReturn.EXIT;
    }

}