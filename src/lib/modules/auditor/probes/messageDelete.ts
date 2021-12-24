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

import {
    asEmote,
    bold,
    codeBlock,
    cond,
    conforms,
    mentionChannel,
    numberEnding,
    time
} from '@ilefa/ivy';

export class MessageDeleteProbe extends AuditorProbe {
    
    constructor() {
        super('Message Delete', 'messageDelete');
    }
    
    report = async (...args: any[]) => {
        let message: Message = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let reactions = [...message.reactions.cache.values()];
        let rxns = reactions.length === 0 ? '' 
            : `${this.manager.DIVIDER} The message had ${bold(reactions.length + ` reaction${numberEnding(reactions.length)}`)}: ` 
                + reactions.map(reaction => {
                    return reaction.emoji.id === null
                        ? reaction.emoji.name
                        : asEmote(reaction.emoji);
                    // figure out a better way to display members who reacted to a particular message
                    // since members don't persist through reboots, either just display this condensed format,
                    // or figure something else out..

                    // let members = reaction.users.cache.array();
                    // let len = members.length;
                    // let sliced = 0;
                    
                    // members = members.slice(0, Math.min(10, members.length));
                    // sliced = len - members.length;
                    
                    // return reaction.emoji.id === 'null'
                    //     ? reaction.emoji.name
                    //     : asEmote(reaction.emoji) + bold(` (${len}): `) + join(members.sort((a, b) => a.username.localeCompare(b.username)), ', ', member => this.asName(member)) + (sliced !== 0 ? `, ${italic(`+ ${sliced} more`)}` : '');
                })
                .join(' ');

        let executor = await this.getExecutor(message.guild, 'MESSAGE_DELETE');
        reports.send(`${this.manager.CHANNEL} Message sent in ${mentionChannel(message.channel.id)} by ${bold(this.asName(message.author))} was deleted by ${bold(executor)}.\n` 
                   + `${this.manager.DIVIDER} The message was sent at ${bold(time(message.createdAt.getTime()))}${cond(message.pinned, ', and was pinned', '')}.\n`
                   + rxns + (!!rxns ? '\n' : '')
                   + `${this.manager.DIVIDER} Original content:`);

        // make sure the message can fit in the code block
        reports.send(codeBlock('', message.content.length === 2000
            ? message.content.substring(0, message.content.length - 9)
            : message.content));
    }

    shouldReport = (...args: any[]): boolean => {
        let message: Message = args[0][0];
        if (!message.author
                || message.author.bot
                || message.type !== 'DEFAULT'
                || !message.content
                || message.attachments.some(attachment => conforms(/giphy.com|tenor.com|kapwing.com|imgflip.com|gifsoup.com|imgplay|senorgif.com|out.mp4/, attachment.url))
                || conforms(/^\.\w+(?:\s.+){0,}/, message.content))
            return false;

        return true;
    }

}