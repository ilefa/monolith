/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { CommandCategory } from '../system';
import { Message, User } from 'discord.js';
import { Command, CommandReturn, emboss } from '@ilefa/ivy';

export class ChunksCommand extends Command {

    constructor() {
        super('chunks', `Invalid usage: ${emboss('.chunks')}`, 'so, chunks huh?', [], 'SEND_MESSAGES', false, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.channel.send({ content: 'https://tenor.com/view/mario-galaxy-penguin-starbits-so-chunks-huh-mario-gif-19595444' });
        return CommandReturn.EXIT;
    }

}