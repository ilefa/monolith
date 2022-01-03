/*
 * Copyright (c) 2022 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { PreferenceBundle } from '.';
import { bold, emboss, mentionChannel, Module, time } from '@ilefa/ivy';
import { Collection, GuildMember, Invite, TextChannel } from 'discord.js';

export class InviteTracker extends Module {

    private channelId: string;
    private channel: TextChannel;
    private stash: Collection<string, number>;

    constructor() {
        super('InviteTracker', 'Inviter');
    }

    async start() {
        const self = this;
        const bundle = this.manager.require<PreferenceBundle>('Prefs');

        if (!bundle) {
            this.manager.unregisterModule(this);
            this.warn('Failed to retrieve channelId from the preference bundle.');
            return;
        }

        this.channelId = bundle.inviterChannelId;
        this.stash = new Collection();

        this.client.on('guildMemberAdd', this.onJoin.bind(self));
        this.client.on('inviteCreate', this.onInviteCreated.bind(self));
        this.client.once('ready', client => client
            .channels
            .fetch(self.channelId)
            .then(channel => {
                self.channel = channel as TextChannel;
                self.channel.guild.invites.fetch().then(invites => {
                    for (let [_, invite] of invites) {
                        self.stash.set(invite.code, invite.uses);
                    }
                });
            })
            .catch(_ => null));

        this.log('Inviter is ready.');
    }

    end() {
        this.client.off('guildMemberAdd', this.onJoin);
        this.client.off('inviteCreate', this.onInviteCreated);
    }

    private async onJoin(member: GuildMember) {
        if (member.user.bot)
            return;

        let self = this;
        let guild = member.guild;
        let updated = await guild.invites.fetch();
        let invite = updated.find(invite => invite.uses > self.stash.get(invite.code));
        if (!invite) {
            this.channel.send(`<:alert:927457022310490162> Could not identify invite code used by ${bold(`${member.user.username}#${member.user.discriminator}`)} to join ${bold('AF')}.`);
            return;
        }

        this.stash.set(invite.code, invite.uses);
        this.channel.send(`<:invite:847320072153726986> ${bold(`${member.user.username}#${member.user.discriminator}`)} joined using invite code ${bold(invite.code)}.\n` 
                        + `<:transparent:923342438645502002> This invite was created by ${bold(`${invite.inviter.username}#${invite.inviter.discriminator}`)} on ${emboss(time(invite.createdAt.getTime()))} with target channel ${mentionChannel(invite.channel.id)}.\n` 
                        + `<:transparent:923342438645502002> As of joining, this invite has been used ${bold(invite.uses)} time${invite.uses === 1 ? '' : 's'}, and will expire on ${emboss(time(invite.expiresAt.getTime()))}.`);
    }

    private onInviteCreated = (invite: Invite) => {
        this.stash.set(invite.code, invite.uses);
    }

}