/*
 * Copyright (c) 2022 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { PreferenceBundle } from '.';
import { bold, Module } from '@ilefa/ivy';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { status, JavaStatusResponse } from 'minecraft-server-util';

export class MinecraftStatusManager extends Module {
   
    private channelId: string;

    private readonly EMBED_ICON = 'https://cdn.discordapp.com/attachments/784858138964262932/932077309131911168/grass.png';
    private readonly SERVER_ADDR = 'mc.ilefa.club';
    private readonly SERVER_PORT = 25565;
    private readonly SOCKET_TIMEOUT = 10 * 1000;
    private readonly VERSION = '1.18.x';
   
    constructor() {
        super('MinecraftStatus', 'Minecraft');
    }

    start() {
        let bundle = this.manager.require<PreferenceBundle>('Prefs');
        if (!bundle)
            return this.warn('Could not fetch PreferenceBundle');
        
        let channelId = bundle.minecraftChannelId;
        if (!channelId)
            return this.warn('Could not fetch status reporting channel');
        
        this.channelId = channelId;
        this.log('Minecraft Status Tracker is ready.');
    }

    end() {}

    onUpdate = async () => {
        if (!this.channelId)
            return;
     
        let channel = await this.manager.client.channels.fetch(this.channelId) as TextChannel;
        if (!channel)
            return;
        
        let server: JavaStatusResponse['players'] = await status(this.SERVER_ADDR, this.SERVER_PORT, { timeout: this.SOCKET_TIMEOUT })
            .then(res => ({ ...res.players }))
            .catch(_ => null);

        let messages = await channel.messages.fetch({ limit: 1 });
        let lastMessage = messages.first();

        if (!server) {
            let embed = this.manager.engine.embeds.build('Minecraft Status', this.EMBED_ICON,
                `<:red:848364257569407066> ${bold('Currently offline')}\nHmm, that's weird - we couldn't ping the server.\n\nSometimes the socket can timeout even when the server is online,\ntry joining the server to ensure that this is not the case.\n\nConnect to ${bold(this.SERVER_ADDR)} using ${bold(this.VERSION)}!`)
            this.editOrSend(channel, embed, lastMessage);
            return;
        }
        
        let embed = this.manager.engine.embeds.build('Minecraft Status', this.EMBED_ICON,
            `<:green:848364257434927125> ${bold('Currently online')}\n` 
          + `There ${server.online === 1 ? 'is' : 'are'} currently ${bold(server.online)}/${bold(server.max)} player${server.online === 1 ? '' : 's'} online.\n\n` 
          + `Connect to ${bold('mc.ilefa.club')} using ${bold(this.VERSION)}!`);
        this.editOrSend(channel, embed, lastMessage);
    }

    private editOrSend = (channel: TextChannel, content: MessageEmbed, message?: Message) => {
        let opts = { embeds: [content] };
        if (message) return message.edit(opts);
        channel.send(opts);
    }

}