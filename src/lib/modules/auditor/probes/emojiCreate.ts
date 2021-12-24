/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { AuditorProbe } from '..';
import { GuildEmoji } from 'discord.js';
import { asEmote, bold } from '@ilefa/ivy';

export class EmojiCreateProbe extends AuditorProbe {
    
    constructor() {
        super('Emoji Create', 'emojiCreate');
    }
    
    report = async (...args: any[]) => {
        let emote: GuildEmoji = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let executor = await this.getExecutor(emote.guild, 'EMOJI_CREATE');
        reports.send(`${this.manager.EMOTE} Emote ${bold(emote.name)} (${asEmote(emote)}) was created by ${bold(executor)}.`);
    }

    shouldReport = (...args: any[]): boolean => true;

}