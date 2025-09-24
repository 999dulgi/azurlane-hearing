import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Tabs,
    Tab,
    Chip,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from '@mui/material';
import Image from 'next/image';
import { rarities } from './FilterDialog';

interface ShipInfoDialogProps {
    open: boolean;
    onClose: () => void;
    ship: Ship | null;
    hullTypes: HullTypes;
    nationalities: Nationalities;
    nationalityImages: { [key: string]: string };
    skinData: ShipSkins;
    statData: StatTypes;
    techStatList: ShipTechStatData[];
    skillData: Skills;
    skillIcons: SkillIcons;
}


const HuntingRangeGrid = ({ gridLevels, setLevel, level }: { gridLevels: number[][][] | undefined; setLevel: React.Dispatch<React.SetStateAction<number>>; level: number; }) => {
    const colors = ['#FFFFFF', '#87CEEB'];
    const playerPosition = { row: 3, col: 3 };

    const currentGrid = gridLevels?.[level];

    return (
        <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6" gutterBottom align="center">잠수 범위</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, marginBottom: 2 }}>
                {[1, 2, 3, 4, 5].map((levelNum) => (
                    <Chip
                        key={levelNum}
                        label={`레벨 ${levelNum}`}
                        variant={level === levelNum - 1 ? 'filled' : 'outlined'}
                        color={level === levelNum - 1 ? 'primary' : 'default'}
                        sx={{ fontWeight: level === levelNum - 1 ? 'bold' : 'normal' }}
                        onClick={() => setLevel(levelNum - 1)}
                    />
                ))}
            </Box>

            <Box sx={{ width: 250, height: 250, margin: 'auto' }}>
                <Table sx={{ borderCollapse: 'collapse', width: '100%', height: '100%', tableLayout: 'fixed' }}>
                    <TableBody>
                        {currentGrid?.map((row, rowIndex) => (
                            <TableRow key={rowIndex} sx={{ height: 'calc(100% / 7)' }}>
                                {row.map((cellValue, cellIndex) => (
                                    <TableCell
                                        key={`${rowIndex}-${cellIndex}`}
                                        sx={{
                                            border: '1px solid #ddd',
                                            backgroundColor: colors[cellValue] || '#FFFFFF',
                                            padding: 0,
                                            ...(rowIndex === playerPosition.row && cellIndex === playerPosition.col && {
                                                border: '2px solid red'
                                            })
                                        }}
                                    />
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Box>
    );
};

function ShipInfoDialog({ open, onClose, ship, hullTypes, nationalities, nationalityImages, skinData, statData, techStatList, skillData, skillIcons }: ShipInfoDialogProps) {
    const [tab, setTab] = useState(0);
    const [affinity, setAffinity] = useState(1);
    const [gridLevels, setGridLevels] = useState<number[][][]>();
    const [level, setLevel] = useState(0);

    const statList = ["health", "firepower", "torpedo", "antiair", "aviation", "reload", "accuracy",
        "evasion", "speed", "luck", "asw"]
    const lvlList = [1, 100, 120, 125];

    useEffect(() => {
        setLevel(0);

        if (!ship) {
            setGridLevels(undefined);
            return;
        }

        const newGridLevels = Array(5).fill(0).map(() =>
            Array(7).fill(0).map(() => Array(7).fill(0))
        );

        if (ship.hunting_range) {
            ship.hunting_range.forEach((levelData, levelIndex) => {
                levelData.forEach(pos => {
                    const r = 3 + pos[0];
                    const c = 3 + pos[1];
                    if (r >= 0 && r < 7 && c >= 0 && c < 7) {
                        for (let i = levelIndex; i < 5; i++) {
                            newGridLevels[i][r][c] = 1;
                        }
                    }
                });
            });
        }

        setGridLevels(newGridLevels);
    }, [ship]);




    const calculateStat = (level: number, base: number, growth: number, enhance?: number, retrofit?: number, affinity: number = 1) => {
        return Math.floor((base + (growth * (level - 1)) / 1000 + (enhance || 0)) * affinity + (retrofit || 0));
    };

    if (!ship) {
        return null;
    }

    const isSubmarine = hullTypes[ship.type]?.position === 'submarine';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogContent>
                <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
                    <Tab label="정보" />
                    <Tab label="스킨" />
                </Tabs>
                <Box role="tabpanel" hidden={tab !== 0} id={`tabpanel-${tab}`}>
                    <Grid container spacing={2}>
                        <Grid sx={{ xs: 4 }}>
                            <Image src={skinData[ship.gid]["skins"][ship.gid * 10].shipyard} alt={ship.name} width={200} height={0}
                                style={{
                                    background: {
                                        'N': '#DDDDDD',
                                        'R': '#34B8F2',
                                        'SR': '#C963FC',
                                        'SSR': '#F4B039',
                                        'UR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                        'PR': '#F4B039',
                                        'DR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                    }[rarities[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)]],
                                }} />
                        </Grid>
                        <Grid sx={{ xs: 8, display: 'flex', flexDirection: 'column', gap: 1 }} size="grow">
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                <Typography sx={{ fontWeight: 'bold' }}>{ship.codename_kr}</Typography>
                                <Typography>{ship.codename}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                <Chip label={rarities[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)]}
                                    sx={{
                                        background: {
                                            'N': '#DDDDDD',
                                            'R': '#34B8F2',
                                            'SR': '#C963FC',
                                            'SSR': '#F4B039',
                                            'UR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                            'PR': '#F4B039',
                                            'DR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                        }[rarities[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)]],
                                        color: ship.rarity === 2 ? '#333333' : '#FFFFFF',
                                        fontWeight: 'bold',
                                        width: 'fit-content',
                                    }}
                                />
                                {ship.retrofit !== undefined &&
                                    <Chip label={rarities[ship.rarity - 1 + (ship.cid == 2 ? 2 : 0)]}
                                        sx={{
                                            background: {
                                                'N': '#DDDDDD',
                                                'R': '#34B8F2',
                                                'SR': '#C963FC',
                                                'SSR': '#F4B039',
                                                'UR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                                'PR': '#F4B039',
                                                'DR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                            }[rarities[ship.rarity - 1 + (ship.cid == 2 ? 2 : 0)]],
                                            color: ship.rarity === 1 ? '#333333' : '#FFFFFF',
                                            fontWeight: 'bold',
                                            width: 'fit-content',
                                        }}
                                    />
                                }
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', minHeight: '40px' }}>
                                <Typography sx={{ fontWeight: 'bold', minWidth: '80px' }}>함종</Typography>
                                <Typography>{hullTypes[ship.type].name_kr}</Typography>
                                <Image src={hullTypes[ship.type].icon} alt={hullTypes[ship.type].name_kr} width={40} height={40} />
                                {ship.retrofit?.type !== undefined && ship.retrofit?.type !== ship.type ? (
                                    <>
                                        <Typography>{hullTypes[ship.retrofit!.type].name_kr}</Typography>
                                        <Image src={hullTypes[ship.retrofit!.type].icon} alt={hullTypes[ship.retrofit!.type].name_kr} width={40} height={40} />
                                    </>
                                )
                                    : null}
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', minHeight: '40px' }}>
                                <Typography sx={{ fontWeight: 'bold', minWidth: '80px' }}>진영</Typography>
                                <Typography>{nationalities[ship.nationality].name_kr}</Typography>
                                <Image src={nationalityImages[ship.nationality]} alt={nationalities[ship.nationality].name_kr} width={40} height={40} />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', minHeight: '40px' }}>
                                <Typography sx={{ fontWeight: 'bold', minWidth: '80px' }}>입수 경로</Typography>
                                <Typography sx={{ maxWidth: '540px' }}>{ship.obtain_kr?.join(', ')}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '40px' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 'bold', minWidth: '80px' }}>개조 유무</Typography>
                                    <Typography sx={{ width: '80px' }}>{ship.retrofit ? 'O' : 'X'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 'bold' }}>호감도</Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {[
                                            { label: '낯섦', value: 1 },
                                            { label: '사랑', value: 1.06 },
                                            { label: '서약 100', value: 1.09 },
                                            { label: '서약 200', value: 1.12 },
                                        ].map(({ label, value }) => (
                                            <Chip
                                                key={label}
                                                label={label}
                                                variant={affinity === value ? 'filled' : 'outlined'}
                                                sx={{
                                                    fontWeight: affinity === value ? 'bold' : 'normal'
                                                    , backgroundColor: affinity === value ? {
                                                        '낯섦': '#AAD1DA',
                                                        '사랑': '#FF7766',
                                                        '서약 100': '#FFDDFF',
                                                        '서약 200': '#FFDDFF',
                                                    }[label] : undefined,
                                                    color: affinity === value ? {
                                                        '낯섦': '#000000',
                                                        '사랑': '#ffffff',
                                                        '서약 100': '#000000',
                                                        '서약 200': '#000000',
                                                    }[label] : 'inherit',
                                                }}
                                                onClick={() => setAffinity(value)}
                                                size="small"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                    <Box sx={{ marginTop: 2 }}>
                        <Table sx={{ tableLayout: 'fixed' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">LV</TableCell>
                                    {statList.map(stat => <TableCell key={stat} align="center">
                                        <Image src={statData[stat].icon} alt={statData[stat].name} width={40} height={40} />
                                    </TableCell>)}
                                    <TableCell align="center"><Image src={statData["oxygen"].icon} alt={statData["oxygen"].name} width={40} height={40} /></TableCell>
                                    <TableCell align="center"><Image src={statData["cost"].icon} alt={statData["cost"].name} width={40} height={40} /></TableCell>
                                    <TableCell align="center"><Image src={statData["armor"].icon} alt={statData["armor"].name} width={40} height={40} /></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lvlList.map((lvl) => (
                                    <TableRow key={lvl}>
                                        <TableCell>{lvl}</TableCell>
                                        {statList.map((stat) => (
                                            <TableCell key={stat}>
                                                {ship.base[ship.sid[0]][stat] ?
                                                    calculateStat(lvl,
                                                        ship.base[(lvl === 1 ? ship.sid[0] : ship.sid[ship.sid.length - 1])][stat],
                                                        ship.growth[(lvl === 1 ? ship.sid[0] : ship.sid[ship.sid.length - 1])][stat],
                                                        lvl === 1 ? 0 : ship.enhance[stat],
                                                        undefined,
                                                        affinity
                                                    )
                                                    : '-'}
                                            </TableCell>
                                        ))}
                                        <TableCell>{ship.oxy_max ? ship.oxy_max : '-'}</TableCell>
                                        <TableCell>{lvl === 1 ? ship.oil_min : ship.oil_max}</TableCell>
                                        {lvl === 1 ? <TableCell rowSpan={ship.retrofit ? lvlList.length + 1 : lvlList.length}>{ship.armor === 1 ? '경장갑' : ship.armor === 2 ? '중형장갑' : '중장갑'}</TableCell> : null}
                                    </TableRow>
                                ))}
                                {ship.retrofit ? (
                                    <TableRow key="retrofit">
                                        <TableCell>改</TableCell>
                                        {statList.map((stat) => (
                                            <TableCell key={stat}>
                                                {ship.base[ship.retrofit!.id][stat] ?
                                                    calculateStat(125,
                                                        ship.base[ship.retrofit!.id][stat],
                                                        ship.growth[ship.retrofit!.id][stat],
                                                        ship.enhance[stat],
                                                        ship.retrofit!.bonus[stat],
                                                        affinity
                                                    )
                                                    : '-'}
                                            </TableCell>
                                        ))}
                                        <TableCell>{ship.oxy_max ? ship.oxy_max : '-'}</TableCell>
                                        <TableCell>{ship.oil_max}</TableCell>
                                    </TableRow>
                                ) : null}
                            </TableBody>
                        </Table>
                        {isSubmarine && gridLevels && (
                            <HuntingRangeGrid gridLevels={gridLevels} setLevel={setLevel} level={level} />
                        )}
                        <Box sx={{ marginTop: 2 }}>
                            <Typography variant="h6" gutterBottom>스킬</Typography>
                            {Object.values(ship.skill).map(skill => (
                                <Box key={skill.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Image src={skillIcons[skill.id]} alt={skillData[skill.id]?.name} width={64} height={64} />
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{skillData[skill.id]?.name}</Typography>
                                        <Typography variant="body2">{skillData[skill.id]?.desc}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
                <Box role="tabpanel" hidden={tab !== 1} id={`tabpanel-${tab}`}>
                    <Image src={skinData[ship.gid]["skins"][ship.gid * 10].painting} alt={ship.name} width={200} height={0} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShipInfoDialog;
