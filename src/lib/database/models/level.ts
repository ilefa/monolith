/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'levels' } })
export class LevelBundle {

    @prop({ required: true })
    public userId: string;

    @prop({ required: true })
    public level: number;

    @prop({ required: true })
    public xp: number;

    @prop({ required: true })
    public totalXp: number;

    @prop({ required: true })
    public messages: number;

}