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
import { GuildEmoji } from 'discord.js';

export class EmojiDeleteProbe extends AuditorProbe {
    
    constructor() {
        super('Emoji Delete', 'emojiDelete');
    }
    
    report = async (...args: any[]) => {
        let emote: GuildEmoji = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let executor = await this.getExecutor(emote.guild, 'EMOJI_DELETE');
        reports.send(`${this.manager.EMOTE} Emote ${bold(emote.name)} was deleted by ${bold(executor)}.`);
    }

    shouldReport = (...args: any[]): boolean => true;

}