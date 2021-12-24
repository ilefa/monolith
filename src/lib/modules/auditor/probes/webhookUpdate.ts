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
import { NewsChannel, StoreChannel, TextChannel } from 'discord.js';

type ChannelLike = TextChannel | NewsChannel | StoreChannel;

export class WebhookUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Webhook Update', 'webhookUpdate');
    }
    
    report = async (...args: any[]) => {
        let channel: ChannelLike = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let executor = await this.getExecutor(channel.guild, 'WEBHOOK_UPDATE');
        reports.send(`${this.manager.WEBHOOK} ${bold(executor)} updated webhooks for ${bold(channel.name)} (${mentionChannel(channel.id)}).`);
    }

    shouldReport = (...args: any[]): boolean => true;

}