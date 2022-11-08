/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { PreferenceBundle } from '.';
import { EmbedFieldData, MessageEmbed, TextChannel } from 'discord.js';
import { bold, italic, mentionChannel, Module, time } from '@ilefa/ivy';
import { getMenu, DiningHallType, DiningHallStatus } from '@ilefa/blueplate';
import { EmbedIconType, getEmoteForDiningHall, getEmoteForMeal } from '../util';

type ActualStationProps = {
    name: string;
    options: string[];
}

type ThreadLinkEntry = {
    hall: string;
    link: string;
}

type ThreadDataEntry = {
    emote: string;
    name: string;
    link: string;
}

export class DinnerHallManager extends Module {

    public channelId: string;
    public tendiesChannelId: string;

    constructor() {
        super('DinnerHallManager', 'Dining');
    }

    start() {
        const bundle = this.manager.require<PreferenceBundle>('Prefs');

        if (!bundle) {
            this.manager.unregisterModule(this);
            this.warn('Failed to retrieve channelId from the preference bundle.');
            return;
        }

        this.channelId = bundle.blueplateChannelId;
        this.tendiesChannelId = bundle.tendiesChannelId;
        this.log('Blueplate Integration is ready.');
    }

    end() {}

    onUpdate = async () => {
        let channel = await this.client.channels.fetch(this.channelId) as TextChannel;
        if (!channel)
            return this.warn('Failed to retrieve channel.');

        await channel.bulkDelete(100);

        let types = Object.keys(DiningHallType) as Array<keyof typeof DiningHallType>;
        let menus = await Promise.all(types.map(type => getMenu(DiningHallType[type])));
        let embeds: MessageEmbed[] = [];
        
        for (let menu of menus) {
            let fields: EmbedFieldData[] = [];
            for (let meal of menu.meals) {
                let stations = meal.stations as any as ActualStationProps | ActualStationProps[];
                let str = '';
                // necessary for late night since it returns a non-array object
                if (stations instanceof Array)
                    str = stations
                        .map(station => `${bold(station.name)}\n${station.options.map(opt => `• ${opt}`).join('\n')}`)
                        .join('\n\n');
                else
                    str = `${bold(stations.name)}\n${stations.options.map(opt => `• ${opt}`).join('\n')}`;

                // major bag alert
                if (str.includes('Zesty Fried Chicken Tenders')) {
                    let tendiesChannel = await this.client.channels.fetch(this.tendiesChannelId) as TextChannel;
                    if (tendiesChannel) await tendiesChannel.send(`:tendies: chicken tendies at ${bold(DiningHallType[menu.type])}!!!!!`);
                }

                fields.push({
                    name: getEmoteForMeal(meal.name as DiningHallStatus) + ' ' + meal.name,
                    value: str + '\n',
                    inline: true
                });
            }

            if (!fields.length)
                continue;

            embeds.push(this.manager.engine.embeds.build(`${(menu as any).name} Menu`, EmbedIconType.UCONN, `Menu as of ${italic(time(menu.time.getTime()))}`, fields));
        }

        let threadLinks: ThreadLinkEntry[] = [];
        (await channel.threads.fetchActive()).threads.forEach(thread => thread.setArchived(true));

        for await (let embed of embeds) {
            let thread = await channel
                .threads
                .create({ name: `${embed.author.name.split(' Menu')[0]} — ${time(Date.now(), 'MMM Do, YYYY')}` });
                
            let tc = await thread.join();
            tc.send({ embeds: [embed] });
            tc.setLocked(true);
            
            threadLinks.push({ hall: embed.author.name, link: thread.id });
        }

        await channel.bulkDelete(100);

        let items: ThreadDataEntry[] = [];
        for (let t of types) {
            let m = menus.find(menu => menu.type === t);
            let ent = threadLinks.find(link => link.hall === (m as any).name + ' Menu');
            items.push({ emote: getEmoteForDiningHall(DiningHallType[t]), name: DiningHallType[t], link: ent?.link ? mentionChannel(ent.link) : 'Closed' });
        }

        let embed = this.manager.engine.embeds.build('Dinner Halls', EmbedIconType.UCONN, '', items.map(item => ({ name: item.emote + ' ' + item.name, value: item.link, inline: false })));
        channel.send({ embeds: [embed] });
    }

}