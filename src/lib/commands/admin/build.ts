/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import buildInfo from '../../../../build_info.json';

import { Message, User } from 'discord.js';
import { EmbedIconType } from '../../util';
import { CommandCategory } from '../system';
import { Command, CommandReturn, emboss } from '@ilefa/ivy';

export class BuildInfoCommand extends Command {

    constructor() {
        super('build', `Invalid usage: ${emboss('.build')}`, null, [], 'ADMINISTRATOR', false, false, CommandCategory.ADMIN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;

        this.reply(message, this.embeds.build('Build Info', EmbedIconType.TEST, '',
            Object
                .entries(buildInfo)
                .map(([key, value]) => ({
                    name: key,
                    value,
                    inline: false
                })), message));
        
        return CommandReturn.EXIT;
    }

}