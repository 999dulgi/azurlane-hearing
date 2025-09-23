/* eslint-disable react/display-name */
"use client";

import React, { useContext, useEffect, useState, useMemo, useCallback, useReducer } from "react";
import {
    Box, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Checkbox, Button, DialogActions, Dialog, DialogContent, TextField, DialogTitle, Snackbar, Alert, Chip, AppBar,
    Toolbar,
    Typography,
    SvgIcon,
    IconButton
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Image from "next/image";
import { TableVirtuoso, TableComponents } from "react-virtuoso";
import FilterDialog, { rarities, statList } from './FilterDialog';
import { ColorModeContext } from "../(components)/ThemeRegistry";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import GitHubIcon from '@mui/icons-material/GitHub';
import ShipInfoDialog from "./ShipInfoDialog";

type AppState = {
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
    snackbar: { open: boolean; message: string; severity: 'success' | 'error' };
};

type AppAction = 
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
    | { type: 'HIDE_SNACKBAR' };

const initialState: AppState = {
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
};


function appReducer(state: AppState, action: AppAction): AppState {
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
        default:
            return state;
    }
}

export default function Page() {
    const theme = useTheme();
    const { toggleColorMode } = useContext(ColorModeContext);
    const [ships, setShips] = useState<Ship[]>([]);
    const [shipSkins, setShipSkins] = useState<ShipSkins>({});
    const [hullTypes, setHullTypes] = useState<HullTypes>({});
    const [statTypes, setStatTypes] = useState<StatTypes>({});
    const [nationalities, setNationalities] = useState<Nationalities>({});
    const [techStatList, setTechStatList] = useState<ShipTechStatData[]>([]);
    const [importText, setImportText] = useState('');
    const [filteredShips, setFilteredShips] = useState<Ship[]>([]);
    const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
    
    const [state, dispatch] = useReducer(appReducer, initialState);

    const handleRowClick = useCallback((ship: Ship) => {
        setSelectedShip(ship);
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
    }), [handleRowClick]);

    const ShipHeaderContent = useCallback(() => {
        return (
            <TableRow sx={{ backgroundColor: 'background.paper', }}>
                <TableCell sx={{ width: '100px' }}></TableCell>
                <TableCell sx={{ width: '160px' }}>이름</TableCell>
                <TableCell>함종</TableCell>
                <TableCell>진영</TableCell>
                <TableCell>등급</TableCell>
                <TableCell sx={{ width: '300px' }}>획득방법</TableCell>
                <TableCell sx={{ width: '240px' }}>기술점수</TableCell>
                <TableCell sx={{ width: '52px' }}></TableCell>
            </TableRow>
        )
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [shipsRes, skinsRes, hullsRes, statsRes, nationsRes] = await Promise.all([
                    fetch('ship_kr.json'),
                    fetch('ship_skin.json'),
                    fetch('hulltype.json'),
                    fetch('attribute.json'),
                    fetch('nationality.json'),
                ]);

                const shipsData = await shipsRes.json();
                const skinsData = await skinsRes.json();
                const hullsData = await hullsRes.json();
                const statsData = await statsRes.json();
                const nationsData = await nationsRes.json();

                setShips(shipsData);
                setShipSkins(skinsData);
                setHullTypes(hullsData);
                setStatTypes(statsData);
                setNationalities(nationsData);
                
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

        setTechStatList(savedTechStats);
        fetchData();
    }, []);

    useEffect(() => {
        let shipsToFilter = [...ships];

        if (state.selectedHullTypes.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => state.selectedHullTypes.includes(ship.type));
        }

        if (state.selectedNationalities.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => state.selectedNationalities.includes(nationalities[ship.nationality]?.code));
        }

        if (state.selectedRarities.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => state.selectedRarities.includes(rarities[ship.rarity - 2 + (ship.cid === 2 ? 2 : 0)]));
        }

        if (state.selectedTechStats.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => {
                if (!ship.tech) return false;
                const techStatName = statList[ship.tech.add_get_attr - 1];
                const techStatName2 = statList[ship.tech.add_level_attr - 1];
                return state.selectedTechStats.includes(techStatName) || state.selectedTechStats.includes(techStatName2);
            });
        }

        if (state.selectedTechStatus.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => {
                const techStat = techStatList.find(t => t.id === ship.id);
                if (!techStat) return false;

                return state.selectedTechStatus.every(status => {
                    if (status === 'get') return techStat.get;
                    if (status === 'level') return techStat.level;
                    if (status === 'upgrade') return techStat.upgrade;
                    return false;
                });
            });
        }

        setFilteredShips(shipsToFilter);
    }, [ships, state, nationalities, hullTypes, techStatList]);

    const exportTechStats = async () => {
        const data = JSON.stringify(techStatList);
        const btoa = window.btoa(data);
        await window.navigator.clipboard.writeText(btoa);
        dispatch({ type: 'SHOW_SNACKBAR', payload: { message: '데이터가 클립보드에 복사되었습니다.', severity: 'success' } });
    };

    const importTechStats = () => {
        try {
            const decodedData = window.atob(importText); // Base64 디코딩
            const parsedData: ShipTechStatData[] = JSON.parse(decodedData); // JSON 파싱

            //데이터 검증
            if (Array.isArray(parsedData) && parsedData.every(item => typeof item.id === 'number')) {
                setTechStatList(parsedData);

                window.localStorage.clear(); // localStorage 초기화
                parsedData.forEach(stat => {
                    window.localStorage.setItem(stat.id.toString(), JSON.stringify(stat));
                });

                dispatch({ type: 'SHOW_SNACKBAR', payload: { message: '데이터를 성공적으로 가져왔습니다.', severity: 'success' } });
                dispatch({ type: 'TOGGLE_IMPORT_DIALOG', payload: false });
                setImportText('');
            } else {
                dispatch({ type: 'SHOW_SNACKBAR', payload: { message: '유효하지 않은 데이터 형식입니다.', severity: 'error' } });
            }
        } catch (error) {
            console.error("Failed to import tech stats:", error);
            dispatch({ type: 'SHOW_SNACKBAR', payload: { message: '데이터를 가져오는 데 실패했습니다. 문자열을 확인해주세요.', severity: 'error' } });
        }
    };

    const handleTechStatChange = (shipId: number, field: string, value: boolean) => {
        setTechStatList(prevList => {
            const index = prevList.findIndex(stat => stat.id === shipId);
            const newList = [...prevList];

            if (index > -1) {
                const updatedStat = { ...newList[index], [field]: value };
                newList[index] = updatedStat;
                window.localStorage.setItem(shipId.toString(), JSON.stringify(updatedStat));
            } else {
                const newStat = { id: shipId, get: false, level: false, upgrade: false, [field]: value };
                newList.push(newStat);
                window.localStorage.setItem(shipId.toString(), JSON.stringify(newStat));
            }
            return newList;
        });
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
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        함순이 청문회
                    </Typography>
                    <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Paper sx={{ flex: 1, overflow: 'hidden', margin: '0 auto', width: '1200px', borderRadius: '0px' }}>
                <TableVirtuoso
                    data={filteredShips}
                    components={VirtuosoTableComponents}
                    fixedHeaderContent={ShipHeaderContent}
                    itemContent={(index, ship) => {
                        const hullTypeName = hullTypes[ship.type]?.name_kr || 'Unknown';
                        const nationalityName = nationalities[ship.nationality]?.name_kr || nationalities[ship.nationality]?.name || 'Unknown';
                        const defaultSkin = shipSkins[ship.gid]?.skins[ship.gid * 10];
                        const skinIcon = defaultSkin?.icon || '/favicon.ico';
                        const techStat = techStatList.find(t => t.id === ship.id);

                        return (
                            <>
                                <TableCell component="th" scope="row">
                                    <Image src={skinIcon} alt={ship.name_kr || ship.name} width={64} height={64} />
                                </TableCell>
                                <TableCell>{ship.name_kr || ship.name}</TableCell>
                                <TableCell>{hullTypeName}</TableCell>
                                <TableCell>{nationalityName}</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>
                                    <Chip
                                        label={rarities[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)]}
                                        sx={{
                                            color: rarities[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)] === 'N' ? 'black' : 'white',
                                            background: {
                                                'N': '#DDDDDD',
                                                'R': '#34B8F2',
                                                'SR': '#C963FC',
                                                'SSR': '#F4B039',
                                                'UR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                                'PR': '#F4B039',
                                                'DR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                            }[rarities[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)]],
                                        }}
                                    />
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
                                <TableCell>{ship.tech ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        {/* 획득 Row */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                                <Box sx={{ display: 'flex', flex: 1 }}>
                                                    {ship.tech.add_get_shiptype.map((text, index) => (
                                                        <Image key={index} src={hullTypes[text]?.icon} alt={hullTypes[text]?.name_kr} width={28} height={28} />
                                                    ))}
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                                                    <Image src={statTypes[statList[ship.tech.add_get_attr - 1]]?.iconbox} alt={statTypes[statList[ship.tech.add_get_attr - 1]]?.name} width={20} height={20} />
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
                                                        <Image key={index} src={hullTypes[text]?.icon} alt={hullTypes[text]?.name_kr} width={28} height={28} />
                                                    ))}
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                                                    <Image src={statTypes[statList[ship.tech.add_level_attr - 1]]?.iconbox} alt={statTypes[statList[ship.tech.add_level_attr - 1]]?.name} width={20} height={20} />
                                                    <p style={{ marginLeft: "4px" }}>+{ship.tech.add_level_value}</p>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '60px', marginLeft: '4px' }}>
                                                <Image src="icon/techpoint.png" alt="techpoint" width={32} height={32} />
                                                <p style={{ marginLeft: "4px" }}>+{ship.tech.pt_upgrade}</p>
                                            </Box>
                                        </Box>
                                    </Box>
                                ) : (
                                    ''
                                )}</TableCell>
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
                hullTypes={hullTypes}
                nationalities={nationalities}
                statTypes={statTypes}
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
                ship={selectedShip}
            />
            <Dialog open={state.importDialogOpen} onClose={() => dispatch({ type: 'TOGGLE_IMPORT_DIALOG', payload: false })}>
                <DialogTitle>데이터 가져오기</DialogTitle>
                <DialogContent>
                    <TextField
                        label="데이터를 붙여넣어 주세요"
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
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
            <SpeedDial
                ariaLabel="tools"
                sx={{ position: 'fixed', bottom: 20, right: 20 }}
                icon={<SpeedDialIcon sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}} />}
            >
                <SpeedDialAction
                    key="Filter"
                    icon={<FilterListIcon />}
                    slotProps={{
                        tooltip: {
                            title: "필터"
                        }
                    }}
                    onClick={() => dispatch({ type: 'TOGGLE_FILTER_DIALOG', payload: true })}
                />
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
