/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Auditor, EventKeys } from '.';

import {
    Client,
    Guild,
    GuildAuditLogsActions,
    GuildAuditLogsEntry,
    GuildMember,
    TextChannel,
    User
} from 'discord.js';

export abstract class AuditorProbe {

    manager: Auditor;
    client: Client;

    readonly DEFAULT_EXECUTOR = 'an unknown user'

    constructor(readonly name: string, readonly eventType: typeof EventKeys[number]) {}

    abstract report(...args: any[]): void;
    abstract shouldReport(...args: any[]): boolean;

    getReportsChannel = async () => {
        let channelId = this.manager.channelId;
        if (!channelId)
            return null;

        return await this
            .client
            .channels
            .fetch(channelId) as TextChannel;
    }

    asName = (member: GuildMember | User | null) => {
        if (!member)
            return 'an unknown user';

        if (member instanceof GuildMember)
            member = member.user;

        return member.username + '#' + member.discriminator;
    }

    getExecutor = async (guild: Guild, type: keyof GuildAuditLogsActions, limit = 1, fallback = this.DEFAULT_EXECUTOR): Promise<string> =>
        await this
            .getAuditEntry(guild, type, limit)
            .then(entry => entry
                ? this.asName(entry.executor)
                : fallback);

    getAuditEntry = async (guild: Guild, type: keyof GuildAuditLogsActions, limit = 1): Promise<GuildAuditLogsEntry> =>
        await guild
            .fetchAuditLogs({ type, limit })
            .then(logs => logs.entries.first())
            .then(entry => Date.now() - entry.createdTimestamp < 2000 ? entry : null)
            .catch(_ => null);

}