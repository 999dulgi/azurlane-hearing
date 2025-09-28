import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

import { Typography, Box } from '@mui/material';
import Image from 'next/image';

interface StatDialogProps {
    open: boolean;
    onClose: () => void;
    shipData: Ship[];
    allShips: Ship[];
    shipType: HullTypes;
    statList: string[];
    statData: StatTypes;
}


export default function StatDialog({ open, onClose, shipData, allShips, shipType, statList, statData }: StatDialogProps) {
    const calculateStats = (ships: Ship[]) => {
        const stats: { [key: string]: { [key: string]: number } } = {};
        ships.forEach(ship => {
            if (!ship.tech) return;
            let hullTypeName = shipType[ship.type]?.name_kr || '기타';
            const hullTypeShort = shipType[ship.type]?.short;

            if (hullTypeShort === 'CA' || hullTypeShort === 'CB') {
                hullTypeName = '중순/대순';
            }
            if (!stats[hullTypeName]) {
                stats[hullTypeName] = {};
            }

            const techStat1 = statList[ship.tech.add_get_attr - 1];
            if (techStat1) {
                stats[hullTypeName][techStat1] = (stats[hullTypeName][techStat1] || 0) + ship.tech.add_get_value;
            }

            const techStat2 = statList[ship.tech.add_level_attr - 1];
            if (techStat2) {
                stats[hullTypeName][techStat2] = (stats[hullTypeName][techStat2] || 0) + ship.tech.add_level_value;
            }
        });
        return stats;
    };

    const processStats = (ships: Ship[]) => {
        const initialStats = calculateStats(ships);

        // Augment CVL with CV stats
        if (initialStats['항공모함'] && initialStats['경항공모함']) {
            for (const statName in initialStats['항공모함']) {
                initialStats['경항공모함'][statName] = (initialStats['경항공모함'][statName] || 0) + initialStats['항공모함'][statName];
            }
        }

        // Augment BC with BB stats
        if (initialStats['전함'] && initialStats['순양전함']) {
            for (const statName in initialStats['전함']) {
                initialStats['순양전함'][statName] = (initialStats['순양전함'][statName] || 0) + initialStats['전함'][statName];
            }
        }

        return initialStats;
    };

    const currentStats = processStats(shipData);
    const totalStats = processStats(allShips);
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>함종별 기술점수 총합</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.keys(totalStats).sort().map(hullTypeName => (
                        <Box key={hullTypeName}>
                            <Typography variant="h6" component="div">{hullTypeName}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1, pl: 1, borderLeft: '3px solid', borderColor: 'divider' }}>
                                {statList.map(statName => {
                                    const current = currentStats[hullTypeName]?.[statName] || 0;
                                    const total = totalStats[hullTypeName]?.[statName] || 0;
                                    if (total === 0) {
                                        return null;
                                    }
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
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
}
