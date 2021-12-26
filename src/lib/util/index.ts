/*
 * Copyright (c) 2021 ILEFA Labs
 * All Rights Reserved.
 * 
 * This software is proprietary and was designed and intended for internal use only.
 * Unauthorized usage, dissemination, or replication of this software in part or in
 * whole is unlawful, and punishable by the full extent of United States Copyright law.
 */

import { IvyEngine, toWords } from '@ilefa/ivy';
import { EnrollmentPayload } from '@ilefa/husky';
import { DiningHallStatus, DiningHallType } from '@ilefa/blueplate';
import { PermissionResolvable, User } from 'discord.js';

export * from './paginator';
export * from './redis';
export * from './stash';

export enum EmbedIconType {
    AUDIO = 'https://storage.googleapis.com/stonks-cdn/audio.png',
    BIRTHDAY = 'https://storage.googleapis.com/stonks-cdn/birthday.png',
    ERROR = 'https://storage.googleapis.com/stonks-cdn/error.png',
    HELP = 'https://storage.googleapis.com/stonks-cdn/help.png',
    MEMBER = 'https://storage.googleapis.com/stonks-cdn/member.png',
    MESSAGE = 'https://storage.googleapis.com/stonks-cdn/message.png',
    NUMBERS = 'https://storage.googleapis.com/stonks-cdn/numbers.png',
    POLL = 'https://storage.googleapis.com/stonks-cdn/poll.png',
    PREFS = 'https://storage.googleapis.com/stonks-cdn/prefs.png',
    STONKS = 'https://storage.googleapis.com/stonks-cdn/stonks.png',
    TEST = 'https://storage.googleapis.com/stonks-cdn/test.png',
    UCONN = 'https://storage.googleapis.com/stonks-cdn/univ.png',
    XP = 'https://storage.googleapis.com/stonks-cdn/xp.png'
}

export type YtMetaResponse = {
    provider_name?: string;
    provider_url?: string;
    thumbnail_url: string;
    thumbnail_width?: number;
    thumbnail_height?: number;
    author_name: string;
    author_url: string;
    version?: string;
    title: string;
    type?: string;
    html?: string;
    width?: number;
    height?: number;
}

export const DAY_MILLIS = 86400000;
export const COMPARISON_COLORS = [
    "rgba(231, 76, 60, 1.0)",
    "rgba(243, 156, 18, 1.0)",
    "rgba(241, 196, 15, 1.0)",
    "rgba(46, 204, 113, 1.0)",
    "rgba(22, 160, 133, 1.0)",
    "rgba(52, 152, 219, 1.0)",
    "rgba(41, 128, 185, 1.0)",
    "rgba(155, 89, 182, 1.0)",
    "rgba(142, 68, 173, 1.0)",
    "rgba(149, 165, 166, 1.0)"
];

export const RESPONSE_GROUP_EMOJI = [
    ":regional_indicator_a:",
    ":regional_indicator_b:",
    ":regional_indicator_c:",
    ":regional_indicator_d:",
    ":regional_indicator_e:",
    ":regional_indicator_f:",
    ":regional_indicator_g:",
    ":regional_indicator_h:",
    ":regional_indicator_i:",
    ":regional_indicator_j:",
    ":regional_indicator_k:",
    ":regional_indicator_l:",
    ":regional_indicator_m:",
    ":regional_indicator_n:",
    ":regional_indicator_o:",
    ":regional_indicator_p:",
    ":regional_indicator_q:",
    ":regional_indicator_r:",
    ":regional_indicator_s:",
    ":regional_indicator_t:",
];

export const RESPONSE_GROUP_EMOJI_RAW = [
    '🇦', '🇧', '🇨',
    '🇩', '🇪', '🇫',
    '🇬', '🇭', '🇮',
    '🇯', '🇰', '🇱',
    '🇲', '🇳', '🇴',
    '🇵', '🇶', '🇷',
    '🇸', '🇹'
];

export const COMPARISON_LEGEND = [
    ":red_circle:",
    ":orange_circle:",
    ":yellow_circle:",
    ":green_circle:",
    ":blue_circle:",
    ":purple_circle:"
];

/**
 * Generates a change string for stock prices.
 * 
 * @param input the input value
 * @param seperator the seperator to place between the prepended +/- and the value
 * @param digits the amount of digits to fix the resulting value to
 * @param prependPlus whether or not to prepend a plus sign if the change is positive
 */
export const getChangeString = (input: string | number, seperator: string, digits: number, prependPlus?: boolean) => {
    return (Number(input) > 0 
        ? prependPlus 
            ? '+' 
            : '' 
        : '-') 
        + seperator 
        + Math
            .abs(Number(input))
            .toFixed(digits);
}

/**
 * Returns an emote for a user's permission level.
 * 
 * @param superPerms whether the user has super permissions
 * @param admin whether the user has administrator permissions
 */
export const getEmoteForPermissions = (superPerms: boolean, admin: boolean) => {
    if (superPerms) return ':tools:';
    if (admin) return ':sauropod:';
    return ':runner:';
}

export const getEmoteForCommandPermission = (permission: PermissionResolvable | 'SUPER_PERMS') => {
    if (permission === 'SUPER_PERMS') return ':eight_spoked_asterisk:';
    if (permission === 'ADMINISTRATOR') return ':a:';
    if (permission === 'BAN_MEMBERS') return ':passport_control:';
    return ':regional_indicator_m:';
}

export const getEmoteForEnrollmentState = (state: EnrollmentPayload) => {
    if (state.overfill && state.available !== state.total) return ':no_entry_sign:';
    if (state.overfill) return ':x:';
    if (state.percent > 0.9) return ':octagonal_sign:';
    return ':white_check_mark:';
}

/**
 * Returns an emote for the XP placement leaderboard.
 * @param placement the xp placement
 */
 export const getEmoteForXpPlacement = (placement: number) => {
    if (placement == 1) return ':first_place:';
    if (placement == 2) return ':second_place:';
    if (placement == 3) return ':third_place:';
    if (placement == 10) return ':keycap_ten:';
    if (placement > 10) return '';

    return `:${toWords(placement)}:`;
}

export const getEmoteForMeal = (meal: DiningHallStatus) => {
    switch (meal) {
        case DiningHallStatus.BREAKFAST: return ':coffee:';
        case DiningHallStatus.BRUNCH: return ':pancakes:';
        case DiningHallStatus.LUNCH: return ':fork_and_knife:';
        case DiningHallStatus.DINNER: return ':hamburger:';
        default: return ':question:';
    }
}

export const getEmoteForDiningHall = (hall: DiningHallType) => {
    switch (hall) {
        case DiningHallType.BUCKLEY: return ':fish:';
        case DiningHallType.MCMAHON: return ':pizza:';
        case DiningHallType.NORTH: return ':spaghetti:';
        case DiningHallType.NORTHWEST: return ':hamburger:';
        case DiningHallType.PUTNAM: return ':tropical_drink:';
        case DiningHallType.SOUTH: return ':cut_of_meat:';
        case DiningHallType.TOWERS: return ':fork_and_knife:';
        case DiningHallType.WHITNEY: return ':ramen:';
        default: return ':fork_knife_plate:';
    }
}

/**
 * Returns an indicator string
 * for a given campus input.
 * 
 * @param campus the campus input
 */
export const getCampusIndicator = (campus: string) => {
    campus = campus.toLowerCase();
    if (campus === 'storrs') return 'S';
    if (campus === 'hartford') return 'H';
    if (campus === 'stamford') return 'Z';
    if (campus === 'waterbury') return 'W';
    if (campus === 'avery point') return 'A';
    if (campus === 'off-campus') return 'O';

    return '?';
}

/**
 * Adds a trailing decimal to a number
 * if it does not have a decimal.
 * 
 * @param int the number
 */
export const addTrailingDecimal = (int: number) => {
    if (!int.toString().includes('.'))
        return int.toString() + '.0';

    return int.toString();
}

export const isSuperPerms = (engine: IvyEngine, user: User | string) =>
    engine
        .opts
        .superPerms
        .includes(user instanceof User
            ? user.id
            : user); 