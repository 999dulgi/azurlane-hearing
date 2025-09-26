"use client";

import React, { useContext, useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Card,
    CardContent,
    Grid
} from "@mui/material";
import Image from 'next/image';
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from "../(components)/ThemeRegistry";

interface Ship {
    id: string;
    name: string;
    hullType: string;
}

function shipStatIndicator({ shipData, hullTypeData, statTypeData, stat, hullType }: { shipData: Ship[], hullTypeData: HullTypes, statTypeData: StatTypes, stat: string, hullType: string }) {
    const ship = shipData.find((ship) => ship.hullType === hullType);
    if (!ship) {
        return null;
    }
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Image src={statTypeData[stat].iconbox} alt={stat} width={25} height={25} />
            <Typography sx={{ textAlign: 'center', marginLeft: '10px' }}>
                1
            </Typography>
        </Box>
    );
}

export default function ResearchPage() {
    const theme = useTheme();
    const { toggleColorMode } = useContext(ColorModeContext);

    const [shipData, setShipData] = useState<Ship[]>([]);
    const [hullTypeData, setHullTypeData] = useState<HullTypes>({});
    const [statTypeData, setStatTypeData] = useState<StatTypes>({});

    const statList = ["health", "firepower", "torpedo", "antiair", "aviation", "reload", "accuracy", "evasion", "asw"];
    const shipTypeList: { name: string; type: number[] }[] = [{
        name: '구축함',
        type: [1, 20, 21]
    },
    {
        name: '경순양함',
        type: [2]
    },
    {
        name: '중순, 대순',
        type: [3, 18]
    },
    {
        name: '전함',
        type: [5]
    },
    {
        name: '순양전함',
        type: [4]
    },
    {
        name: '항공모함',
        type: [6]
    },
    {
        name: '경항공모함',
        type: [7]
    },
    {
        name: '잠수함, 잠수항모',
        type: [8, 17]
    }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const shipDataresponse = await fetch('ship_kr.json');
                const hullTypeResponse = await fetch('hulltype.json');
                const statTypeResponse = await fetch('attribute.json');
                const shipData = await shipDataresponse.json();
                const hullTypeData = await hullTypeResponse.json();
                const statTypeData = await statTypeResponse.json();
                setShipData(shipData);
                setHullTypeData(hullTypeData);
                setStatTypeData(statTypeData);
            } catch (error) {
                console.error('Error fetching research data:', error);
            }
        };
        fetchData();
    }, []);

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
            <Box sx={{ '@media (min-width: 1200px)': { width: '1200px', margin: '0 auto' } }}>
                <Grid container direction="row" spacing={2} sx={{ backgroundColor: '#444' }}>
                    {Object.keys(hullTypeData).length > 0 && Object.keys(statTypeData).length > 0 && shipTypeList.map((shipType) => (
                        <Grid key={shipType.name} size={{ xs: 6, sm: 4, md: 3 }}>
                            <Card sx={{ backgroundColor: '#666' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                                        <Image src={hullTypeData[shipType.type[0]].icon} alt={shipType.name} width={25} height={25} />
                                        <Typography sx={{ textAlign: 'center', marginLeft: '10px', fontWeight: 'bold' }}>
                                            {shipType.name}
                                        </Typography>
                                    </Box>
                                    <Grid container direction="row" spacing={2}>
                                        {statList.map((stat) => (
                                            <Grid key={stat} size={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Image src={statTypeData[stat].iconbox} alt={stat} width={25} height={25} />
                                                    <Typography sx={{ textAlign: 'center', marginLeft: '10px' }}>
                                                        
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}

