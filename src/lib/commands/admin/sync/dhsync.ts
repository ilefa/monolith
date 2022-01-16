/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { CommandCategory, InvokerCommand } from '../../system';
import { CommandReturn, emboss, IvyEmbedIcons } from '@ilefa/ivy';

export class DinnerHallSyncCommand extends InvokerCommand {

    constructor() {
        super('blueplate', 'dhsync', `Invalid usage: ${emboss('.dhsync')}`, null, [], 'ADMINISTRATOR', false, false, CommandCategory.ADMIN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;

        this.invoke(
            async () => {
                let msg = await this.reply(message, this.embeds.build('Blueplate Management', IvyEmbedIcons.PREFS, 'Syncing menus, one moment please..', [], message));
                this.manager.client.once('blueplateSync', () => {
                    msg.edit({ embeds: [this.embeds.build('Blueplate Management', IvyEmbedIcons.PREFS, 'Menus synced.', [], message)] });
                });      
            },
            reason => this.reply(message, this.embeds.build('Blueplate Management', IvyEmbedIcons.PREFS, reason, [], message))
        );

        return CommandReturn.EXIT;
    }

}