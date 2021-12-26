/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { LevelManager } from '../../../modules';
import { AutowiredCommand, CommandCategory } from '../../system';
import { EmbedIconType, getEmoteForXpPlacement } from '../../../util';
import { asMention, bold, capitalizeFirst, CommandReturn, emboss, toWords } from '@ilefa/ivy';

export class LeaderboardCommand extends AutowiredCommand<LevelManager> {
    
    constructor() {
        super('LevelManager', 'lb', `Invalid usage: ${emboss('.lb')}`, null, [], 'SEND_MESSAGES', false, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (!this.manager) {
            this.reply(message, this.embeds.build('Levels', EmbedIconType.XP, `Hmm, something went wrong - please try again.`, [], message));
            return CommandReturn.EXIT;
        }

        let users = await this.module.getLeaderboard(10);
        if (!users) {
            this.reply(message, this.embeds.build('Levels', EmbedIconType.XP, `Something went wrong while retrieving data from the web.`, [], message));
            return CommandReturn.EXIT;
        }

        let lines = users
            .map((bundle, i) => `${getEmoteForXpPlacement(i + 1)} ${asMention(bundle.userId)} at ${bold(`Level ${bundle.level.toLocaleString()}`)} with ${bold(bundle.totalXp.toLocaleString() + ' XP')} (${bundle.messages.toLocaleString()} :incoming_envelope:)`)
            .join('\n');

        this.reply(message, this.embeds.build('Levels', EmbedIconType.XP, `Top ${capitalizeFirst(toWords(Math.min(users.length, 10)))} Users for ${bold(message.guild.name)}\n\n${lines}`, [], message, null, message.guild.iconURL()));
        return CommandReturn.EXIT;
    }
}