import { AppState, AppAction } from './types';

export const initialState: AppState = {
    // Filter State
    selectedHullTypes: [],
    selectedNationalities: [],
    selectedRarities: [],
    selectedTechStats: [],
    selectedTechStatus: [],
    // UI State
    loading: true,
    filterDialogOpen: false,
    importDialogOpen: false,
    shipInfoDialogOpen: false,
    snackbar: { open: false, message: '', severity: 'success' },
    statDialogOpen: false,
    // Data State
    ships: [],
    shipSkins: {},
    hullTypes: {},
    statTypes: {},
    nationalities: {},
    nationalityImages: {},
    skillData: {},
    skillIcons: {},
    transformSkillMapping: {},
    uniqueSpWeapons: {},
    techStatList: [],
    // Derived/UI Helpers
    filteredShips: [],
    selectedShips: [],
    selectedShip: null,
    // Inputs
    importText: '',
    searchTerm: '',
};

export function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        // Filter Reducers
        case 'SET_HULL_TYPES':
            return { ...state, selectedHullTypes: action.payload };
        case 'SET_NATIONALITIES':
            return { ...state, selectedNationalities: action.payload };
        case 'SET_RARITIES':
            return { ...state, selectedRarities: action.payload };
        case 'SET_TECH_STATS':
            return { ...state, selectedTechStats: action.payload };
        case 'SET_TECH_STATUS':
            return { ...state, selectedTechStatus: action.payload };

        // UI Reducers
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'TOGGLE_FILTER_DIALOG':
            return { ...state, filterDialogOpen: action.payload };
        case 'TOGGLE_IMPORT_DIALOG':
            return { ...state, importDialogOpen: action.payload };
        case 'TOGGLE_SHIP_INFO_DIALOG':
            return { ...state, shipInfoDialogOpen: action.payload };
        case 'SHOW_SNACKBAR':
            return { ...state, snackbar: { open: true, ...action.payload } };
        case 'HIDE_SNACKBAR':
            return { ...state, snackbar: { ...state.snackbar, open: false } };
        case 'TOGGLE_STAT_DIALOG':
            return { ...state, statDialogOpen: action.payload };
        
        // Data Reducers
        case 'SET_SHIPS':
            return { ...state, ships: action.payload };
        case 'SET_SHIP_SKINS':
            return { ...state, shipSkins: action.payload };
        case 'SET_HULL_TYPES_DATA':
            return { ...state, hullTypes: action.payload };
        case 'SET_STAT_TYPES':
            return { ...state, statTypes: action.payload };
        case 'SET_NATIONALITIES_DATA':
            return { ...state, nationalities: action.payload };
        case 'SET_NATIONALITY_IMAGES':
            return { ...state, nationalityImages: action.payload };
        case 'SET_SKILL_DATA':
            return { ...state, skillData: action.payload };
        case 'SET_SKILL_ICONS':
            return { ...state, skillIcons: action.payload };
        case 'SET_TRANSFORM_SKILL_MAPPING':
            return { ...state, transformSkillMapping: action.payload };
        case 'SET_UNIQUE_SP_WEAPONS':
            return { ...state, uniqueSpWeapons: action.payload };
        case 'SET_TECH_STAT_LIST':
            return { ...state, techStatList: action.payload };
        case 'UPDATE_TECH_STAT': {
            const { shipId, field, value } = action.payload;
            const index = state.techStatList.findIndex(stat => stat.id === shipId);
            const newList = [...state.techStatList];
            if (index > -1) {
                const updatedStat = { ...newList[index], [field]: value } as ShipTechStatData;
                newList[index] = updatedStat;
            } else {
                const newStat = { id: shipId, get: false, level: false, upgrade: false, [field]: value } as ShipTechStatData;
                newList.push(newStat);
            }
            return { ...state, techStatList: newList };
        }

        // Derived/UI Helpers
        case 'SET_FILTERED_SHIPS':
            return { ...state, filteredShips: action.payload };
        case 'SET_SELECTED_SHIPS':
            return { ...state, selectedShips: action.payload };
        case 'SET_SELECTED_SHIP':
            return { ...state, selectedShip: action.payload };

        // Inputs
        case 'SET_IMPORT_TEXT':
            return { ...state, importText: action.payload };
        case 'SET_SEARCH_TERM':
            return { ...state, searchTerm: action.payload };
        default:
            return state;
    }
}
