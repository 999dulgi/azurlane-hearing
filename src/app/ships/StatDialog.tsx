import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, LinearProgress } from '@mui/material';
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
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
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

export default function StatDialog({ open, onClose, shipData, allShips, shipType, nationalities, statList, statData }: StatDialogProps) {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
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
            <DialogTitle>기술점수 총합</DialogTitle>
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {Object.keys(totalFactionPoints).map(factionName => {
                            const currentValue = currentFactionPoints[factionName] || 0;
                            const totalValue = totalFactionPoints[factionName];
                            const factionInfo = Object.values(nationalities).find(n => n.name_kr === factionName);
                            const progress = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;

                            return (
                                <Box key={factionName} sx={{ width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        {factionInfo && <Image src={factionInfo.image} alt={factionName} width={24} height={24} />}
                                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>{factionName}</Typography>
                                        <Typography variant="body2">{`${currentValue} / ${totalValue}`}</Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={progress} />
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
