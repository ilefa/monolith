/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import axios from 'axios';

import { PreferenceBundle } from '.';
import { bold, Module } from '@ilefa/ivy';

export class UpdateManager extends Module {
 
    private webhookUrl: string;
    private webhookId: string;

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

        let bundle = this.manager.require<PreferenceBundle>('Prefs');
        if (!bundle) {
            this.manager.unregisterModule(this);
            this.warn('Could not retrieve preference bundle.');
            return;
        }

        this.webhookUrl = bundle.statusWebhook;
        this.webhookId = this.webhookUrl.split('/').pop();
    }

    end() {}

    runUpdate = () =>
        axios
            .post('https://172.17.0.1:3000/update')
            .then(_ => this
                .client
                .fetchWebhook(this.webhookUrl)
                .then(webhook => webhook.send(`:crystal_ball: ${bold('Monolith')} is restarting for an update.`)))
            .catch(_ => null);

}