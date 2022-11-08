/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { HexColorString } from 'discord.js';
import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'prefs' } })
export class RemotePreferenceBundle {
    
    @prop({ required: true })
    name: string;
    
    @prop({ required: true })
    token: string;
    
    @prop({ required: true })
    prefix: string;
    
    @prop({ required: true })
    color: HexColorString;
    
    @prop({ required: true })
    serverId: string;

    @prop({ required: true })
    welcomeChannelId: string;

    @prop({ required: true })
    birthdayChannelId: string;

    @prop({ required: true })
    contentArchiveChannelId: string;
    
    @prop({ required: true })
    auditorChannelId: string;

    @prop({ required: true })
    blueplateChannelId: string;

    @prop({ required: true })
    starboardChannelId: string;
    
    @prop({ required: true })
    nameArchiveChannelId: string;
    
    @prop({ required: true })
    levelUpChannelId: string;

    @prop({ required: true })
    alertsWebhook: string;

    @prop({ required: true })
    statusWebhook: string;

    @prop({ required: true })
    statusChannelId: string;

    @prop({ required: true })
    inviterChannelId: string;

    @prop({ required: true })
    minecraftChannelId: string;

    @prop({ required: true })
    tendiesChannelId: string;

    @prop({ required: true, type: () => [String] })
    superPerms: string[];

}