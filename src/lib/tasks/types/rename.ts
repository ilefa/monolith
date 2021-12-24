/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import qs from 'qs';
import axios from 'axios';

import { Task } from '..';
import { bold, time } from '@ilefa/ivy';
import { TextChannel } from 'discord.js';
import { PreferenceBundle } from '../../modules';

export class ServerRenameTask extends Task {
    
    constructor() {
        super('rename');
    }

    run = async () => {
        let data = await axios
            .post('https://backronym.org/server/proccessInput.php', qs.stringify({ word: 'AF' }))
            .then(res => res.data)
            .catch(_ => null);

        if (!data)
            return this.scheduler.warn('ServerRenameTask: Error retrieving data from the web.');

        let bundle = this.scheduler.manager.require<PreferenceBundle>('Prefs');
        if (!bundle)
            return this.scheduler.warn('ServerRenameTask: Could not fetch preference bundle.');

        let guild = await this
            .scheduler
            .client
            .guilds
            .fetch(bundle.serverId);
            
        if (!guild)
            return this.scheduler.warn('ServerRenameTask: Could not fetch guild.');

        let formatted = data
            .split(' ')
            .filter(word => /[AF]/.test(word[0]))
            .join(' ');

        let currentName = guild.name;
        let archiveChannel = await guild.channels.fetch(bundle.nameArchiveChannelId) as TextChannel;
        if (archiveChannel)
            archiveChannel.send(`${bold(`[${time(Date.now())}]`)} ${currentName} → ${formatted}`);

        guild.setName(formatted, `ServerRenameTask execution at ${time(Date.now())}`);
    }

}