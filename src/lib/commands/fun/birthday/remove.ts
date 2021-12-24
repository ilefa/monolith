/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { Message, User } from 'discord.js';
import { EmbedIconType } from '../../../util';
import { BirthdayManager } from '../../../modules';

import {
    asMention,
    CommandComponent,
    CommandReturn,
    emboss,
    findUser
} from '@ilefa/ivy';

export class RemoveBirthdayCommand extends CommandComponent<BirthdayManager> {

    constructor() {
        super('remove', 'remove <@mention | id>', 'ADMINISTRATOR');
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1)
            return CommandReturn.HELP_MENU;

        let target = args[0];
        let targetUser = await findUser(message, target, null);
        if (!targetUser) {
            this.host.reply(message, this.host.embeds.build('Birthday', EmbedIconType.BIRTHDAY, `Could not find target: ${emboss(target)}`, [], message));
            return CommandReturn.EXIT;
        }

        await this.manager.removeBirthday(targetUser,
            () => this.host.reply(message, this.host.embeds.build('Birthday', EmbedIconType.BIRTHDAY, `Unassigned ${asMention(targetUser)}'s birthday.`, [], message)),
            () => this.host.reply(message, this.host.embeds.build('Birthday', EmbedIconType.BIRTHDAY, `${emboss(targetUser)} does not have a birthday set.`, [], message)));

        return CommandReturn.EXIT;
    }

}