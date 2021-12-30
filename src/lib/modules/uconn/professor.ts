/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import axios from 'axios';
import RmpIds from '@ilefa/husky/rmpIds.json';

import { Module, Stash } from '@ilefa/ivy';
import { RateMyProfessorReport } from '@ilefa/husky';
import { BluepagesRecord, lookup } from '@ilefa/bluepages';
import { BestMatch, findBestMatch } from 'string-similarity';

export type ProfessorReport = RmpReport & BluepagesRecord;

export type RmpReport = RateMyProfessorReport & {
    mostRelevant: string;
}

export class UConnProfessorDataProvider extends Module {

    private stash: Stash<string, ProfessorReport>;
    
    constructor() {
        super('UConnProfessorProvider', 'Professors');
    }

    start = () => this.stash = new Stash({
        keyspace: {
            delimiter: '.',
            prefix: 'uconn.professor',
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
     * Retrieves information about a professor
     * either from the stable Cobalt API
     * endpoint, or from cache.
     * 
     * @param name the name of the room
     */
    getProfessor = async (name: string) => await this.stash.retrieveOrSet(name, await this.retrieveProfessor(name));

    getClosestMatches = (input: string): BestMatch => findBestMatch(input.toLowerCase(), RmpIds.map(rmp => rmp.name.toLowerCase()));

    private retrieveProfessor = async (name: string) => {
        let record = await lookup(name);
        let matches = RmpIds.find(rmp => rmp.name.toUpperCase() === name.toUpperCase());
        if (!matches)
            return record;

        let rmp = await axios
            .get(`https://cobalt.ilefa.club/api/professor/${matches.rmpIds.join(',')}`)
            .then(res => res.data)
            .then(data => data as RmpReport)
            .catch(_ => null);

        return { ...rmp, ...record };
    }
    
}