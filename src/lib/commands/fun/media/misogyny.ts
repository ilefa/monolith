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

export class MisogynyCommand extends Command {

    constructor() {
        super('misogyny', 'qwubgrwingipfmwqepowgn', null, [], 'SEND_MESSAGES', false, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        this.reply(message, 'https://media.discordapp.net/attachments/785050947407052824/915799627280834620/final_61a8369930ec5900648ec7b6_367752.gif')
        return CommandReturn.EXIT;
    }

}