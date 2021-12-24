/*
 * Copyright (c) 2021 ILEFA Labs
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import TinyGradient from 'tinygradient';

import { IvyEngine } from '@ilefa/ivy';
import { Instance as TGInst } from 'tinygradient';

import {
    EmbedFieldData,
    Message,
    MessageReaction,
    ReactionCollector,
    TextChannel,
    User
} from 'discord.js';

export type PageContent = {
    description: string,
    fields: EmbedFieldData[]
}

export class PaginatedEmbed {

    page: number;
    message: Message;
    collector: ReactionCollector;
    colorGradient: TGInst;

    constructor(public engine: IvyEngine,
                public channel: TextChannel,
                public author: User,
                public title: string,
                public icon: string,
                public pages: PageContent[],
                public timeout: number = 60000,
                public thumbnail: string = null,
                public beginColor: string = 'black',
                public endColor: string = engine.opts.color.toString(),
                public footerIcon: string = null) {

        this.page = 1;
        this.colorGradient = TinyGradient([beginColor, endColor]);
        if (!footerIcon) this.footerIcon = this.channel.guild.iconURL();

        let self = this;

        channel
            .send({ embeds: [this.generatePage(this.page)] })
            .then(this.init.bind(self));
    }

    static of = (engine: IvyEngine,
                 channel: TextChannel,
                 author: User,
                 title: string,
                 icon: string,
                 pages: PageContent[],
                 timeout: number = 60000,
                 thumbnail: string = null,
                 beginColor: string = 'black',
                 endColor: string = engine.opts.color.toString(),
                 footerIcon: string = null) => {
        return new PaginatedEmbed(engine, channel, author,
            title, icon, pages, timeout, thumbnail,
            beginColor, endColor, footerIcon);
    }

    static ofItems = <T>(engine: IvyEngine,
                         channel: TextChannel,
                         author: User,
                         title: string,
                         icon: string,
                         items: T[],
                         perPage: number,
                         transform: (itemsOnPage: T[]) => PageContent,
                         timeout: number = 60000,
                         thumbnail: string = null,
                         beginColor: string = 'black',
                         endColor: string = engine.opts.color.toString(),
                         footerIcon: string = null) => {

        let total = Math.ceil(items.length / perPage);

        let paginate = (items: T[], page: number, result: PageContent[]): PageContent[] => {
            if (page > total) {
                return result;
            }

            let offset = (page - 1) * perPage;
            let record = transform(items
                    .slice(offset)
                    .slice(0, perPage));

            result.push(record);
            return paginate(items, page + 1, result);
        };

        return new PaginatedEmbed(engine, channel, author,
                                  title, icon, paginate(items, 1, []),
                                  timeout, thumbnail, beginColor, endColor, footerIcon);
    }

    private generatePage(pnum: number) {
        let pind = pnum - 1;
        let { r, g, b } = this.getColor(pind);
        return this.engine.embeds.build(this.title, this.icon, this.pages[pind]?.description || '', this.pages[pind]?.fields || [])
                .setTimestamp()
                .setThumbnail(this.thumbnail)
                .setFooter(`Page ${pnum} of ${this.pages.length}`, this.footerIcon)
                .setColor([r, g, b]);
    }

    private init(message: Message) {
        this.message = message;
        if (this.pages.length === 1)
            return;

        this.collector = message.createReactionCollector(
            {
                filter: (_reaction: MessageReaction, user: User) => !user.bot && user.id === this.author.id,
                time: this.timeout
            }
        );

        this.collector.on('collect', (reaction, user) => {
            if (this.functionMap.get(reaction.emoji.name)(this)) {
                this.message.edit({ embeds: [this.generatePage(this.page)] });
            }

            reaction.users.remove(user);
        });

        this.collector.on('end', () => message.reactions.removeAll());
        
        this.functionMap.forEach((_, emote) => {
            message.react(emote);
        });
    }

    private prevPage(ctx: PaginatedEmbed): boolean {
        if (ctx.page < 2) return false;
        ctx.page--;
        return true;
    }

    private nextPage(ctx: PaginatedEmbed): boolean {
        if (ctx.page >= ctx.pages.length) return false;
        ctx.page++;
        return true;
    }

    private firstPage(ctx: PaginatedEmbed): boolean {
        if (ctx.page === 1) return false;
        ctx.page = 1;
        return true;
    }

    private lastPage(ctx: PaginatedEmbed): boolean {
        if (ctx.page === ctx.pages.length) return false;
        ctx.page = ctx.pages.length;
        return true;
    }

    private functionMap: Map<string, (ctx: PaginatedEmbed) => boolean> = new Map([
        ['⬅️', this.firstPage],
        ['◀️', this.prevPage],
        ['▶️', this.nextPage],
        ['➡️', this.lastPage]
    ]);

    private getColor(index: number) {
        let val = index / ( this.pages.length - 1);
        return this.colorGradient.rgbAt(val).toRgb();
    }

}