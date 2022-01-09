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

export class CringeCommand extends Command {

    constructor() {
        super('cringe', 'oh no cringe!', null, [], 'SEND_MESSAGES', false, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        this.reply(message, 'https://cdn.discordapp.com/attachments/784858138964262932/929567793962176522/IMG_3938.jpg')
        return CommandReturn.EXIT;
    }

}