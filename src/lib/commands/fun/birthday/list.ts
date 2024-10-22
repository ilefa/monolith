/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { EmbedIconType } from '../../../util';
import { BirthdayManager } from '../../../modules';
import { Message, TextChannel, User } from 'discord.js';
import { BirthdayBundle, BirthdayDateFormat } from '../../../database';

import {
    asMention,
    bold,
    CommandComponent,
    CommandReturn,
    PageContent,
    PaginatedEmbed
} from '@ilefa/ivy';

type CollapsedBirthdayEntries = {
    users: User[];
    date?: BirthdayDateFormat;
}

export class ListBirthdaysCommand extends CommandComponent<BirthdayManager> {

    constructor() {
        super('list', 'list', 'SEND_MESSAGES');
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (!this.manager) {
            this.host.reply(message, this.host.embeds.build('Birthdays', EmbedIconType.PREFS, `mm, something went wrong - please try again.`, [], message));
            return CommandReturn.EXIT;
        }

        if (args.length !== 0)
            return CommandReturn.HELP_MENU;

        let birthdays = await this.manager.getBirthdays();
        if (birthdays.length === 0) {
            this.host.reply(message, this.host.embeds.build('Birthdays', EmbedIconType.BIRTHDAY, 'Nobody has set their birthdays yet.', [], message));
            return CommandReturn.EXIT;
        }

        birthdays = birthdays.sort(this.sortBirthdays);

        PaginatedEmbed.ofItems<BirthdayBundle>(
            this.host.engine, message.channel as TextChannel, user,
            'Birthdays', EmbedIconType.BIRTHDAY, birthdays, 20,
            this.generatePageContent
        );

        return CommandReturn.EXIT;
    }

    private sortBirthdays = (a: BirthdayBundle, b: BirthdayBundle) => {
        let aMonth = parseInt(a.date.split('/')[0]);
        let bMonth = parseInt(b.date.split('/')[0]);
        if (aMonth !== bMonth)
            return aMonth - bMonth;

        let aDay = parseInt(a.date.split('/')[1]);
        let bDay = parseInt(b.date.split('/')[1]);
        return aDay - bDay;
    }

    private generatePageContent = (bundles: BirthdayBundle[]): PageContent => {
        let collapsed = this.coalesce(bundles);
        let description = collapsed
            .map(bundle => `${bold(bundle.date + ':')} ${bundle.users.map(asMention).join(', ')}`)
            .join('\n');

        return { description, fields: [] };
    }

    private coalesce = (bundles: BirthdayBundle[]): CollapsedBirthdayEntries[] => {
        let entries: CollapsedBirthdayEntries[] = [];
        let current: CollapsedBirthdayEntries = { users: [] };
        for (let bundle of bundles) {
            if (current.date === undefined)
                current.date = bundle.date;

            if (current.date !== bundle.date) {
                entries.push(current);
                current = { users: [], date: bundle.date };
            }

            current.users.push(this.host.manager.client.users.cache.get(bundle.user));
        }

        if (current.users.length !== 0)
            entries.push(current);

        return entries;
    }

}