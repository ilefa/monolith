/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { CommandCategory } from './system';
import { asMention, bold, Command, CommandReturn, emboss, italic } from '@ilefa/ivy';
import { EmbedIconType, RESPONSE_GROUP_EMOJI, RESPONSE_GROUP_EMOJI_RAW } from '../util';

export class PollCommand extends Command {

    constructor() {
        super('poll', `Invalid usage: ${emboss('.poll <[question]> [responses..]')}`, null, [
            {
                name: 'Simple Polls',
                value: 'If you just want a poll with standard 👍, 👎, 🤷 responses, you may just supply a question prompt wrapped in brackets.',
                inline: false
            },
            {
                name: 'Advanced Polls',
                value: 'If you would like to fully utilize the power of Monolith polling, supply a question prompt wrapped in brackets, followed by up to twenty custom response prompts.',
                inline: false
            },
            {
                name: 'Advanced Poll Example',
                value: `The following command will create a poll asking the question ${bold('do stonks go brrr?')}\n` +
                       `This poll will have four responses, ${emboss('of course')}, ${emboss('yes')}, ${emboss('~~no~~')}, and ${emboss('pee')}.\n\n` +
                       `${emboss(`.poll [do stonks go brrr?] [of course]   [yes]   [~~noo~~]   [pee]`)}\n` +
                       `${emboss(`         question prompt        a          b         c         d  `)}\n`,
                inline: false
            }
        ], 'BAN_MEMBERS', false, false, CommandCategory.INFO);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            return CommandReturn.HELP_MENU;
        }

        let prompt = args.join(' ');
        let components = prompt
            .split('[')
            .join('')
            .split(']')
            .map(ent => ent.trim())
            .filter(ent => ent !== '');

        // Simple polls
        if (components.length === 1) {
            let reply = await this.reply(message, this.embeds.build('Polls', EmbedIconType.POLL, `${italic(prompt)}\nby ${asMention(user)}`, null, message));
            ['👍', '👎', '🤷'].map(async emote => await reply.react(emote));

            return CommandReturn.EXIT;
        }

        if (components.length > 0 && components.length < 3) {
            return CommandReturn.HELP_MENU;
        }

        // Complex polls
        let question = components[0].trim();
        let responses = components.slice(1);
        if (responses.length < 2 || responses.length > 20) {
            this.reply(message, this.embeds.build('Polls', EmbedIconType.POLL, `${responses.length < 2 ? 'Too few response groups, must have have atleast two.' : 'Too many response groups, can have twenty at most.'}`, [
                {
                    name: 'Valid Response Specification',
                    value: emboss('[<response>]'),
                    inline: false
                },
                {
                    name: 'Valid Example',
                    value: emboss('.poll [do stonks go brrr?] [of course] [yes] [~~no~~] [pee]'),
                    inline: false
                }
            ], message));

            return CommandReturn.EXIT;
        }

        let str = '';
        let emotes = [];
        responses.map((response, i) => {
            str += `${RESPONSE_GROUP_EMOJI[i]} ${response.trim()}\n`;
            emotes.push(RESPONSE_GROUP_EMOJI_RAW[i]);
        })

        let reply = await this.reply(message, this.embeds.build('Polls', EmbedIconType.POLL, `${italic(question)}\n` 
            + `by ${asMention(user)}\n\n` 
            + `${bold('Responses')}\n` 
            + `${str.trim()}`, null, message));

        emotes.map(async emote => await reply.react(emote));
        return CommandReturn.EXIT;
    }

}