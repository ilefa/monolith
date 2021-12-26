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
import { bold, CommandComponent, CommandReturn, emboss } from '@ilefa/ivy';

export class SelfAssignBirthdayCommand extends CommandComponent<BirthdayManager> {

    constructor() {
        super('set', 'set <mm/dd>', 'SEND_MESSAGES');
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (!this.manager) {
            this.host.reply(message, this.host.embeds.build('Birthday Management', EmbedIconType.PREFS, `Hmm, something went wrong - please try again.`, [], message));
            return CommandReturn.EXIT;
        }

        if (args.length !== 1)
            return CommandReturn.HELP_MENU;

        let birthday = args[0];
        if (!BirthdayCommand.BIRTHDAY_FORMAT_REGEX.test(birthday)) {
            this.host.reply(message, this.host.embeds.build('Birthday', EmbedIconType.BIRTHDAY, `Invalid birthday: ${emboss(birthday)}`, [
                {
                    name: 'Valid Format',
                    value: 'mm/dd'
                }
            ], message));
            return CommandReturn.EXIT;
        }

        await this.manager.createBirthday(user, birthday as BirthdayDateFormat,
            bundle => this.host.reply(message, this.host.embeds.build('Birthday', EmbedIconType.BIRTHDAY, `Your birthday is now ${bold(bundle.date)}.`, [], message)),
            () => this.host.reply(message, this.host.embeds.build('Birthday', EmbedIconType.BIRTHDAY, `You have already set your birthday.`, [], message)));

        return CommandReturn.EXIT;
    }

}