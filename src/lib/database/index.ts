/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import mongoose from 'mongoose';

import { Logger, Module } from '@ilefa/ivy';
import { getModelForClass } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';

export * from './models';

export class DatabaseManager extends Module {

    private initTime: number;
    private quiet: boolean;
    private db: mongoose.Mongoose;
    private serverUri = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`;

    constructor(logger: Logger, quiet = false) {
        super('Database');
        this.initTime = Date.now();
        this.logger = logger;
        this.quiet = quiet;
    }

    start = async () => this.db = await mongoose
        .connect(this.serverUri, { dbName: process.env.MONGO_DB })
        .then(_ => {
            if (!this.quiet)
                this.logger.info('Database', `Connected to the database in ${(Date.now() - this.initTime).toFixed(2)}ms.`);
            return _;
        });

    end = () => this.db.connection.close();

    getModel<T>(target: AnyParamConstructor<T>) {
        return getModelForClass(target);
    }

}