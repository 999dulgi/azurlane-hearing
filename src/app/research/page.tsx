"use client";

import React, { useContext, useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Card,
    CardContent
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from "../(components)/ThemeRegistry";

export default function ResearchPage() {
    const theme = useTheme();
    const { toggleColorMode } = useContext(ColorModeContext);

    const [shipData, setShipData] = useState<Ship[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('ship_kr.json');
                const data = await response.json();
                setShipData(data);
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
            <Box sx={{ width: '1200px', margin: '0 auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: '#444' }}>
                    {}
                </Box>
            </Box>
        </Box>
    );
}

