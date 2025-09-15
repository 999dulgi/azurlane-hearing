import React from "react";
import { Box, Container } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import Image from "next/image";

function createData(
    photo: string,
    name: string,
    type: string,
    faction: string,
    base: string,
    max_lb: string,
    lv120: string,
) {
    return { photo, name, type, faction, base, max_lb, lv120 };
}

const rows = [
    createData('placeholder', 'Laffey', 'DD', 'Eagle Union', 'Yes', 'Yes', 'Yes'),
    createData('placeholder', 'Javelin', 'DD', 'Royal Navy', 'Yes', 'Yes', 'Yes'),
    createData('placeholder', 'Z23', 'DD', 'Iron Blood', 'Yes', 'Yes', 'Yes'),
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
                                <TableCell>명함</TableCell>
                                <TableCell>풀돌</TableCell>
                                <TableCell>120</TableCell>
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

function ShipTableRow({ row }: { row: {photo: string, name: string, type: string, faction: string, base: string, max_lb: string, lv120: string} }) {
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
            <TableCell>{row.base}</TableCell>
            <TableCell>{row.max_lb}</TableCell>
            <TableCell>{row.lv120}</TableCell>
        </TableRow>
    );
}