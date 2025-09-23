"use client";

import React from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";

export const rarities = ['N', 'R', 'SR', 'SSR', 'UR', 'PR', 'DR'];
export const statList = ["health", "firepower", "torpedo", "antiair", "aviation", "reload", "accuracy", "evasion", "asw"];

interface FilterDialogProps {
    open: boolean;
    onClose: () => void;
    hullTypes: HullTypes;
    nationalities: Nationalities;
    statTypes: StatTypes;
    selectedHullTypes: string[];
    setSelectedHullTypes: (value: string[]) => void;
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

    const allHullTypeNames = Object.values(hullTypes).map((h) => h.name);
    const allNationCodes = [...regularNationCodes, ...collaborationNationCodes];
    const allStatNames = Object.values(statList);

    const hullTypeValue = selectedHullTypes.length === allHullTypeNames.length ? [...selectedHullTypes, "all"] : selectedHullTypes;
    const allNationsSelected = allNationCodes.every(code => selectedNationalities.includes(code));
    const nationalityValue = allNationsSelected ? [...selectedNationalities, "all"] : selectedNationalities;
    const rarityValue = selectedRarities.length === rarities.length ? [...selectedRarities, "all"] : selectedRarities;
    const techStatValue = selectedTechStats.length === allStatNames.length ? [...selectedTechStats, "all"] : selectedTechStats;
    const techStatusNames = ['획득', '풀돌', '120레벨'];
    const techStatusCodes = ['get', 'level', 'upgrade'];

    const handleHullTypeChange = (event: React.MouseEvent<HTMLElement>, newValues: string[]) => {
        const allWasClicked = newValues.includes("all") && !hullTypeValue.includes("all");
        const allWasDeselected = !newValues.includes("all") && hullTypeValue.includes("all");

        if (allWasClicked) {
            setSelectedHullTypes(allHullTypeNames);
        } else if (allWasDeselected) {
            setSelectedHullTypes([]);
        } else {
            setSelectedHullTypes(newValues.filter((v) => v !== "all"));
        }
    };

    const handleNationalityChange = (event: React.MouseEvent<HTMLElement>, newValues: string[]) => {
        const allWasClicked = newValues.includes("all") && !nationalityValue.includes("all");
        const allWasDeselected = !newValues.includes("all") && nationalityValue.includes("all");
        const collabWasClicked = newValues.includes("collab") && !nationalityValue.includes("collab");
        const collabWasDeselected = !newValues.includes("collab") && nationalityValue.includes("collab");

        if (allWasClicked) {
            setSelectedNationalities([...allNationCodes, "collab"]);
        } else if (allWasDeselected) {
            setSelectedNationalities([]);
        } else if (collabWasClicked) {
            const newSelection = [...new Set([...selectedNationalities, ...collaborationNationCodes])];
            setSelectedNationalities(newSelection.filter(v => v !== 'all' && v !== 'collab'));
        } else if (collabWasDeselected) {
            const newSelection = selectedNationalities.filter(n => !collaborationNationCodes.includes(n));
            setSelectedNationalities(newSelection);
        } else {
            setSelectedNationalities(newValues.filter((v) => v !== "all" && v !== "collab"));
        }
    };

    const handleRarityChange = (event: React.MouseEvent<HTMLElement>, newValues: string[]) => {
        const allWasClicked = newValues.includes("all") && !rarityValue.includes("all");
        const allWasDeselected = !newValues.includes("all") && rarityValue.includes("all");

        if (allWasClicked) {
            setSelectedRarities(rarities);
        } else if (allWasDeselected) {
            setSelectedRarities([]);
        } else {
            setSelectedRarities(newValues.filter((v) => v !== "all"));
        }
    };

    const handleTechStatChange = (event: React.MouseEvent<HTMLElement>, newValues: string[]) => {
        const allWasClicked = newValues.includes("all") && !techStatValue.includes("all");
        const allWasDeselected = !newValues.includes("all") && techStatValue.includes("all");

        if (allWasClicked) {
            setSelectedTechStats(allStatNames);
        } else if (allWasDeselected) {
            setSelectedTechStats([]);
        } else {
            setSelectedTechStats(newValues.filter((v) => v !== "all"));
        }
    };

    const handleTechStatusChange = (event: React.MouseEvent<HTMLElement>, newValues: string[]) => {
        setSelectedTechStatus(newValues);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Filter Ships</DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    <FormControl component="fieldset" fullWidth>
                        <InputLabel shrink>함종</InputLabel>
                        <ToggleButtonGroup
                            value={hullTypeValue}
                            onChange={handleHullTypeChange}
                            sx={{ flexWrap: "wrap", pt: 3 }}
                        >
                            <ToggleButton value="all" sx={{ textTransform: "none" }}>
                                전체
                            </ToggleButton>
                            {Object.values(hullTypes).map((hull) => (
                                <ToggleButton key={hull.name} value={hull.name} sx={{ textTransform: "none" }}>
                                    {hull.name_kr}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </FormControl>
                    <FormControl component="fieldset" fullWidth>
                        <InputLabel shrink>진영</InputLabel>
                        <ToggleButtonGroup
                            value={nationalityValue}
                            onChange={handleNationalityChange}
                            sx={{ flexWrap: "wrap", pt: 3 }}
                        >
                            <ToggleButton value="all" sx={{ textTransform: "none" }}>
                                전체
                            </ToggleButton>
                            {Object.values(nationalities).filter(n => regularNationCodes.includes(n.code)).map((nation) => (
                                <ToggleButton key={nation.code} value={nation.code} sx={{ textTransform: "none" }}>
                                    {nation.name_kr || nation.name}
                                </ToggleButton>
                            ))}
                            <ToggleButton value="collab" sx={{ textTransform: "none" }}>
                                콜라보
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </FormControl>
                    <FormControl component="fieldset" fullWidth>
                        <InputLabel shrink>등급</InputLabel>
                        <ToggleButtonGroup
                            value={rarityValue}
                            onChange={handleRarityChange}
                            sx={{ flexWrap: "wrap", pt: 3 }}
                        >
                            <ToggleButton value="all" sx={{ textTransform: "none" }}>
                                전체
                            </ToggleButton>
                            {rarities.map((rarity) => (
                                <ToggleButton key={rarity} value={rarity} sx={{ textTransform: "none" }}>
                                    {rarity}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </FormControl>
                    <FormControl component="fieldset" fullWidth>
                        <InputLabel shrink>기술점수 능력치</InputLabel>
                        <ToggleButtonGroup
                            value={techStatValue}
                            onChange={handleTechStatChange}
                            sx={{ flexWrap: "wrap", pt: 3 }}
                        >
                            <ToggleButton value="all" sx={{ textTransform: "none" }}>
                                전체
                            </ToggleButton>
                            {statList.map((stat) => (
                                <ToggleButton key={stat} value={stat} sx={{ textTransform: "none" }}>
                                    {statNames[statList.indexOf(stat)]}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </FormControl>
                    <FormControl component="fieldset" fullWidth>
                        <InputLabel shrink>기술점수 달성 상태</InputLabel>
                        <ToggleButtonGroup
                            value={selectedTechStatus}
                            onChange={handleTechStatusChange}
                            sx={{ flexWrap: "wrap", pt: 3 }}
                        >
                            {techStatusCodes.map((status, index) => (
                                <ToggleButton key={status} value={status} sx={{ textTransform: "none" }}>
                                    {techStatusNames[index]}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onApply} variant="contained">적용</Button>
            </DialogActions>
        </Dialog>
    );
}