/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Command, CommandReturn, Module, MultiCommand } from '@ilefa/ivy';
import { EmbedFieldData, Message, PermissionResolvable, User } from 'discord.js';

/**
 * An autowired command is a special command-type that automatically
 * injects a module (of type T) into it's runtime `AutowiredCommand#module`.
 * 
 * It accomplishes this by using a `clazz` property that is a reference
 * to the {@link Module#name} of the target module that you would like
 * to inject.
 * 
 * This system is quite useful when you want to have a command that
 * is a singleton, but you don't want to manually inject the module
 * using the hacky `Command#start` method and listening for the `ready`
 * from Discord.js.
 * 
 * @example
 * ```typescript
 * export class RoleListCommand extends AutowiredCommand<RoleAssignmentManager> {
 *
 *        constructor() {
 *            super('RoleAssignmentManager', 'roles', ...);
 *        }
 *
 *        async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
 *            if (!this.module) {
 *                // module not present
 *            }
 * 
 *            // do something with autowired module
 *        }
 *
 *   }
 * ```
 */
export abstract class AutowiredCommand<T extends Module> extends Command {

    protected module: T;
    private clazz: string;

    constructor(clazz: string,
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
        this.clazz = clazz;
    }

    start() {
        let self = this;
        super.start();
        this.engine.client.once('ready', () => {
            self.module = this.engine.moduleManager.require<T>(self.clazz);
        });
    }

    abstract execute(user: User, message: Message, args: string[]): Promise<CommandReturn>;

    /**
     * Attempts to retrieve the instance of the
     * provided module.
     * 
     * @param clazz the class name of the module
     */
    require<M extends Module>(clazz: string): M {
        return this.engine.moduleManager.require<M>(clazz);
    }

}

export abstract class AutowiredMultiCommand<M extends Module> extends MultiCommand<M> {

    private clazz: string;

    constructor(base: string, basePermission: PermissionResolvable, clazz: string, baseHelp?: string, deleteMessage?: boolean, category?: string) {
        super(base, basePermission, null, baseHelp);
        this.clazz = clazz;
        this.category = category;
        this.deleteMessage = deleteMessage;
        this.help = baseHelp ?? 'Invalid usage, available subcommands are listed below.';
    }

    start() {
        super.start();
        this.engine.client.once('ready', () => {
            this.baseManager = this.engine.moduleManager.require<M>(this.clazz);
            this.components.forEach(component => component.manager = this.baseManager);
        });
    }

    abstract registerComponents(): void;

    /**
     * Attempts to retrieve the instance of the
     * provided module.
     * 
     * @param clazz the class name of the module
     */
    require<M extends Module>(clazz: string): M {
        return this.engine.moduleManager.require<M>(clazz);
    }

}