/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { EmbedIconType } from '../util';
import { User, Message } from 'discord.js';
import { CommandCategory } from './system';
import { Command, CommandReturn, emboss } from '@ilefa/ivy';

export class FlowCommand extends Command {

    constructor() {
        super('flow', `Invalid usage: ${emboss('.flow <name>')}`, null, [], 'SUPER_PERMS', false, false, CommandCategory.TEST);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1)
            return CommandReturn.HELP_MENU;

        let flow = this.manager.findFlow(args[0]);
        if (!flow) {
            this.reply(message, this.embeds.build('Test Flow Manager', EmbedIconType.TEST, `Invalid flow: ${emboss(args[0])}`, null, message));
            return CommandReturn.EXIT;
        }

        flow.command.execute(user, message, args);
        return CommandReturn.EXIT;
    }

}