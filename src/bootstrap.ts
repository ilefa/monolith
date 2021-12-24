/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import env from 'dotenv';

import { Logger } from '@ilefa/ivy';
import { MonolithApp } from './app';
import { DatabaseManager, RemotePreferenceBundle } from './lib/database';
import { COMMIT_HASH, DISPLAY_VERSION, RELEASE_CHANNEL } from './build';

env.config();

const start = Date.now();
const logger = new Logger();
const preset = process.env.PRESET;
const db = new DatabaseManager(logger, true);

logger.info('Build', `Monolith version ${DISPLAY_VERSION} (${COMMIT_HASH.trim() || 'unknown'} -> ilefa/monolith:${RELEASE_CHANNEL})`);

(async () => {
    await db.start();
    const bundle = await db
        .getModel(RemotePreferenceBundle)
        .findOne({ name: preset })
        .lean()
        .catch(console.error);
    
    if (!bundle) {
        logger.severe('Env', `Could not locate preferences for \`${preset}\` preset!`);
        process.exit(1);
    }
    
    logger.info('Env', `Loaded & applied \`${preset}\` preset in ${(Date.now() - start).toFixed(2)}ms.`);
    await db.end();
    new MonolithApp(bundle.token, bundle.prefix, bundle.color, logger, bundle.superPerms, bundle.serverId, bundle).prefs = bundle;
})();