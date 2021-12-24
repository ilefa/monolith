/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { AuditorProbe } from '..';
import { bold } from '@ilefa/ivy';
import { Guild } from 'discord.js';

export class GuildIntegrationsUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Integrations Update', 'guildIntegrationsUpdate');
    }
    
    report = async (...args: any[]) => {
        let guild: Guild = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let report = await this.getAuditEntry(guild, 'INTEGRATION_UPDATE');
        let executor = report.executor
            ? this.asName(report.executor)
            : 'an unknown user';

        reports.send(`${this.manager.COG} Server integrations were updated by ${bold(executor)}.`);
    }

    shouldReport = (...args: any[]): boolean => true;

}