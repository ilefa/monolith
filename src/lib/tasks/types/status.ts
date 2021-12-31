/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import axios from 'axios';

import { Task } from '..';
import { UConnServiceStatus } from '@ilefa/husky';
import { SERVICES, StatusReport, UConnStatusRepository } from '../../modules';

export class UConnStatusFetcher extends Task {
    
    private repository: UConnStatusRepository;
    
    constructor() {
        super('status');
    }

    start = () => {
        this.repository = this.scheduler.manager.require<UConnStatusRepository>('UConnStatusRepository');
        if (!this.repository) this.scheduler.warn('Could not retrieve the status repository.');
    }

    run = async () => {
        let self = this;
        let statuses = [];

        for (let service of SERVICES) {
            statuses.push(await self.getRemoteStatus(service.key.toLowerCase(), service.url));
        }

        statuses.forEach(status => this.repository.stash.store(status.service, status));
        this.repository.onUpdate();
    }

    private getRemoteStatus = async (name: string, url: string, degradedThreshold = 2500, timeout = 7500): Promise<StatusReport> => {
        const start = Date.now();
        return await axios
            .get(url, { timeout })
            .then(_ => {
                let diff = Date.now() - start;
                let status = diff >= degradedThreshold
                    ? UConnServiceStatus.DEGRADED
                    : UConnServiceStatus.OPERATIONAL;

                return ({
                    service: name,
                    status,
                    time: Date.now()
                });
            })
            .catch(_ => ({ service: name, status: UConnServiceStatus.OUTAGE, time: Date.now() }));
    }

}