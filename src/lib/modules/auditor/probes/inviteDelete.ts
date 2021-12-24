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
import { Invite } from 'discord.js';

export class InviteDeleteProbe extends AuditorProbe {
    
    constructor() {
        super('Invite Delete', 'inviteDelete');
    }
    
    report = async (...args: any[]) => {
        let invite: Invite = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let executor = await this.getExecutor(await invite.guild.fetch(), 'INVITE_DELETE');
        reports.send(`${this.manager.INVITE} Invite ${bold(invite.code)} was deleted by ${bold(executor)}.`);
    }

    shouldReport = (...args: any[]): boolean => true;

}