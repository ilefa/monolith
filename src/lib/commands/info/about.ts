/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { User, Message } from 'discord.js';

import {
    bold,
    Command,
    CommandReturn,
    emboss,
    IvyEmbedIcons,
    link
} from '@ilefa/ivy';

export class AboutCommand extends Command {
    
    constructor() {
        super('about', `Invalid usage: ${emboss('.about')}`, null, null, 'SEND_MESSAGES', false);
    }

    async execute(user: User, message: Message<boolean>, args: string[]): Promise<CommandReturn> {
        this.reply(message, this.embeds.build('About Monolith & ILEFA', IvyEmbedIcons.HELP, 
                `${bold('Monolith')}\n` 
                + `Monolith is the direct successor to ${bold('rkt')} (and spiritually StonksBot before it), with the main purpose of providing highly integrated workflows for the ${bold('AF')} server.\n\n` 
                + `${bold('ILEFA Labs')}\n` 
                + `What started as a couple of college freshman interested in the stonk market has become a strong development group focused on creating software that connects people. Learn more about us on ${link('our website', 'https://www.ilefa.club')}.`,
            [], message));
        return CommandReturn.EXIT;
    }

}