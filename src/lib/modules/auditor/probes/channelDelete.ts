/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { bold } from '@ilefa/ivy';
import { AuditorProbe } from '..';
import { NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';

type ChannelLike = TextChannel | VoiceChannel | NewsChannel | StoreChannel;

export class ChannelDeleteProbe extends AuditorProbe {
    
    constructor() {
        super('Channel Delete', 'channelDelete');
    }
    
    report = async (...args: any[]) => {
        let channel: ChannelLike = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let executor = await this.getExecutor(channel.guild, 'CHANNEL_DELETE');
        reports.send(`${this.manager.CHANNEL} Channel ${bold(channel.name)} was deleted by ${bold(executor)}.`);
    }

    shouldReport = (...args: any[]): boolean => true;

}