import React from "react";
import { Box, Container } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { Checkbox } from "@mui/material";
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

    const statTypesJson = fs.readFileSync(path.join(dataPath, 'attribute.json'), 'utf-8');
    const statTypes: StatTypes = JSON.parse(statTypesJson);

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
                                <TableCell/>
                                <TableCell>완성여부</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ships.map((ship) => (
                                <ShipTableRow key={ship.id} ship={ship} hullTypes={hullTypes} statTypes={statTypes} nationalities={nationalities} shipSkins={shipSkins} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
    );
}

function ShipTableRow({ ship, hullTypes, statTypes, nationalities, shipSkins }: { ship: Ship, hullTypes: HullTypes, statTypes: StatTypes, nationalities: Nationalities, shipSkins: ShipSkins }) {
    const hullTypeName = hullTypes[ship.type]?.name_kr || 'Unknown';
    const nationalityName = nationalities[ship.nationality]?.name_kr || nationalities[ship.nationality]?.name || 'Unknown';
    const defaultSkin = shipSkins[ship.gid]?.skins[ship.gid * 10];
    const skinIcon = defaultSkin?.icon || '/favicon.ico';
    const raritylist = ['N', 'R', 'SR', 'SSR', 'UR', 'PR', 'DR'];
    const statList = ["health", "firepower", "torpedo", "antiair", "aviation", "reload", "armor", "evasion", "luck", "asw", "hunting_range", "oxygen", "consumption"];

    return (
        <TableRow
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
            <TableCell component="th" scope="row">
                <Image src={skinIcon} alt={ship.name_kr || ship.name} width={112} height={112} />
            </TableCell>
            <TableCell>{ship.name_kr || ship.name}</TableCell>
            <TableCell>{hullTypeName}</TableCell>
            <TableCell>{nationalityName}</TableCell>
            <TableCell>{raritylist[ship.rarity - 2 + (ship.cid == 2 ? 2 : 0)]}</TableCell>
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
            <TableCell>{ship.tech ? (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', marginBottom: '32px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                        {
                            ship.tech.add_get_shiptype.map((text, index) => (
                                <Image key={index} src={hullTypes[text]?.icon} alt={hullTypes[text]?.name_kr} width={28} height={28} />
                            ))
                        }
                        </Box>
                        <Box sx={{ marginLeft: "4px", display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                            <Image src={statTypes[statList[ship.tech.add_get_attr - 1]]?.iconbox} alt={statTypes[statList[ship.tech.add_get_attr - 1]]?.name} width={20} height={20} />
                            <p style={{ marginLeft: "4px" }}>+{ship.tech.add_get_value}</p>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                        {
                            ship.tech.add_level_shiptype.map((text, index) => (
                                <Image key={index} src={hullTypes[text]?.icon} alt={hullTypes[text]?.name_kr} width={28} height={28} />
                            ))
                        }
                        <Box sx={{ marginLeft: "4px", display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                            <Image src={statTypes[statList[ship.tech.add_level_attr - 1]]?.iconbox} alt={statTypes[statList[ship.tech.add_level_attr - 1]]?.name} width={20} height={20} />
                            <p style={{ marginLeft: "4px" }}>+{ship.tech.add_level_value}</p>
                        </Box>
                    </Box>
                </Box>
            ) : (
                ''
            )}
            </TableCell>
            <TableCell>{ship.tech ? (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                        <Image src="/techpoint.png" alt="techpoint" width={32} height={32} />
                        <p style={{ marginLeft: "4px" }}>+{ship.tech.pt_get}</p>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                        <Image src="/techpoint.png" alt="techpoint" width={32} height={32} />
                        <p style={{ marginLeft: "4px" }}>+{ship.tech.pt_level}</p>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                        <Image src="/techpoint.png" alt="techpoint" width={32} height={32} />
                        <p style={{ marginLeft: "4px" }}>+{ship.tech.pt_upgrade}</p>
                    </Box>
                </Box>
            ) : (
                ''
            )}
            </TableCell>
            <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                    <Checkbox/>
                    <Checkbox/>
                    <Checkbox/>
                </Box>
            </TableCell>
        </TableRow>
    );
}
