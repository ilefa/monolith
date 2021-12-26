/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { ListBirthdaysCommand } from './list';
import { AssignBirthdayCommand } from './assign';
import { RemoveBirthdayCommand } from './remove';
import { SelfAssignBirthdayCommand } from './set';
import { BirthdayManager } from '../../../modules';
import { ForceBirthdayAnnouncementCommand } from './announce';
import { AutowiredMultiCommand, CommandCategory } from '../../system';

export class BirthdayCommand extends AutowiredMultiCommand<BirthdayManager> {

    public static readonly BIRTHDAY_FORMAT_REGEX = /\d{1,2}\/\d{1,2}/; 

    constructor() {
        super('birthday', 'SEND_MESSAGES', 'BirthdayManager', null, false, CommandCategory.FUN);
    }

    registerComponents() {
        this.register(new AssignBirthdayCommand());
        this.register(new ForceBirthdayAnnouncementCommand());
        this.register(new ListBirthdaysCommand());
        this.register(new RemoveBirthdayCommand());
        this.register(new SelfAssignBirthdayCommand());
    }

}