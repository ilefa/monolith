/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { AuditorProbe } from '..';
import { bold, mentionChannel } from '@ilefa/ivy';
import { NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';

type ChannelLike = TextChannel | VoiceChannel | NewsChannel | StoreChannel;

export class ChannelPinsUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Channel Pins Update', 'channelPinsUpdate');
    }
    
    report = async (...args: any[]) => {
        let channel: TextChannel = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let executor = await this.getExecutor(channel.guild, 'MESSAGE_PIN');
        reports.send(`${this.manager.PIN} ${bold(executor)} pinned a message in ${mentionChannel(channel.id)}.`);
    }

    shouldReport = (...args: any[]): boolean => true;

}