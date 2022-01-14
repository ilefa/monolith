/*
 * Copyright (c) 2022 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { PreferenceBundle } from '.';
import { BouncerBundle } from '../database';
import { bold, emboss, Module } from '@ilefa/ivy';
import { BeAnObject } from '@typegoose/typegoose/lib/types';
import { GuildMember, TextChannel, User } from 'discord.js';
import { getModelForClass, ReturnModelType } from '@typegoose/typegoose';

export class BouncerManager extends Module {

    private serverId: string;
    private channelId: string;
    private model: ReturnModelType<typeof BouncerBundle, BeAnObject>;

    constructor() {
        super('Bouncer', 'Bouncer');
    }

    start() {
        this.model = getModelForClass(BouncerBundle);
        const bundle = this.manager.require<PreferenceBundle>('Prefs');
        
        if (!bundle) {
            this.manager.unregisterModule(this);
            this.warn('Failed to retrieve data from the preference bundle.');
            return;
        }
        
        this.serverId = bundle.serverId;
        this.channelId = bundle.inviterChannelId;
        this.log('Bouncer is ready.');
    }

    end() {}

    /**
     * Returns a level bundle for a given user,
     * and creates + saves it, if it does not exist.
     * 
     * @param resolvable a user-resolvable object
     */
     getProfile = async (resolvable: User | string): Promise<BouncerBundle | null> => {
        let userId = resolvable instanceof User
            ? resolvable.id
            : resolvable;

        let profile = await this
            .model
            .findOne({ userId });

        return profile;
    }

    /**
     * Attempts to blacklist the provided user.
     * 
     * @param resolvable a user-resolvable object
     * @param then fired if the blacklist succeeds
     * @param error fired if the blacklist fails, with the reason
     */
    blacklist = async (resolvable: User | string, then: (user: string) => void, error: (reason: string) => void) => {
        let prof = await this.getProfile(resolvable);
        if (!!prof) return error('User is already blacklisted.');

        let userId = resolvable instanceof User
            ? resolvable.id
            : resolvable;

        let bundle = await this
            .model
            .create({ serverId: this.serverId, userId });

        await bundle.save();
        return then(userId);
    }

    /**
     * Attempts to unblacklist the provided user.
     * 
     * @param resolvable a user-resolvable object
     * @param then fired if the blacklist is removed
     * @param error fired if the unblacklist fails, with the reason
     */
    unblacklist = async (resolvable: User | string, then: (user: string) => void, error: (reason: string) => void) => {
        let prof = await this.getProfile(resolvable);
        if (!prof) return error('User is not blacklisted.');

        let userId = resolvable instanceof User
            ? resolvable.id
            : resolvable;

        await this
            .model
            .deleteOne({ userId });

        return then(userId);
    }

    /**
     * Attempts to return all blacklisted IDs from the database.
     */
    list = async () => {
        let profiles = await this
            .model
            .find({ serverId: this.serverId });

        return profiles.map(p => p.userId);
    }

    private onJoin = async (member: GuildMember) => {
        let prof = await this.getProfile(member.user);
        if (!prof)
            return;

        let role = member.guild.roles.cache.find(r => r.name === 'Unverified');
        if (!role)
            return;

        member.roles.add(role);

        let channel = member.guild.channels.cache.get(this.channelId) as TextChannel;
        if (!channel)
            return;

        channel.send(`:loudspeaker: Blacklisted user ${bold(`${member.user.username}#${member.user.discriminator}`)} joined ${bold('AF')}.\n` 
                   + `<:transparent:923342438645502002> Group policy applied: ${emboss('Unverified')}`);
    }

}