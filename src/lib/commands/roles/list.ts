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
import { RoleAssignmentManager } from '../../modules';
import { bold, Command, CommandReturn, emboss, IvyEmbedIcons } from '@ilefa/ivy';

export class RoleListCommand extends Command {

    roleManager: RoleAssignmentManager;

    constructor() {
        super('roles', `Invalid usage: ${emboss('.roles')}`, null, [], 'SEND_MESSAGES', false, false, CommandCategory.ROLE);
    }

    start() {
        super.start();
        this.engine.client.once('ready', () => {
            this.roleManager = this.engine.moduleManager.require<RoleAssignmentManager>('RoleAssignmentManager');
        });
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (!this.roleManager) {
            this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `Hmm, something went wrong - please try again.`, [], message));
            return CommandReturn.EXIT;
        }

        let roles = await this.roleManager.getRoles();
        if (roles.length === 0) {
            this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `There are no roles to display.`, [], message));
            return CommandReturn.EXIT;
        }

        let roleList = roles
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
            .map(role => `${role.emote} ${bold(role.displayName)}`).join('\n');
            
        this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `Here are the roles you can assign to yourself:\n\n${roleList}\n\nType ${bold('.role <name>')} to assign/remove a role.`, [], message));
        return CommandReturn.EXIT;
    }

}