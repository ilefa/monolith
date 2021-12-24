/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { User, Message } from 'discord.js';
import { CommandCategory } from '../system';
import { RoleAssignmentManager } from '../../modules';
import { bold, Command, CommandReturn, emboss, IvyEmbedIcons } from '@ilefa/ivy';

export class AssignRoleCommand extends Command {
    
    roleManager: RoleAssignmentManager;

    constructor() {
        super('role', `Invalid usage: ${emboss('.role <role>')}`, null, [], 'SEND_MESSAGES', false, false, CommandCategory.ROLE);
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

        if (args.length < 1)
            return CommandReturn.HELP_MENU;

        let roleName = args.join(' ');
        let member = message.member;

        let role = await this.roleManager.getRoleByName(roleName);
        if (!role) {
            this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `I couldn't find a role called ${bold(roleName)}.`, [], message));
            return CommandReturn.EXIT;
        }

        if (await this.roleManager.userHasRole(role.displayName, member)) {
            this.roleManager.removeRoleFromUser(role.displayName, member,
                bundle => this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `Removed ${bold(bundle.displayName)} from you.`, [], message)),
                () => this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `Could not remove ${bold(role)} from you.`, [], message)));
            return CommandReturn.EXIT;
        }

        this.roleManager.applyRoleToUser(role.displayName, member,
            bundle => this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `Added ${bold(bundle.displayName)} to you.`, [], message)),
            () => this.reply(message, this.embeds.build('Roles', IvyEmbedIcons.MEMBER, `Could not grant you the ${bold(role)} role.`, [], message)));

        return CommandReturn.EXIT;
    }

}