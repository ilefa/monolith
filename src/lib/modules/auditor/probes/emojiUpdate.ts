/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { asEmote, bold } from '@ilefa/ivy';
import { AuditorProbe } from '..';
import { GuildEmoji } from 'discord.js';

// I think the only thing that can change is the name, since emojiDelete is emitted when it's deleted..
enum EmojiUpdateCause {
    NAME, UNKNOWN
}

export class EmojiUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Emoji Update', 'emojiUpdate');
    }
    
    report = async (...args: any[]) => {
        let a: GuildEmoji = args[0][0];
        let b: GuildEmoji = args[0][1];

        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let cause = this.detectChange(a, b);
        reports.send(await this.generateChangeMessage(a, b, cause));
    }

    shouldReport = (...args: any[]): boolean => true;

    private generateChangeMessage = async (a: GuildEmoji, b: GuildEmoji, cause: EmojiUpdateCause) => {
        let executor = await this.getExecutor(a.guild, 'EMOJI_UPDATE');
        if (cause == EmojiUpdateCause.UNKNOWN)
            return `${this.manager.EMOTE} Emote ${bold(b.name)} (${asEmote(b)}) was somehow updated by ${bold(executor)}.`;

        if (cause == EmojiUpdateCause.NAME)
            return `${this.manager.EMOTE} Emote ${bold(a.name)} (${asEmote(b)}) was renamed to ${bold(b.name)} by ${bold(executor)}.`;
    }

    private detectChange = (a: GuildEmoji, b: GuildEmoji) => {
        if (a.name !== b.name) return EmojiUpdateCause.NAME;
        else return EmojiUpdateCause.UNKNOWN;
    }

}