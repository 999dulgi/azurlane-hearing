/* eslint-disable react/display-name */
"use client";

import React, { useEffect, useState } from "react";
import { Box, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Button, DialogActions, Dialog, DialogContent, TextField, DialogTitle, Snackbar, Alert } from "@mui/material";
import Image from "next/image";
import { TableVirtuoso, TableComponents } from "react-virtuoso";
import FilterDialog, { rarities, statList } from './FilterDialog';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const VirtuosoTableComponents: TableComponents<Ship> = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
        <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: (props) => (
        <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed', overflowX: 'scroll' }} />
    ),
    TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableHead {...props} ref={ref} />
    )),
    TableRow,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableBody {...props} ref={ref} />
    )),
};

function ShipHeaderContent() {
    return (
        <TableRow sx={{ backgroundColor: 'background.paper' }}>
            <TableCell sx={{ width: '100px' }}></TableCell>
            <TableCell sx={{ width: '160px' }}>이름</TableCell>
            <TableCell>함종</TableCell>
            <TableCell>진영</TableCell>
            <TableCell>등급</TableCell>
            <TableCell sx={{ width: '300px' }}>획득방법</TableCell>
            <TableCell sx={{ width: '220px' }}>기술점수</TableCell>
            <TableCell sx={{ width: '52px' }}></TableCell>
        </TableRow>
    )
}


export default function Page() {
    const [ships, setShips] = useState<Ship[]>([]);
    const [shipSkins, setShipSkins] = useState<ShipSkins>({});
    const [hullTypes, setHullTypes] = useState<HullTypes>({});
    const [statTypes, setStatTypes] = useState<StatTypes>({});
    const [nationalities, setNationalities] = useState<Nationalities>({});
    const [techStatList, setTechStatList] = useState<ShipTechStatData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importText, setImportText] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
    const [filteredShips, setFilteredShips] = useState<Ship[]>([]);

    const [selectedHullTypes, setSelectedHullTypes] = useState<string[]>([]);
    const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);
    const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
    const [selectedTechStats, setSelectedTechStats] = useState<string[]>([]);
    const [selectedTechStatus, setSelectedTechStatus] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [shipsRes, skinsRes, hullsRes, statsRes, nationsRes] = await Promise.all([
                    fetch('/ship_kr.json'),
                    fetch('/ship_skin.json'),
                    fetch('/hulltype.json'),
                    fetch('/attribute.json'),
                    fetch('/nationality.json'),
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
                setLoading(false);
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

        if (selectedHullTypes.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => {
                const hullName = hullTypes[ship.type]?.name;
                return hullName ? selectedHullTypes.includes(hullName) : false;
            });
        }

        if (selectedNationalities.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => selectedNationalities.includes(nationalities[ship.nationality]?.code));
        }

        if (selectedRarities.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => selectedRarities.includes(rarities[ship.rarity - 2 + (ship.cid === 2 ? 2 : 0)]));
        }

        if (selectedTechStats.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => {
                if (!ship.tech) return false;
                const techStatName = statList[ship.tech.add_get_attr - 1];
                const techStatName2 = statList[ship.tech.add_level_attr - 1];
                return selectedTechStats.includes(techStatName) || selectedTechStats.includes(techStatName2);
            });
        }

        if (selectedTechStatus.length > 0) {
            shipsToFilter = shipsToFilter.filter(ship => {
                const techStat = techStatList.find(t => t.id === ship.id);
                if (!techStat) return false;

                return selectedTechStatus.every(status => {
                    if (status === 'get') return techStat.get;
                    if (status === 'level') return techStat.level;
                    if (status === 'upgrade') return techStat.upgrade;
                    return false;
                });
            });
        }

        setFilteredShips(shipsToFilter);
    }, [ships, selectedHullTypes, selectedNationalities, selectedRarities, selectedTechStats, selectedTechStatus, nationalities, hullTypes, techStatList]);

    const exportTechStats = async () => {
        const data = JSON.stringify(techStatList);
        const btoa = window.btoa(data);
        await window.navigator.clipboard.writeText(btoa);
        setSnackbar({ open: true, message: '데이터가 클립보드에 복사되었습니다.', severity: 'success' });
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

                setSnackbar({ open: true, message: '데이터를 성공적으로 가져왔습니다.', severity: 'success' });
                setImportDialogOpen(false);
                setImportText('');
            } else {
                setSnackbar({ open: true, message: '유효하지 않은 데이터 형식입니다.', severity: 'error' });
            }
        } catch (error) {
            console.error("Failed to import tech stats:", error);
            setSnackbar({ open: true, message: '데이터를 가져오는 데 실패했습니다. 문자열을 확인해주세요.', severity: 'error' });
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Paper sx={{ height: '100vh', overflow: 'hidden', margin: '0 auto', width: '1200px' }}>
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
                                <TableCell>{rarities[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)]}</TableCell>
                                <TableCell>
                                    {ship.obtain_kr ? (
                                        ship.obtain_kr.map((text, index) => (
                                            <p key={index} style={{ margin: 0 }}>
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
                                                <Image src="/techpoint.png" alt="techpoint" width={32} height={32} />
                                                <p style={{ marginLeft: "4px" }}>+{ship.tech.pt_get}</p>
                                            </Box>
                                        </Box>

                                        {/* 풀돌 Row */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                                            <Box sx={{ flex: 1 }} /> {/* Empty placeholder for stat bonus */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '60px', marginLeft: '4px' }}>
                                                <Image src="/techpoint.png" alt="techpoint" width={32} height={32} />
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
                                                <Image src="/techpoint.png" alt="techpoint" width={32} height={32} />
                                                <p style={{ marginLeft: "4px" }}>+{ship.tech.pt_upgrade}</p>
                                            </Box>
                                        </Box>
                                    </Box>
                                ) : (
                                    ''
                                )}</TableCell>
                                <TableCell padding="checkbox">
                                    <Box sx={{ display: 'flex', alignItems: 'left', flexDirection: 'column' }}>
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
                open={filterDialogOpen}
                onClose={() => setFilterDialogOpen(false)}
                hullTypes={hullTypes}
                nationalities={nationalities}
                statTypes={statTypes}
                selectedHullTypes={selectedHullTypes}
                setSelectedHullTypes={setSelectedHullTypes}
                selectedNationalities={selectedNationalities}
                setSelectedNationalities={setSelectedNationalities}
                selectedRarities={selectedRarities}
                setSelectedRarities={setSelectedRarities}
                selectedTechStats={selectedTechStats}
                setSelectedTechStats={setSelectedTechStats}
                selectedTechStatus={selectedTechStatus}
                setSelectedTechStatus={setSelectedTechStatus}
                onApply={() => setFilterDialogOpen(false)}
            />
            <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
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
                    <Button onClick={() => setImportDialogOpen(false)}>취소</Button>
                    <Button onClick={importTechStats}>가져오기</Button>
                </DialogActions>
            </Dialog>
            <SpeedDial
                ariaLabel="tools"
                sx={{ position: 'fixed', bottom: 20, right: 20 }}
                icon={<SpeedDialIcon />}
            >
                <SpeedDialAction
                    key="Filter"
                    icon={<FilterListIcon />}
                    slotProps={{
                        tooltip: {
                            title: "필터"
                        }
                    }}
                    onClick={() => setFilterDialogOpen(true)}
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
                    onClick={() => setImportDialogOpen(true)}
                />
            </SpeedDial>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
