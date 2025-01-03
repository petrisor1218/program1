import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    Box,
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { format } from 'date-fns';
import AddHolidayModal from './AddHolidayModal';

const Holidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchHolidays = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Nu sunteți autentificat');
                setIsLoading(false);
                return;
            }
    
            const response = await axios.get('http://localhost:5000/api/holidays', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setHolidays(response.data);
            setIsLoading(false);
        } catch (err) {
            console.error('Eroare la încărcarea concediilor:', err);
            setError(err.response?.data?.message || 'Nu s-au putut încărca concediile');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const getStatusColor = (status) => {
        const statusColors = {
            'Activ': 'success',
            'Plecat': 'primary',
            'In Tara': 'warning',
            'Concediu': 'secondary',
            'Suspendat': 'error',
            'Inactiv': 'default'
        };
        return statusColors[status] || 'default';
    };

    const handleAddSuccess = () => {
        fetchHolidays();
        setIsAddModalOpen(false);
    };

    if (isLoading) return <Typography>Se încarcă...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Concedii</Typography>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Adaugă Concediu
                    </Button>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Șofer</TableCell>
                                <TableCell>Tip Concediu</TableCell>
                                <TableCell>Data Start</TableCell>
                                <TableCell>Data Final</TableCell>
                                <TableCell>Zile Totale</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Acțiuni</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {holidays.map((holiday) => (
                                <TableRow key={holiday._id}>
                                    <TableCell>{holiday.sofer.nume}</TableCell>
                                    <TableCell>{holiday.tipConcediu}</TableCell>
                                    <TableCell>
                                        {format(new Date(holiday.dataStart), 'dd.MM.yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(holiday.dataFinal), 'dd.MM.yyyy')}
                                    </TableCell>
                                    <TableCell>{holiday.zileTotale}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={holiday.status}
                                            color={getStatusColor(holiday.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outlined" size="small">
                                            Detalii
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <AddHolidayModal 
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />
        </Box>
    );
};

export default Holidays;