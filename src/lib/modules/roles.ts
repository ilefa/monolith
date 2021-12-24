/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Module } from '@ilefa/ivy';
import { PreferenceBundle } from '.';
import { GuildMember } from 'discord.js';
import { SelfAssignableRoleBundle } from '../database';
import { getModelForClass } from '@typegoose/typegoose';
import { BeAnObject, ReturnModelType } from '@typegoose/typegoose/lib/types';

export class RoleAssignmentManager extends Module {

    private model: ReturnModelType<typeof SelfAssignableRoleBundle, BeAnObject>;
    public bundle: PreferenceBundle;

    constructor() {
        super('RoleAssignmentManager', 'Self Assign');
    }

    start = () => {
        this.model = getModelForClass(SelfAssignableRoleBundle);
        this.bundle = this.manager.require<PreferenceBundle>('Prefs');
    }

    end() {}

    /**
     * Returns all registered self-assign roles from the database.
     */
    getRoles = async (): Promise<SelfAssignableRoleBundle[]> =>
        await this
            .model
            .find({})
            .lean()
            .exec();

    /**
     * Attempts to find a self-assignable role by it's Discord Role ID
     * from the database.
     * 
     * @param roleId the role id to find
     */
    getRole = async (roleId: string): Promise<SelfAssignableRoleBundle | null> =>
        await this
            .model
            .findOne({ roleId })
            .lean()
            .exec();

    /**
     * Attempts to find a self-assignable role by it's display name
     * from the database.
     * 
     * @param roleId the role id to find
     */
    getRoleByName = async (roleName: string): Promise<SelfAssignableRoleBundle | null> =>
        await this
            .model
            .findOne({
                displayName: {
                    $regex: new RegExp(`^${roleName.toLowerCase()}$`, 'i')
                }
            })
            .lean()
            .exec();

    /**
     * Attempts to create a new self-assignable role and store it in the database.
     * 
     * @param roleId the role's id
     * @param displayName the display name of the role
     * @param emote the emote to display for the role
     */
    addRole = async (roleId: string, displayName: string, emote: string): Promise<SelfAssignableRoleBundle> => {
        if (await this.getRole(roleId))
            throw new Error('Role already exists');
        
        let entry = await this
            .model
            .create({
                roleId,
                displayName,
                emote
            });

        entry.save();
        return entry;
    }

    /**
     * Attempts to delete a self-assignable role from the database.
     * @param roleId the role's id
     */
    removeRole = async (roleId: string): Promise<SelfAssignableRoleBundle | null> => 
        await this
            .model
            .findOneAndDelete({ roleId })
            .exec();

    /**
     * Attempts to update a self-assignable role's display name and emote.
     * 
     * @param roleId the role's id
     * @param displayName the new display name
     * @param emote the new emote
     */
    updateRole = async (roleId: string, displayName: string, emote: string): Promise<SelfAssignableRoleBundle | null> =>
        await this
            .model
            .findOneAndUpdate(
                { roleId },
                { displayName, emote },
                { new: true })
            .exec();

    userHasRole = async (roleName: string, member: GuildMember) => {
        let role = await this.getRoleByName(roleName);
        if (!role) return false;

        return member
            .roles
            .cache
            .map(r => r.id)
            .includes(role.roleId);
    }

    applyRoleToUser = async (roleName: string, member: GuildMember, then: (bundle: SelfAssignableRoleBundle) => void, failure: () => void) => {
        let role = await this.getRoleByName(roleName);
        if (!role) return failure();

        member.roles.add(role.roleId, 'Self-assign grant');
        then(role);
    }

    removeRoleFromUser = async (roleName: string, member: GuildMember, then: (bundle: SelfAssignableRoleBundle) => void, failure: () => void) => {
        let role = await this.getRoleByName(roleName);
        if (!role) return failure();

        member.roles.remove(role.roleId, 'Self-assign removal');
        then(role);
    }

}
