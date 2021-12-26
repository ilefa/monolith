/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { BirthdayCommand } from '.';
import { Message, User } from 'discord.js';
import { EmbedIconType } from '../../../util';
import { BirthdayManager } from '../../../modules';
import { BirthdayDateFormat } from '../../../database';

import {
    asMention,
    bold,
    CommandComponent,
    CommandReturn,
    emboss,
    findUser
} from '@ilefa/ivy';

export class AssignBirthdayCommand extends CommandComponent<BirthdayManager> {

    constructor() {
        super('assign', 'assign <@mention | id> <date>', 'ADMINISTRATOR');
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (!this.manager) {
            this.host.reply(message, this.host.embeds.build('Birthday Management', EmbedIconType.PREFS, `Could not autowire birthday manager, please investigate.`, [], message));
            return CommandReturn.EXIT;
        }

        if (args.length !== 2)
            return CommandReturn.HELP_MENU;

        let target = args[0];
        let date = args[1];

        if (!BirthdayCommand.BIRTHDAY_FORMAT_REGEX.test(date))
            return CommandReturn.HELP_MENU;

        let targetUser = await findUser(message, target, null);
        if (!targetUser) {
            this.host.reply(message, this.host.embeds.build('Birthday', EmbedIconType.BIRTHDAY, `Could not find target: ${emboss(target)}`, [], message));
            return CommandReturn.EXIT;
        }

        let entry = await this.manager.getBirthday(targetUser.id);
        if (entry) {
            await this.manager.updateBirthday(targetUser, date as BirthdayDateFormat,
                bundle => this.host.reply(message, this.host.embeds.build('Birthday', EmbedIconType.BIRTHDAY, `Updated ${asMention(bundle.user)}'s birthday to ${bold(bundle.date)}.`, [], message)),
                () => this.host.reply(message, this.host.embeds.build('Birthday', EmbedIconType.BIRTHDAY, `Could not update ${emboss(targetUser)}'s birthday.`, [], message)))
            return CommandReturn.EXIT;
        }

        await this.manager.createBirthday(targetUser, date as BirthdayDateFormat,
            bundle => this.host.reply(message, this.host.embeds.build('Birthday', EmbedIconType.BIRTHDAY, `${asMention(bundle.user)}'s birthday set to ${bold(bundle.date)}.`, [], message)),
            () => this.host.reply(message, this.host.embeds.build('Birthday', EmbedIconType.BIRTHDAY, `An error occurred while setting ${asMention(targetUser)}'s birthday!`, [], message)));

        return CommandReturn.EXIT;
    }

}