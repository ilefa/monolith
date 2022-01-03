/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { AuditorProbe } from '..';
import { Guild, GuildFeatures } from 'discord.js';

import {
    asMention,
    bold,
    codeBlock,
    cond,
    emboss,
    getLatestTimeValue,
    GREEN_CIRCLE,
    mentionChannel,
    numberEnding,
    RED_CIRCLE
} from '@ilefa/ivy';

enum GuildUpdateCause {
    NAME,
    ICON,
    AFK_CHANNEL,
    AFK_TIMEOUT,
    REGION,
    SYSTEM_CHANNEL,
    WELCOME_MESSAGE,
    BOOST_MESSAGE,
    NOTIFICATIONS,
    GUILD_FEATURES,
    VERIFICATION_LEVEL,
    MEDIA_FILTER,
    MFA_REQUIREMENT,
    WIDGET_STATUS,
    WIDGET_CHANNEL,
    RULES_CHANNEL,
    UPDATES_CHANNEL,
    PRIMARY_LANGUAGE,
    SERVER_DESCRIPTION,
    BANNER,
    DISCOVERY_IMAGE,
    SPLASH_IMAGE,
    OWNER_CHANGE,
    VANITY_URL,
    VERIFIED,
    UNKNOWN
}

enum FeatureChangeStatus {
    ADD, REMOVE
}

enum VerificationLevels {
    NONE = '<:offline:808585033890791424>',
    LOW = '<:blue:836447279782297640>',
    MEDIUM = '<:online:808585033899966464>',
    HIGH = '<:idle:808585033908224010>',
    VERY_HIGH = '<:dnd:808585033991585802>'
}

enum MediaFilterNames {
    DISABLED = 'Nobody',
    MEMBERS_WITHOUT_ROLES = 'Members without Roles',
    ALL_MEMBERS = 'All Members'
}

enum MfaLevelNames {
    NONE = 'None',
    ELEVATED = 'MFA Required for Staff'
}

type FeatureWrapper = {
    status: FeatureChangeStatus;
    feature: GuildFeatures;
}

export class GuildUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Update', 'guildUpdate');
    }
    
    report = async (...args: any[]) => {
        let a: Guild = args[0][0];
        let b: Guild = args[0][1];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        reports.send(await this.generateChangeMessage(a, b, this.detectChange(a, b)));
    }

    shouldReport = (...args: any[]): boolean => true;

    private generateChangeMessage = async (a: Guild, b: Guild, cause: GuildUpdateCause) => {
        let report = await this.getAuditEntry(a, 'GUILD_UPDATE');
        let executor = this.asName(report?.executor);

        if (cause == GuildUpdateCause.UNKNOWN)
            return `${this.manager.COG} ${bold(b.name)} was somehow updated by ${bold(executor)}.`;
        
        if (cause == GuildUpdateCause.NAME)
            return `${this.manager.COG} ${bold(executor)} renamed ${bold(a.name)} to ${bold(b.name)}.`;

        if (cause == GuildUpdateCause.ICON)
            return `${this.manager.COG} ${bold(executor)} updated ${bold(b.name + '\'s')} guild icon.\n` 
                 + `${this.manager.DIVIDER} Old: ${emboss(a.icon)}\n` 
                 + `${this.manager.DIVIDER} New: ${emboss(b.icon)}`;

        if (cause == GuildUpdateCause.AFK_CHANNEL)
            return `${this.manager.COG} ${bold(executor)} ${!b.afkChannel ? 'unset' : 'set'} the AFK channel${!b.afkChannel ? '' : `to ${mentionChannel(b.afkChannelId)}`}.`;

        if (cause == GuildUpdateCause.AFK_TIMEOUT)
            return `${this.manager.COG} ${bold(executor)} ${!b.afkTimeout ? 'unset' : 'set'} the AFK timeout${!b.afkTimeout ? '': `to ${bold(getLatestTimeValue(b.afkTimeout * 1000))}`}.`;

        if (cause == GuildUpdateCause.SYSTEM_CHANNEL)
            return `${this.manager.COG} ${bold(executor)} ${!b.systemChannelId ? 'unset' : 'set'} the system channel ${!b.systemChannel ? '' : `to ${mentionChannel(b.systemChannelId)}`}.`;

        if (cause == GuildUpdateCause.WELCOME_MESSAGE)
            return `${this.manager.MENTION} ${bold(executor)} ${b.systemChannelFlags.has('SUPPRESS_JOIN_NOTIFICATIONS') ? 'disabled' : 'enabled'} welcome messages.`;

        if (cause == GuildUpdateCause.BOOST_MESSAGE)
            return `${this.manager.MENTION} ${bold(executor)} ${cond(b.systemChannelFlags.has('SUPPRESS_PREMIUM_SUBSCRIPTIONS'), 'disabled', 'enabled')} boost messages.`;

        if (cause == GuildUpdateCause.NOTIFICATIONS)
            return `${this.manager.MENTION} ${bold(executor)} set default notifications to ${bold(cond(b.defaultMessageNotifications === 'ALL_MESSAGES', 'All Messages', 'Mentions Only'))}.`;

        if (cause == GuildUpdateCause.GUILD_FEATURES) {
            let old = a.features;
            let cur = b.features;
            let diff = this.getDifferences(old, cur);
            let added = this.wrapRoles(this.getDifferences(cur, old), FeatureChangeStatus.ADD);
            let removed = this.wrapRoles(diff, FeatureChangeStatus.REMOVE);

            let allChanges = [...added, ...removed]
                .sort((a, b) => a.feature.localeCompare(b.feature))
                .sort((a, b) => a.status - b.status);

            return `${this.manager.COG} ${bold(`${diff.length} feature${numberEnding(diff.length)}`)} were altered for ${bold(b.name)}.\n` 
                    + allChanges
                        .map(ent => 
                            cond(ent.status === FeatureChangeStatus.ADD, GREEN_CIRCLE, RED_CIRCLE) + ` ${ent.feature}`)
                        .join('\n');

        }

        if (cause == GuildUpdateCause.VERIFICATION_LEVEL)
            return `${this.manager.COG} ${bold(executor)} changed the server verification level to ${bold(b.verificationLevel)}.`;

        if (cause == GuildUpdateCause.MEDIA_FILTER)
            return `${this.manager.COG} ${bold(executor)} made media filtering apply towards ${bold(MediaFilterNames[b.explicitContentFilter])}.`;

        if (cause == GuildUpdateCause.MFA_REQUIREMENT)
            return `${this.manager.COG} ${bold(executor)} changed the 2FA requirement to ${bold(MfaLevelNames[b.mfaLevel])}`;

        if (cause == GuildUpdateCause.WIDGET_STATUS)
            return `${this.manager.WIDGET} ${bold(executor)} ${bold(cond(b.widgetEnabled, 'enabled', 'disabled'))} the Server Widget.`;

        if (cause == GuildUpdateCause.WIDGET_CHANNEL)
            return `${this.manager.WIDGET} ${bold(executor)} ${!b.widgetChannelId ? 'unset' : 'changed'} the server widget channel ${!b.widgetChannel ? '' : `to ${mentionChannel(b.widgetChannelId)}`}.`;

        if (cause == GuildUpdateCause.RULES_CHANNEL)
            return `${this.manager.COG} ${bold(executor)} set the rules channel to ${mentionChannel(b.rulesChannelId)}.`;

        if (cause == GuildUpdateCause.UPDATES_CHANNEL)
            return `${this.manager.COG} ${bold(executor)} set the updates channel to ${mentionChannel(b.publicUpdatesChannelId)}.`;

        if (cause == GuildUpdateCause.PRIMARY_LANGUAGE)
            return `${this.manager.COG} ${bold(executor)} changed the server locale to ${bold(b.preferredLocale)}.`;

        if (cause == GuildUpdateCause.SERVER_DESCRIPTION)
            return `${this.manager.COG} ${bold(executor)} updated the server description:\n${codeBlock('', b.description)}`;

        if (cause == GuildUpdateCause.BANNER)
            return `${this.manager.COG} ${bold(executor)} updated the server banner.\n` 
                 + !!a.banner ? `${this.manager.DIVIDER} Old: ${emboss(a.banner)}\n` : ''
                 + `${this.manager.DIVIDER} ${!!a.banner ? 'New' : 'Banner'}: ${emboss(b.banner)}`;

        if (cause == GuildUpdateCause.DISCOVERY_IMAGE)
            return `${this.manager.COG} ${bold(executor)} updated the Discovery Splash Image.\n` 
                 + !!a.discoverySplash ? `${this.manager.DIVIDER} Old: ${emboss(a.discoverySplash)}\n` : ''
                 + `${this.manager.DIVIDER} ${!!a.discoverySplash ? 'New' : 'Splash Image'}: ${emboss(b.discoverySplash)}`;

        if (cause == GuildUpdateCause.SPLASH_IMAGE)
            return `${this.manager.COG} ${bold(executor)} updated the Invite Splash Image.\n` 
                 + !!a.splash ? `${this.manager.DIVIDER} Old: ${emboss(a.splash)}\n` : ''
                 + `${this.manager.DIVIDER} ${!!a.splash ? 'New' : 'Splash Image'}: ${emboss(b.splash)}`;

        if (cause == GuildUpdateCause.OWNER_CHANGE)
            return `${this.manager.COG} ${asMention(a.ownerId)} transferred ownership of ${bold(b.name)} to ${asMention(b.ownerId)}.`;

        if (cause == GuildUpdateCause.VANITY_URL)
            return `${this.manager.COG} ${bold(executor)} updated the Server Vanity URL.\n` 
                 + !!a.vanityURLCode ? `${this.manager.DIVIDER} Old: ${emboss('discord.gg/' + a.vanityURLCode)}\n` : ''
                 + `${this.manager.DIVIDER} ${!!a.vanityURLCode ? 'New' : 'Vanity URL'}: ${emboss('discord.gg/' + b.vanityURLCode)}`;

        if (cause == GuildUpdateCause.VERIFIED)
            return `${this.manager.VERIFIED} ${bold(b.name)} is ${cond(b.verified, 'now', 'no longer')} verified. ${b.verified ? bold('(Woohoo!)') : ''}`;

    }

    private wrapRoles = (entries: GuildFeatures[], status: FeatureChangeStatus): FeatureWrapper[] => {
        return entries.map(feature => {
            return {
                status,
                feature,
            }
        });
    }

    private getDifferences = (a: GuildFeatures[], b: GuildFeatures[]) => {
        return b.filter(elem => !a.some(val => val == elem));
    }

    private detectChange = (a: Guild, b: Guild) => {
        if (a.name !== b.name)
            return GuildUpdateCause.NAME;

        if (a.icon !== b.icon)
            return GuildUpdateCause.ICON;

        if (a.afkChannelId !== b.afkChannelId)
            return GuildUpdateCause.AFK_CHANNEL;

        if (a.afkTimeout !== b.afkTimeout)
            return GuildUpdateCause.AFK_TIMEOUT;

        if (a.systemChannelId !== b.systemChannelId)
            return GuildUpdateCause.SYSTEM_CHANNEL;

        if (a.systemChannelFlags.bitfield !== b.systemChannelFlags.bitfield) {
            if (a.systemChannelFlags.has('SUPPRESS_PREMIUM_SUBSCRIPTIONS') !== b.systemChannelFlags.has('SUPPRESS_PREMIUM_SUBSCRIPTIONS'))
                return GuildUpdateCause.BOOST_MESSAGE;

            if (a.systemChannelFlags.has('SUPPRESS_JOIN_NOTIFICATIONS') !== b.systemChannelFlags.has('SUPPRESS_JOIN_NOTIFICATIONS'))
                return GuildUpdateCause.WELCOME_MESSAGE;
        }

        if (a.defaultMessageNotifications !== b.defaultMessageNotifications)
            return GuildUpdateCause.NOTIFICATIONS;

        if (b.features.some(val => !a.features.includes(val)))
            return GuildUpdateCause.GUILD_FEATURES;

        if (a.verificationLevel !== b.verificationLevel)
            return GuildUpdateCause.VERIFICATION_LEVEL;

        if (a.explicitContentFilter !== b.explicitContentFilter)
            return GuildUpdateCause.MEDIA_FILTER;

        if (a.mfaLevel !== b.mfaLevel)
            return GuildUpdateCause.MFA_REQUIREMENT;

        if (a.widgetEnabled !== b.widgetEnabled)
            return GuildUpdateCause.WIDGET_STATUS;

        if (a.widgetChannelId !== b.widgetChannelId)
            return GuildUpdateCause.WIDGET_CHANNEL;

        if (a.rulesChannelId !== b.rulesChannelId)
            return GuildUpdateCause.RULES_CHANNEL;

        if (a.publicUpdatesChannelId !== b.publicUpdatesChannelId)
            return GuildUpdateCause.UPDATES_CHANNEL;

        if (a.preferredLocale !== b.preferredLocale)
            return GuildUpdateCause.PRIMARY_LANGUAGE;

        if (a.description !== b.description)
            return GuildUpdateCause.SERVER_DESCRIPTION;

        if (a.banner !== b.banner)
            return GuildUpdateCause.BANNER;

        if (a.discoverySplash !== b.discoverySplash)
            return GuildUpdateCause.DISCOVERY_IMAGE;

        if (a.splash !== b.splash)
            return GuildUpdateCause.SPLASH_IMAGE;

        if (a.ownerId !== b.ownerId)
            return GuildUpdateCause.OWNER_CHANGE;

        if (a.vanityURLCode !== b.vanityURLCode)
            return GuildUpdateCause.VANITY_URL;

        if (a.verified !== b.verified)
            return GuildUpdateCause.VERIFIED;

        return GuildUpdateCause.UNKNOWN;
    }

}