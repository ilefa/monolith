/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Task } from '..';
import { MinecraftStatusManager } from '../../modules';

export class MinecraftStatusFetcher extends Task {
    
    private manager: MinecraftStatusManager;
    
    constructor() {
        super('minecraft');
    }

    start = () => {
        this.manager = this.scheduler.manager.require<MinecraftStatusManager>('MinecraftStatus');
        if (!this.manager) this.scheduler.warn('Could not retrieve the status manager.');
    }

    run = async () => {
        this.manager.onUpdate();
        this.scheduler.client.emit('minecraftSync');
    }

}