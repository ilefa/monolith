/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { EmbedIconType } from '../../../util';
import { RoleAssignmentManager } from '../../../modules/roles';

import {
    bold,
    CommandComponent,
    CommandReturn,
    emboss,
    isSnowflake
} from '@ilefa/ivy';

export class RemoveAssignableRoleCommand extends CommandComponent<RoleAssignmentManager> {

    constructor() {
        super('remove', 'remove <roleId>', 'ADMINISTRATOR');
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        let roleId = args[0];
        if (!roleId)
            return CommandReturn.HELP_MENU;

        if (!isSnowflake(roleId)) {
            this.host.reply(message, this.host.embeds.build('Role Assignment Manager', EmbedIconType.PREFS, 'Role ID must be a valid snowflake ID.', [], message));
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
            this.host.reply(message, this.host.embeds.build('Role Assignment Manager', EmbedIconType.PREFS, `Could not locate any role(s) with ID ${emboss(roleId)}!`, [], message));
            return CommandReturn.EXIT;
        }

        let remote = await this.manager.getRole(roleId);
        if (!remote) {
            this.host.reply(message, this.host.embeds.build('Role Assignment Manager', EmbedIconType.PREFS, `${bold(role.name)} is not currently self-assignable!`, [], message));
            return CommandReturn.EXIT;
        }

        await this.manager.removeRole(roleId);
        this.host.reply(message, this.host.embeds.build('Role Assignment Manager', EmbedIconType.PREFS, `${bold(role.name)} is no longer self-assignable.`, [], message));
        return CommandReturn.EXIT;
    }

}