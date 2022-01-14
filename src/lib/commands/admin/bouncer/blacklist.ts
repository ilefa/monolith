/*
 * Copyright (c) 2022 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { BouncerManager } from '../../../modules';
import { bold, CommandReturn, isSnowflake } from '@ilefa/ivy';
import { AutowiredCommand, CommandCategory } from '../../system';

export class BlacklistCommand extends AutowiredCommand<BouncerManager> {

    constructor() {
        super('Bouncer', 'blacklist', 'There is no help message.', null, [], 'SEND_MESSAGES', false, true, CommandCategory.ADMIN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (!this.engine.has(user, 'SUPER_PERMS', message.guild))
            return CommandReturn.EXIT;

        message.delete();
            
        if (args.length !== 0)
            return CommandReturn.EXIT;

        let target = args[0];
        if (!target || !isSnowflake(target))
            return CommandReturn.EXIT;

        let channel = await user.createDM();
        this.module.blacklist(target,
            id => channel.send(`:loudspeaker: ${bold(id)} has been blacklisted from ${bold('AF')}.`),
            err => channel.send(`<:alert:927457022310490162> ${err}`));

        return CommandReturn.EXIT;
    }

}