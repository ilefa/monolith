/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { EmbedIconType } from '../../util';
import { CommandCategory } from '../system';
import { Message, Permissions, User } from 'discord.js';

import {
    asMention,
    bold,
    Command,
    CommandReturn,
    emboss
} from '@ilefa/ivy';

export class InvitesCommand extends Command {

    constructor() {
        super('invites', `Invalid usage: ${emboss('.invites')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false, false, CommandCategory.INFO);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let invites = await message.guild.invites.fetch();
        if (!invites || invites.size === 0) {
            this.reply(message, this.embeds.build('Invites Overview', EmbedIconType.MEMBER, `There are no active invites for ${bold(message.guild.name)}.`, null, message));
            return CommandReturn.EXIT;
        }
        
        let str = invites
            .sort((a, b) => b.uses - a.uses)
            .map((invite, _) => `${bold(`[${invite.code}]`)} by ${asMention(invite.inviter)} (${invite.uses.toLocaleString()} uses)`)
            .slice(0, 24)
            .join('\n');

        this.reply(message, this.embeds.build('Invites Overview', EmbedIconType.MEMBER, str.trimEnd(), null, message));
        return CommandReturn.EXIT;
    }

}