/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { AuditorProbe } from '..';
import { Message } from 'discord.js';
import { mentionChannel } from '@ilefa/ivy';

export class MessageReactionRemoveAllProbe extends AuditorProbe {
    
    constructor() {
        super('Message Reaction Remove All', 'messageReactionRemoveAll');
    }
    
    report = async (...args: any[]) => {
        let message: Message = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        reports.send(`${this.manager.CHANNEL} All reactions were removed from a message in ${mentionChannel(message.channel.id)}.\n` 
                   + `${this.manager.DIVIDER} Original Message: https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`);
    }

    shouldReport = (...args: any[]): boolean => true;

}