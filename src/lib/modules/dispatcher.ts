/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Module } from '@ilefa/ivy';
import { PreferenceBundle } from '.';
import { MessageOptions, WebhookClient } from 'discord.js';

type DispatchType = 'alert' | 'status';

type MessageLike = string | MessageOptions;

export class Dispatcher extends Module {

    private bundle: PreferenceBundle;

    constructor() {
        super('dispatcher', 'Dispatcher');
    }

    start() {
        let bundle = this.manager.require<PreferenceBundle>('Prefs');
        if (!bundle) {
            this.manager.unregisterModule(this);
            this.warn('Could not retrieve preference bundle.');
            return;
        }

        this.bundle = bundle;
        this.log(`Dispatcher activated for environment \`${this.bundle.preset}\`.`);
        this.log(` - Alerts: ${this.bundle.alertsWebhook}`);
        this.log(` - Status: ${this.bundle.statusWebhook}`);
    }

    end() {}

    /**
     * Dispatches an message using the alerts webhook.
     * @param message the message to send
     */
    sendAlert = (message: MessageLike) => {
        let client = this.createClient('alert');
        client
            .send(message)
            .then(client.destroy)
            .catch(err => {
                this.except(err, 'Could not dispatch alert');
                client.destroy();
            });
    }

    /**
     * Dispatches an message using the status webhook.
     * @param message the message to send
     */
    sendStatus = (message: MessageLike) => {
        let client = this.createClient('status');
        client
            .send(message)
            .then(client.destroy)
            .catch(err => {
                this.except(err, 'Could not dispatch status');
                client.destroy();
            });
    }
    
    private createClient = (type: DispatchType) => new WebhookClient({
        url: type === 'alert' ? this.bundle.alertsWebhook : this.bundle.statusWebhook
    });

}