/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Module } from '@ilefa/ivy';
import { ColorResolvable } from 'discord.js';
import { RemotePreferenceBundle } from '../database';

export class PreferenceBundle extends Module {

    public readonly preset: string;
    public readonly token: string;
    public readonly prefix: string;
    public readonly color: ColorResolvable;
    public readonly serverId: string;
    public readonly welcomeChannelId: string;
    public readonly birthdayChannelId: string;
    public readonly auditorChannelId: string;
    public readonly blueplateChannelId: string;
    public readonly starboardChannelId: string;
    public readonly nameArchiveChannelId: string;
    public readonly superPerms: string[];

    constructor(bundle: RemotePreferenceBundle) {
        super('Prefs');

        this.preset = bundle.name;
        this.token = bundle.token;
        this.prefix = bundle.prefix;
        this.color = bundle.color;
        this.serverId = bundle.serverId;
        this.welcomeChannelId = bundle.welcomeChannelId;
        this.birthdayChannelId = bundle.birthdayChannelId;
        this.auditorChannelId = bundle.auditorChannelId;
        this.blueplateChannelId = bundle.blueplateChannelId;
        this.starboardChannelId = bundle.starboardChannelId;
        this.nameArchiveChannelId = bundle.nameArchiveChannelId;
        this.superPerms = bundle.superPerms;
    }

    start() {}

    end() {}

}