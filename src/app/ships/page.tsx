"use client";

import React, { useEffect, useState } from "react";
import { Box, Paper, CircularProgress } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Checkbox } from "@mui/material";
import Image from "next/image";
import { TableVirtuoso, TableComponents } from "react-virtuoso";

export default function Page() {
    const [ships, setShips] = useState<Ship[]>([]);
    const [shipSkins, setShipSkins] = useState<ShipSkins>({});
    const [hullTypes, setHullTypes] = useState<HullTypes>({});
    const [statTypes, setStatTypes] = useState<StatTypes>({});
    const [nationalities, setNationalities] = useState<Nationalities>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [shipsRes, skinsRes, hullsRes, statsRes, nationsRes] = await Promise.all([
                    fetch('/ship_kr.json'),
                    fetch('/ship_skin.json'),
                    fetch('/hulltype.json'),
                    fetch('/attribute.json'),
                    fetch('/nationality.json'),
                ]);

                const shipsData = await shipsRes.json();
                const skinsData = await skinsRes.json();
                const hullsData = await hullsRes.json();
                const statsData = await statsRes.json();
                const nationsData = await nationsRes.json();

                setShips(shipsData);
                setShipSkins(skinsData);
                setHullTypes(hullsData);
                setStatTypes(statsData);
                setNationalities(nationsData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableVirtuoso
                    data={ships}
                    components={VirtuosoTableComponents}
                    fixedHeaderContent={ShipHeaderContent}
                    itemContent={(index, ship) => (
                        <ShipTableRow
                            ship={ship}
                            hullTypes={hullTypes}
                            statTypes={statTypes}
                            nationalities={nationalities}
                            shipSkins={shipSkins}
                        />
                    )}
                />
            </Paper>
        </Box>
    );
}

const Scroller = React.forwardRef<HTMLDivElement>((props, ref) => (
  <TableContainer component={Paper} {...props} ref={ref} />
));
Scroller.displayName = 'Scroller';

const VirtuosoTableHead = React.forwardRef<HTMLTableSectionElement>((props, ref) => (
  <TableHead {...props} ref={ref} />
));
VirtuosoTableHead.displayName = 'VirtuosoTableHead';

const VirtuosoTableBody = React.forwardRef<HTMLTableSectionElement>((props, ref) => (
  <TableBody {...props} ref={ref} />
));
VirtuosoTableBody.displayName = 'VirtuosoTableBody';

const VirtuosoTableComponents: TableComponents<Ship> = {
    Scroller,
    Table: (props) => (
      <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed', minWidth: '100%', minHeight: '100%' }} />
    ),
    TableHead: VirtuosoTableHead,
    TableRow,
    TableBody: VirtuosoTableBody,
  };

function ShipHeaderContent() {
    return (
        <TableRow>
            <TableCell></TableCell>
            <TableCell>이름</TableCell>
            <TableCell>함종</TableCell>
            <TableCell>진영</TableCell>
            <TableCell>등급</TableCell>
            <TableCell>획득방법</TableCell>
            <TableCell>기술점수</TableCell>
            <TableCell />
            <TableCell>완성여부</TableCell>
        </TableRow>
    )
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
                    <Checkbox />
                    <Checkbox />
                    <Checkbox />
                </Box>
            </TableCell>
        </TableRow>
    );
}
