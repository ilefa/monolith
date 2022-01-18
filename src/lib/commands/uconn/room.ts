/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import moment from 'moment';

import { User, Message } from 'discord.js';
import { EmbedIconType, getDateFromTime } from '../../util';
import { AutowiredCommand, CommandCategory } from '../system';
import { ROOM_REGEX_PATTERN, ScheduleEntry } from '@ilefa/bluesign';
import { CustomRoomPayload, UConnRoomDataProvider } from '../../modules';

import {
    BoardType,
    BuildingCode,
    Classroom,
    LectureCaptureType,
    SeatingType,
    TechType
} from '@ilefa/husky';

import {
    bold,
    capitalizeFirst, 
    CommandReturn,
    emboss,
    getLatestTimeValue,
    GREEN_CIRCLE,
    link,
    RED_CIRCLE,
    YELLOW_CIRCLE
} from '@ilefa/ivy';

type CurrentAndNextEvents = [CustomScheduleEntry | undefined, CustomScheduleEntry[] | undefined, boolean];

type CustomScheduleEntry = ScheduleEntry & {
    startDate: Date;
    endDate: Date;
}

export class RoomCommand extends AutowiredCommand<UConnRoomDataProvider> {

    constructor() {
        super('UConnRoomProvider', 'room', `Invalid usage: ${emboss('.room <name>')}`, null, [], 'SEND_MESSAGES', false, false, CommandCategory.UCONN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (!this.module) {
            this.reply(message, this.embeds.build('Room Search', EmbedIconType.UCONN, 'Hmm, something went wrong - please try again.', [], message));
            return CommandReturn.EXIT;
        }
        
        if (args.length === 0)
            return CommandReturn.HELP_MENU;

        let buildingCode = Object.keys(BuildingCode).find(key => args[0].toUpperCase().startsWith(key));
        let roomNumber = args[0].toUpperCase().split(buildingCode.toUpperCase())[1];
        let special = `${buildingCode}_${roomNumber}`

        if (args.length > 1 || !ROOM_REGEX_PATTERN.test(special)) {
            this.reply(message, this.embeds.build('Room Search', EmbedIconType.UCONN, `Invalid room name: ${emboss(args[0])}`, [
                {
                    name: 'Valid Room Name',
                    value: emboss('<building prefix><room number>'),
                    inline: false
                },
                {
                    name: 'Valid Examples',
                    value: emboss('MONT419, MCHU201, GP107'),
                    inline: false
                }
            ], message));
            return CommandReturn.EXIT;
        }

        let room = await this.module.getRoom(special, args[0].toUpperCase());
        if (!room) {
            this.reply(message, this.embeds.build('Room Search', EmbedIconType.UCONN, `Hmm, we couldn't find any rooms named ${emboss(args[0])}.`, [], message));
            return CommandReturn.EXIT;
        }

        let roomDataAvailable = !!room.capacity;
        let payload = `${bold('Current Status')}\n`
                    + `${this.getRoomStatus(room.title, room)}\n\n`
                    + `${bold('Scheduled Usage')}\n` 
                    + `${this.getRoomSchedule(room.title, room)}`

        if (!roomDataAvailable) {
            this.reply(message, this.embeds.build(room.title.replace(/\s/g, ''), EmbedIconType.UCONN,
                payload + `\n\n${bold('Room Information')}\nInformation about ${bold(room.title)} isn't available.`, [], message))
            return CommandReturn.EXIT;
        }
    
        this.reply(message, this.embeds.build(`${room.building.name} ${room.name.split(room.building.code)[1]} (${room.title})`,
            EmbedIconType.UCONN, payload + `\n\n${bold('Technical Facts')}\n` + this.getRoomFacts(room), [], message))
        
        return CommandReturn.EXIT;
    }
    
    private getCurrentAndNextEvents = (schedule?: CustomRoomPayload): CurrentAndNextEvents => {
        if (!schedule)
            return [undefined, undefined, false];
    
        let events = schedule
            .entries
            .map(ent => ({
                ...ent,
                startDate: getDateFromTime(ent.start),
                endDate: getDateFromTime(ent.end)
            }));
    
        let current = events.find(e => e.startDate.getTime() <= Date.now() && e.endDate.getTime() >= Date.now());
        let next = events.filter(e => e.startDate.getTime() > Date.now());
    
        return [current, next, true];
    }

    private getRoomStatus = (room: string, schedule: CustomRoomPayload) => {
        let events = schedule
            .entries
            .map(ent => ({
                ...ent,
                startDate: getDateFromTime(ent.start),
                endDate: getDateFromTime(ent.end)
            }));
    
        let current = events.find(e => e.startDate.getTime() <= Date.now() && e.endDate.getTime() >= Date.now());
        let next = events.filter(e => e.startDate.getTime() > Date.now());
    
        return current ?
                `${RED_CIRCLE} ${bold(capitalizeFirst(current.event))} for the next ${bold(getLatestTimeValue(current.endDate.getTime() - Date.now()))}.`
                : next.length
                    ? `${YELLOW_CIRCLE} ${bold(capitalizeFirst(next[0].event))} starts ${moment(next[0].startDate).fromNow()}`
                    : `${GREEN_CIRCLE} ${bold(room)} is free.`;
    }

    private getRoomFacts = (room: Classroom) =>
        `<:cobaltnative:924570604772933672> ${link('View with Cobalt', `https://cobalt-v4.ilefa.club/room/${room.building.code + room.room}`)}\n`
      + `:record_button: Campus: ${bold(capitalizeFirst(room.building.campus.toLowerCase()))}\n` 
      + `:seat: Seating: ${bold(SeatingType[room.seatingType] ?? 'Unknown')}\n` 
      + `:man_teacher: Board: ${bold(BoardType[room.boardType] ?? 'Unknown')}\n` 
      + `:desktop: Technology: ${bold(TechType[room.techType]) ?? 'Unknown'}\n` 
      + `:video_camera: Lecture Capture: ${bold(LectureCaptureType[room.lectureCapture] ?? 'Unknown')}\n\n`
      + `${bold('Capacity')}\n` 
      + `:person_running: Regular: ${bold(room.capacity.full)}\n`
      + `:microbe: COVID-19: ${bold(room.capacity.covid)}\n\n` 
      + `${bold('Amenities')}\n` 
      + `${this.getRoomAmenities(room)}\n\n` 
      + `${bold('Conferencing')}\n` 
      + `${this.getConferencingDetails(room)}`;

    private getRoomAmenities = (room: Classroom) => 
        `${this.getStatusIcon(room.airConditioned)} Air Conditioning\n` 
      + `${this.getStatusIcon(room.byodTesting)} BYOD Testing`;

    private getConferencingDetails = (room: Classroom) =>
        `${this.getStatusIcon(room.videoConference?.attributes?.shareContent)} Share Content\n`
      + `${this.getStatusIcon(room.videoConference?.attributes?.instructorFacingCamera)} Instructor-facing Camera\n`
      + `${this.getStatusIcon(room.videoConference?.attributes?.studentFacingCamera)} Student-facing Camera\n`
      + `${this.getStatusIcon(room.videoConference?.attributes?.presentMediaFrontOfRoom)} Present Media (Front)\n`
      + `${this.getStatusIcon(room.videoConference?.attributes?.presentMediaBackOfRoom)} Present Media (Back)\n`
      + `${this.getStatusIcon(room.videoConference?.attributes?.instructorMicrophone)} Instructor Microphone\n`
      + `${this.getStatusIcon(room.videoConference?.attributes?.studentMicrophone)} Student Microphone(s)\n`
      + `${this.getStatusIcon(room.videoConference?.attributes?.connectToWebex)} Webex Capable\n`;

    private getStatusIcon = (status: boolean | null) =>
        !!status
            ? status 
                ? ':white_check_mark:'
                : ':no_entry_sign:'
            : '<:question:933074469541531699>';

    private getRoomSchedule = (room: string, schedule: CustomRoomPayload) =>
        schedule && schedule.entries.length
            ? schedule
                .entries
                .map(entry => ({
                    ...entry,
                    startDate: getDateFromTime(entry.start),
                    endDate: getDateFromTime(entry.end)
                }))
                .map(entry => {
                    let clazz = !!entry.section;
                    let event = clazz
                        ? link(`${entry.event} (${entry.section})`, `https://cobalt-v4.ilefa.club/course/${entry.event.replace(/\s/g, '')}`)
                        : bold(entry.event);

                    return `${bold(`${entry.start} - ${entry.end}`)} used by ${event}.`;
                })
                .join('\n')
            : `:calendar: ${bold(room)} has nothing scheduled for the day.`

}