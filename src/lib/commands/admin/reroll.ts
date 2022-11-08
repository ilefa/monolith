/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { User, Message, Guild } from 'discord.js';
import { CommandCategory, InvokerCommand } from '../system';
import { bold, CommandReturn, emboss, IvyEmbedIcons } from '@ilefa/ivy';

export class RerollCommand extends InvokerCommand {
    
    constructor() {
        super('rename', 'reroll', `Invalid usage: ${emboss('.reroll')}`, null, null, 'ADMINISTRATOR', false, false, CommandCategory.ADMIN);
    }
    
    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;

        this.invoke(
            async () => {
                let msg = await this.reply(message, this.embeds.build('AF Management', IvyEmbedIcons.PREFS, 'Rerolling..', [], message));
                this.manager.client.once('guildUpdate', (old, current) => this.renameEventHandler(old as Guild, current as Guild, msg));
            },
            reason => this.reply(message, this.embeds.build('AF Management', IvyEmbedIcons.PREFS, reason, [], message))
        );
        
        return CommandReturn.EXIT;
    }

    private renameEventHandler(old: Guild, current: Guild, msg: Message) {
        if (old.name !== current.name)
            msg.edit({ embeds: [this.embeds.build('AF Management', IvyEmbedIcons.PREFS, `Rerolled the server name to ${bold(current.name)}!`)] });
    }

}