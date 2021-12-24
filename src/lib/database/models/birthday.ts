/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { modelOptions, prop } from '@typegoose/typegoose';

export type BirthdayDateFormat = `${number}/${number}`;

@modelOptions({ schemaOptions: { collection: 'birthday' } })
export class BirthdayBundle {
    
    @prop({ required: true })
    public user: string;

    @prop({ required: true, type: () => String })
    public date: BirthdayDateFormat;
    
}