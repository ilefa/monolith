/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { CommandCategory } from '../../system';
import { Message, User } from 'discord.js';
import { Command, CommandReturn, emboss } from '@ilefa/ivy';

export class MaldCommand extends Command {

    constructor() {
        super('mald', `Invalid usage: ${emboss('.mald')}`, 'fleance be maldin, it never stops :(', [], 'SEND_MESSAGES', false, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.channel.send({ files: ['https://media.discordapp.net/attachments/784858138964262932/810011108013506610/unknown.png?width=720&height=540'] });
        return CommandReturn.EXIT;
    }

}