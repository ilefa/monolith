/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import axios from 'axios';

import { Stash } from '../../util';
import { Module } from '@ilefa/ivy';
import { CompleteCoursePayload, COURSE_IDENTIFIER } from '@ilefa/husky';

export class UConnCourseDataProvider extends Module {

    private stash: Stash<string, CompleteCoursePayload>;

    constructor() {
        super('UConnCourseProvider', 'UConn');
    }

    start = () => this.stash = new Stash({
        keyspace: {
            delimiter: '.',
            prefix: 'uconn.course',
            serialize: key => key,
            deserialize: key => key,
        },
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        expiry: 10 * 60,
        serializers: {
            resultTransformer: JSON.parse,
            typeTransformer: JSON.stringify
        }
    });

    end() {}

    /**
     * Retrieves information about a course
     * either from the stable Cobalt API
     * endpoint, or from cache.
     * 
     * @param name the name of the course
     */
    getCourse = async (name: string) => {
        if (!COURSE_IDENTIFIER.test(name))
            return null;

        return await this.stash.retrieveOrSet(name, await this.retrieveCourse(name));
    }

    private retrieveCourse = async (name: string) =>
        await axios
            .get(`https://cobalt.ilefa.club/api/course/${name}`)
            .then(res => res.data)
            .then(data => data as CompleteCoursePayload)
            .catch(_ => null);

}