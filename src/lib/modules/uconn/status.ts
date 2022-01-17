/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { PreferenceBundle } from '..';
import { TextChannel } from 'discord.js';
import { EmbedIconType } from '../../util';
import { bold, link, Module, Stash } from '@ilefa/ivy';
import { UConnService, UConnServiceStatus } from '@ilefa/husky';

export type StatusReport = {
    service: string;
    status: UConnServiceStatus;
    time: number;
}

enum UConnServiceUrls {
    AURORA = 'https://aurora.uconn.edu/',
    EMAIL = 'https://email.uconn.edu',
    HUSKYCT = 'https://lms.uconn.edu',
    NETID = 'https://netid.uconn.edu',
    STUDENT_ADMIN = 'https://studentadmin.uconn.edu',
}

export enum UConnServiceEmotes {
    AURORA = ':globe_with_meridians:',
    EMAIL = ':incoming_envelope:',
    HUSKYCT = ':man_teacher:',
    NETID = ':man_detective:',
    STUDENT_ADMIN = ':pushpin:',
    CATALOG = ':books:',
    PHONEBOOK = ':telephone:',
    COBALT = '<:cobalt2:922017306035494932>',
    COBALT_NEXT = '<:cobalt2:922017306035494932>',
    SNAPSHOTS = '<:snapshots:932449252708352031>',
    ILEFA = '<:ilefa:926347172050526278>',
    RMP = ':pencil:',
}

export enum ServiceStatusEmote {
    OPERATIONAL = '<:green:848364257434927125>',
    REPORTING = '<:blue:848364257577271296>',
    DEGRADED = '<:yellow:848364257640054805>',
    OUTAGE = '<:red:848364257569407066>',
    UNKNOWN = '<:gray:848364257644773416>'
}

export type TrackedService = {
    key: string;
    name: string;
    url: string;
}

export const SERVICES: TrackedService[] = [
    ...Object
        .keys(UConnService)
        .filter(key => Object
            .keys(UConnServiceEmotes)
            .includes(key))
        .map(key => ({
            key,
            name: UConnService[key],
            url: UConnServiceUrls[key]
        })),
    {
        key: 'catalog',
        name: 'Course Catalog',
        url: 'https://catalog.uconn.edu/directory-of-courses'
    },
    {
        key: 'phonebook',
        name: 'Phonebook',
        url: 'https://phonebook.uconn.edu'
    },
    {
        key: 'cobalt',
        name: 'Cobalt',
        url: 'https://cobalt.ilefa.club',
    },
    {
        key: 'cobalt_next',
        name: 'Cobalt (v4)',
        url: 'https://cobalt-v4.ilefa.club',
    },
    {
        key: 'snapshots',
        name: 'Snapshots',
        url: 'https://snapshots.ilefa.club',
    },
    {
        key: 'ilefa',
        name: 'ILEFA',
        url: 'https://ilefa.club',
    },
    {
        key: 'rmp',
        name: 'RateMyProfessors',
        url: 'https://ratemyprofessors.com',
    }
];

export class UConnStatusRepository extends Module {

    public stash: Stash<string, StatusReport>;
    private channelId: string;
    
    constructor() {
        super('UConnStatusRepository', 'Status Repository');
    }

    start = () => {
        this.stash = new Stash({
            keyspace: {
                delimiter: '.',
                prefix: 'uconn.status',
                serialize: key => key,
                deserialize: key => key,
            },
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT),
            expiry: 120,
            serializers: {
                resultTransformer: JSON.parse,
                typeTransformer: JSON.stringify
            }
        });

        let bundle = this.manager.require<PreferenceBundle>('Prefs');
        if (!bundle)
            return this.warn('Could not fetch PreferenceBundle');
        
        let channelId = bundle.statusChannelId;
        if (!channelId)
            return this.warn('UConnStatusFetcher: Could not fetch status reporting channel');
        
        this.channelId = channelId;
    }

    end() {}

    /**
     * Attempts to retrieve the statuses of specified services.
     * 
     * @param all whether or not to return all services
     * @param service a list of services to retrieve statuses for
     */
    get = async (all: boolean, ...service: string[]): Promise<StatusReport[]> => {
        if (all)
            service = SERVICES.map(s => s.key.toLowerCase());

        return Promise.all(service.map(async name => await this.stash.retrieve(name)));
    } 

    onUpdate = async () => {
        let channel = await this.client.channels.fetch(this.channelId) as TextChannel;
        let all = await this.get(true);

        let moreInfo = `For more information, check out the ${link('IT Status', 'https://itstatus.uconn.edu/')} website.`;
        let status = all.every(s => s.status === UConnServiceStatus.OPERATIONAL) 
            ? 'All services are currently operational.'
            : all.every(s => s.status !== UConnServiceStatus.OUTAGE) && all.some(s => s.status === UConnServiceStatus.DEGRADED)
                ? `Some services are currently experiencing performance degradation.\n${moreInfo}`
                : `Some services are currently unavailable as a result of an outage.\n${moreInfo}`;

        let message = (await channel.messages.fetch({ limit: 1 })).first();
        let embed = this.manager.engine.embeds.build('System Status', EmbedIconType.PREFS,
            `${bold('At a glance')}\n` 
                + status + '\n',
            all.map(entry => ({
                name: `${UConnServiceEmotes[entry.service.toUpperCase()]} ${SERVICES.find(s => s.key.toLowerCase() === entry.service).name}`,
                value: `${ServiceStatusEmote[entry.status.toUpperCase()]} ${entry.status}`,
                inline: false
            })));

        if (!message)
            return channel.send({ embeds: [embed] });

        message.edit({ embeds: [embed] });
    }

}