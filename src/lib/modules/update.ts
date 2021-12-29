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
import { WebhookClient } from 'discord.js';

export class UpdateManager extends Module {
 
    private webhookUrl: string;

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
    }

    end() {}

    runUpdate = (then: () => void, failure: (message: any) => void) =>
        axios
            .post('https://172.17.0.1:3000/update')
            .then(_ => {
                then();
                this.client.user.setPresence({
                    status: 'dnd',
                    activities: [{
                        type: 'PLAYING',
                        name: 'with Docker.'
                    }]
                })

                let webhook = new WebhookClient({ url: this.webhookUrl });
                webhook.send({ content: `:crystal_ball: ${bold('Monolith')} is restarting for an update.` });
            })
            .catch(failure);

}