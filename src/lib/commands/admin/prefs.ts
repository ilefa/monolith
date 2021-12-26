/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { PreferenceBundle } from '../../modules';
import { AutowiredCommand, CommandCategory } from '../system';
import { bold, codeBlock, CommandReturn, emboss, IvyEmbedIcons } from '@ilefa/ivy';

export class PrefsCommand extends AutowiredCommand<PreferenceBundle> {

    constructor() {
        super('Prefs', 'prefs', `Invalid usage: ${emboss('.prefs')}`, null, [], 'SUPER_PERMS', false, false, CommandCategory.ADMIN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;

        if (!this.module) {
            this.reply(message, this.embeds.build('Monolith Management', IvyEmbedIcons.PREFS, `Could not autowire preference bundle, please investigate.`, [], message));
            return CommandReturn.EXIT;
        }

        let filtered = [
            'preset',
            'prefix',
            'color',
            'serverId',
            'welcomeChannelId',
            'birthdayChannelId',
            'auditorChannelId',
            'blueplateChannelId',
            'nameArchiveChannelId',
            'superPerms'
        ];

        this.reply(message, this.embeds.build('Monolith Management', IvyEmbedIcons.PREFS, `Preferences for instance preset ${bold(this.module.preset)}:`,
            filtered
                .map(field => ({
                    field,
                    value: this.module[field]
                }))
                .map(bundle => ({
                    name: bundle.field,
                    value: codeBlock('', bundle.value),
                    inline: true
                })), message));

        return CommandReturn.EXIT;
    }

}