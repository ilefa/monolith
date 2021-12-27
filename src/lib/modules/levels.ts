/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { EmbedIconType } from '../util';
import { LevelBundle } from '../database';
import { Message, User } from 'discord.js';
import { BeAnObject } from '@typegoose/typegoose/lib/types';
import { getModelForClass, ReturnModelType } from '@typegoose/typegoose';
import { asMention, bold, CommandManager, Module, RechargeManager } from '@ilefa/ivy';

export type SurroundingUsers = {
    upwards: LevelBundle;
    downwards: LevelBundle;
}

export class LevelManager extends Module {

    private rechargeManager: RechargeManager;
    private commandManager: CommandManager;
    private model: ReturnModelType<typeof LevelBundle, BeAnObject>;

    public constructor() {
        super('LevelManager', 'Levels');
    }

    start() {
        this.model = getModelForClass(LevelBundle);
        this.commandManager = this.manager.engine.commandManager;
        this.rechargeManager = new RechargeManager();

        this.client.on('messageCreate', async message => await this.onChat(message));
        this.log('Chat Level Manager is ready.');
    }

    end() {}

    /**
     * Returns a level bundle for a given user,
     * and creates + saves it, if it does not exist.
     * 
     * @param resolvable a user-resolvable object
     */
    getProfile = async (resolvable: User | string): Promise<LevelBundle> => {
        let userId = resolvable instanceof User
            ? resolvable.id
            : resolvable;

        let profile = await this
            .model
            .findOne({ userId });

        if (!profile) {
            profile = await this
                .model
                .create({
                    userId,
                    level: 0,
                    xp: 0,
                    totalXp: 0,
                    messages: 0
                });

            await profile.save();
        }

        return profile;
    }

    /**
     * Retrieves all registered profiles from the database.
     */
    getAllProfiles = async (): Promise<LevelBundle[]> =>
        await this
            .model
            .find()
            .lean()
            .exec()

    /**
     * Attempts to return the top-N users recorded
     * in the database, based on level, and then xp.
     * 
     * @param limit the top-N user bundles to return
     */
    getLeaderboard = async (limit = 25): Promise<LevelBundle[]> =>
        await this
            .model
            .find({})
            .sort({ level: -1, xp: -1 })
            .limit(limit)
            .lean();

    /**
     * Attempts to return the current leaderboard position
     * of a registered user. If the user is not found,
     * returns -1.
     */
    getLeaderboardPosition = async (user: User | string): Promise<number> => {
        let profile = await this.getProfile(user);
        let all = await this.getAllProfiles();

        all = all
            .sort((a, b) => b.level - a.level)
            .sort((a, b) => b.xp - a.xp);

        return all.findIndex(p => p.userId === profile.userId);
    }

    /**
     * Attempts to return the users surrounding
     * a given user (above and below) on the leaderboard.
     * 
     * @param user the user to get the surrounding users for
     */
    getSurroundingUsers = async (user: User | string): Promise<SurroundingUsers> => {
        let profile = await this.getProfile(user);
        let all = await this.getAllProfiles();

        all = all
            .sort((a, b) => b.level - a.level)
            .sort((a, b) => b.xp - a.xp);

        let index = all.findIndex(p => p.userId === profile.userId);
        let downwards = index >= all.length ? null : all[index + 1];
        let upwards = index <= 0 ? null : all[index - 1];

        return { downwards, upwards };
    }

    /**
     * Returns whether or not the provided user
     * is currently on XP cooldown.
     * 
     * @param user the user to check recharge status for
     */
    getRechargeStatus = (user: User | string) => ({
        time: this.rechargeManager.getRechargeTime(user),
        active: this.rechargeManager.isRecharging(user)
    });

    private onChat = async (message: Message) => {
        let user = message.author;
        if (user.bot || user.system)
            return;

        if (!this.isEligibleForXp(message))
            return;

        if (this.rechargeManager.isRecharging(user))
            return;

        this.rechargeManager.recharge(user, 60000);

        let profile = await this.getProfile(user);
        let earned = this.getEarnedXp();

        profile.xp += earned;
        profile.totalXp += earned;
        profile.messages++;

        let needed = this.getNeededXp(profile.level, profile.xp);
        if (needed <= 0) {
            profile.level++;
            profile.xp = Math.abs(needed);
            
            message.channel.send({
                embeds: [
                    this.manager.engine.embeds.build('Levels', EmbedIconType.XP, `:tada: Congratulations ${asMention(user)}, you've reached ${bold(`Level ${profile.level.toLocaleString()}`)}!`)
                ]
            });
        }

        // this.log(`[DEBUG] ${user.username}#${user.discriminator} earned ${earned} XP for message with ID ${message.id}.`);

        this
            .model
            .updateOne(
                { userId: user.id },
                {
                    $set: {
                        xp: profile.xp,
                        totalXp: profile.totalXp,
                        level: profile.level,
                        messages: profile.messages
                    }
                }
            )
            .exec();
    }

    getXpForLevel = (level: number): number => 5 * Math.pow(level, 2) + (50 * level) + 100;

    /**
     * Returns the amount of XP earned for a given message.
     */
    private getEarnedXp = () => Math.floor(Math.random() * 50) + 1;

    /**
     * Returns the amount of XP needed for
     * a user to reach the next level.
     * 
     * @param level the user's current level
     * @param xp the user's current xp
     */
    private getNeededXp = (level: number, xp: number) => 5 * Math.pow(level, 2) + (50 * level) + 100 - xp;

    /**
     * Check if a message is eligible to earn XP.
     * 
     * The only current criteria for eligibility
     * is that the message is not a command message
     * (i.e. the user is running a valid command.)
     * 
     * @param message the message to check
     */
    private isEligibleForXp = (message: Message) => {
        if (!message.content.startsWith('.'))
            return true;

        let match = this
            .commandManager
            .commands
            .find(c => c.name === message
                .content
                .split(' ')[0]
                .slice(1));

        return !match;
    }

}