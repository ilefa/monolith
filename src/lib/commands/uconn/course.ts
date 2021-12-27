/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import Classrooms from '@ilefa/husky/classrooms.json';

import { UConnCourseDataProvider } from '../../modules';
import { Message, TextChannel, User } from 'discord.js';
import { AutowiredCommand, CommandCategory } from '../system';
import { bold, CommandReturn, emboss, italic, link, replaceAll } from '@ilefa/ivy';
import { CompleteCoursePayload, COURSE_IDENTIFIER, SectionData } from '@ilefa/husky';
import { EmbedIconType, getCampusIndicator, getModalityIndicator, PaginatedEmbed } from '../../util';

export class CourseCommand extends AutowiredCommand<UConnCourseDataProvider> {

    constructor() {
        super('UConnCourseProvider', 'course', `Invalid usage: ${emboss('.course <name>')}`, null, [], 'SEND_MESSAGES', false, false, CommandCategory.UCONN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (!this.module) {
            this.reply(message, this.embeds.build('Course Search', EmbedIconType.UCONN, 'Hmm, something went wrong - please try again.', [], message));
            return CommandReturn.EXIT;
        }
        
        if (args.length !== 1)
            return CommandReturn.HELP_MENU;

        if (!COURSE_IDENTIFIER.test(args[0])) {
            this.reply(message, this.embeds.build('Course Search', EmbedIconType.UCONN, `Invalid course name: ${emboss(args[0])}`, [
                {
                    name: 'Valid Course Name',
                    value: emboss('<course prefix><course number>[Q,E,W]'),
                    inline: false
                },
                {
                    name: 'Valid Examples',
                    value: emboss('CSE3100, MATH2210Q'),
                    inline: false
                }
            ], message));
            return CommandReturn.EXIT;
        }

        let course = await this.module.getCourse(args[0]);
        if (!course) {
            this.reply(message, this.embeds.build('Course Search', EmbedIconType.UCONN, `Hmm, we couldn't find any courses named ${emboss(args[0])}.`, [], message));
            return CommandReturn.EXIT;
        }

        let target = `https://cobalt-v4.ilefa.club/course/${course.name}`;
        if (!course.sections.length) {
            this.reply(message, this.embeds.build(`${course.name} - ${course.catalogName}`, EmbedIconType.UCONN, this.getEmbedDescription(course, target), [
                {
                    name: 'Sections',
                    value: ':( There aren\'t any sections being taught at the moment.',
                    inline: false
                }
            ], message));
            return CommandReturn.EXIT;
        }

        let termMarkers = course.sections.some(section => section.term !== course.sections[0].term);

        PaginatedEmbed.ofItems<SectionData>(this.engine, message.channel as TextChannel, user,
            `${course.name} - ${course.catalogName}`, EmbedIconType.UCONN, course.sections, 7,
            items => {
                return {
                    description: this.getEmbedDescription(course, target),
                    fields: [{
                        name: `Sections (${course.sections.length})`,
                        value: items.map(section => `${bold(`[${getCampusIndicator(section.campus)}/${getModalityIndicator(section.mode)}${termMarkers ? `/${section.term[0] + section.term.substring(section.term.length - 2)}` : ''}]`)} Section ${section.section} is taught ${this.getMeetingLocation(section)} by ${this.getInstructorName(section.instructor)} (${section.enrollment.current}/${section.enrollment.max}).`).join('\n'),
                        inline: false
                    }]
                }
            });

        return CommandReturn.EXIT;
    }

    private getEmbedDescription = (course: CompleteCoursePayload, target: string) =>
        `<:cobaltnative:924570604772933672> ${link('View with Cobalt', target)}\n`
        + `:hash: Credits: ${bold(course.credits + '.0')}\n` 
        + `:asterisk: Grading Type: ${bold(course.grading)}\n\n`
        + `${bold('Description')}\n` 
        + `${italic(course.description)}\n\n`
        + `${bold('Prerequisites')}\n`
        + `${italic(course.prerequisites)}\n\n`;

    private getMeetingLocation = (section: SectionData) =>
        section.location.name === 'No Room Required - Online'
            ? 'virtually'
            : 'in ' + section.location.name
                .split(/([A-Z]{2,4}\s\d{1,4}[a-zA-Z]{0,1})/)
                .filter(str => !!str)
                .map(room => this.isManagedRoom(room) ? `${bold(room)}` : link(room, `https://cobalt-v4.ilefa.club/room/${room.replace(/\s/g, '')}`))
                .join(', ');

    private getInstructorName = (instructor: string) => {
        let copy = instructor.trim();
        if (!copy.length)
            return 'someone'

        copy = replaceAll(copy, /<br\/*>/, ' ');
        copy = replaceAll(copy, '&nbsp;', ' ');
    
        return copy;
    }

    private isManagedRoom = (room: string) => Classrooms.some(r => r.name === room);

}