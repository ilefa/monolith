/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Task } from '..';
import { asMention } from '@ilefa/ivy';
import { TextChannel } from 'discord.js';
import { EmbedIconType } from '../../util';
import { BirthdayManager, PreferenceBundle } from '../../modules';

export class BirthdayAnnounceTask extends Task {

    constructor() {
        super('birthday');
    }

    run = async () => {
        const mm = this.scheduler.manager;
        const client = this.scheduler.client;
        const manager = mm.require<BirthdayManager>('BirthdayManager');
        const bundle = mm.require<PreferenceBundle>('Prefs');
        
        const channel = await client.channels.fetch(bundle.birthdayChannelId) as TextChannel;
        if (!channel)
            return;

        const birthdays = await manager.getBirthdays();
        const date = new Date();
        const today = `${date.getMonth() + 1}/${date.getDate()}`;

        const birthdaysToAnnounce = birthdays.filter(birthday => birthday.date === today);
        if (birthdaysToAnnounce.length === 0)
            return;

        const embed = mm.engine.embeds.build(`${today} — Birthdays`, EmbedIconType.BIRTHDAY,
            `Happy Birthday ${birthdaysToAnnounce.length === 1
                ? asMention(birthdaysToAnnounce[0].user)
                : birthdaysToAnnounce
                    .map(({ user }) => asMention(user))
                    .join(', ')}!`, []);

        channel.send({ embeds: [embed] })
    }

}