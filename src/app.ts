/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { StartupInjector } from './lib/startup';
import { bold, IvyEngine, Logger } from '@ilefa/ivy';
import { DatabaseManager, RemotePreferenceBundle } from './lib/database';
import { Client, ColorResolvable, Intents, WebhookClient } from 'discord.js';
import { COMMIT_HASH, DISPLAY_VERSION, HOST, MANAGED, RELEASE_CHANNEL } from './build';

import {
    BirthdayAnnounceTask,
    BlueplateRefreshTask,
    ServerRenameTask
} from './lib/tasks';

import {
    Auditor,
    BirthdayManager,
    CustomEventManager,
    DinnerHallManager,
    LevelManager,
    PollManager,
    PreferenceBundle,
    RoleAssignmentManager,
    TaskScheduler,
    UConnCourseDataProvider,
    UConnProfessorDataProvider,
    UConnRoomDataProvider,
    UpdateManager,
    WelcomeManager
} from './lib/modules';

import {
    AboutCommand,
    AlinaCommand,
    AssignRoleCommand,
    BigJannieCommand,
    BingQiLingCommand,
    BirthdayCommand,
    BuildInfoCommand,
    ChunksCommand,
    CourseCommand,
    DinnerHallSyncCommand,
    EmoteCommand,
    EyebrowCommand,
    FlowCommand,
    GetRealCommand,
    GigachadCommand,
    HelpCommand,
    InvitesCommand,
    KingCommand,
    LeaderboardCommand,
    MaldCommand,
    MembersCommand,
    MisogynyCommand,
    PollCommand,
    PrefsCommand,
    ProfessorCommand,
    PurgeCommand,
    RankCommand,
    RerollCommand,
    RockCommand,
    RoleAdminCommand,
    RoleListCommand,
    RoomCommand,
    SudoCommand,
    UpdateCommand,
    VersionCommand
} from './lib/commands';

import {
    ChannelCreateProbe,
    ChannelDeleteProbe,
    ChannelPinsUpdateProbe,
    ChannelUpdateProbe,
    EmojiCreateProbe,
    EmojiDeleteProbe,
    EmojiUpdateProbe,
    GuildBanAddProbe,
    GuildBanRemoveProbe,
    GuildIntegrationsUpdateProbe,
    GuildMemberAddProbe,
    GuildMemberRemoveProbe,
    GuildMemberUpdateProbe,
    GuildUpdateProbe,
    InviteCreateProbe,
    InviteDeleteProbe,
    MessageDeleteBulkProbe,
    MessageDeleteProbe,
    MessageUpdateProbe,
    RoleCreateProbe,
    RoleDeleteProbe,
    RoleUpdateProbe,
    VoiceStateUpdateProbe,
    WebhookUpdateProbe
} from './lib/modules/auditor/probes';

export class MonolithApp extends IvyEngine {
    
    auditor: Auditor;
    pollManager: PollManager;
    roleManager: RoleAssignmentManager;
    database: DatabaseManager;
    scheduler: TaskScheduler;
    prefs: RemotePreferenceBundle;
    bundle: PreferenceBundle;
    
    constructor(token: string,
                prefix: string,
                color: ColorResolvable,
                logger: Logger,
                superPerms: string[],
                serverId: string,
                prefs: RemotePreferenceBundle) {
        super({
            token,
            name: 'Monolith',
            logger,
            superPerms: superPerms,
            reportErrors: [serverId],
            color,
            prefix,
            startup: new StartupInjector(prefs),
            discord: {
                intents: [
                    Intents.FLAGS.GUILDS,
                    Intents.FLAGS.GUILD_BANS,
                    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
                    Intents.FLAGS.GUILD_INTEGRATIONS,
                    Intents.FLAGS.GUILD_MEMBERS,
                    Intents.FLAGS.GUILD_MESSAGES,
                    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                    Intents.FLAGS.GUILD_PRESENCES,
                    Intents.FLAGS.GUILD_VOICE_STATES,
                    Intents.FLAGS.GUILD_WEBHOOKS
                ],
                partials: ['CHANNEL', 'MESSAGE', 'REACTION']
            },
            presence: {
                status: 'online',
                activities: [
                    {
                        type: 'WATCHING',
                        name: 'over the sanctuary.'
                    }
                ]
            }
        });
    }

    onReady(_client: Client) {
        this.registerEventHandler(new CustomEventManager(this, this.commandManager, this.pollManager));
        
        if (MANAGED) {
            let webhook = new WebhookClient({ url: this.prefs.statusWebhook });
            webhook.send(`<a:ditto:925118470545342564> ${bold('Monolith')} was deployed on ${bold(HOST)} (v${DISPLAY_VERSION} :: ${COMMIT_HASH} → @ilefa/monolith:${RELEASE_CHANNEL})`);
        }
    }

    registerCommands() {
        this.registerCommand(new AboutCommand());
        this.registerCommand(new AlinaCommand());
        this.registerCommand(new AssignRoleCommand());
        this.registerCommand(new BigJannieCommand());
        this.registerCommand(new BingQiLingCommand());
        this.registerCommand(new BirthdayCommand());
        this.registerCommand(new BuildInfoCommand());
        this.registerCommand(new ChunksCommand());
        this.registerCommand(new CourseCommand());
        this.registerCommand(new DinnerHallSyncCommand());
        this.registerCommand(new EmoteCommand());
        this.registerCommand(new EyebrowCommand());
        this.registerCommand(new FlowCommand());
        this.registerCommand(new GetRealCommand());
        this.registerCommand(new GigachadCommand());
        this.registerCommand(new HelpCommand());
        this.registerCommand(new InvitesCommand());
        this.registerCommand(new KingCommand());
        this.registerCommand(new LeaderboardCommand());
        this.registerCommand(new MaldCommand());
        this.registerCommand(new MembersCommand());
        this.registerCommand(new MisogynyCommand());
        this.registerCommand(new PollCommand());
        this.registerCommand(new PrefsCommand());
        this.registerCommand(new ProfessorCommand());
        this.registerCommand(new PurgeCommand());
        this.registerCommand(new RankCommand());
        this.registerCommand(new RerollCommand());
        this.registerCommand(new RockCommand());
        this.registerCommand(new RoleAdminCommand());
        this.registerCommand(new RoleListCommand());
        this.registerCommand(new RoomCommand());
        this.registerCommand(new SudoCommand())
        this.registerCommand(new UpdateCommand())
        this.registerCommand(new VersionCommand());
    }
    
    registerModules() {
        this.registerModule(this.bundle = new PreferenceBundle(this.prefs));
        this.registerModule(this.database = new DatabaseManager(this.logger));
        this.registerModule(this.pollManager = new PollManager());
        this.registerModule(this.roleManager = new RoleAssignmentManager());
    
        // Auditor
        this.registerModule(this.auditor = new Auditor());
        this.auditor.registerProbe(new ChannelCreateProbe());
        this.auditor.registerProbe(new ChannelDeleteProbe());
        this.auditor.registerProbe(new ChannelPinsUpdateProbe());
        this.auditor.registerProbe(new ChannelUpdateProbe());
        this.auditor.registerProbe(new EmojiCreateProbe());
        this.auditor.registerProbe(new EmojiDeleteProbe());
        this.auditor.registerProbe(new EmojiUpdateProbe());
        this.auditor.registerProbe(new GuildBanAddProbe());
        this.auditor.registerProbe(new GuildBanRemoveProbe());
        this.auditor.registerProbe(new GuildIntegrationsUpdateProbe());
        this.auditor.registerProbe(new GuildMemberAddProbe());
        this.auditor.registerProbe(new GuildMemberRemoveProbe());
        this.auditor.registerProbe(new GuildMemberUpdateProbe());
        this.auditor.registerProbe(new GuildUpdateProbe());
        this.auditor.registerProbe(new InviteCreateProbe());
        this.auditor.registerProbe(new InviteDeleteProbe());
        this.auditor.registerProbe(new MessageDeleteProbe());
        this.auditor.registerProbe(new MessageDeleteBulkProbe());
        this.auditor.registerProbe(new MessageUpdateProbe());
        this.auditor.registerProbe(new RoleCreateProbe());
        this.auditor.registerProbe(new RoleDeleteProbe());
        this.auditor.registerProbe(new RoleUpdateProbe());
        this.auditor.registerProbe(new VoiceStateUpdateProbe());
        this.auditor.registerProbe(new WebhookUpdateProbe());

        // Task Scheduler
        this.scheduler = new TaskScheduler();
        this.scheduler.schedule({ interval: '0 0 * * *', task: new ServerRenameTask() });
        this.scheduler.schedule({ interval: '0 0 * * *', task: new BlueplateRefreshTask() });
        this.scheduler.schedule({ interval: '0 0 * * *', task: new BirthdayAnnounceTask() });

        this.registerModule(this.scheduler);
        this.registerModule(new WelcomeManager());
        this.registerModule(new DinnerHallManager());
        this.registerModule(new BirthdayManager());
        this.registerModule(new LevelManager());
        this.registerModule(new UpdateManager());

        // UConn-related modules
        this.registerModule(new UConnCourseDataProvider());
        this.registerModule(new UConnProfessorDataProvider());
        this.registerModule(new UConnRoomDataProvider());
    }
    
    registerFlows() {}

}