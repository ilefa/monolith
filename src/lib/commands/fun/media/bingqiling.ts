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

export class BingQiLingCommand extends Command {

    constructor() {
        super('bingqiling', 'wo hen xi huan bing qi ling', null, [], 'SEND_MESSAGES', false, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        this.reply(message, `https://c.tenor.com/cWsK6nwdcHYAAAAd/bing-chi-ling-alex-mei-bing.gif`);
        return CommandReturn.EXIT;
    }

}