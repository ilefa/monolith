/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { User, Message } from 'discord.js';
import { EmbedIconType } from '../../../util';
import { RoleAssignmentManager } from '../../../modules/roles';

import {
    bold,
    CommandComponent,
    CommandReturn,
    isSnowflake
} from '@ilefa/ivy';

export class AddAssignableRoleCommand extends CommandComponent<RoleAssignmentManager> {
    
    constructor() {
        super('add', 'add <roleId> [<displayName>] <displayEmote>', 'ADMINISTRATOR');
    }
    
    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        let { roleId, displayName, emote } = this.parseArgs(args);
        if (!roleId || !displayName || !emote)
            return CommandReturn.HELP_MENU;

        if (!isSnowflake(roleId)) {
            this.host.reply(message, 'Role ID must be a valid snowflake ID.');
            return CommandReturn.EXIT;
        }

        let role = await this
            .manager
            .client
            .guilds
            .cache
            .get(this
                .manager
                .bundle
                .serverId)
            .roles
            .fetch(roleId);

        if (!role) {
            this.host.reply(message, this.host.embeds.build('Role Assignment Manager', EmbedIconType.PREFS, `Could not locate any role(s) with ID ${bold(roleId)}!`, [], message));
            return CommandReturn.EXIT;
        }

        let remote = await this.manager.getRole(roleId);
        if (remote) {
            this.host.reply(message, this.host.embeds.build('Role Assignment Manager', EmbedIconType.PREFS, `${bold(role.name)} already exists!`, [], message));
            return CommandReturn.EXIT;
        }

        await this.manager.addRole(roleId, displayName, emote);
        this.host.reply(message, this.host.embeds.build('Role Assignment Manager', EmbedIconType.PREFS, `${bold(role.name)} is now self-assignable.`, [], message));
        return CommandReturn.EXIT;
    }

    private parseArgs = (args: string[]) => {
        let roleId = args[0];
        let displayName = args.join(' ').split('[')[1].split(']')[0];
        let emote = args.join(' ').split(']')[1].split(' ')[1];

        return { roleId, displayName, emote };
    }
    
}