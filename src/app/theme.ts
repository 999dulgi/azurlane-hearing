"use client";

import { createTheme } from '@mui/material/styles';


// 라이트 테마
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // A standard blue color
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "Noto Sans KR, sans-serif",
    fontWeightBold: 700,
    fontWeightMedium: 500,
    fontWeightLight: 300,
    fontSize: 16,
  },
});

// 다크 테마
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#222222',
      paper: '#333333',
    },
    divider: 'rgba(255, 255, 255, 0.2)',
  },
  typography: {
    fontFamily: "Noto Sans KR, sans-serif",
    fontWeightBold: 700,
    fontWeightMedium: 500,
    fontWeightLight: 300,
    fontSize: 16,
  },
});
