/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { bold } from '@ilefa/ivy';
import { Role } from 'discord.js';
import { AuditorProbe } from '..';

export class RoleDeleteProbe extends AuditorProbe {
    
    constructor() {
        super('Role Delete', 'roleDelete');
    }
    
    report = async (...args: any[]) => {
        let role: Role = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let executor = await this.getExecutor(role.guild, 'ROLE_DELETE');
        reports.send(`${this.manager.ROLE} Role ${bold(role.name)} was deleted by ${bold(executor)}.`);
    }

    shouldReport = (...args: any[]): boolean => true;

}