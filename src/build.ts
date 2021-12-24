/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import buildInfo from '../build_info.json';

export const DISPLAY_VERSION = buildInfo.version;
export const MAJOR_VERSION = buildInfo.version.split('.')[0];
export const MINOR_VERSION = buildInfo.version.split('.')[1];
export const PATCH_VERSION = buildInfo.version.split('.')[2];
export const COMMIT_HASH = buildInfo.sha;
export const COMMIT_MESSAGE = buildInfo.message;
export const COMMIT_AUTHOR = buildInfo.dev;
export const COMMIT_AUTHOR_NAME = buildInfo.dev_name;
export const COMMIT_AUTHOR_EMAIL = buildInfo.dev_email;
export const RELEASE_CHANNEL = buildInfo.channel;
export const HOST = buildInfo.device;
export const BUILT_AT = buildInfo.time;
export const PRESET = process.env.PRESET;