import React, { useState } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Tabs, Tab, LinearProgress, IconButton } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Typography, Box } from '@mui/material';
import Image from 'next/image';
import { techAttr } from '../typelist';

interface StatDialogProps {
    open: boolean;
    onClose: () => void;
    shipData: Ship[];
    allShips: Ship[];
    shipType: HullTypes;
    nationalities: Nationalities;
    statList: string[];
    statData: StatTypes;
    skinData: ShipSkins;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const milestones = {
    "US": [
        { gid: 19901, pt: 760 },
        { gid: 19902, pt: 810 },
        { gid: 19903, pt: 850 },
        { gid: 19904, pt: 1000 },
        { gid: 19905, pt: 950 },
        { gid: 19906, pt: 950 },
        { gid: 79901, pt: 760 },
        { gid: 89902, pt: 760 },
        { gid: 99901, pt: 760}
    ],
    "EN": [
        { gid: 29903, pt: 700 },
        { gid: 29904, pt: 820 },
        { gid: 29905, pt: 900 },
        { gid: 69901, pt: 700 },
        { gid: 89902, pt: 700 }
    ],
    "JP": [
        { gid: 39903, pt: 780 },
        { gid: 39904, pt: 900 },
        { gid: 39905, pt: 950 },
        { gid: 39906, pt: 900 },
        { gid: 39907, pt: 950 },
    ],
    "DE": [
        { gid: 49902, pt: 630 },
        { gid: 49903, pt: 550 },
        { gid: 49904, pt: 600 },
        { gid: 49905, pt: 700 },
        { gid: 49906, pt: 600 },
        { gid: 49907, pt: 700 },
        { gid: 49908, pt: 850 },
        { gid: 49909, pt: 950 },
        { gid: 49910, pt: 950 },
        { gid: 69901, pt: 600 },
        { gid: 99901, pt: 420 },
        { gid: 99902, pt: 800 },
        { gid: 119901, pt: 800 }
    ],
    "CN": [
        { gid: 59901, pt: 160 },
    ],
    "ITA": [
        { gid: 69902, pt: 300 },
        { gid: 69903, pt: 300 },
        { gid: 79901, pt: 300 },
        { gid: 79902, pt: 200 },
        { gid: 119901, pt: 200 }
    ],
    "SN": [
        { gid: 69902, pt: 200 },
        { gid: 79902, pt: 300 },
        { gid: 79903, pt: 300 }
    ],
    "FF": [
        { gid: 89003, pt: 250 },
        { gid: 89004, pt: 230 },
    ],
    "MNF": [
        { gid: 99902, pt: 180 }
    ]
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`stat-tabpanel-${index}`}
            aria-labelledby={`stat-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function StatDialog({ open, onClose, shipData, allShips, shipType, nationalities, statList, statData, skinData }: StatDialogProps) {
    const [tabValue, setTabValue] = useState(0);
    const [milestoneView, setMilestoneView] = useState<{ [key: string]: boolean }>({});

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleToggleMilestoneView = (factionName: string) => {
        setMilestoneView(prev => ({ ...prev, [factionName]: !prev[factionName] }));
    };

    function calculateStats(ships: Ship[]) {
        const stats: { [key: string]: { [key: string]: number } } = {};

        const processTechBonus = (types: number[], attr: number, value: number) => {
            types.forEach(type => {
                let hullTypeName = shipType[type]?.name_kr || '기타';
                const hullTypeShort = shipType[type]?.short;

                const ignoredShorts = ['DDGV', 'DDGM', 'IXV', 'IXM', 'BBV', 'CB', 'BM', 'SS'];
                if (ignoredShorts.includes(hullTypeShort)) return;

                if (hullTypeShort === 'IXS') hullTypeName = '범선';
                if (['CA'].includes(hullTypeShort)) hullTypeName = '중순/대순/모니터';
                if (['SSV'].includes(hullTypeShort)) hullTypeName = '잠수함/잠수항모';

                if (!stats[hullTypeName]) {
                    stats[hullTypeName] = {};
                }

                const techStat = techAttr[attr];
                if (techStat) {
                    stats[hullTypeName][techStat] = (stats[hullTypeName][techStat] || 0) + value;
                }
            });
        };

        ships.forEach(ship => {
            if (!ship.tech) return;
            processTechBonus(ship.tech.add_get_shiptype, ship.tech.add_get_attr, ship.tech.add_get_value);
            processTechBonus(ship.tech.add_level_shiptype, ship.tech.add_level_attr, ship.tech.add_level_value);
        });

        return stats;
    };

    function calculateFactionPoints(ships: Ship[]) {
        const points: { [key: string]: number } = {};
        ships.forEach(ship => {
            if (!ship.tech) return;
            const factionName = nationalities[ship.nationality]?.name_kr || '기타';
            if (!points[factionName]) {
                points[factionName] = 0;
            }
            points[factionName] += (ship.tech.pt_get || 0) + (ship.tech.pt_level || 0) + (ship.tech.pt_upgrade || 0);
        });
        return points;
    }

    const currentStats = calculateStats(shipData);
    const totalStats = calculateStats(allShips);
    const currentFactionPoints = calculateFactionPoints(shipData);
    const totalFactionPoints = calculateFactionPoints(allShips);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} centered>
                        <Tab label="스탯" id="stat-tab-0" />
                        <Tab label="진영점수" id="stat-tab-1" />
                    </Tabs>
                </Box>
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {Object.keys(totalStats).map(hullTypeName => (
                            <Box key={hullTypeName}>
                                <Typography variant="h6" component="div">{hullTypeName}</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1, pl: 1, borderLeft: '3px solid', borderColor: 'divider' }}>
                                    {statList.map(statName => {
                                        const current = currentStats[hullTypeName]?.[statName] || 0;
                                        const total = totalStats[hullTypeName]?.[statName] || 0;
                                        if (total === 0) return null;
                                        return (
                                            <Box key={statName} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {statData[statName] && <Image src={statData[statName].iconbox} alt={statName} width={24} height={24} />}
                                                <Typography variant="body2">{`${current} / ${total}`}</Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {Object.keys(totalFactionPoints).map(factionName => {
                            const currentValue = currentFactionPoints[factionName] || 0;
                            const totalValue = totalFactionPoints[factionName];
                            const factionInfo = Object.values(nationalities).find(n => n.name_kr === factionName);
                            const isMilestoneView = milestoneView[factionName];
                            const overallProgress = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;

                            return (
                                <Box key={factionName} sx={{ width: '100%', marginBottom: '20px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        {factionInfo && <Image src={factionInfo.image} alt={factionName} width={24} height={24} />}
                                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>{factionName}</Typography>
                                        <Typography variant="body2">{`${currentValue} / ${totalValue}`}</Typography>
                                        {factionInfo && milestones[factionInfo.code as keyof typeof milestones] ? (
                                            <IconButton onClick={() => handleToggleMilestoneView(factionName)} size="small">
                                                {isMilestoneView ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                            </IconButton>
                                        ) : (
                                            <Box sx={{ width: 34, height: 34 }} />
                                        )}
                                    </Box>
                                    <Box sx={{ position: 'relative', width: '100%' }}>
                                        <LinearProgress variant="determinate" value={overallProgress} sx={{ height: 10, borderRadius: 5 }} />
                                    </Box>
                                    {isMilestoneView && factionInfo && milestones[factionInfo.code as keyof typeof milestones] && (
                                        <Box sx={{ mt: 1, pl: 1, borderLeft: '3px solid', borderColor: 'divider' }}>
                                            {(() => {
                                                const sortedMilestones = milestones[factionInfo.code as keyof typeof milestones].sort((a, b) => a.pt - b.pt);
                                                return sortedMilestones.map((milestone, index) => {
                                                    const isAchieved = currentValue >= milestone.pt;
                                                    const start = index > 0 ? sortedMilestones[index - 1].pt : 0;
                                                    const end = milestone.pt;
                                                    let progress = 0;
                                                    if (currentValue > start) {
                                                        progress = Math.min(((currentValue - start) / (end - start)) * 100, 100);
                                                    }

                                                    return (
                                                        <Box key={milestone.gid} sx={{ mb: 1.5 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isAchieved ? 'text.disabled' : 'text.primary' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Image src={skinData[milestone.gid].skins[milestone.gid*10].icon} alt={milestone.gid.toString()} width={48} height={48} />
                                                                    <Typography>{Object.values(shipData).find(n => n.gid === milestone.gid)?.name_kr || "none"}</Typography> 
                                                                </Box>
                                                                <Typography variant="body2" sx={{ ml: 'auto' }}>{`${start} / ${end}`}</Typography>
                                                            </Box>
                                                            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                                                        </Box>
                                                    );
                                                });
                                            })()}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </TabPanel>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
}
