"use client";

import React from "react";
import Image from "next/image";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
} from "@mui/material";
import { rarities, statList } from "../ships/state/types";

interface FilterDialogProps {
    open: boolean;
    onClose: () => void;
    hullTypes: HullTypes;
    nationalities: Nationalities;
    statTypes: StatTypes;
    selectedHullTypes: number[];
    setSelectedHullTypes: (value: number[]) => void;
    selectedNationalities: string[];
    setSelectedNationalities: (value: string[]) => void;
    selectedRarities: string[];
    setSelectedRarities: (value: string[]) => void;
    selectedTechStats: string[];
    setSelectedTechStats: (value: string[]) => void;
    selectedTechStatus: string[];
    setSelectedTechStatus: (value: string[]) => void;
    onApply: () => void;
}

export default function FilterDialog({
    open,
    onClose,
    hullTypes,
    nationalities,
    statTypes,
    selectedHullTypes,
    setSelectedHullTypes,
    selectedNationalities,
    setSelectedNationalities,
    selectedRarities,
    setSelectedRarities,
    selectedTechStats,
    setSelectedTechStats,
    selectedTechStatus,
    setSelectedTechStatus,
    onApply,
}: FilterDialogProps) {
    const regularNationCodes = ['US', 'EN', 'JP', 'DE', 'CN', 'ITA', 'SN', 'FF', 'MNF', 'HNL', 'MOT', 'META', 'BULIN'];
    const collaborationNationCodes = ['FR', 'CM', 'LINK', 'BILI', 'NP', 'UM', 'AI', 'HOLO', 'DOA', 'IMAS', 'SSSS', 'RYZA', 'SENRAN', 'TOLOVE', 'BLACKROCKSHOOTER', 'YUMIA'];
    const statNames = ["내구", "화력", "뇌장", "대공", "항공", "장전", "명중", "기동", "대잠"];
    const techStatusNames = ['획득', '풀돌', '120레벨'];
    const techStatusCodes = ['get', 'level', 'upgrade'];

    const allHullTypeIds = Object.values(hullTypes).map((h) => h.id);
    const allNationCodes = [...regularNationCodes, ...collaborationNationCodes];
    const allStatNames = Object.values(statList);

    const handleChipClick = <T,>(value: T, selectedValues: T[], setSelectedValues: (values: T[]) => void) => {
        const newSelection = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        setSelectedValues(newSelection);
    };

    const handleHullTypeClick = (hullId: number) => {
        const ddgIds = [20, 21];
        let newSelection = [...selectedHullTypes];

        const isDdg = ddgIds.includes(hullId);
        const isCurrentlySelected = selectedHullTypes.includes(hullId);

        if (isDdg) {
            if (isCurrentlySelected) {
                // Deselect both DDGs
                newSelection = newSelection.filter(id => !ddgIds.includes(id));
            } else {
                // Select both DDGs
                newSelection.push(...ddgIds.filter(id => !newSelection.includes(id)));
            }
        } else {
            if (isCurrentlySelected) {
                newSelection = newSelection.filter(id => id !== hullId);
            } else {
                newSelection.push(hullId);
            }
        }
        setSelectedHullTypes(newSelection);
    };

    const handleAllClick = <T,>(allItems: T[], selectedValues: T[], setSelectedValues: (values: T[]) => void) => {
        if (selectedValues.length === allItems.length) {
            setSelectedValues([]);
        } else {
            setSelectedValues(allItems);
        }
    };

    const handleCollabClick = () => {
        const currentlySelected = collaborationNationCodes.filter(c => selectedNationalities.includes(c));
        if (currentlySelected.length === collaborationNationCodes.length) {
            // Deselect all collab nations
            setSelectedNationalities(selectedNationalities.filter(n => !collaborationNationCodes.includes(n)));
        } else {
            // Select all collab nations
            const newSelection = [...new Set([...selectedNationalities, ...collaborationNationCodes])];
            setSelectedNationalities(newSelection);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>함선 필터</DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
                    <FormControl component="fieldset" fullWidth>
                        <InputLabel shrink>함종</InputLabel>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 3 }}>
                            <Chip
                                label="전체"
                                clickable
                                onClick={() => handleAllClick(allHullTypeIds, selectedHullTypes, setSelectedHullTypes)}
                                variant={selectedHullTypes.length === allHullTypeIds.length ? 'filled' : 'outlined'}
                                color="primary"
                                sx={{ fontWeight: selectedHullTypes.length === allHullTypeIds.length ? 'bold' : 'normal' }}
                            />
                            {Object.values(hullTypes).map((hull) => (
                                <Chip
                                    key={hull.id}
                                    label={hull.name_kr}
                                    clickable
                                    onClick={() => handleHullTypeClick(hull.id)}
                                    variant={selectedHullTypes.includes(hull.id) ? 'filled' : 'outlined'}
                                    sx={{ fontWeight: selectedHullTypes.includes(hull.id) ? 'bold' : 'normal' }}
                                />
                            ))}
                        </Box>
                    </FormControl>

                    <FormControl component="fieldset" fullWidth>
                        <InputLabel shrink>진영</InputLabel>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 3 }}>
                            <Chip
                                label="전체"
                                clickable
                                onClick={() => handleAllClick(allNationCodes, selectedNationalities, setSelectedNationalities)}
                                variant={selectedNationalities.length === allNationCodes.length ? 'filled' : 'outlined'}
                                color="primary"
                                sx={{ fontWeight: selectedNationalities.length === allNationCodes.length ? 'bold' : 'normal' }}
                            />
                            {Object.values(nationalities).filter(n => regularNationCodes.includes(n.code)).map((nation) => (
                                <Chip
                                    key={nation.code}
                                    label={nation.name_kr || nation.name}
                                    clickable
                                    onClick={() => handleChipClick(nation.code, selectedNationalities, setSelectedNationalities)}
                                    variant={selectedNationalities.includes(nation.code) ? 'filled' : 'outlined'}
                                    sx={{ fontWeight: selectedNationalities.includes(nation.code) ? 'bold' : 'normal' }}
                                />
                            ))}
                            <Chip
                                label="콜라보"
                                clickable
                                onClick={handleCollabClick}
                                variant={collaborationNationCodes.every(c => selectedNationalities.includes(c)) ? 'filled' : 'outlined'}
                                color="secondary"
                                sx={{ fontWeight: collaborationNationCodes.every(c => selectedNationalities.includes(c)) ? 'bold' : 'normal' }}
                            />
                        </Box>
                    </FormControl>

                    <FormControl component="fieldset" fullWidth>
                        <InputLabel shrink>등급</InputLabel>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 3 }}>
                            <Chip
                                label="전체"
                                clickable
                                onClick={() => handleAllClick(rarities, selectedRarities, setSelectedRarities)}
                                variant={selectedRarities.length === rarities.length ? 'filled' : 'outlined'}
                                color="primary"
                                sx={{ fontWeight: selectedRarities.length === rarities.length ? 'bold' : 'normal' }}
                            />
                            {rarities.map((rarity) => {
                                const isSelected = selectedRarities.includes(rarity);
                                const style = {
                                    background: {
                                        'N': '#DDDDDD',
                                        'R': '#34B8F2',
                                        'SR': '#C963FC',
                                        'SSR': '#F4B039',
                                        'UR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                        'PR': '#F4B039',
                                        'DR': 'linear-gradient(150deg, #FFE1D3, #DCABF7, #53DEB9)',
                                    }[rarity],
                                    color: rarity === 'N' ? 'black' : 'white',
                                    fontWeight: isSelected ? 'bold' : 'normal',
                                };

                                return (
                                    <Chip
                                        key={rarity}
                                        label={rarity}
                                        clickable
                                        onClick={() => handleChipClick(rarity, selectedRarities, setSelectedRarities)}
                                        sx={isSelected ? style : { fontWeight: 'normal' }}
                                        variant={isSelected ? 'filled' : 'outlined'}
                                    />
                                );
                            })}
                        </Box>
                    </FormControl>

                    <FormControl component="fieldset" fullWidth>
                        <InputLabel shrink>기술점수 능력치</InputLabel>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 3 }}>
                            <Chip
                                label="전체"
                                clickable
                                onClick={() => handleAllClick(allStatNames, selectedTechStats, setSelectedTechStats)}
                                variant={selectedTechStats.length === allStatNames.length ? 'filled' : 'outlined'}
                                color="primary"
                                sx={{ fontWeight: selectedTechStats.length === allStatNames.length ? 'bold' : 'normal' }}
                            />
                            {statList.map((stat, index) => (
                                <Chip
                                    key={stat}
                                    icon={<Image src={statTypes[stat]?.iconbox} alt={statTypes[stat]?.name} width={20} height={20} />}
                                    label={statNames[index]}
                                    clickable
                                    onClick={() => handleChipClick(stat, selectedTechStats, setSelectedTechStats)}
                                    variant={selectedTechStats.includes(stat) ? 'filled' : 'outlined'}
                                    sx={{ fontWeight: selectedTechStats.includes(stat) ? 'bold' : 'normal' }}
                                />
                            ))}
                        </Box>
                    </FormControl>

                    <FormControl component="fieldset" fullWidth>
                        <InputLabel shrink>기술점수 달성 상태</InputLabel>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 3 }}>
                            {techStatusCodes.map((status, index) => (
                                <Chip
                                    key={status}
                                    label={techStatusNames[index]}
                                    clickable
                                    onClick={() => handleChipClick(status, selectedTechStatus, setSelectedTechStatus)}
                                    variant={selectedTechStatus.includes(status) ? 'filled' : 'outlined'}
                                    sx={{ fontWeight: selectedTechStatus.includes(status) ? 'bold' : 'normal' }}
                                />
                            ))}
                        </Box>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onApply} variant="contained">적용</Button>
            </DialogActions>
        </Dialog>
    );
}