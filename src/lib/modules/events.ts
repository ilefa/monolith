import { PollManager } from './poll';
import { CommandManager, EventManager, IvyEngine } from '@ilefa/ivy';
import { Message, MessageReaction, PartialMessageReaction } from 'discord.js';

export class CustomEventManager extends EventManager {

    constructor(engine: IvyEngine,
                public commandManager: CommandManager,
                public pollManager: PollManager) {
        super(engine);
        this.commandManager = commandManager;
        this.pollManager = pollManager;
    }

    start = () => super.start();

    end = () => super.end();

    onMessage = async (message: Message<boolean>) => {
        if (message.author.bot)
            return;
            
        if (message.content.toLowerCase().startsWith('poll:'))
            return await this.pollManager.handleSimple(message);

        try {
            // highly unlikely, but catch provider being null
            let data = await this.engine.provider.load(message.guild);
            if (!message.content.startsWith(data.prefix))
                return;
        
            this.commandCenter.handle(message.author, message);   
        } catch (e) {
            this.except(e, `Error processing message`);
        } 
    }

    onReact = async (reaction: MessageReaction | PartialMessageReaction) => {
        let user = reaction.users.cache.last();
        if (!user)
            return;

        if (user.bot)
            return;

        let rxn = reaction;
        if (reaction.partial)
            rxn = await reaction.fetch();

        if (!rxn)
            return;

        if (reaction.message.embeds.length && reaction.message?.embeds[0]?.author?.name === 'Polls')
            await this.pollManager.handleAdd(rxn as MessageReaction, user);
    }

    onReactRemoved = async (reaction: MessageReaction | PartialMessageReaction) => {
        let rxn = reaction;
        if (reaction.partial)
            rxn = await reaction.fetch();
    
        if (!rxn)
            return;

        if (reaction.message.embeds.length && reaction.message?.embeds[0]?.author?.name === 'Polls')
            await this.pollManager.handle(reaction as MessageReaction);
    }

}