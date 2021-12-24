/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { CommandCategory } from '../system';
import { Command, CommandReturn } from '@ilefa/ivy';
import { Message, Permissions, User } from 'discord.js';

export class BigJannieCommand extends Command {

    constructor() {
        super('bigjannie', `haha jannie big`, `what did you expect to be here?`, [], Permissions.FLAGS.SEND_MESSAGES, false, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.channel.send({ content: 'https://cdn.discordapp.com/attachments/778422963560644639/788266859718901770/cleanyourscreen.gif' });
        return CommandReturn.EXIT;
    }

}