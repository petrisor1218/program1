// src/components/holidays/AddHolidayModal.js
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    CircularProgress
} from '@mui/material';
import axios from 'axios';

const AddHolidayModal = ({ open, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        sofer: '',
        tipConcediu: '',
        dataStart: '',
        dataFinal: '',
        status: 'In Tara',
        motiv: '',
        observatii: ''
    });
    const [drivers, setDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/drivers`);
                setDrivers(response.data);
            } catch (error) {
                console.error('Eroare la încărcarea șoferilor:', error);
                setError('Nu s-au putut încărca șoferii');
            }
        };

        if (open) {
            fetchDrivers();
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/holidays`, {
                ...formData,
                dataStart: new Date(formData.dataStart),
                dataFinal: new Date(formData.dataFinal)
            });
            onSuccess();
            setFormData({
                sofer: '',
                tipConcediu: '',
                dataStart: '',
                dataFinal: '',
                status: 'In Tara',
                motiv: '',
                observatii: ''
            });
        } catch (error) {
            setError('Eroare la salvarea concediului');
            console.error('Eroare:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Adaugă Concediu Nou</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                        select
                        label="Șofer"
                        name="sofer"
                        value={formData.sofer}
                        onChange={handleChange}
                        fullWidth
                    >
                        {drivers.map((driver) => (
                            <MenuItem key={driver._id} value={driver._id}>
                                {driver.nume}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Tip Concediu"
                        name="tipConcediu"
                        value={formData.tipConcediu}
                        onChange={handleChange}
                        fullWidth
                    >
                        {['Intre Curse', 'Medical', 'Neplatit', 'Special'].map((tip) => (
                            <MenuItem key={tip} value={tip}>
                                {tip}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        type="date"
                        label="Data Start"
                        name="dataStart"
                        value={formData.dataStart}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <TextField
                        type="date"
                        label="Data Final"
                        name="dataFinal"
                        value={formData.dataFinal}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <TextField
                        label="Motiv"
                        name="motiv"
                        value={formData.motiv}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="Observații"
                        name="observatii"
                        value={formData.observatii}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Anulează</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={24} /> : 'Salvează'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddHolidayModal;