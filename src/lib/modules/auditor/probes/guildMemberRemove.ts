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

export class GuildMemberRemoveProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Member Remove', 'guildMemberRemove');
    }
    
    report = async (...args: any[]) => {
        let member: GuildMember = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        reports.send(`${this.manager.LEAVE} ${bold(member.user.username + '#' + member.user.discriminator)} left on ${time(Date.now(), '[**]MMMM Do YYYY[**] [at] [**]h:mm:ss a[**]')}.`);
    }

    shouldReport = (...args: any[]): boolean => true;

}