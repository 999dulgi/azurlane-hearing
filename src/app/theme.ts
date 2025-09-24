"use client";

import { createTheme } from '@mui/material/styles';


// 라이트 테마
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ffffff',
      contrastText: 'rgba(0, 0, 0, 0.87)',
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
      paper: '#333333', // Paper 컴포넌트는 약간 더 밝은 색으로 설정하여 깊이감을 줍니다.
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
