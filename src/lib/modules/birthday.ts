/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { User } from 'discord.js';
import { Module } from '@ilefa/ivy';
import { PreferenceBundle } from '.';
import { BeAnObject } from '@typegoose/typegoose/lib/types';
import { BirthdayBundle, BirthdayDateFormat } from '../database';
import { getModelForClass, ReturnModelType } from '@typegoose/typegoose';

export class BirthdayManager extends Module {

    private model: ReturnModelType<typeof BirthdayBundle, BeAnObject>;
    public bundle: PreferenceBundle;

    constructor() {
        super('BirthdayManager', 'Birthdays');
    }
    
    start = () => {
        this.model = getModelForClass(BirthdayBundle);
        this.bundle = this.manager.require<PreferenceBundle>('Prefs');
        this.log('Birthday Manager is ready.')
    }

    end() {}

    /**
     * Attempts to create a birthday for a given user.
     * 
     * @param user the user to create the birthday for
     * @param date the birthday date
     * @param then callback if birthday is created
     * @param failure callback if creation fails
     */
    createBirthday = async (user: User | string, date: BirthdayDateFormat, then: (bundle: BirthdayBundle) => void, failure: () => void) => {
        let entry = await this.getBirthday(user);
        if (entry) return failure();

        // remove leading zeroes for date
        let clean = date
            .split('/')
            .map(ent => ent.replace(/^0+/, ''))
            .join('/');

        let birthday = await this.model.create({ user: user instanceof User ? user.id : user, date: clean });
        await birthday
            .save()
            .then(then)
            .catch(failure);

        return birthday;
    }

    /**
     * Attempts to update a user's existing birthday.
     * 
     * @param user the user to update the birthday for
     * @param date the new birthday date
     * @param then callback if birthday is updated
     * @param failure callback if update fails
     */
    updateBirthday = async (user: User | string, date: BirthdayDateFormat, then: (bundle: BirthdayBundle) => void, failure: () => void) => {
        let entry = await this.getBirthday(user);
        if (!entry) return failure();

        await this
            .model
            .updateOne(
                {
                    user: user instanceof User
                        ? user.id
                        : user
                },
                {
                    $set: { date }
                })
            .exec()
            .then(_ => then({ ...entry, date }))
            .catch(failure);
    }

    /**
     * Attempts to remove a birthday for a given user.
     * 
     * @param user the user to remove the birthday for
     * @param then callback if birthday is removed
     * @param failure callback if removal fails
     */
    removeBirthday = async (user: User | string, then: () => void, failure: () => void) => {
        let entry = await this.getBirthday(user);
        if (!entry) return failure();

        this
            .model
            .deleteOne({
                user: user instanceof User
                    ? user.id
                    : user
            })
            .then(then)
            .catch(failure);
    }

    /**
     * Retrieves all stored birthdays from the database.
     */
    getBirthdays = async (): Promise<BirthdayBundle[]> =>
        await this
            .model
            .find({})
            .lean()
            .exec();

    /**
     * Attempts to find a birthday by it's Discord User ID.
     * @param user the user to retrieve the birthday for
     */
    getBirthday = async (user: User | string): Promise<BirthdayBundle | null> =>
        await this
            .model
            .findOne({
                user: user instanceof User
                    ? user.id
                    : user
            })
            .lean()
            .exec();


}