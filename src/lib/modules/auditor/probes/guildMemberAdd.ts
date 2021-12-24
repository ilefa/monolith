/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { AuditorProbe } from '..';
import { bold, time } from '@ilefa/ivy';
import { GuildMember } from 'discord.js';

export class GuildMemberAddProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Member Add', 'guildMemberAdd');
    }
    
    report = async (...args: any[]) => {
        let member: GuildMember = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        reports.send(`${this.manager.JOIN} ${bold(member.user.username + '#' + member.user.discriminator)} joined on ${time(Date.now(), '[**]MMMM Do YYYY[**] [at] [**]h:mm:ss a[**]')}.`);
    }

    shouldReport = (...args: any[]): boolean => true;

}