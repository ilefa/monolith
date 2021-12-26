/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { User, Message } from 'discord.js';
import { RoleAssignmentManager } from '../../modules';
import { CommandCategory, AutowiredCommand } from '../system';
import { bold, CommandReturn, emboss, IvyEmbedIcons } from '@ilefa/ivy';

export class AssignRoleCommand extends AutowiredCommand<RoleAssignmentManager> {
    
    constructor() {
        super('RoleAssignmentManager', 'role', `Invalid usage: ${emboss('.role <name>')}`, null, [], 'SEND_MESSAGES', false, false, CommandCategory.ROLE);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (!this.module) {
            this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `Hmm, something went wrong - please try again.`, [], message));
            return CommandReturn.EXIT;
        }

        if (args.length < 1)
            return CommandReturn.HELP_MENU;

        let roleName = args.join(' ');
        let member = message.member;

        let role = await this.module.getRoleByName(roleName);
        if (!role) {
            this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `I couldn't find a role called ${bold(roleName)}.`, [], message));
            return CommandReturn.EXIT;
        }

        if (await this.module.userHasRole(role.displayName, member)) {
            this.module.removeRoleFromUser(role.displayName, member,
                bundle => this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `Removed ${bold(bundle.displayName)} from you.`, [], message)),
                () => this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `Could not remove ${bold(role)} from you.`, [], message)));
            return CommandReturn.EXIT;
        }

        this.module.applyRoleToUser(role.displayName, member,
            bundle => this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `Added ${bold(bundle.displayName)} to you.`, [], message)),
            () => this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `Could not grant you the ${bold(role)} role.`, [], message)));

        return CommandReturn.EXIT;
    }

}