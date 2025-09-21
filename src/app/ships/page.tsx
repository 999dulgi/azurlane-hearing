import React from "react";
import { Box, Container } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import Image from "next/image";
import fs from 'fs';
import path from 'path';

export default function Page() {
    const dataPath = path.join(process.cwd(), 'public');

    const shipsJson = fs.readFileSync(path.join(dataPath, 'ship_kr.json'), 'utf-8');
    const ships: Ship[] = JSON.parse(shipsJson);

    const shipSkinsJson = fs.readFileSync(path.join(dataPath, 'ship_skin.json'), 'utf-8');
    const shipSkins: ShipSkins = JSON.parse(shipSkinsJson);

    const hullTypesJson = fs.readFileSync(path.join(dataPath, 'hulltype.json'), 'utf-8');
    const hullTypes: HullTypes = JSON.parse(hullTypesJson);

    const nationalitiesJson = fs.readFileSync(path.join(dataPath, 'nationality.json'), 'utf-8');
    const nationalities: Nationalities = JSON.parse(nationalitiesJson);

    return (
        <Box>
            <Container>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 900 }} aria-label="ship table">
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>이름</TableCell>
                                <TableCell>함종</TableCell>
                                <TableCell>진영</TableCell>
                                <TableCell>등급</TableCell>
                                <TableCell>획득방법</TableCell>
                                <TableCell>기술점수</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ships.map((ship) => (
                                <ShipTableRow key={ship.id} ship={ship} hullTypes={hullTypes} nationalities={nationalities} shipSkins={shipSkins} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
    );
}

function ShipTableRow({ ship, hullTypes, nationalities, shipSkins }: { ship: Ship, hullTypes: HullTypes, nationalities: Nationalities, shipSkins: ShipSkins }) {
    const hullTypeName = hullTypes[ship.type]?.name_kr || 'Unknown';
    const nationalityName = nationalities[ship.nationality]?.name_kr || nationalities[ship.nationality]?.name || 'Unknown';
    const defaultSkin = shipSkins[ship.gid]?.skins[ship.gid*10];
    const skinIcon = defaultSkin?.icon || '/favicon.ico';
    const raritylist = ['N', 'R', 'SR', 'SSR', 'UR', 'PR', 'DR'];

    return (
        <TableRow
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
            <TableCell component="th" scope="row">
                <Image src={skinIcon} alt={ship.name_kr || ship.name} width={50} height={50}/>
            </TableCell>
            <TableCell>{ship.name_kr || ship.name}</TableCell>
            <TableCell>{hullTypeName}</TableCell>
            <TableCell>{nationalityName}</TableCell>
            <TableCell>{raritylist[ship.rarity-2+(ship.cid == 2 ? 2 : 0)]}</TableCell>
            <TableCell>
                {ship.obtain_kr ? (
                    ship.obtain_kr.map((text, index) => (
                        <p key={index} style={{ margin: 0 }}>
                            {text}
                        </p>
                    ))
                ) : (
                    ''
                )}
            </TableCell>
            <TableCell>{ship.tech ? ship.tech.add_get_value : 0}</TableCell>
        </TableRow>
    );
}
