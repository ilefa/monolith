/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { User, Message } from 'discord.js';
import { AutowiredCommand, CommandCategory } from '../system';
import { ProfessorReport, UConnProfessorDataProvider } from '../../modules';
import { addTrailingDecimal, EmbedIconType, RMP_TAG_CONS, RMP_TAG_PROS } from '../../util';

import {
    bold,
    capitalizeFirst,
    CommandReturn,
    emboss,
    link,
    mentionChannel
} from '@ilefa/ivy';

enum RmpTag {
    PRO = '<:triangle_up:859218865023877162>',
    CON = ':small_red_triangle_down:',
    UNKNOWN = ':grey_question:'
}

enum RmpTagOrdinal {
    PRO, CON, UNKNOWN
}

export class ProfessorCommand extends AutowiredCommand<UConnProfessorDataProvider> {
    
    constructor() {
        super('UConnProfessorProvider', 'prof', `Invalid usage: ${emboss('.prof <name..>')}`, null, [], 'SEND_MESSAGES', false, false, CommandCategory.UCONN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (!this.module) {
            this.reply(message, this.embeds.build('Professor Search', EmbedIconType.MEMBER, 'Hmm, something went wrong - please try again.', [], message));
            return CommandReturn.EXIT;
        }
        
        if (args.length === 0)
            return CommandReturn.HELP_MENU;

        let name = args.join(' ');
        let data = await this.module.getProfessor(name);
        if (!data || !data.average) {
            let matches = this.getTopMatches(name, 10);
            let embed = await this.reply(message, this.embeds.build('Professor Search', EmbedIconType.MEMBER,
                `:mag_right: Results for ${emboss(name)}:\n\n`
                + matches.map((match, i) => `${bold(`${i + 1}.`)} ${this.getTargetName(match.target)}`).join('\n') + `\n\n`
                + `Select a professor by typing ${bold(`1-${matches.length}`)} in ${mentionChannel(message.channel.id)}.`,
                [], message));

            message.channel.awaitMessages(
                {
                    max: 1,
                    time: 30000,
                    errors: ['time'],
                    filter: message => message && message.author.id === user.id
                }
            )
            .then(async _m => {
                let msg = _m.first();
                let choice = parseInt(msg.content);

                // selection not numeric
                if (isNaN(choice)) {
                    msg.reply(`:x: Non-Numeric Selection: ${emboss(msg.content)}`);
                    return;
                }

                // selection not in range
                let valid = Array.from(Array(matches.length).slice(1).keys());
                if (!valid.includes(choice)) {
                    msg.reply(`:x: Invalid Selection: ${emboss(choice)}`);
                    return;
                }

                // selection is valid, but doesn't appear to exist (?)
                let selected = matches[choice - 1];
                if (!selected) {
                    msg.reply(`:x: Something went wrong while processing your request.`);
                    return;
                }

                // clean up
                msg.delete();
                embed.delete();

                // dispatch
                let report = await this.module.getProfessor(selected.target);
                this.reply(message, await this.generateReply(message, report, capitalizeFirst(selected.target)));
            })
            .catch(() => {
                message.reply(`:hourglass: Professor selection timed out.`);
                embed.delete();
            });

            return CommandReturn.EXIT;
        }

        this.reply(message, await this.generateReply(message, data, name));
        return CommandReturn.EXIT;
    }

    private generateReply = async (message: Message, report: ProfessorReport, name: string) => {
        let rmp = `Rate My Professors report for ${bold(name)} is not available.`;
        if (report.average)
            rmp = `${bold(report.name)} was scored ${bold(`${addTrailingDecimal(report.average)}/5.0`)} based on ${bold(report.ratings)} rating${report.ratings === 1 ? '' : 's'}.\n` 
                   + `Difficulty Score: ${bold(`${addTrailingDecimal(report.difficulty)}/5.0`)}\n` 
                   + `Would Retake: ${bold(`${addTrailingDecimal(report.takeAgain)}%`)}\n\n` 
                   + `:link: ${link('View reviews on RMP', `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${report.mostRelevant}`)}\n\n` 
                   + `${bold('Student-Assigned Tags')}\n` 
                   + report
                       .tags
                       .filter((val, i, self) => self.indexOf(val) === i)
                       .sort((a, b) => this.proOrConSorting(a) - this.proOrConSorting(b))
                       .map(ent => `${this.proOrCon(ent)} ${ent}`)
                       .join('\n');

        let bluepages = `Bluepages report for ${bold(name)} is not available.`;
        if (report.netId)
            bluepages = this.processBluepagesEntry(report, 'email', 'Email') 
                      + this.processBluepagesEntry(report, 'netId', 'NetID')
                      + this.processBluepagesEntry(report, 'building', 'Building')
                      + this.processBluepagesEntry(report, 'department', 'Dept')
                      + this.processBluepagesEntry(report, 'title', 'Title');

        return this.embeds.build(report.name, EmbedIconType.MEMBER, `${rmp}\n\n${bold('Bluepages Report')}\n${bluepages}`, [], message);
    }

    private getTopMatches = (name: string, limit = 5) =>
        this
            .module
            .getClosestMatches(name)
            .ratings
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);

    private getTargetName = (name: string) =>
        name
            .split(/\s/g)
            .map(ent => ent[0].toUpperCase() + ent.slice(1))
            .join(' ');

    private processBluepagesEntry = (data: ProfessorReport, attrib: keyof ProfessorReport, header: string, transform?: (value: string) => string) => {
        if (!data[attrib])
            return '';

        let display = data[attrib];
        if (transform)
            display = transform(data[attrib] as string);

        return `${header}: ${bold(display)}\n`;
    }

    private proOrCon = (tag: string) => {
        if (RMP_TAG_PROS.includes(tag.toLowerCase()))
            return RmpTag.PRO;
    
        if (RMP_TAG_CONS.includes(tag.toLowerCase()))
            return RmpTag.CON;
    
        return RmpTag.UNKNOWN;
    }
    
    private proOrConSorting = (tag: string) => {
        if (RMP_TAG_PROS.includes(tag.toLowerCase()))
            return RmpTagOrdinal.PRO;
    
        if (RMP_TAG_CONS.includes(tag.toLowerCase()))
            return RmpTagOrdinal.CON;
    
        return RmpTagOrdinal.UNKNOWN;
    }

}