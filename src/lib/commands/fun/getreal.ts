/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { select } from 'weighted-map';
import { CommandCategory } from '../system';
import { User, Message, TextChannel } from 'discord.js';
import { EmbedIconType, isSuperPerms, PaginatedEmbed } from '../../util';

import {
    bold,
    Command,
    CommandReturn,
    emboss,
    link
} from '@ilefa/ivy';

const weightedMap = new Map<string, number>()
    .set('https://tenor.com/view/get-real-trombone-cruel-angels-thesis-gif-20305175', 1)
    .set('https://tenor.com/view/get-real-club-penguin-gif-20076242', 1)
    .set('https://tenor.com/view/getrealgetrealgetrealgetreal-get-real-getreal-gettingreal-gif-19961013', 1)
    .set('https://tenor.com/view/get-real-gif-20133241', 1)
    .set('https://tenor.com/view/get-real-real-landios-wimpy-kid-fuuny-gif-19349806', 1)
    .set('https://tenor.com/view/get-real-gif-19801109', 1)
    .set('https://tenor.com/view/get-real-chinese-egg-man-chinese-guy-eats-raw-eggs-raw-eggs-raw-eggs-chug-gif-19458097', 1)
    .set('https://tenor.com/view/omori-omori-sunny-sunny-omori-meme-gif-20309727', 1)
    .set('https://tenor.com/view/get-real-jungle-junglecord-gif-20306452', 1)
    .set('https://tenor.com/view/get-real-cat-skate-funny-meme-gif-18666878', 1)
    .set('https://tenor.com/view/get-real-nintendo-funny-gif-18779041', 1)
    .set('https://tenor.com/view/get-real-get-real-thomas-thomas-gif-20099097', 1)
    .set('https://tenor.com/view/get-real-gif-20267230', 1)
    .set('https://tenor.com/view/mcc-minecraft-championships-mc-championships-kaizodude-kaizo-gif-21249027', 1)
    .set('https://tenor.com/view/get-real-stickman-neon-dance-dancing-gif-20592187', 1)
    .set('https://tenor.com/view/getreal-get-real-please-do-not-get-fake-gif-20594592', 1)
    .set('https://tenor.com/view/sonic-the-hedgehog-sonic-get-real-get-real-gif-19386744', 1)
    .set('https://tenor.com/view/get-real-fortnite-gif-20397038', 1)
    .set('https://tenor.com/view/get-real-mario-karc-mario-kart-gif-21001616', 1)
    .set('https://tenor.com/view/get-real-cats-cat-kittens-gif-22323194', 1)
    .set('https://tenor.com/view/garfield-get-real-gif-22272639', 1)
    .set('https://tenor.com/view/get-real-chillpenguin-get-fake-htl-neufelden-gif-21811055', 1)
    .set('https://tenor.com/view/omori-omori-sunny-sunny-omori-meme-gif-20309727', 1)
    .set('https://tenor.com/view/get-real-flareon-eevee-pokemon-spin-gif-20184130', 1)
    .set('https://tenor.com/view/danganronpa-byakuya-cube-gif-20131981', 1)
    .set('https://tenor.com/view/among-us-funny-spunch-bop-spongebob-funny-funny-gif-20670568', 1)
    .set('https://tenor.com/view/spongebob-wavedash-get-real-gif-23012832', 1)
    .set('https://tenor.com/view/gd-geometry-dash-get-real-ballistic-wistfully-bw-gif-23518273', 1)
    .set('https://tenor.com/view/terraria-calamity-yharon-get-real-gif-20553133', 1)
    .set('https://tenor.com/view/obtain-realism-get-real-mario-gif-21036214', 1)
    .set('https://tenor.com/view/get-real-anime-doraemon-cartoon-gif-23853287', 1)
    .set('https://tenor.com/view/get-real-scylla-roblox-godzilla-ku-gif-21498614', 1)
    .set('https://tenor.com/view/get-real-apollo-justice-capcom-chair-throwing-gif-23410152', 1);

export class GetRealCommand extends Command {
    
    constructor() {
        super('getreal', `Invalid usage: ${emboss('.getreal')}`, null, [], 'SEND_MESSAGES', false, false, CommandCategory.FUN);
    }
    
    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 1)
            return CommandReturn.HELP_MENU;

        if (args.length === 1 && !isSuperPerms(this.engine, user))
            return CommandReturn.HELP_MENU;

        // hidden subcommand
        if (args.length === 1 && args[0] === 'list') {
            let arr = Array.from(weightedMap, ([gif, priority]) => ({ gif, priority }));
            PaginatedEmbed.ofItems(this.engine, message.channel as TextChannel, user, 'Get Real', EmbedIconType.TEST, arr, 10, items => {
                let list = `There are ${bold(weightedMap.size)} get real GIFs loaded and ready.\n\n${bold('Entries')}\n`;
                items.forEach(ent => {
                    list += ` • ${link(this._getDisplay(ent.gif), ent.gif)} (${ent.priority})\n`;
                });
    
                return {
                    description: list,
                    fields: [],
                }
            })

            return CommandReturn.EXIT;
        }
        
        message.channel.send(select(weightedMap));
        return CommandReturn.EXIT;
    }

    private _getDisplay = (link: string) => link
        .split('/view/')[1]
        .split(/-(?:\d{8})/)[0];

}