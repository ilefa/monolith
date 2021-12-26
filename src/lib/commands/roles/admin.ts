/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { RoleAssignmentManager } from '../../modules/roles';
import { AutowiredMultiCommand, CommandCategory } from '../system';

import {
    AddAssignableRoleCommand,
    ListAssignableRolesCommand,
    RemoveAssignableRoleCommand
} from './subcommands';

export class RoleAdminCommand extends AutowiredMultiCommand<RoleAssignmentManager> {

    constructor() {
        super('roleadmin', 'ADMINISTRATOR', 'RoleAssignmentManager', null, false, CommandCategory.ROLE);
    }

    registerComponents() {
        this.register(new AddAssignableRoleCommand());
        this.register(new ListAssignableRolesCommand());
        this.register(new RemoveAssignableRoleCommand());
    }

}