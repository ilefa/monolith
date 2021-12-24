/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { PreferenceBundle } from '.';
import { GuildMember, TextChannel } from 'discord.js';
import { asMention, bold, mentionChannel, Module } from '@ilefa/ivy';

export class WelcomeManager extends Module {

    private channel: TextChannel;
    private channelId: string;

    constructor() {
        super('WelcomeManager', 'Greeter');
    }

    start() {
        const self = this;
        const bundle = this.manager.require<PreferenceBundle>('Prefs');

        if (!bundle) {
            this.manager.unregisterModule(this);
            this.warn('Failed to retrieve channelId from the preference bundle.');
            return;
        }

        this.channelId = bundle.welcomeChannelId;

        this.client.on('guildMemberAdd', self.onWelcome);
        this.client.on('ready', client => client
            .channels
            .fetch(self.channelId)
            .then(channel => self.channel = channel as TextChannel)
            .catch(_ => null));

        this.log('Greeter is ready.');
    }

    end() {
        this.client.off('guildMemberAdd', this.onWelcome);
    }

    private onWelcome = (member: GuildMember) => {
        if (!this.channel)
            return;

        this.channel.send(`Welcome to ${bold('AF')}, ${asMention(member.user)}!`
            + `\n:blue_book: Read about the server, our rules, and assign your roles in ${mentionChannel('922014878116503572')}.`);
    }

}