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

export class RoleCreateProbe extends AuditorProbe {
    
    constructor() {
        super('Role Create', 'roleCreate');
    }
    
    report = async (...args: any[]) => {
        let role: Role = args[0][0];
        let reports = await this.getReportsChannel();
        if (!reports)
            return;

        let perms = role.permissions.toArray();
        let allowed = this.wrapPermissions(perms, PermissionStatus.ALLOW);
        let denied = this.matchMissingPermissions(allowed);

        let allChanges = [...allowed, ...denied]
            .sort((a, b) => a.permission.localeCompare(b.permission))
            .sort((a, b) => a.status - b.status);

        let changes = allChanges
            .map(ent => cond(ent.status === PermissionStatus.ALLOW, GREEN_CIRCLE, RED_CIRCLE) + ` ${ent.permission}`)
            .join('\n');

        let executor = await this.getExecutor(reports.guild, 'ROLE_CREATE');
        reports.send(`${this.manager.ROLE} Role ${bold(role.name)} was created by ${bold(executor)}.\n${changes}`);
    }

    shouldReport = (...args: any[]): boolean => true;

    private wrapPermissions = (entries: PermissionString[], status: PermissionStatus): PermissionWrapper[] =>
        entries.map(permission => ({
            status,
            permission: this.matchPermissionString(permission)
        }));

    private matchPermissionString = (perm: PermissionString) => PermissionStrings.find(str => perm === str);

    private matchMissingPermissions = (allowed: PermissionWrapper[]): PermissionWrapper[] => 
        PermissionStrings
            .filter(elem => !allowed.some(ent => ent.permission === elem))
            .map(elem => {
                return {
                    status: PermissionStatus.DENY,
                    permission: elem
                }
            });

}