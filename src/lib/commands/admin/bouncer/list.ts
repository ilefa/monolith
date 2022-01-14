/*
 * Copyright (c) 2022 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { User, Message } from 'discord.js';
import { BouncerManager } from '../../../modules';
import { bold, CommandReturn, emboss } from '@ilefa/ivy';
import { AutowiredCommand, CommandCategory } from '../../system';

export class ListBlacklistsCommand extends AutowiredCommand<BouncerManager> {

    constructor() {
        super('Bouncer', 'listblacklists', 'There is no help message.', null, [], 'SEND_MESSAGES', false, true, CommandCategory.ADMIN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (!this.engine.has(user, 'SUPER_PERMS', message.guild))
            return CommandReturn.EXIT;

        message.delete();
            
        if (args.length !== 0)
            return CommandReturn.EXIT;

        let list = await this.module.list();
        let channel = await user.createDM();

        channel.send(`:loudspeaker: ${bold('Blacklisted users:')}\n` + list.map(line => `• ${emboss(line)}`).join('\n'));
    }

}