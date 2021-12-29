/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import axios from 'axios';

import { Classroom } from '@ilefa/husky';
import { Module, Stash } from '@ilefa/ivy';

import {
    getRoomSchedule,
    isRoomTracked,
    ROOM_REGEX_PATTERN,
    ScheduleEntry
} from '@ilefa/bluesign';

export type CustomRoomPayload = {
    title: string;
    date: string;
    entries: ScheduleEntry[];
}

export type RoomPayload = CustomRoomPayload & Classroom;

export class UConnRoomDataProvider extends Module {

    private stash: Stash<string, RoomPayload>;

    constructor() {
        super('UConnRoomProvider', 'Rooms');
    }

    start = () => this.stash = new Stash({
        keyspace: {
            delimiter: '.',
            prefix: 'uconn.room',
            serialize: key => key,
            deserialize: key => key,
        },
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        expiry: 60,
        serializers: {
            resultTransformer: JSON.parse,
            typeTransformer: JSON.stringify
        }
    });

    end() {}
    
    /**
     * Retrieves information about a room
     * either from the stable Cobalt API
     * endpoint, or from cache.
     * 
     * @param name the name of the room
     */
    getRoom = async (special: string, normalized: string) => {
        if (!ROOM_REGEX_PATTERN.test(special))
            return null;

        if (!isRoomTracked(special))
            return null;

        return await this.stash.retrieveOrSet(normalized, await this.retrieveRoom(special, normalized));
    }

    private retrieveRoom = async (special: string, normalized: string) => {
        let roomData = await axios
            .get(`https://cobalt.ilefa.club/api/room/${normalized}`)
            .then(res => res.data)
            .then(data => data as Classroom)
            .catch(_ => null);

        let roomSchedule = await getRoomSchedule(special);
        return { ...roomData, ...roomSchedule };
    }

}