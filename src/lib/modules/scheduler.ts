/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import scheduler from 'node-schedule';

import { Dispatcher } from '.';
import { Job } from 'node-schedule';
import { TaskEntry } from '../tasks';
import { getSystemTimezone } from '../util';
import { bold, conforms, Module } from '@ilefa/ivy';

export class TaskScheduler extends Module {

    private registeredTasks: TaskEntry[];
    private scheduledJobs: Map<string, Job>;
    private CRON_REGEX = /(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})/;

    constructor() {
        super('TaskScheduler', 'Scheduler');
        this.registeredTasks = [];
        this.scheduledJobs = new Map();
    }

    start = () => {
        this
            .registeredTasks
            .forEach(entry => this
                .scheduledJobs
                .set(entry.task.id, scheduler.scheduleJob(entry.interval, entry.task.run)));

        this.registeredTasks.forEach(({ task }) => task.start());
        this.log(`Scheduled ${this.registeredTasks.length} tasks.`);

        let timezone = getSystemTimezone();
        if (timezone !== 'America/New_York') {
            let dispatcher = this.manager.require<Dispatcher>('Dispatcher');
            dispatcher.sendAlert(`:warning: The system timezone is not set to ${bold('America/New_York')} - this will cause problems with scheduled tasks.`);
        }
    }

    end = () => this.registeredTasks.forEach(entry => {
        let job = this.scheduledJobs.get(entry.task.id);
        if (!job)
            return;

        job.cancel();
        this.scheduledJobs.delete(entry.task.id);
    });

    schedule(entry: TaskEntry) {
        let match = this.getTaskById(entry.task.id);
        if (match) return this.warn(`Failed to register task with ambiguous ID [${entry.task.id}]`);

        if (!conforms(this.CRON_REGEX, entry.interval))
            return this.warn(`Failed to register task with ID ${entry.task.id} since it has an invalid schedule: [${entry.interval}]`);

        entry.task.scheduler = this;
        this.registeredTasks.push(entry);
    }

    invokeNow(id: string) {
        let match = this.getTaskById(id)
        if (!match) return;

        let job = this.scheduledJobs.get(match.id);
        job.invoke();
    }

    cancel(id: string) {
        let match = this.getTaskById(id);
        if (!match) return;

        let job = this.scheduledJobs.get(match.id);
        job.cancel();

        this.scheduledJobs.delete(match.id);
        this.registeredTasks = this.registeredTasks.filter(entry => entry.task.id !== id);
    }

    getTaskById(id: string) {
        let match = this.registeredTasks.find(entry => entry.task.id === id);
        if (!match) return null;

        return match.task;
    }

}