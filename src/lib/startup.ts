/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { RemotePreferenceBundle } from './database';
import { Colors, IvyEngine, StartupRunnable } from '@ilefa/ivy';

const MESSAGE = Colors.BLUE + `
        _..._
      .'     '.      _
     /    .-""-\\   _/ \\
   .-|   /:.   |  |   |
   |  \\  |:.   /.-'-./
   | .-'-;:__.'    =/
   .'=  *=|     _.='                            _ _ _   _     
  /   _.  |    ;        \/\\/\\   ___  _ __   ___ | (_) |_| |__ 
 ;-.-'|    \\   |       /    \\ / _ \\| '_ \\ / _ \\| | | __| '_ \\
/   | \\    _\\  _\\     / /\\/\\ \\ (_) | | | | (_) | | | |_| | | |
\\__/'._;.  ==' ==\\    \\/    \\/\\___/|_| |_|\\___/|_|_|\\__|_| |_|
         \\    \\   |
         /    /   /
         /-._/-._/
         \\   \`\\  \\
          \`-._/._/

`;

export class StartupInjector implements StartupRunnable {

    constructor(private bundle: RemotePreferenceBundle) {}

    run = (engine: IvyEngine) => {
        engine.logger.unlisted(MESSAGE);
        (engine as any).prefs = this.bundle;
    }

}