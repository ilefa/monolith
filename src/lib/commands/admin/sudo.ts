/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { AutowiredCommand, CommandCategory } from '../system';
import { CommandManager, CommandReturn, emboss, IvyEmbedIcons, findUser, EventManager } from '@ilefa/ivy';
export class SudoCommand extends AutowiredCommand<CommandManager> {

    constructor() {
        super('Commands', 'sudo', `Invalid usage: ${emboss('.sudo <userId> <command-name> (command-args)')}`, null, [], 'SUPER_PERMS', false, false, CommandCategory.ADMIN);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        if (args.length < 2)
            return CommandReturn.HELP_MENU;

        if (!this.module) {
            this.reply(message, this.embeds.build('Monolith Management', IvyEmbedIcons.TEST, `Could not autowire command manager, please investigate.`, [], message));
            return CommandReturn.EXIT;
        }

        const sudodUser = await findUser(message, args.shift(), null);;

        if (!sudodUser) {
            this.reply(message, this.embeds.build('Monolith Management', IvyEmbedIcons.TEST, `ERROR: User not found.`, [], message));
            return CommandReturn.EXIT;        }

        const commandMessage = `.${args.join(' ')}`;
        message.author = sudodUser;
        message.content = commandMessage;
        this.module.handle(sudodUser, message);

        return CommandReturn.EXIT;
    }

}