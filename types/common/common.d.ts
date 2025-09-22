type StatType = "Ammunition" | "AntiAir" | "Armor" | "ASW" | "Aviation" | "Consumption" | "Evasion" | 
    "Firepower" | "Health" | "Luck" | "Oxygen" | "Reload" | "Torpedo";
type HullType = "DD" | "CL" | "CA" | "BC" | "BB" | "CVL" | "CV" | "BBV" | "SS" |
    "AR" | "BM" | "SSV" | "CB" | "DDGV" | "DDGM" | "IXS" | "IXV" | "IXM";
type FactionType = "CM" | "US" | "EN" | "JP" | "DE" | "CN" | "ITA" | "SN" | "FF" | "MNF" | "FR" | "MOT" | 
    "META" | "BULIN" | "LINK" | "NP" | "BILI" | "UM" | "AI" | "HOLO" | "DOA" | "IMAS" | "SSSS" | "RYZA" | "SENRAN";

interface Ship {
    id: number;
    gid: number;
    cid: number;
    sid: number[];
    name: string;
    name_kr?: string;
    codename: string;
    class: string;
    nationality: number;
    obtain: string[];
    obtain_kr?: string[];
    type: number;
    rarity: number;
    armor: number;
    hexagon: string[];
    share_group: number[];
    breakout: (string | string[])[][];
    enhance: Record<string, number>;
    skill: Record<string, SkillData>;
    tech: {
        add_get_attr: number;
        add_get_shiptype: number[];
        add_get_value: number;
        add_level_attr: number;
        add_level_shiptype: number[];
        add_level_value: number;
        pt_get: number;
        pt_level: number;
        pt_upgrade: number;
    };
}

interface HullTypeData {
    id: number;
    name: string;
    name_kr: string;
    short: string;
    position: string;
    icon: string;
    tech: string | null;
    title: string;
    label: Record<string, string>;
}

interface StatTypeData {
    code: string;
    name: string;
    short: string;
    icon: string;
    iconbox: string;
    icon128: string;
    icon64: string;
    icon32: string;
}

interface NationalityData {
    id: number;
    code: string;
    name: string;
    name_kr: string;
    image: string;
    prefix: string[];
}

interface ShipSkin {
    gid: number;
    name: string;
    skins: Record<string, SkinData>;
}

interface SkinData {
    id: number;
    gid: number;
    name: string;
    type: string;
    desc: string;
    tag: string[];
    illustrator: number;
    illustrator2: number;
    voice_actor: number;
    voice_actor2: number;
    bgm: string | null;
    background: string | null;
    background2: string | null;
    painting: string;
    painting_n: string | null;
    banner: string;
    chibi: string;
    icon: string;
    qicon: string;
    shipyard: string;
}

type ShipSkins = Record<string, ShipSkin>;
type HullTypes = Record<string, HullTypeData>;
type Nationalities = Record<string, NationalityData>;
type StatTypes = Record<string, StatTypeData>;

interface SkillData {
    id: number;
    parent: number;
    upgrade: number | null;
    downgrade: number | null;
    requirement: string;
}