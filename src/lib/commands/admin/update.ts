/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { EmbedIconType } from '../../util';
import { UpdateManager } from '../../modules';
import { CommandReturn, emboss } from '@ilefa/ivy';
import { AutowiredCommand, CommandCategory } from '../system';

export class UpdateCommand extends AutowiredCommand<UpdateManager> {

    constructor() {
        super('UpdateManager', 'update', `Invalid usage: ${emboss('.update')}`, null, [], 'SUPER_PERMS', false, false, CommandCategory.ADMIN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;

        await this.module.runUpdate(
            () => this.reply(message, this.embeds.build('Monolith Instance Manager', EmbedIconType.TEST, `Sent update signal.`)),
            reason => this.reply(message, this.embeds.build('Monolith Instance Manager', EmbedIconType.TEST, `Failed to invoke update signal:\n${emboss(reason)}`, [], message)
        ));

        return CommandReturn.EXIT;
    }

}