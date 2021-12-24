/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { AuditorProbe } from '..';
import { asMention} from '@ilefa/ivy';
import { Guild, User } from 'discord.js';

export class GuildBanRemoveProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Ban Remove', 'guildBanRemove');
    }
    
    report = async (...args: any[]) => {
        let guild: Guild = args[0][0];
        let user: User = args[0][1];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;


        let report = await this.getAuditEntry(guild, 'MEMBER_BAN_REMOVE');
        if (!report || (report.target as User).id !== user.id) {
            reports.send(`${this.manager.MEMBERS} ${asMention(user)} (${user.id}) was unbanned.`);
            return;
        }

        reports.send(`${this.manager.MEMBERS} ${asMention(user)} (${user.id}) was unbanned by ${this.asName(report.executor)}.`);
    }

    shouldReport = (...args: any[]): boolean => true;

}