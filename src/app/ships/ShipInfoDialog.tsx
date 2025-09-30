import React, { useEffect, useState, useRef } from 'react';
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
    CircularProgress,
    Switch,
    FormControlLabel,
    IconButton,
} from '@mui/material';
import Image from 'next/image';
import LinkIcon from '@mui/icons-material/Link';
import { rarities, statList, techAttr } from '../ships/state/types';
import shipLinks from '../../../public/ship_links.json';

interface ShipInfoDialogProps {
    open: boolean;
    onClose: () => void;
    ship: Ship | null;
    hullTypes: HullTypes;
    nationalities: Nationalities;
    nationalityImages: { [key: string]: string };
    skinData: ShipSkins;
    statData: StatTypes;
    skillData: Skills;
    skillIcons: SkillIcons;
    transformSkillMapping: { [key: string]: number };
    uniqueSpWeapons: { [key: string]: { name: string; skill: number } };
    isMobile: boolean;
}

interface ShipEvaluation {
    url: string;
    name: string;
    grade?: string;
    description?: string;
}


const HuntingRangeGrid = ({ gridLevels, setLevel, level }:
    { gridLevels: number[][][] | undefined; setLevel: React.Dispatch<React.SetStateAction<number>>; level: number; }) => {
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

function ShipInfoDialog({ open, onClose, ship, hullTypes, nationalities, nationalityImages, skinData, statData,
    skillData, skillIcons, transformSkillMapping, uniqueSpWeapons, isMobile }: ShipInfoDialogProps) {
    const [tab, setTab] = useState(0);
    const [affinity, setAffinity] = useState(1);
    const [gridLevels, setGridLevels] = useState<number[][][]>();
    const [level, setLevel] = useState(0);
    const [selectedSkin, setSelectedSkin] = useState<SkinData | null>(null);
    const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set());
    const [showPaintingN, setShowPaintingN] = useState(false);
    const [evaluation, setEvaluation] = useState<ShipEvaluation | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (scrollContainerRef.current) {
            e.preventDefault();
            scrollContainerRef.current.scrollLeft += e.deltaY;
        }
    };

    const lvlList = [1, 100, 120, 125];
    const equipName: Record<number, string> = {
        1: "구축포",
        2: "경순포",
        3: "중순포",
        4: "전함포",
        5: "수면 어뢰",
        6: "대공포",
        7: "전투기",
        8: "뇌격기",
        9: "폭격기",
        10: "설비",
        11: "대순포",
        14: "설비",
        12: "수상기",
        13: "잠수함 어뢰",
        21: "대공포(시한신관)"
    }
    const equipHasMount = [1, 2, 3, 4, 6, 7, 8, 9, 21];

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

        if (ship && skinData[ship.gid]) {
            const defaultSkin = Object.values(skinData[ship.gid].skins).find(s => s.id === ship.gid * 10) || Object.values(skinData[ship.gid].skins)[0];
            setSelectedSkin(defaultSkin);
        }

        const foundEval = (shipLinks as ShipEvaluation[]).find(link => link.name === ship.name_kr);
        setEvaluation(foundEval || null);

    }, [ship, skinData]);

    useEffect(() => {
        if (selectedSkin) {
            setShowPaintingN(false); // Reset switch on new skin selection
            const urls = new Set<string>();
            urls.add(selectedSkin.background || 'https://raw.githubusercontent.com/Fernando2603/AzurLane/main/images/background/210.png');
            urls.add(selectedSkin.painting); // Initially, only load the default painting
            if (!isMobile) {
                urls.add(selectedSkin.chibi);
            }
            setLoadingUrls(urls);
        }
    }, [selectedSkin, isMobile]);

    const handleImageLoad = (url: string) => {
        setLoadingUrls(prev => {
            const newUrls = new Set(prev);
            newUrls.delete(url);
            return newUrls;
        });
    };




    const calculateStat = (level: number, base: number, growth: number, enhance?: number, retrofit?: number, affinity: number = 1) => {
        return Math.floor((base + (growth * (level - 1)) / 1000 + (enhance || 0)) * affinity + (retrofit || 0));
    };

    if (!ship) {
        return null;
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll={isMobile ? 'body' : 'paper'}>
            <DialogContent>
                <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
                    <Tab label="정보" />
                    <Tab label="스킨" />
                </Tabs>
                <Box role="tabpanel" hidden={tab !== 0} id={`tabpanel-${tab}`}>
                    <Grid container spacing={2} direction={isMobile ? 'column' : 'row'}>
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
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                                <Typography sx={{ fontWeight: 'bold' }}>{ship.codename_kr}</Typography>
                                <Typography>{ship.codename}</Typography>
                                {evaluation && evaluation.url && evaluation.url.startsWith('http') && (
                                    <IconButton
                                        component="a"
                                        href={evaluation.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="small"
                                    >
                                        <LinkIcon fontSize="small" />
                                    </IconButton>
                                )}
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
                            <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', minHeight: '40px' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 'bold', minWidth: '80px' }}>개조 유무</Typography>
                                    <Typography sx={{ width: '80px' }}>{ship.retrofit ? 'O' : 'X'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 'bold', minWidth: '80px' }}>전장 유무</Typography>
                                    <Typography sx={{ width: '80px' }}>{Object.keys(uniqueSpWeapons || {}).includes(ship.gid.toString()) ? 'O' : 'X'}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                    <Box sx={{ marginTop: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
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
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table sx={{ tableLayout: 'fixed', minWidth: 650 }}>
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
                        </Box>
                        {hullTypes[ship.type]?.position === "submarine" && gridLevels && (
                            <HuntingRangeGrid gridLevels={gridLevels} setLevel={setLevel} level={level} />
                        )}
                        {ship.tech && (
                            <Box sx={{ marginTop: 2 }}>
                                <Typography variant="h6" gutterBottom>기술 점수</Typography>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>조건</TableCell>
                                            <TableCell>함종</TableCell>
                                            <TableCell>스탯</TableCell>
                                            <TableCell>점수</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>획득</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                                                    {ship.tech.add_get_shiptype.map((text, index) => (
                                                        isMobile ?
                                                        <Image key={index} src={hullTypes[text]?.icon} alt={hullTypes[text]?.name_kr} width={28} height={28} />
                                                        :
                                                        <Typography key={index} sx={{ ml: 1 }}>{hullTypes[text]?.name_kr}</Typography>
                                                    ))}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Image src={statData[techAttr[ship.tech.add_get_attr]]?.iconbox} alt={statData[techAttr[ship.tech.add_get_attr]]?.name} width={20} height={20} />
                                                    <Typography variant="body2" sx={{ ml: 1 }}>+{ship.tech.add_get_value}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{ship.tech.pt_get}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>풀돌</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                            <TableCell>{ship.tech.pt_level}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>120레벨</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                                                    {ship.tech.add_level_shiptype.map((text, index) => (
                                                        isMobile ?
                                                        <Image key={index} src={hullTypes[text]?.icon} alt={hullTypes[text]?.name_kr} width={28} height={28} />
                                                        :
                                                        <Typography key={index} sx={{ ml: 1 }}>{hullTypes[text]?.name_kr}</Typography>
                                                    ))}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Image src={statData[techAttr[ship.tech.add_level_attr]]?.iconbox} alt={statData[techAttr[ship.tech.add_level_attr]]?.name} width={20} height={20} />
                                                    <Typography variant="body2" sx={{ ml: 1 }}>+{ship.tech.add_level_value}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{ship.tech.pt_upgrade}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Box>
                        )}
                        <Box sx={{ marginTop: 2 }}>
                            <Typography variant="h6" gutterBottom>스킬</Typography>
                            {Object.values(ship.skill).map(skill => {
                                let skillId = skill.id;
                                if (skillId === 19001 || skillId === 19002) {
                                    return null;
                                }
                                if (transformSkillMapping[skill.id]) {
                                    skillId = transformSkillMapping[skill.id];
                                }
                                return (
                                    <Box key={skillId} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Image src={skillIcons[skillId]} alt={skillData[skillId]?.name} width={64} height={64} />
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{skillData[skillId]?.name} {skill.requirement === "Retrofit" ? "(개조 스킬)" : ""}</Typography>
                                            <Typography variant="body2">{skillData[skillId]?.desc}</Typography>
                                        </Box>
                                    </Box>
                                )
                            })}
                            <Box sx={{ marginTop: 2 }}>
                                <Typography variant="h6" gutterBottom>장비</Typography>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>슬롯</TableCell>
                                            <TableCell>장비종류</TableCell>
                                            <TableCell>효율</TableCell>
                                            <TableCell>포좌/항공기수</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.values(ship.equipment).map((equip, index) => {
                                            const proficiencyBonusKey = `equipment_proficiency_${index + 1}`;
                                            const proficiencyBonus = ship.retrofit?.bonus[proficiencyBonusKey];

                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{
                                                        index === 3 || index === 4
                                                            ? '설비'
                                                            : equip.type.map(t => equipName[t] || '').join(', ')
                                                    }</TableCell>
                                                    <TableCell>
                                                        {Math.floor(equip.efficiency * 100)}%
                                                        {proficiencyBonus && <span style={{ color: 'skyblue' }}> (+{Math.floor(proficiencyBonus * 100)}%)</span>}
                                                    </TableCell>
                                                    <TableCell>{equip.type.some(t => equipHasMount.includes(t)) ? equip.mount : '-'}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </Box>
                            {Object.keys(uniqueSpWeapons || {}).includes(ship.gid.toString()) ? (
                                <Box sx={{ marginTop: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                                        <Typography variant="h6" gutterBottom>전용 장비</Typography>
                                        <Typography>{uniqueSpWeapons[ship.gid].name}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                                        {skillData[uniqueSpWeapons[ship.gid].skill] ? (
                                            <Box key={ship.gid} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Image src={skillIcons[uniqueSpWeapons[ship.gid].skill]} alt={skillData[uniqueSpWeapons[ship.gid].skill]?.name} width={64} height={64} />
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{skillData[uniqueSpWeapons[ship.gid].skill]?.name}</Typography>
                                                    <Typography variant="body2">{skillData[uniqueSpWeapons[ship.gid].skill]?.desc}</Typography>
                                                </Box>
                                            </Box>
                                        ) : <Typography>전용 장비 스킬 정보 없음</Typography>}
                                    </Box>
                                </Box>) : null}
                            {evaluation && (evaluation.grade || evaluation.description) && (
                                <Box sx={{ marginTop: 2 }}>
                                    <Typography variant="h6" gutterBottom>한줄평</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {evaluation.grade && 
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{evaluation.grade}</Typography>
                                        }
                                        {evaluation.description && 
                                            <Typography variant="body2">{evaluation.description}</Typography>
                                        }
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
                <Box role="tabpanel" hidden={tab !== 1} id={`tabpanel-${tab}`}>
                    {selectedSkin && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            {/* Main Image with Background */}
                            <Box sx={{ position: 'relative', width: '100%', height: '500px', backgroundColor: '#f0f0f0', borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {loadingUrls.size > 0 && <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
                                <Box sx={{
                                    opacity: loadingUrls.size > 0 ? 0 : 1,
                                    visibility: loadingUrls.size > 0 ? 'hidden' : 'visible',
                                    transition: 'opacity 0.3s ease-in-out',
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative'
                                }}>
                                    <Image
                                        key={`${selectedSkin.id}-bg`}
                                        src={selectedSkin.background || 'https://raw.githubusercontent.com/Fernando2603/AzurLane/main/images/background/210.png'}
                                        alt="background"
                                        layout="fill"
                                        objectFit="cover"
                                        quality={100}
                                        style={{ zIndex: 0 }}
                                        onLoad={() => handleImageLoad(selectedSkin.background || 'https://raw.githubusercontent.com/Fernando2603/AzurLane/main/images/background/210.png')}
                                        onError={() => handleImageLoad(selectedSkin.background || 'https://raw.githubusercontent.com/Fernando2603/AzurLane/main/images/background/210.png')}
                                    />
                                    <Image
                                        key={showPaintingN ? `${selectedSkin.id}-painting_n` : `${selectedSkin.id}-painting`}
                                        src={showPaintingN ? selectedSkin.painting_n! : selectedSkin.painting}
                                        alt={selectedSkin.name_kr || selectedSkin.name}
                                        layout="fill"
                                        objectFit="contain"
                                        style={{ zIndex: 1 }}
                                        onLoad={() => handleImageLoad(showPaintingN ? selectedSkin.painting_n! : selectedSkin.painting)}
                                        onError={() => handleImageLoad(showPaintingN ? selectedSkin.painting_n! : selectedSkin.painting)}
                                    />
                                    {!isMobile && (
                                        <Image
                                            key={`${selectedSkin.id}-chibi`}
                                            src={selectedSkin.chibi}
                                            alt={`${selectedSkin.name_kr || selectedSkin.name} chibi`}
                                            width={150}
                                            height={150}
                                            style={{
                                                position: 'absolute',
                                                bottom: 10,
                                                right: 10,
                                                zIndex: 2,
                                            }}
                                            onLoad={() => handleImageLoad(selectedSkin.chibi)}
                                            onError={() => handleImageLoad(selectedSkin.chibi)}
                                        />
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: isMobile ? 'column' : 'row' }}>
                                <Typography variant="h6">{selectedSkin.name_kr || selectedSkin.name}</Typography>
                                {selectedSkin.painting_n && (
                                    <FormControlLabel
                                        control={<Switch checked={showPaintingN} onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setShowPaintingN(isChecked);
                                            if (isChecked && selectedSkin?.painting_n) {
                                                setLoadingUrls(prev => new Set(prev).add(selectedSkin.painting_n!));
                                            } else if (!isChecked && selectedSkin?.painting) {
                                                setLoadingUrls(prev => new Set(prev).add(selectedSkin.painting));
                                            }
                                        }} />}
                                        label="배경 제거"
                                        labelPlacement="start"
                                    />
                                )}
                            </Box>

                            <Box
                                ref={scrollContainerRef}
                                onWheel={handleWheel}
                                sx={{
                                    display: 'flex',
                                    overflowX: 'scroll',
                                    gap: 1,
                                    padding: 1,
                                    width: '100%',
                                    '::-webkit-scrollbar': {
                                        height: '8px',
                                    },
                                    '::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'rgba(0,0,0,.2)',
                                        borderRadius: '4px',
                                    }
                                }}>
                                {Object.values(skinData[ship.gid].skins).map(skin => (
                                    <Box
                                        key={skin.id}
                                        onClick={() => setSelectedSkin(skin)}
                                        sx={{
                                            cursor: 'pointer',
                                            border: skin.id === selectedSkin.id ? '2px solid' : '2px solid transparent',
                                            borderColor: skin.id === selectedSkin.id ? 'primary.main' : 'transparent',
                                            borderRadius: 1,
                                            minWidth: '100px',
                                            height: '100px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            backgroundColor: '#e0e0e0'
                                        }}
                                    >
                                        <Image
                                            src={skin.icon}
                                            alt={skin.name_kr || skin.name}
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShipInfoDialog;
