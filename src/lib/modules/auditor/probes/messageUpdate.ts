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
import { bold, codeBlock, conforms, mentionChannel } from '@ilefa/ivy';

export class MessageUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Message Update', 'messageUpdate');
    }
    
    report = async (...args: any[]) => {
        let message: Message = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        // i'm pretty sure the only way a message can be updated is if it was edited
        reports.send(`${this.manager.CHANNEL} Message in ${mentionChannel(message.channel.id)} was edited by ${bold(this.asName(message.author))}.\n` 
                   + `${this.manager.DIVIDER} Message Link: https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}\n` 
                   + `${this.manager.DIVIDER} Original Content:`);
                   
        // make sure the message can fit in the code block
        reports.send(codeBlock('', message.content.length === 2000
            ? message.content.substring(0, message.content.length - 9)
            : message.content));
    }

    shouldReport = (...args: any[]): boolean => {
        let a: Message = args[0][0];
        let b: Message = args[0][1];

        if (!a.author
                || a.author.bot
                || a.type !== 'DEFAULT'
                || !a.content
                || ![...a.attachments.values()] && [...b.attachments.values()]
                || ![...b.attachments.values()] && [...a.attachments.values()]
                || a.attachments?.size !== b.attachments?.size
                || a.content === b.content
                || a.attachments.some(attachment => conforms(/^http(?:s){0,}:\/{2}(?:giphy.com|tenor.com|kapwing.com|imgflip.com|gifsoup.com|imgplay|senorgif.com|youtube.com)/, attachment.url))
                || conforms(/^\.\w+(?:\s.+){0,}/, a.content))
            return false;

        return true;
    }

}