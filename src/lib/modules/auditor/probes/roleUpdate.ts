/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { AuditorProbe } from '..';
import { PermissionString, Role } from 'discord.js';
import { bold, cond, GREEN_CIRCLE, RED_CIRCLE } from '@ilefa/ivy';

type PermissionWrapper = {
    status: PermissionStatus;
    permission: string;
}

enum RoleUpdateCause {
    NAME,
    COLOR,
    PERMISSIONS,
    UNKNOWN
}

enum PermissionStatus {
    ALLOW, DENY
}

const PermissionStrings = [
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'ADMINISTRATOR',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'VIEW_GUILD_INSIGHTS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS_AND_STICKERS',
    'USE_APPLICATION_COMMANDS',
    'REQUEST_TO_SPEAK',
    'MANAGE_THREADS',
    'USE_PUBLIC_THREADS',
    'CREATE_PUBLIC_THREADS',
    'USE_PRIVATE_THREADS',
    'CREATE_PRIVATE_THREADS',
    'USE_EXTERNAL_STICKERS',
    'SEND_MESSAGES_IN_THREADS',
    'START_EMBEDDED_ACTIVITIES'
];

export class RoleUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Role Update', 'roleUpdate');
    }
    
    report = async (...args: any[]) => {
        let a: Role = args[0][0];
        let b: Role = args[0][1];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let cause = this.detectChange(a, b);
        let message = await this.generateChangeMessage(a, b, cause);
        if (!message)
            return;

        reports.send(message);
    }

    shouldReport = (...args: any[]): boolean => true;

    private wrapPermissions = (entries: PermissionString[], status: PermissionStatus): PermissionWrapper[] => 
        entries.map(permission => ({
            status,
            permission: this.matchPermissionString(permission),
        }));

    private matchPermissionString = (perm: PermissionString) => PermissionStrings.find(str => perm === str);

    private getDifferences = (a: PermissionString[], b: PermissionString[]) => b.filter(elem => !a.some(val => val === elem));

    private generateChangeMessage = async (a: Role, b: Role, cause: RoleUpdateCause) => {
        if (cause == RoleUpdateCause.UNKNOWN)
            return null;
        
        let executor = await this.getExecutor(a.guild, 'ROLE_UPDATE');
        if (cause == RoleUpdateCause.NAME)
            return `${this.manager.ROLE} ${bold(executor)} renamed role ${bold(a.name)} to ${bold(b.name)}.`;

        if (cause == RoleUpdateCause.COLOR)
            return `${this.manager.ROLE} ${bold(executor)} changed ${bold(b.name + '\'s')} color to ${bold(b.hexColor)}.`;

        let permA = a.permissions.toArray();
        let permB = b.permissions.toArray();
        let added = this.wrapPermissions(this.getDifferences(permA, permB), PermissionStatus.ALLOW);
        let removed = this.wrapPermissions(this.getDifferences(permB, permA), PermissionStatus.DENY);

        let allChanges = [...added, ...removed]
            .sort((a, b) => a.permission.localeCompare(b.permission))
            .sort((a, b) => a.status - b.status);

        let report = await this.getAuditEntry(a.guild, 'ROLE_UPDATE');
        console.log(report.changes);

        return `${this.manager.ROLE} ${bold(executor)} updated role permissions for ${bold(b.name)}.\n` 
              + allChanges
                    .map(ent => cond(ent.status === PermissionStatus.ALLOW, GREEN_CIRCLE, RED_CIRCLE) + ` ${ent.permission}`)
                    .join('\n')
    }

    private detectChange = (a: Role, b: Role) => {
        if (a.name !== b.name)
            return RoleUpdateCause.NAME;

        if (a.color !== b.color)
            return RoleUpdateCause.COLOR;

        if (a.permissions.bitfield !== b.permissions.bitfield)
            return RoleUpdateCause.PERMISSIONS;

        return RoleUpdateCause.UNKNOWN;
    }

}