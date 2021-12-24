/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { AuditorProbe } from '..';
import { Guild, User } from 'discord.js';
import { asMention, bold, emboss } from '@ilefa/ivy';

export class GuildBanAddProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Ban Add', 'guildBanAdd');
    }
    
    report = async (...args: any[]) => {
        let guild: Guild = args[0][0];
        let user: User = args[0][1];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let report = await this.getAuditEntry(guild, 'MEMBER_BAN_ADD');
        if (!report || (report.target as User).id !== user.id) {
            reports.send(`${this.manager.MEMBERS} ${asMention(user)} (${user.id}) was banned.`);
            return;
        }
        
        let { executor, reason } = report;
        reports.send(`${this.manager.MEMBERS} ${asMention(user)} (${user.id}) was banned by ${bold(this.asName(executor))}.` 
                   + reason ? `${this.manager.DIVIDER} The provided reason for this punishment was ${emboss(reason)}.` : '');

    }

    shouldReport = (...args: any[]): boolean => true;

}