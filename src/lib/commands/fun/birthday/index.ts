/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { MultiCommand } from '@ilefa/ivy';
import { ListBirthdaysCommand } from './list';
import { CommandCategory } from '../../system';
import { AssignBirthdayCommand } from './assign';
import { RemoveBirthdayCommand } from './remove';
import { SelfAssignBirthdayCommand } from './set';
import { BirthdayManager } from '../../../modules';
import { ForceBirthdayAnnouncementCommand } from './announce';

export class BirthdayCommand extends MultiCommand<BirthdayManager> {

    public static readonly BIRTHDAY_FORMAT_REGEX = /\d{1,2}\/\d{1,2}/; 

    constructor() {
        super('birthday', 'SEND_MESSAGES', null);
        this.deleteMessage = false;
        this.category = CommandCategory.FUN;
    }

    start() {
        super.start();
        this.engine.client.once('ready', _ => {
            this.baseManager = this.engine.moduleManager.require<BirthdayManager>('BirthdayManager');
            this.components.forEach(component => component.manager = this.baseManager);
        });
    }

    registerComponents() {
        this.register(new AssignBirthdayCommand());
        this.register(new ForceBirthdayAnnouncementCommand());
        this.register(new ListBirthdaysCommand());
        this.register(new RemoveBirthdayCommand());
        this.register(new SelfAssignBirthdayCommand());
    }

}