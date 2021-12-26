/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { PreferenceBundle } from '..';
import { AuditorProbe } from './probe';
import { Module, numberEnding } from '@ilefa/ivy';

export * from './probe';

export type AuditorEntry = {
    channel: string;
    events: string[];
    tracks: string[];
}

export type DuplicateEntryAction = {
    guild: string;
    entry: AuditorEntry;
}

export const EventKeys = [
    'channelCreate',
    'channelDelete',
    'channelPinsUpdate',
    'channelUpdate',
    'emojiCreate',
    'emojiDelete',
    'emojiUpdate',
    'guildBanAdd',
    'guildBanRemove',
    'guildIntegrationsUpdate',
    'guildMemberAdd',
    'guildMemberRemove',
    'guildMemberUpdate',
    'guildUpdate',
    'inviteCreate',
    'inviteDelete',
    'messageDelete',
    'messageDeleteBulk',
    'messageReactionRemoveAll',
    'messageUpdate',
    'roleCreate',
    'roleDelete',
    'roleUpdate',
    'voiceStateUpdate',
    'webhookUpdate'
] as const;

export class Auditor extends Module {

    channelId: string;
    probes: AuditorProbe[]; 

    readonly COG = '<:cog:847564995289284638>';
    readonly PIN = '<:pin:847284224540540941>';
    readonly CHANNEL = '<:channel:847304547516678194>';
    readonly CHANNEL_LOCKED = '<:channelLocked:847304547402907688>';
    readonly CHANNEL_NSFW = '<:channelNsfw:847304547302113331>';
    readonly CHANNEL_STAGE = '<:stageChannel:847304547473817650>';
    readonly EMOTE = '<:emote:847320072228962324>';
    readonly ROLE = '<:role:847320541270376468>';
    readonly JOIN = '<:join:848364382135779418>';
    readonly LEAVE = '<:leave:848364381645307926>';
    readonly INVITE = '<:invite:847320072153726986>';
    readonly MEMBERS = '<:members:847337907810467841>';
    readonly MENTION = '<:mention:847601027414753290>';
    readonly VOICE = '<:voice:847320072145862676>';
    readonly VOICE_LOCKED = '<:voiceLocked:847320072175353896>';
    readonly MUTE = '<:mute:847611885494992916>';
    readonly UNMUTE = '<:unmute:847611885406912542>';
    readonly DEAFEN = '<:deafen:847611885268631612>';
    readonly UNDEAFEN = '<:undeafen:847611887335899156>';
    readonly STREAM = '<:stream:847688506414596106>';
    readonly WIDGET = '<:widget:847615965084647474>';
    readonly VERIFIED = '<:verified:847618591858753609>';
    readonly WEBHOOK = '<:webhook:847690690976940032>';
    readonly DIVIDER = '<:transparent:923342438645502002>';

    constructor() {
        super('Auditor');
        this.probes = [];   
    }

    start() {
        let bundle = this.manager.require<PreferenceBundle>('Prefs');
        if (!bundle) {
            this.manager.unregisterModule(this);
            this.warn('Failed to retrieve channelId from the preference bundle.');
            return;
        }

        this.channelId = bundle.auditorChannelId;
        this.client.once('ready', () => {
            this.log(`Launched ${this.probes.length} investigation${numberEnding(this.probes.length)}.`);
            for (let event of EventKeys) {
                let handler = this.probes.find(handler => handler.eventType === event);
                if (!handler)
                    continue;
    
                this.client.on(event, (...args: any[]) => {
                    if (!handler.shouldReport(args))
                        return;

                    handler.report(args);
                });
            }
        });
    }
    
    end() {}

    registerProbe = (probe: AuditorProbe) => {
        let { logger } = this.manager.engine;
        if (this.hasDuplicateProbe(probe.eventType))
            return logger.warn('Auditor', `Blocked registration of probe \`${probe.name}\`, with duplicate event type \`${probe.eventType}\`.`);

        probe.manager = this;
        probe.client = this.client;
        this.probes.push(probe);
    }

    private hasDuplicateProbe = (eventType: string) => this.probes.some(probe => probe.eventType === eventType);

}