/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { AuditorProbe } from '..';
import { GuildMember, Role } from 'discord.js';

import {
    bold,
    cond,
    emboss,
    GREEN_CIRCLE,
    numberEnding,
    RED_CIRCLE
} from '@ilefa/ivy';

enum MemberUpdateCause {
    ROLES,
    NICKNAME,
    NICKNAME_REMOVE,
    USERNAME,
    AVATAR,
    DELETED,
    UNKNOWN
}

enum RoleChangeStatus {
    ADD, REMOVE
}

type RolesWrapper = {
    status: RoleChangeStatus;
    role: Role;
}

export class GuildMemberUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Member Update', 'guildMemberUpdate');
    }
    
    report = async (...args: any[]) => {
        let a: GuildMember = args[0][0];
        let b: GuildMember = args[0][1];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let cause = this.detectChange(a, b);
        let change = await this.generateChangeMessage(a, b, cause);
        if (!change)
            return;

        reports.send(change);
    }

    shouldReport = (...args: any[]): boolean => true;

    private generateChangeMessage = async (a: GuildMember, b: GuildMember, cause: MemberUpdateCause) => {
        let report = await this.getAuditEntry(a.guild, 'MEMBER_UPDATE');
        let executor = this.asName(report?.executor);
        let selfChange = false;
        if (executor !== 'an unknown user')
            selfChange = report.executor.id === b.id;

        if (cause == MemberUpdateCause.UNKNOWN)
            return;
        
        if (cause == MemberUpdateCause.ROLES) {
            let report = await this.getAuditEntry(a.guild, 'MEMBER_ROLE_UPDATE');
            let executor = await this.getExecutor(a.guild, 'MEMBER_ROLE_UPDATE');
            let rolesA = [...a.roles.cache.values()];
            let rolesB = [...b.roles.cache.values()];

            let added = this.wrapRoles(this.getDifferences(rolesA, rolesB), RoleChangeStatus.ADD);
            let removed = this.wrapRoles(this.getDifferences(rolesB, rolesA), RoleChangeStatus.REMOVE);
            let changes = added.length + removed.length;
            let allChanges = [...added, ...removed]
                .sort((a, b) => a.role.name.localeCompare(b.role.name))
                .sort((a, b) => a.status - b.status);

            return `${this.manager.MEMBERS} ${!selfChange ? bold(executor) + ' modified ' : ''}${bold(`${changes} role${numberEnding(changes)}`)}${selfChange ? cond(changes === 1, 'was', 'were') + ' modified' : ''} for ${bold(this.asName(b))}.\n` 
                    + allChanges
                        .map(ent => cond(ent.status === RoleChangeStatus.ADD, GREEN_CIRCLE, RED_CIRCLE) + ` ${ent.role.name}`)
                        .join('\n');
        }

        if (cause == MemberUpdateCause.NICKNAME && selfChange)
            return `${this.manager.MEMBERS} ${bold(this.asName(b.user))} changed their nickname to ${emboss(b.nickname)}.`;

        if (cause == MemberUpdateCause.NICKNAME && !selfChange)
            return `${this.manager.MEMBERS} ${bold(executor)} changed ${bold(this.asName(b.user) + '\'s')} nickname to ${emboss(b.nickname)}.`;

        if (cause == MemberUpdateCause.NICKNAME_REMOVE && selfChange)
            return `${this.manager.MEMBERS} ${bold(this.asName(b.user))} removed their nickname.`;

        if (cause == MemberUpdateCause.NICKNAME_REMOVE && !selfChange)
            return `${this.manager.MEMBERS} ${bold(executor)} removed ${bold(this.asName(b.user) + '\'s')} nickname.`;

        if (cause == MemberUpdateCause.USERNAME)
            return `${this.manager.MEMBERS} ${bold(this.asName(a.user))} changed their name to ${bold(this.asName(b.user))}.`;

        if (cause == MemberUpdateCause.AVATAR)
            return `${this.manager.MEMBERS} ${bold(this.asName(b.user))} changed their avatar.\n` 
                 + `${this.manager.DIVIDER} Old: ${emboss(a.user.avatar)}`
                 + `${this.manager.DIVIDER} New: ${emboss(b.user.avatar)}`;
    }
    
    private wrapRoles = (entries: Role[], status: RoleChangeStatus): RolesWrapper[] =>
        entries.map(role => ({
            status,
            role,
        }));

    private getDifferences = (a: Role[], b: Role[]) => b.filter(elem => !a.some(val => val.id == elem.id));

    private detectChange = (a: GuildMember, b: GuildMember) => {
        if (a.roles.cache.size !== b.roles.cache.size)
            return MemberUpdateCause.ROLES;
            
        if (!a.nickname && b.nickname)
            return MemberUpdateCause.NICKNAME;

        if (a.nickname && !b.nickname)
            return MemberUpdateCause.NICKNAME_REMOVE;

        if (a.user.username !== b.user.username)
            return MemberUpdateCause.USERNAME;

        if (a.user.avatar !== b.user.avatar)
            return MemberUpdateCause.AVATAR;

        return MemberUpdateCause.UNKNOWN;
    }

}