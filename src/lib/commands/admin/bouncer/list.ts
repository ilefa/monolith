/*
 * Copyright (c) 2022 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { User, Message } from 'discord.js';
import { bold, CommandReturn } from '@ilefa/ivy';
import { BouncerManager } from '../../../modules';
import { AutowiredCommand, CommandCategory } from '../../system';

export class ListBlacklistsCommand extends AutowiredCommand<BouncerManager> {

    constructor() {
        super('Bouncer', 'listblacklists', 'There is no help message.', null, [], 'SEND_MESSAGES', false, true, CommandCategory.ADMIN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (!this.engine.has(user, 'SUPER_PERMS', message.guild))
            return CommandReturn.EXIT;

        if (args.length !== 0)
            return CommandReturn.EXIT;
            
        message.delete();
        
        let list = await this.module.list();
        let channel = await user.createDM();

        channel.send(`:loudspeaker: ${bold('Blacklisted users:')}\n` + (list.length === 0 ? ' • None \:)' : list.map(line => ` • ${line}`).join('\n')));
        return CommandReturn.EXIT;
    }

}