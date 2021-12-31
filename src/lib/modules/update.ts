/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import axios from 'axios';

import { Dispatcher } from '.';
import { bold, Module } from '@ilefa/ivy';

export class UpdateManager extends Module {
 
    private dispatcher: Dispatcher;

    constructor() {
        super('UpdateManager', 'Update');
    }

    start() {
        let managed = process.env.MANAGED;
        if (!managed || managed !== 'true') {
            this.manager.unregisterModule(this);
            this.warn('This module is only available for managed instances.');
            return;
        }

        let dispatcher = this.manager.require<Dispatcher>('Dispatcher');
        if (!dispatcher) {
            this.manager.unregisterModule(this);
            this.warn('Could not retrieve the dispatcher.');
            return;
        }

        this.dispatcher = dispatcher;
        this.log('Update Manager is ready.');
    }

    end() {}

    runUpdate = (then: () => void, failure: (message: any) => void) =>
        axios
            .post('http://172.17.0.1:3000/update')
            .then(then)
            .then(_ => {
                this.dispatcher.sendStatus({ content: `:crystal_ball: ${bold('Monolith')} is restarting for an update.` });
                this.client.user.setPresence({
                    status: 'dnd',
                    activities: [{
                        type: 'PLAYING',
                        name: 'with updates.'
                    }]
                })
            })
            .catch(failure);

}