/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { CommandCategory } from '../system';
import { COMMIT_HASH, DISPLAY_VERSION, RELEASE_CHANNEL } from '../../../build';
import { bold, Command, CommandReturn, emboss, IvyEmbedIcons } from '@ilefa/ivy';

export class VersionCommand extends Command {

    constructor() {
        super('version', `Invalid usage: ${emboss('.version')}`, null, null, 'SEND_MESSAGES', false, false, CommandCategory.INFO);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        this.reply(message, this.embeds.build('Version', IvyEmbedIcons.TEST, `${bold('Monolith')} is running version ${bold(DISPLAY_VERSION)} ${bold(`(${COMMIT_HASH.trim() || 'unknown'} -> ilefa/monolith:${RELEASE_CHANNEL})`)}`, [], message));
        return CommandReturn.EXIT;
    }

}