import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';

interface ShipInfoDialogProps {
    open: boolean;
    onClose: () => void;
    ship: Ship | null;
}

const ShipInfoDialog: React.FC<ShipInfoDialogProps> = ({ open, onClose, ship }) => {
    if (!ship) {
        return null;
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{ship.name_kr || ship.name}</DialogTitle>
            <DialogContent>
                <Typography>함선 정보를 여기에 표시합니다.</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShipInfoDialog;
