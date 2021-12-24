/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Task } from '..';
import { DinnerHallManager } from '../../modules/dining';

export class BlueplateRefreshTask extends Task {

    constructor() {
        super('blueplate');
    }

    run = async () => {
        let manager = this.scheduler.manager.require<DinnerHallManager>('DinnerHallManager');
        if (!manager)
            return this.scheduler.warn('BlueplateRefreshTask: Could not fetch DinnerHallManager.');

        manager.onUpdate();
        this.scheduler.client.emit('blueplateSync');
    }

}