/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { AuditorProbe } from '..';
import { Collection, Message, Snowflake } from 'discord.js';

import {
    bold,
    mentionChannel,
    numberEnding,
    time
} from '@ilefa/ivy';

export class MessageDeleteBulkProbe extends AuditorProbe {
    
    constructor() {
        super('Message Delete Bulk', 'messageDeleteBulk');
    }
    
    report = async (...args: any[]) => {
        let collection: Collection<Snowflake, Message> = args[0][0];
        let messages = [...collection.values()];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let distinctChannels = [...new Set(messages.map(message => message.channel))];
        let channels = distinctChannels.map(channel => mentionChannel(channel.id)).join(', ');

        reports.send(`${this.manager.CHANNEL} ${bold(messages.length + ` message${numberEnding(messages.length)}`)} were deleted from ${channels}.\n` 
                   + messages
                        .map(message => `${this.manager.DIVIDER} ${bold(`[${message.id}]`)} created by ${bold(this.asName(message.author))} on ${bold(time(message.createdAt.getTime()))}`)
                        .join('\n'));
    }

    shouldReport = (...args: any[]): boolean => true;

}