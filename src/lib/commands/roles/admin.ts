/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { MultiCommand } from '@ilefa/ivy';
import { RoleAssignmentManager } from '../../modules/roles';
import { CommandCategory } from '../system';

import {
    AddAssignableRoleCommand,
    ListAssignableRolesCommand,
    RemoveAssignableRoleCommand
} from './subcommands';

export class RoleAdminCommand extends MultiCommand<RoleAssignmentManager> {

    constructor() {
        super('roleadmin', 'ADMINISTRATOR', null);
        this.deleteMessage = false;
        this.category = CommandCategory.ROLE;
    }
    
    start() {
        super.start();
        this.engine.client.once('ready', _ => {
            this.baseManager = this.engine.moduleManager.require<RoleAssignmentManager>('RoleAssignmentManager');
            this.components.forEach(component => component.manager = this.baseManager);
        });
    }

    registerComponents() {
        this.register(new AddAssignableRoleCommand());
        this.register(new ListAssignableRolesCommand());
        this.register(new RemoveAssignableRoleCommand());
    }

}