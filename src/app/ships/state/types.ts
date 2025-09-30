export type AppState = {
    // Filter State
    selectedHullTypes: number[];
    selectedNationalities: string[];
    selectedRarities: string[];
    selectedTechStats: string[];
    selectedTechStatus: string[];
    // UI State
    loading: boolean;
    filterDialogOpen: boolean;
    importDialogOpen: boolean;
    shipInfoDialogOpen: boolean;
    statDialogOpen: boolean;
    snackbar: { open: boolean; message: string; severity: 'success' | 'error' };
    // Data State
    ships: Ship[];
    shipSkins: ShipSkins;
    hullTypes: HullTypes;
    statTypes: StatTypes;
    nationalities: Nationalities;
    nationalityImages: { [key: string]: string };
    skillData: Skills;
    skillIcons: SkillIcons;
    transformSkillMapping: { [key: string]: number };
    uniqueSpWeapons: { [key: string]: { name: string; skill: number } };
    techStatList: ShipTechStatData[];
    // Derived/UI Helpers
    filteredShips: Ship[];
    selectedShips: Ship[];
    selectedShip: Ship | null;
    // Inputs
    importText: string;
    searchTerm: string;
};

export type AppAction = 
    // Filter Actions
    | { type: 'SET_HULL_TYPES'; payload: number[] }
    | { type: 'SET_NATIONALITIES'; payload: string[] }
    | { type: 'SET_RARITIES'; payload: string[] }
    | { type: 'SET_TECH_STATS'; payload: string[] }
    | { type: 'SET_TECH_STATUS'; payload: string[] }
    // UI Actions
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'TOGGLE_FILTER_DIALOG'; payload: boolean }
    | { type: 'TOGGLE_IMPORT_DIALOG'; payload: boolean }
    | { type: 'TOGGLE_SHIP_INFO_DIALOG'; payload: boolean }
    | { type: 'SHOW_SNACKBAR'; payload: { message: string; severity: 'success' | 'error' } }
    | { type: 'HIDE_SNACKBAR' }
    | { type: 'TOGGLE_STAT_DIALOG'; payload: boolean }
    // Data Actions
    | { type: 'SET_SHIPS'; payload: Ship[] }
    | { type: 'SET_SHIP_SKINS'; payload: ShipSkins }
    | { type: 'SET_HULL_TYPES_DATA'; payload: HullTypes }
    | { type: 'SET_STAT_TYPES'; payload: StatTypes }
    | { type: 'SET_NATIONALITIES_DATA'; payload: Nationalities }
    | { type: 'SET_NATIONALITY_IMAGES'; payload: { [key: string]: string } }
    | { type: 'SET_SKILL_DATA'; payload: Skills }
    | { type: 'SET_SKILL_ICONS'; payload: SkillIcons }
    | { type: 'SET_TRANSFORM_SKILL_MAPPING'; payload: { [key: string]: number } }
    | { type: 'SET_UNIQUE_SP_WEAPONS'; payload: { [key: string]: { name: string; skill: number } } }
    | { type: 'SET_TECH_STAT_LIST'; payload: ShipTechStatData[] }
    | { type: 'UPDATE_TECH_STAT'; payload: { shipId: number; field: keyof ShipTechStatData; value: boolean } }
    // Derived/UI Helpers
    | { type: 'SET_FILTERED_SHIPS'; payload: Ship[] }
    | { type: 'SET_SELECTED_SHIPS'; payload: Ship[] }
    | { type: 'SET_SELECTED_SHIP'; payload: Ship | null }
    // Inputs
    | { type: 'SET_IMPORT_TEXT'; payload: string }
    | { type: 'SET_SEARCH_TERM'; payload: string };

export const statList = ["health", "firepower", "torpedo", "antiair", "aviation", "reload", "accuracy", "evasion", "asw"];
export const techAttr: { [key: number]: string } = { 1: "health", 2: "firepower", 3: "torpedo", 4: "antiair", 5: "aviation", 6: "reload", 8: "accuracy", 9: "evasion", 12: "asw" };
export const rarities = ['N', 'R', 'SR', 'SSR', 'UR', 'PR', 'DR'];