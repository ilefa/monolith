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
import { LevelBundle } from '../../../database';
import { AutowiredCommand, CommandCategory } from '../../system';
import { LevelManager, SurroundingUsers } from '../../../modules';

import {
    asMention,
    bold,
    CommandReturn,
    emboss,
    findUser,
    getLatestTimeValue,
    ordinalSuffix
} from '@ilefa/ivy';

export class RankCommand extends AutowiredCommand<LevelManager> {

    constructor() {
        super('LevelManager', 'rank', `Invalid usage: ${emboss('.rank [@mention | id]')}`, null, [], 'SEND_MESSAGES', false, false, CommandCategory.FUN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (!this.manager) {
            this.reply(message, this.embeds.build('Levels', EmbedIconType.MESSAGE, `Hmm, something went wrong - please try again.`, [], message));
            return CommandReturn.EXIT;
        }

        if (args.length > 1)
            return CommandReturn.HELP_MENU;

        let target = await findUser(message, args[0], user);
        if (!target) {
            this.reply(message, this.embeds.build('Levels', EmbedIconType.XP, `Invalid or unknown target: ${emboss(args[0])}`, [], message));
            return CommandReturn.EXIT;
        }

        let self = target.id === user.id;
        let profile = await this.module.getProfile(target);
        if (!profile) {
            this.reply(message, this.embeds.build('Levels', EmbedIconType.XP, `Something went wrong while retrieving data from the web.`, [], message));
            return CommandReturn.EXIT;
        }

        let current = profile.xp;
        let needed = this.module.getXpForLevel(profile.level + 1);
        let percent = current / needed;
        let amount = Math.floor((percent * 10));
        let recharge = this.module.getRechargeStatus(user);
        let surrounding = await this.module.getSurroundingUsers(user);
        let position = await this.module.getLeaderboardPosition(target) + 1;

        let leveling = `:left_right_arrow: ${current.toLocaleString()}/${needed.toLocaleString()} XP [${'▰'.repeat(amount)}${'▱'.repeat((10 - amount))}] (${(percent * 100).toFixed(2)}%)`;

        let who = self
            ? 'You'
            : asMention(target); 

        let after = who === 'You'
            ? 'are'
            : 'is';

        let str = `${bold('Leaderboard Overview')}` 
            + `\n${who} ${after} ${bold(ordinalSuffix(position))} on the leaderboard.`
            + `\n${who} ${after} ${bold(`Level ${profile.level.toLocaleString()}`)} with ${bold(profile.totalXp.toLocaleString() + ' XP')} and ${bold(profile.messages.toLocaleString() + ` message${profile.messages === 1 ? '' : 's'}`)}.`
            + (recharge.active ? `\n:triangular_flag_on_post: Recharging for another ${bold(getLatestTimeValue(recharge.time))}.` : '')
            + `\n\n${bold('Leveling')}`
            + `\n${leveling}`
            + `\n\n${bold('Ranking Insights')}` 
            + `\n${!surrounding.upwards
                    ? `:first_place: ${who} ${after} at the top of the leaderboard.` 
                    : `:arrow_down: ${who} ${after} ${bold(this.getUpwardXpDifference(profile, surrounding).toLocaleString() + ' XP')} behind ${asMention(surrounding.upwards.userId)}`}` 
            + `\n${!surrounding.downwards 
                    ? `:upside_down: ${who} ${after} at the bottom of the leaderboard.` 
                    : `:arrow_up: ${who} ${after} ${bold(this.getDownwardXpDifference(profile, surrounding).toLocaleString() + ' XP')} ahead of ${asMention(surrounding.downwards.userId)}`}`;

        this.reply(message, this.embeds.build('Levels', EmbedIconType.XP, str, [], message, null, user.avatarURL()));
        return CommandReturn.EXIT;
    }

    private getUpwardXpDifference = (profile: LevelBundle, surrounding: SurroundingUsers) => surrounding.upwards.totalXp - profile.totalXp;

    private getDownwardXpDifference = (profile: LevelBundle, surrounding: SurroundingUsers) => profile.totalXp - surrounding.downwards.totalXp;
}