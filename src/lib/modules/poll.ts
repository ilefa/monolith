/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { asMention, Module } from '@ilefa/ivy';
import { Message, MessageReaction, User } from 'discord.js';
import { EmbedIconType, RESPONSE_GROUP_EMOJI, RESPONSE_GROUP_EMOJI_RAW } from '../util';

export class PollManager extends Module {

    constructor() {
        super('Polls');
    }

    start = () => this.manager.engine.logger.info('Polls', 'Poll Manager is ready.');
     
    end() {}

    async handleAdd(reaction: MessageReaction, user: User) {
        let message = reaction.message.partial ? await reaction.message.fetch() : reaction.message;

        await Promise.all(message.reactions.cache.map(async oldReact => {
            if (oldReact.emoji.name ===  reaction.emoji.name) return;
            if (!oldReact.users.cache.size) await oldReact.users.fetch();
            oldReact.users.cache.forEach((testUser, key) => {
                if (testUser.id === user.id) {
                    oldReact.users.remove(user);
                    oldReact.users.cache.delete(key);
                }
            })
        }));

        await this.handle(reaction);
    }

    async handle(reaction: MessageReaction) {
        let message = reaction.message.partial
            ? await reaction.message.fetch()
            : reaction.message as Message;

        let fields = [];
        let questionString = this.getQuestionString(message);
        let reactionMap = this.isComplex(message)
            ? this.getResponses(message)
            : this.basicMap;

        await Promise.all(message.reactions.cache.map(async reaction => {
            let title = reactionMap.get(reaction.emoji.name);
            if (!title)
                return;

            title += ` (${reaction.count - 1})`;

            let players = '';
            if (!reaction.users.cache.size) await reaction.users.fetch();
            reaction.users.cache.forEach(user => {
                if(user.bot) return;
                players += asMention(user) + '\n';
            });

            if (players === '')
                return;

            fields.push({
                name: title,
                value: players,
                inline: true
            });
        }));

        if (fields.length === 0) fields.push({
            name: 'No Responses :(',
            value: 'Click a reaction to start voting!',
        });

        let embed = this.manager.engine.embeds.build('Polls', EmbedIconType.POLL, questionString, fields);
        await message.edit({ embeds: [embed] });
    }

    handleSimple = async (message: Message) => this.basicMap.forEach((_, emote) => message.react(emote));

    private getQuestionString = (message: Message): string => message.embeds[0].description;

    private isComplex = (message: Message): boolean => this.getQuestionString(message).includes('Responses');

    private getResponses(message: Message): Map<string, string> {
        let responses = message
            .embeds[0]
            .description
            .split('Responses')[1]
            .split('**')[1]
            .split('\n')
            .slice(1);

        let map = new Map<string, string>();
        responses.forEach(str => {
            let [key, ...value] = str.split(' ');
            map.set(RESPONSE_GROUP_EMOJI_RAW[RESPONSE_GROUP_EMOJI.indexOf(key)], value.join(' '));
        });

        return map;
    }

    private basicMap = new Map([
        ['👍', 'Yes'],
        ['👎', 'No'],
        ['🤷', 'Doesn\'t Care']
    ]);

}