/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { TaskScheduler } from '../../modules';
import { Command, CommandReturn } from '@ilefa/ivy';
import { EmbedFieldData, Message, PermissionResolvable, User } from 'discord.js';

export abstract class InvokerCommand extends Command {

    private task: string;
    private scheduler: TaskScheduler;

    constructor(task: string,
                       name: string,
                       help: string,
                       helpTitle: string,
                       helpFields: EmbedFieldData[],
                       permission: PermissionResolvable | 'SUPER_PERMS',
                       deleteMessage?: boolean,
                       hideFromHelp?: boolean,
                       category?: string,
                       permitRoles?: string[],
                       permitUsers?: string[],
                       internalCommand?: boolean) {
        super(name, help, helpTitle, helpFields, permission, deleteMessage, hideFromHelp, category, permitRoles, permitUsers, internalCommand);
        this.task = task;
    }

    start() {
        super.start();
        this.engine.client.once('ready', () => {
            this.scheduler = this.engine.moduleManager.require<TaskScheduler>('TaskScheduler');
        });
    }

    abstract execute(user: User, message: Message, args: string[]): Promise<CommandReturn>;

    protected invoke = (then: () => void, failure: (reason: string) => void) => {
        if (!this.scheduler)
            return failure('Could not locate the task scheduler.');

        let job = this.scheduler.getTaskById(this.task);
        if (!job)
            return failure('Could not locate the task.');

        this.scheduler.invokeNow(job.id);
        then();
    }

}