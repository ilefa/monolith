/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { CommandCategory, CommandCategoryIcon } from '../system';
import { EmbedFieldData, Message, PermissionResolvable, User } from 'discord.js';
import { EmbedIconType, getEmoteForCommandPermission, isSuperPerms } from '../../util';

import {
    bold,
    Command,
    CommandReturn,
    emboss,
    IvyEmbedIcons,
    MultiCommand,
    replaceAll
} from '@ilefa/ivy';

enum PermissionSorting {
    MEMBER,
    MOD,
    ADMIN,
    SUPER
}

export class HelpCommand extends Command {
    
    constructor() {
        super('help', `Invalid usage: ${emboss('.help [category]')}`, null, [], 'SEND_MESSAGES', false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            let categories = Object.keys(CommandCategory);
            let icons = Object.values(CommandCategoryIcon);

            let legend = '';
            if (isSuperPerms(this.engine, user)) {
                legend += `${getEmoteForCommandPermission('SUPER_PERMS')} Super User\n\t${bold('Monolith')} developers and other epic people\n\n`;
            }
    
            if (this.engine.has(user, 'ADMINISTRATOR', message.guild)) {
                legend += `${getEmoteForCommandPermission('ADMINISTRATOR')} Administrator\n\t${bold(message.guild.name)} server administrators\n\n`;
            }
    
            if (this.engine.has(user, 'BAN_MEMBERS', message.guild)) {
                legend += `${getEmoteForCommandPermission('BAN_MEMBERS')} Moderators\n\t${bold(message.guild.name)} server moderators\n\n`
            }
    
            legend += `${getEmoteForCommandPermission('SEND_MESSAGES')} Member\n\t${bold(message.guild.name)} server members`;    

            let entries: EmbedFieldData[] = categories.map((ent, i) => ({ name: `${icons[i]} ${CommandCategory[ent]}`, value: `.help ${ent.toLowerCase()}`, inline: true }));
            let embed = this.embeds.build('Help', IvyEmbedIcons.HELP, `Here are the available categories of commands.`, [...entries, { name: `~~${'-'.repeat(60)}~~\nPermissions Legend`, value: legend, inline: false }], message);
            this.reply(message, embed);
            return CommandReturn.EXIT;
        }

        let category = args[0].toUpperCase();
        if (!CommandCategory[category])
            return CommandReturn.HELP_MENU;

        let commands = this.manager.commands.filter(c => c.command.category === CommandCategory[category]);
        let helpList = '';

        commands = commands
            .filter(_cmd => !_cmd.command.hideFromHelp)
            .filter(_cmd => {
                if (!_cmd.command.internalCommand)
                    return true;

                return this.engine.opts.reportErrors.includes(message.guild.id);
            })
            .filter(_cmd => _cmd.command.permission === 'SUPER_PERMS'
                ? isSuperPerms(this.engine, user)
                : this.engine.has(user, _cmd.command.permission, message.guild))
            .sort((a, b) => {
                let ap = this.getPermissionSort(a.command.permission);
                let bp = this.getPermissionSort(b.command.permission);

                return ap - bp;
            })
            .map(_cmd => {
                let command = _cmd.command;
                let help = replaceAll(command.help.split('Invalid usage: ')[1], '``', '');
                if (help === '.' + command.name)
                    help = null;

                if (command instanceof MultiCommand)
                    help = null;

                // ignores dumb help messages
                if (!command.help.includes('Invalid usage'))
                    help = null;

                let perm = getEmoteForCommandPermission(command.permission);
                helpList += `${perm + ' ' + bold('.' + command.name + (help ? ':' : ''))} ${help ?? ''}\n`;
                return _cmd;
            });

        this.reply(message, this.embeds.build('Command Help', EmbedIconType.HELP, '' 
            + `${bold(`Command List (${commands.length})`)}\n` 
            + helpList.trim(), [], message));

        return CommandReturn.EXIT;
    }

    private getPermissionSort = (perm: PermissionResolvable | 'SUPER_PERMS') => {
        if (perm === 'SEND_MESSAGES')
            return PermissionSorting.MEMBER;

        if (perm === 'BAN_MEMBERS')
            return PermissionSorting.MOD;

        if (perm === 'ADMINISTRATOR')
            return PermissionSorting.ADMIN;

        if (perm === 'SUPER_PERMS')
            return PermissionSorting.SUPER;
    }

}