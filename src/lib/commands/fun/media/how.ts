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

export class HowCommand extends Command {

    constructor() {
        super('how', 'me explaining how', null, [], 'SEND_MESSAGES', false, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        this.reply(message, 'https://media.discordapp.net/attachments/785050947407052824/914619279645769768/final_61a3e54ae256be00ea426197_157070.gif');
        return CommandReturn.EXIT;
    }

}