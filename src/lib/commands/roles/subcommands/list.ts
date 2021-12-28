/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { EmbedIconType } from '../../../util';
import { RoleAssignmentManager } from '../../../modules';
import { SelfAssignableRoleBundle } from '../../../database';
import { GuildMember, Message, TextChannel, User } from 'discord.js';
import { CommandComponent, CommandReturn, PaginatedEmbed } from '@ilefa/ivy';

type StatefulRoleBundle = SelfAssignableRoleBundle & {
    members: GuildMember[];
}

export class ListAssignableRolesCommand extends CommandComponent<RoleAssignmentManager> {
    
    constructor() {
        super('list', 'list', 'ADMINISTRATOR');
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (!this.manager) {
            this.host.reply(message, this.host.embeds.build('Role Assignment Manager', EmbedIconType.PREFS, `Could not autowire role manager, please investigate.`, [], message));
            return CommandReturn.EXIT;
        }

        let roles = await this.manager.getRoles();
        if (roles.length === 0) {
            this.host.reply(message, this.host.embeds.build('Role Assignment Manager', EmbedIconType.PREFS, 'No roles are currently registered.', [], message));
            return CommandReturn.EXIT;
        }

        let stateful = await Promise.all(roles
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
            .map(async bundle => ({
                ...bundle,
                members: await this.getMembersForRole(bundle.roleId)
            })));

        PaginatedEmbed.ofItems<StatefulRoleBundle>(
            this.host.engine, message.channel as TextChannel, user,
            'Role Assignment Manager', EmbedIconType.PREFS, stateful, 5,
            items => ({
                description: '',
                fields: items.map(item => ({
                    name: `${item.emote} ${item.displayName}`,
                    value: `${item.members.length} members`,
                    inline: false
                }))
            }));
            
        return CommandReturn.EXIT;
    }

    private getMembersForRole = async (roleId: string) => {
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

        return [...role.members.values()];
    }

}