import React from "react";
import { Box, Container } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { Checkbox } from "@mui/material";
import Image from "next/image";

// type StatType = "HP" | "ATK" | "DEF" | "SPD" | "ACC" | "EVA";
// type ShipType = "DD" | "CL" | "CA" | "BB" | "CV" | "CVB" | "SS" | "SSV";

function createData(
    photo: string,
    name: string,
    type: string, // 나중에 ShipType으로 변경
    faction: string,
    // stats: {
    //     basePoint: number,
    //     maxPoint: number,
    //     lv120Point: number,
    //     baseStatType: StatType,
    //     baseStatTarget: ShipType[],
    //     baseStatValue: number,
    //     lv120StatType: StatType,
    //     lv120StatTarget: ShipType[],
    //     lv120StatValue: number
    // },
    stats: string,
    base: string,
    max_lb: string,
    lv120: string,
) {
    return { photo, name, type, faction, stats, base, max_lb, lv120 };
}

const rows = [
    createData('placeholder', 'Laffey', 'DD', 'Eagle Union', 'a', 'Yes', 'Yes', 'Yes'),
    createData('placeholder', 'Javelin', 'DD', 'Royal Navy', 'a', 'Yes', 'Yes', 'Yes'),
    createData('placeholder', 'Z23', 'DD', 'Iron Blood', 'a', 'Yes', 'Yes', 'Yes'),
];

export default function Page() {
    return (
        <Box>
            <Container>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="ship table">
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>이름</TableCell>
                                <TableCell>함종</TableCell>
                                <TableCell>진영</TableCell>
                                <TableCell align="center">스탯</TableCell>
                                <TableCell align="center" padding="checkbox">명함</TableCell>
                                <TableCell align="center" padding="checkbox">풀돌</TableCell>
                                <TableCell align="center" padding="checkbox">120</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <ShipTableRow key={row.name} row={row} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
    );
}

function ShipTableRow({ row }: { row: {photo: string, name: string, type: string, faction: string, stats: string, base: string, max_lb: string, lv120: string} }) {
    return (
        <TableRow
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
            <TableCell component="th" scope="row">
                <Image src="/favicon.ico" alt={row.name} width={50} height={50}/>
            </TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.type}</TableCell>
            <TableCell>{row.faction}</TableCell>
            <TableCell align="center">
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Container>
                        <Image src="/favicon.ico" alt={row.name} width={25} height={25}/>
                    </Container>
                    <Container>
                        <Image src="/favicon.ico" alt={row.name} width={25} height={25}/>
                    </Container>
                    <Container>
                        <Image src="/favicon.ico" alt={row.name} width={25} height={25}/>
                    </Container>
                </Box>
            </TableCell>
            <TableCell align="center">
                <Box>
                    <Checkbox checked={row.base === 'Yes'} />
                </Box>
            </TableCell>
            <TableCell align="center">
                <Box>
                    <Checkbox checked={row.max_lb === 'Yes'} />
                </Box>
            </TableCell>
            <TableCell align="center">
                <Box>
                    <Checkbox checked={row.lv120 === 'Yes'} />
                </Box>
            </TableCell>
        </TableRow>
    );
}