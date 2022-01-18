/*
 * Copyright (c) 2022 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { User, Message } from 'discord.js';
import { CommandCategory } from '../../system';
import { Command, CommandReturn } from '@ilefa/ivy';

export class FlourideCommand extends Command {

    constructor() {
        super('flouride', 'when you show them a based schizopost and all you get back is that flouride stare', null, [], 'SEND_MESSAGES', false, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        this.reply(message, 'https://cdn.discordapp.com/attachments/922010436377931849/932845366053830736/6796c366-56ce-44c4-b5b1-f7e5b552cd17.png');
        return CommandReturn.EXIT;
    }

}