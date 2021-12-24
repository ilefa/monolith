/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { v4 as uuid } from 'uuid';
import { TaskScheduler } from '../modules';

export interface Runnable {
    run(): void;
}

export abstract class Task implements Runnable {

    public scheduler: TaskScheduler;

    constructor(public id: string) {}

    /**
     * Fired when the interval is met by the task scheduler.
     */
    abstract run(): Promise<void>;

}

export type TaskEntry = {
    task: Task;
    interval: string;
}