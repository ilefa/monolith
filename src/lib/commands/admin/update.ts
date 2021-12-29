/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
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

        await this.module.runUpdate();
        return CommandReturn.EXIT;
    }

}