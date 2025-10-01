/* eslint-disable react/display-name */
"use client";

import React, { useContext, useEffect, useMemo, useCallback, useReducer } from "react";
import {
    Box, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Checkbox, Button, DialogActions, Dialog, DialogContent, TextField, DialogTitle, Snackbar, Alert, Chip, AppBar,
    Toolbar,
    Typography,
    SvgIcon,
    IconButton,
    InputBase,
    Fab,
    useMediaQuery,
    TableFooter
} from "@mui/material";
import { useTheme, alpha } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Image from "next/image";
import { TableVirtuoso, TableComponents } from "react-virtuoso";
import { ColorModeContext } from "../(components)/ThemeRegistry";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import GitHubIcon from '@mui/icons-material/GitHub';
import SearchIcon from '@mui/icons-material/Search';
import TableChartIcon from '@mui/icons-material/TableChart';
import FilterDialog from './FilterDialog';
import ShipInfoDialog from "./ShipInfoDialog";
import StatDialog from "./StatDialog";
import { statList, rarities, techAttr } from '../ships/state/types';
import { appReducer, initialState } from './state/reducer';


export default function Page() {
    const theme = useTheme();
    const { toggleColorMode } = useContext(ColorModeContext);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [state, dispatch] = useReducer(appReducer, initialState);

    const handleRowClick = useCallback((ship: Ship) => {
        dispatch({ type: 'SET_SELECTED_SHIP', payload: ship });
        dispatch({ type: 'TOGGLE_SHIP_INFO_DIALOG', payload: true });
    }, []);

    const VirtuosoTableComponents = useMemo<TableComponents<Ship>>(() => ({
        Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
            <TableContainer component={Paper} {...props} ref={ref} />
        )),
        Table: (props: React.HTMLAttributes<HTMLTableElement>) => (
            <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed', overflowX: 'scroll' }} />
        ),
        TableHead,
        TableRow: ({ item: ship, ...props }: { item: Ship } & Omit<React.ComponentProps<typeof TableRow>, 'item'>) => (
            <TableRow
                {...props}
                hover
                onClick={() => handleRowClick(ship)}
                sx={{ height: 144, cursor: 'pointer' }}
            />
        ),
        TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
            <TableBody {...props} ref={ref} />
        )),
        Footer: () => (
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={isMobile ? 4 : 8} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            {'Copyright © Azurlane Hearing '}
                            {new Date().getFullYear()}
                            {'.'}
                        </Typography>
                    </TableCell>
                </TableRow>
            </TableFooter>
        ),
    }), [handleRowClick, isMobile]);

    const ShipHeaderContent = useCallback(() => {
        return (
            <TableRow sx={{ backgroundColor: 'background.paper', }}>
                <TableCell sx={{ width: '100px' }}></TableCell>
                <TableCell sx={{ width: '124px' }}>이름</TableCell>
                {!isMobile && <TableCell sx={{ width: '160px' }}>함종</TableCell>}
                {!isMobile && <TableCell sx={{ width: '140px' }}>진영</TableCell>}
                {!isMobile && <TableCell>등급</TableCell>}
                {!isMobile && <TableCell sx={{ width: '300px' }}>입수 경로</TableCell>}
                <TableCell sx={{ width: isMobile ? '100px' : '240px' }}>기술점수</TableCell>
                <TableCell sx={{ width: '48px' }}></TableCell>
            </TableRow>
        )
    }, [isMobile]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [shipsRes, skinsRes, hullsRes, statsRes, nationsRes, nationsDataRes, skillsRes, skillIconsRes, transformSkillMappingRes, uniqueSpWeaponsRes] = await Promise.all([
                    fetch('ship_kr.json'),
                    fetch('ship_skin.json'),
                    fetch('hulltype.json'),
                    fetch('attribute.json'),
                    fetch('nationality.json'),
                    fetch('nationality_icon.json'),
                    fetch('skill_data.json'),
                    fetch('skill_icon.json'),
                    fetch('transform_skill_mapping.json'),
                    fetch('unique_sp_weapons.json'),
                ]);

                const shipsData = await shipsRes.json();
                const skinsData = await skinsRes.json();
                const hullsData = await hullsRes.json();
                const statsData = await statsRes.json();
                const nationsData = await nationsRes.json();
                const nationsImgData = await nationsDataRes.json();
                const skillsData = await skillsRes.json();
                const skillIconsData = await skillIconsRes.json();
                const transformSkillMappingData = await transformSkillMappingRes.json();
                const uniqueSpWeaponsData = await uniqueSpWeaponsRes.json();

                dispatch({ type: 'SET_SHIPS', payload: shipsData });
                dispatch({ type: 'SET_SHIP_SKINS', payload: skinsData });
                dispatch({ type: 'SET_HULL_TYPES_DATA', payload: hullsData });
                dispatch({ type: 'SET_STAT_TYPES', payload: statsData });
                dispatch({ type: 'SET_NATIONALITIES_DATA', payload: nationsData });
                dispatch({ type: 'SET_NATIONALITY_IMAGES', payload: nationsImgData });
                dispatch({ type: 'SET_SKILL_DATA', payload: skillsData });
                dispatch({ type: 'SET_SKILL_ICONS', payload: skillIconsData });
                dispatch({ type: 'SET_TRANSFORM_SKILL_MAPPING', payload: transformSkillMappingData });
                dispatch({ type: 'SET_UNIQUE_SP_WEAPONS', payload: uniqueSpWeaponsData });

                

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        const savedTechStats: ShipTechStatData[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key && !isNaN(Number(key))) { // Only consider numeric keys (ship IDs)
                const value = window.localStorage.getItem(key);
                if (value) {
                    try {
                        savedTechStats.push(JSON.parse(value));
                    } catch (e) {
                        console.error(`Failed to parse localStorage item ${key}:`, e);
                    }
                }
            }
        }

        dispatch({ type: 'SET_TECH_STAT_LIST', payload: savedTechStats });
        fetchData();
    }, []);

    useEffect(() => {
        let shipsToFilter = [...state.ships];

        if (state.searchTerm) {
            shipsToFilter = shipsToFilter.filter(ship =>
                (ship.name_kr || ship.name).toLowerCase().includes(state.searchTerm.toLowerCase())
            );
        }

        if (state.selectedHullTypes.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => {
                const originalTypeMatch = state.selectedHullTypes.includes(ship.type);
                if (ship.retrofit?.type === undefined) {
                    return originalTypeMatch;
                }
                const retrofitTypeMatch = state.selectedHullTypes.includes(ship.retrofit.type);
                return originalTypeMatch || retrofitTypeMatch;
            });
        }

        if (state.selectedNationalities.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => state.selectedNationalities.includes(state.nationalities[ship.nationality]?.code));
        }

        if (state.selectedRarities.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => {
                const originalRarityName = rarities[ship.rarity - 2 + (ship.cid === 2 ? 2 : 0)];
                const originalRarityMatch = state.selectedRarities.includes(originalRarityName);

                if (ship.retrofit === undefined) {
                    return originalRarityMatch;
                }

                const retrofitRarityName = rarities[ship.rarity - 1 + (ship.cid === 2 ? 2 : 0)];
                const retrofitRarityMatch = state.selectedRarities.includes(retrofitRarityName);

                return originalRarityMatch || retrofitRarityMatch;
            });
        }

        if (state.selectedTechStats.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => {
                if (!ship.tech) return false;
                const techStatName = techAttr[ship.tech.add_get_attr];
                const techStatName2 = techAttr[ship.tech.add_level_attr];
                return state.selectedTechStats.includes(techStatName) || state.selectedTechStats.includes(techStatName2);
            });
        }

        if (state.selectedTechStatus.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => {
                const techStat = state.techStatList.find(t => t.id === ship.id);
                if (!techStat) return false;

                return state.selectedTechStatus.every(status => {
                    if (status === 'get') return techStat.get;
                    if (status === 'level') return techStat.level;
                    if (status === 'upgrade') return techStat.upgrade;
                    return false;
                });
            });
        }

        dispatch({ type: 'SET_FILTERED_SHIPS', payload: shipsToFilter });
    }, [
        state.ships,
        state.searchTerm,
        state.selectedHullTypes,
        state.selectedNationalities,
        state.selectedRarities,
        state.selectedTechStats,
        state.selectedTechStatus,
        state.nationalities,
        state.hullTypes,
        state.techStatList,
    ]);

    useEffect(() => {
        const selected = state.ships.filter(ship => state.techStatList.some(tech => tech.id === ship.id && (tech.get || tech.level)));
        dispatch({ type: 'SET_SELECTED_SHIPS', payload: selected });
    }, [state.techStatList, state.ships]);

    useEffect(() => {
        const preloadImages = (sources: (string | undefined)[]) => {
            sources.forEach(src => {
                if (src) {
                    const img = new window.Image();
                    img.src = src;
                }
            });
        };

        if (Object.keys(state.hullTypes).length > 0 && Object.keys(state.nationalityImages).length > 0 && Object.keys(state.statTypes).length > 0) {
            const hullTypeIcons = Object.values(state.hullTypes).map(ht => ht.icon);
            const nationalityIcons = Object.values(state.nationalityImages);
            const statIcons = Object.values(state.statTypes).map(st => st.iconbox);

            preloadImages([...hullTypeIcons, ...nationalityIcons, ...statIcons]);
        }
    }, [state.hullTypes, state.nationalityImages, state.statTypes]);

    const exportTechStats = async () => {
        const data = JSON.stringify(state.techStatList);
        const btoa = window.btoa(data);
        await window.navigator.clipboard.writeText(btoa);
        dispatch({ type: 'SHOW_SNACKBAR', payload: { message: '데이터가 클립보드에 복사되었습니다.', severity: 'success' } });
    };

    const importTechStats = () => {
        try {
            const decodedData = window.atob(state.importText); // Base64 디코딩
            const parsedData: ShipTechStatData[] = JSON.parse(decodedData); // JSON 파싱

            //데이터 검증
            if (Array.isArray(parsedData) && parsedData.every(item => typeof item.id === 'number')) {
                dispatch({ type: 'SET_TECH_STAT_LIST', payload: parsedData });

                window.localStorage.clear(); // localStorage 초기화
                parsedData.forEach(stat => {
                    window.localStorage.setItem(stat.id.toString(), JSON.stringify(stat));
                });

                dispatch({ type: 'SHOW_SNACKBAR', payload: { message: '데이터를 성공적으로 가져왔습니다.', severity: 'success' } });
                dispatch({ type: 'TOGGLE_IMPORT_DIALOG', payload: false });
                dispatch({ type: 'SET_IMPORT_TEXT', payload: '' });
            } else {
                dispatch({ type: 'SHOW_SNACKBAR', payload: { message: '유효하지 않은 데이터 형식입니다.', severity: 'error' } });
            }
        } catch (error) {
            console.error("Failed to import tech stats:", error);
            dispatch({ type: 'SHOW_SNACKBAR', payload: { message: '데이터를 가져오는 데 실패했습니다. 문자열을 확인해주세요.', severity: 'error' } });
        }
    };

    const handleTechStatChange = (shipId: number, field: keyof ShipTechStatData, value: boolean) => {
        dispatch({ type: 'UPDATE_TECH_STAT', payload: { shipId, field, value } });
        const existing = state.techStatList.find(stat => stat.id === shipId);
        const updated = existing ? { ...existing, [field]: value } : { id: shipId, get: false, level: false, upgrade: false, [field]: value } as ShipTechStatData;
        window.localStorage.setItem(shipId.toString(), JSON.stringify(updated));
    };

    if (state.loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    {isMobile ? (
                        <>
                            <Box sx={{
                                position: 'relative',
                                borderRadius: theme.shape.borderRadius,
                                backgroundColor: alpha(theme.palette.common.white, 0.15),
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.common.white, 0.25),
                                },
                                width: 'auto',
                            }}>
                                <Box sx={{ padding: theme.spacing(0, 2), height: '100%', position: 'absolute', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <SearchIcon />
                                </Box>
                                <InputBase
                                    placeholder="함선 검색…"
                                    value={state.searchTerm}
                                    onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
                                    sx={{
                                        color: 'inherit',
                                        '& .MuiInputBase-input': {
                                            padding: theme.spacing(1, 1, 1, 0),
                                            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                                            transition: theme.transitions.create('width'),
                                            width: '20ch',
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton onClick={toggleColorMode} color="inherit">
                                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                            </IconButton>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" component="div">
                                함순이 청문회
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{
                                    position: 'relative',
                                    borderRadius: theme.shape.borderRadius,
                                    backgroundColor: alpha(theme.palette.common.white, 0.15),
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.common.white, 0.25),
                                    },
                                    width: 'auto',
                                }}>
                                    <Box sx={{ padding: theme.spacing(0, 2), height: '100%', position: 'absolute', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <SearchIcon />
                                    </Box>
                                    <InputBase
                                        placeholder="함선 검색…"
                                        value={state.searchTerm}
                                        onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
                                        sx={{
                                            color: 'inherit',
                                            '& .MuiInputBase-input': {
                                                padding: theme.spacing(1, 1, 1, 0),
                                                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                                                transition: theme.transitions.create('width'),
                                                width: '20ch',
                                            },
                                        }}
                                    />
                                </Box>
                                <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                                    {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                                </IconButton>
                            </Box>
                        </>
                    )}
                </Toolbar>
            </AppBar>
            <Paper sx={{ flex: 1, overflow: 'hidden', margin: isMobile ? 0 : '0 auto', width: isMobile ? '100%' : '1200px', borderRadius: '0px' }}>
                    <TableVirtuoso
                        data={state.filteredShips}
                        components={VirtuosoTableComponents}
                        fixedHeaderContent={ShipHeaderContent}
                        fixedFooterContent={!isMobile ? null :
                            () => <Box sx={{ backgroundColor: theme.palette.background.paper, width: '100vw', height: '100px' }}>
                            </Box>
                        }
                        itemContent={(index, ship) => {
                        const hullTypeName = state.hullTypes[ship.type]?.name_kr || 'Unknown';
                        const nationalityName = state.nationalities[ship.nationality]?.name_kr || state.nationalities[ship.nationality]?.name || 'Unknown';
                        const defaultSkin = state.shipSkins[ship.gid]?.skins[ship.gid * 10];
                        const skinIcon = defaultSkin?.icon || '/favicon.ico';
                        const techStat = state.techStatList.find(t => t.id === ship.id);

                        return (
                            <>
                                <TableCell component="th" scope="row">
                                    <Image src={skinIcon} alt={ship.name_kr || ship.name} width={64} height={64} />
                                </TableCell>
                                <TableCell>{ship.name_kr || ship.name}</TableCell>
                                {!isMobile && (
                                    <>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {state.hullTypes[ship.type] && <Image src={state.hullTypes[ship.type].icon} alt={hullTypeName} width={32} height={32} />}
                                                    <span>{hullTypeName}</span>
                                                </Box>
                                                {ship.retrofit?.type !== undefined && ship.retrofit.type !== ship.type && state.hullTypes[ship.retrofit.type] && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <span>→</span>
                                                        <Image src={state.hullTypes[ship.retrofit.type].icon} alt={state.hullTypes[ship.retrofit.type].name_kr} width={32} height={32} />
                                                        <span>{state.hullTypes[ship.retrofit.type].name_kr === "미사일구축함" ? "미구" : state.hullTypes[ship.retrofit.type].name_kr}</span>
                                                    </Box>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{nationalityName}</TableCell>
                                        <TableCell sx={{ fontWeight: 800 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Chip
                                                    label={rarities[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)]}
                                                    sx={theme => ({
                                                        background: theme.palette.mode === 'dark' ? {
                                                            'N': '#DDDDDD',
                                                            'R': '#34B8F2',
                                                            'SR': '#C963FC',
                                                            'SSR': '#F4B039',
                                                            'UR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                                            'PR': '#F4B039',
                                                            'DR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                                        }[rarities[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)]] : {
                                                            'N': '#e0e0e0',
                                                            'R': '#64b5f6',
                                                            'SR': '#ba68c8',
                                                            'SSR': '#ffd54f',
                                                            'UR': 'linear-gradient(150deg, #ffccbc, #e1bee7, #a7ffeb)',
                                                            'PR': '#ffd54f',
                                                            'DR': 'linear-gradient(150deg, #ffccbc, #e1bee7, #a7ffeb)',
                                                        }[rarities[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)]],
                                                        color: theme.palette.getContrastText(theme.palette.mode === 'dark' ? {
                                                            'N': '#DDDDDD',
                                                            'R': '#34B8F2',
                                                            'SR': '#C963FC',
                                                            'SSR': '#F4B039',
                                                            'UR': '#FFFFFF',
                                                            'PR': '#F4B039',
                                                            'DR': '#FFFFFF',
                                                        }[rarities[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)]] || '#000' : {
                                                            'N': '#e0e0e0',
                                                            'R': '#64b5f6',
                                                            'SR': '#ba68c8',
                                                            'SSR': '#ffd54f',
                                                            'UR': '#000000',
                                                            'PR': '#ffd54f',
                                                            'DR': '#000000',
                                                        }[rarities[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)]] || '#fff'),
                                                        fontWeight: 'bold',
                                                        width: 'fit-content',
                                                        '& .MuiChip-label': {
                                                            overflow: 'visible',
                                                        },
                                                    })} 
                                                />
                                                {ship.retrofit !== undefined &&
                                                    <Chip
                                                        label={rarities[ship.rarity - 1 + (ship.cid == 2 ? 2 : 0)]}
                                                        sx={theme => ({
                                                            background: theme.palette.mode === 'dark' ? {
                                                                'N': '#DDDDDD',
                                                                'R': '#34B8F2',
                                                                'SR': '#C963FC',
                                                                'SSR': '#F4B039',
                                                                'UR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                                                'PR': '#F4B039',
                                                                'DR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                                            }[rarities[ship.rarity - 1 + (ship.cid == 2 ? 2 : 0)]] : {
                                                                'N': '#e0e0e0',
                                                                'R': '#64b5f6',
                                                                'SR': '#ba68c8',
                                                                'SSR': '#ffd54f',
                                                                'UR': 'linear-gradient(150deg, #ffccbc, #e1bee7, #a7ffeb)',
                                                                'PR': '#ffd54f',
                                                                'DR': 'linear-gradient(150deg, #ffccbc, #e1bee7, #a7ffeb)',
                                                            }[rarities[ship.rarity - 1 + (ship.cid == 2 ? 2 : 0)]],
                                                            color: theme.palette.getContrastText(theme.palette.mode === 'dark' ? {
                                                                'N': '#DDDDDD',
                                                                'R': '#34B8F2',
                                                                'SR': '#C963FC',
                                                                'SSR': '#F4B039',
                                                                'UR': '#FFFFFF',
                                                                'PR': '#F4B039',
                                                                'DR': '#FFFFFF',
                                                            }[rarities[ship.rarity - 1 + (ship.cid == 2 ? 2 : 0)]] || '#000' : {
                                                                'N': '#e0e0e0',
                                                                'R': '#64b5f6',
                                                                'SR': '#ba68c8',
                                                                'SSR': '#ffd54f',
                                                                'UR': '#000000',
                                                                'PR': '#ffd54f',
                                                                'DR': '#000000',
                                                            }[rarities[ship.rarity - 1 + (ship.cid == 2 ? 2 : 0)]] || '#fff'),
                                                            fontWeight: 'bold',
                                                            width: 'fit-content',
                                                            '& .MuiChip-label': {
                                                                overflow: 'visible',
                                                            }
                                                        })}
                                                    />
                                                }
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {ship.obtain_kr ? (
                                                ship.obtain_kr.map((text, index) => (
                                                    <p key={index} style={{ margin: '4px 0' }}>
                                                        {text}
                                                    </p>
                                                ))
                                            ) : (
                                                ''
                                            )}
                                        </TableCell>
                                    </>
                                )}
                                <TableCell>
                                    {ship.tech ? (
                                        isMobile ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Image src={state.statTypes[techAttr[ship.tech.add_get_attr]]?.iconbox} alt={state.statTypes[techAttr[ship.tech.add_get_attr]]?.name} width={20} height={20} />
                                                    <Typography variant="body2" sx={{ ml: 1 }}>+{ship.tech.add_get_value}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                    <Image src={state.statTypes[techAttr[ship.tech.add_level_attr]]?.iconbox} alt={state.statTypes[techAttr[ship.tech.add_level_attr]]?.name} width={20} height={20} />
                                                    <Typography variant="body2" sx={{ ml: 1 }}>+{ship.tech.add_level_value}</Typography>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                {/* 획득 Row */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                                        <Box sx={{ display: 'flex', flex: 1 }}>
                                                            {ship.tech.add_get_shiptype.map((text, index) => (
                                                                <Image key={index} src={state.hullTypes[text]?.icon} alt={state.hullTypes[text]?.name_kr} width={28} height={28} />
                                                            ))}
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                                                            <Image src={state.statTypes[techAttr[ship.tech.add_get_attr]]?.iconbox} alt={state.statTypes[techAttr[ship.tech.add_get_attr]]?.name} width={20} height={20} />
                                                            <p style={{ marginLeft: "4px" }}>+{ship.tech.add_get_value}</p>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '60px', marginLeft: '4px' }}>
                                                        <Image src="icon/techpoint.png" alt="techpoint" width={32} height={32} />
                                                        <p style={{ marginLeft: "4px" }}>+{ship.tech.pt_get}</p>
                                                    </Box>
                                                </Box>

                                                {/* 풀돌 Row */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                                                    <Box sx={{ flex: 1 }} /> {/* Empty placeholder for stat bonus */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '60px', marginLeft: '4px' }}>
                                                        <Image src="icon/techpoint.png" alt="techpoint" width={32} height={32} />
                                                        <p style={{ marginLeft: "4px" }}>+{ship.tech.pt_level}</p>
                                                    </Box>
                                                </Box>

                                                {/* 120 Row */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                                        <Box sx={{ display: 'flex', flex: 1 }}>
                                                            {ship.tech.add_level_shiptype.map((text, index) => (
                                                                <Image key={index} src={state.hullTypes[text]?.icon} alt={state.hullTypes[text]?.name_kr} width={28} height={28} />
                                                            ))}
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                                                            <Image src={state.statTypes[techAttr[ship.tech.add_level_attr]]?.iconbox} alt={state.statTypes[techAttr[ship.tech.add_level_attr]]?.name} width={20} height={20} />
                                                            <p style={{ marginLeft: "4px" }}>+{ship.tech.add_level_value}</p>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '60px', marginLeft: '4px' }}>
                                                        <Image src="icon/techpoint.png" alt="techpoint" width={32} height={32} />
                                                        <p style={{ marginLeft: "4px" }}>+{ship.tech.pt_upgrade}</p>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )
                                    ) : (
                                        ''
                                    )}
                                </TableCell>
                                <TableCell padding="checkbox">
                                    <Box sx={{ display: 'flex', alignItems: 'left', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                                        <Checkbox onChange={(e) => handleTechStatChange(ship.id, 'get', e.target.checked)} checked={techStat?.get || false} sx={{ width: '32px', height: '32px' }} />
                                        <Checkbox onChange={(e) => handleTechStatChange(ship.id, 'level', e.target.checked)} checked={techStat?.level || false} sx={{ width: '32px', height: '32px' }} />
                                        <Checkbox onChange={(e) => handleTechStatChange(ship.id, 'upgrade', e.target.checked)} checked={techStat?.upgrade || false} sx={{ width: '32px', height: '32px' }} />
                                    </Box>
                                </TableCell>
                            </>
                        );
                        }}
                    />
            </Paper>
            <FilterDialog
                open={state.filterDialogOpen}
                onClose={() => dispatch({ type: 'TOGGLE_FILTER_DIALOG', payload: false })}
                hullTypes={state.hullTypes}
                nationalities={state.nationalities}
                statTypes={state.statTypes}
                selectedHullTypes={state.selectedHullTypes}
                setSelectedHullTypes={(payload) => dispatch({ type: 'SET_HULL_TYPES', payload })}
                selectedNationalities={state.selectedNationalities}
                setSelectedNationalities={(payload) => dispatch({ type: 'SET_NATIONALITIES', payload })}
                selectedRarities={state.selectedRarities}
                setSelectedRarities={(payload) => dispatch({ type: 'SET_RARITIES', payload })}
                selectedTechStats={state.selectedTechStats}
                setSelectedTechStats={(payload) => dispatch({ type: 'SET_TECH_STATS', payload })}
                selectedTechStatus={state.selectedTechStatus}
                setSelectedTechStatus={(payload) => dispatch({ type: 'SET_TECH_STATUS', payload })}
                onApply={() => dispatch({ type: 'TOGGLE_FILTER_DIALOG', payload: false })}
            />
            <ShipInfoDialog
                open={state.shipInfoDialogOpen}
                onClose={() => dispatch({ type: 'TOGGLE_SHIP_INFO_DIALOG', payload: false })}
                ship={state.selectedShip}
                hullTypes={state.hullTypes}
                nationalities={state.nationalities}
                nationalityImages={state.nationalityImages}
                skinData={state.shipSkins}
                statData={state.statTypes}
                skillData={state.skillData}
                skillIcons={state.skillIcons}
                transformSkillMapping={state.transformSkillMapping}
                uniqueSpWeapons={state.uniqueSpWeapons}
                isMobile={isMobile}
            />
            <StatDialog
                open={state.statDialogOpen}
                onClose={() => dispatch({ type: 'TOGGLE_STAT_DIALOG', payload: false })}
                shipData={state.selectedShips}
                allShips={state.ships}
                ship120List={state.techStatList}
                shipType={state.hullTypes}
                nationalities={state.nationalities}
                statList={statList}
                statData={state.statTypes}
                skinData={state.shipSkins}
            />
            <Dialog open={state.importDialogOpen} onClose={() => dispatch({ type: 'TOGGLE_IMPORT_DIALOG', payload: false })}>
                <DialogTitle>데이터 가져오기</DialogTitle>
                <DialogContent>
                    <TextField
                        label="데이터를 붙여넣어 주세요"
                        value={state.importText}
                        onChange={(e) => dispatch({ type: 'SET_IMPORT_TEXT', payload: e.target.value })}
                        multiline
                        rows={5}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => dispatch({ type: 'TOGGLE_IMPORT_DIALOG', payload: false })}>취소</Button>
                    <Button onClick={importTechStats}>가져오기</Button>
                </DialogActions>
            </Dialog>
            <Fab 
            color="primary" 
            aria-label="filter" 
            onClick={() => dispatch({ type: 'TOGGLE_FILTER_DIALOG', payload: true })}
            sx={{ position: 'fixed', bottom: 20, right: 180 }}>
                <FilterListIcon />
            </Fab>
            <Fab
            color="primary"
            aria-label="stat"
            onClick={() => dispatch({ type: 'TOGGLE_STAT_DIALOG', payload: true })}
            sx={{ position: 'fixed', bottom: 20, right: 100 }}>
                <TableChartIcon />
            </Fab>
            <SpeedDial
                ariaLabel="tools"
                sx={{ position: 'fixed', bottom: 20, right: 20 }}
                icon={<SpeedDialIcon sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}} />}
            >
                <SpeedDialAction
                    key="Export"
                    icon={<FileUploadIcon />}
                    slotProps={{
                        tooltip: {
                            title: "내보내기"
                        }
                    }}
                    onClick={exportTechStats}
                />
                <SpeedDialAction
                    key="Import"
                    icon={<FileDownloadIcon />}
                    slotProps={{
                        tooltip: {
                            title: "가져오기"
                        }
                    }}
                    onClick={() => dispatch({ type: 'TOGGLE_IMPORT_DIALOG', payload: true })}
                />
                <SpeedDialAction
                    key="Arca"
                    icon={<SvgIcon>
                        <svg version="1.0" width="100%" height="100%" viewBox="0 0 144 144" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0.000000,144.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none"><path d="M591 1314 c-325 -70 -535 -394 -466 -719 70 -328 393 -539 720 -470 328 70 539 393 470 720 -70 329 -396 541 -724 469z m269 -564 l0 -410 -40 0 -40 0 0 410 0 410 40 0 40 0 0 -410z m-337 219 c44 -53 6 -129 -64 -129 -61 0 -94 55 -68 114 22 49 96 57 132 15z m530 0 c41 -50 4 -129 -61 -129 -88 0 -114 105 -37 149 27 15 76 5 98 -20z m-373 -424 l0 -205 -40 0 -40 0 0 165 0 165 -110 0 -110 0 0 40 0 40 150 0 150 0 0 -205z m-166 24 c55 -43 18 -139 -54 -139 -19 0 -40 9 -55 25 -73 72 28 178 109 114z m531 -4 c50 -49 15 -135 -55 -135 -41 0 -80 39 -80 80 0 41 39 80 80 80 19 0 40 -9 55 -25z"></path></g></svg>
                    </SvgIcon>}
                    slotProps={{
                        tooltip: {
                            title: "벽람항로 채널"
                        }
                    }}
                    onClick={() => {
                        window.open('https://arca.live/b/azurlane', '_blank');
                    }}
                />
                <SpeedDialAction
                    key="Github"
                    icon={<GitHubIcon />}
                    slotProps={{
                        tooltip: {
                            title: "Github"
                        }
                    }}
                    onClick={() => {
                        window.open('https://github.com/999dulgi/azurlane-hearing.git', '_blank');
                    }}
                />
            </SpeedDial>
            <Snackbar
                open={state.snackbar.open}
                autoHideDuration={6000}
                onClose={() => dispatch({ type: 'HIDE_SNACKBAR' })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => dispatch({ type: 'HIDE_SNACKBAR' })} severity={state.snackbar.severity} sx={{ width: '100%' }}>
                    {state.snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
