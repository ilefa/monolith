/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { EmbedIconType } from '../../util';
import { CommandCategory } from '../system';
import { GuildEmoji, Message, TextChannel, User } from 'discord.js';
import { asEmote, Command, CommandReturn, emboss, PaginatedEmbed } from '@ilefa/ivy';

export class EmoteCommand extends Command {

    constructor() {
        super('emote', `Invalid usage: ${emboss('.emote')}`, null, [], 'SEND_MESSAGES', false, false, CommandCategory.INFO);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;

        let emotes = await message.guild.emojis.fetch();
        let items = [...emotes.values()];

        PaginatedEmbed.ofItems<GuildEmoji>(this.engine, message.channel as TextChannel, user,
            'Emotes', EmbedIconType.MESSAGE, items, 50,
            items => {
                let emoji = items.map(asEmote);
                let description = '';

                for (let i = 0; i < emoji.length; i++) {
                    if (i % 10 === 0)
                        description += '\n';
                    description += `${emoji[i]} `;
                }

                return { description, fields: [] };
            });

        return CommandReturn.EXIT;
    }

}