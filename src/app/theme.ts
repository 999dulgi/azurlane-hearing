"use client";

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: 'var(--font-geist-sans)',
        fontWeightBold: 700,
        fontWeightMedium: 500,
        fontWeightLight: 300,
    },
});

export default theme;
