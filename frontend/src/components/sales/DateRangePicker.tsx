import React from 'react';
import { Box, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { DateRange } from '../../features/sales/salesSlice';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateChange: (newDateRange: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateRange, onDateChange }) => {
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      onDateChange({
        ...dateRange,
        startDate: date.toISOString().split('T')[0]
      });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      onDateChange({
        ...dateRange,
        endDate: date.toISOString().split('T')[0]
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <DatePicker
          label="Fecha Inicial"
          value={new Date(dateRange.startDate)}
          onChange={handleStartDateChange}
          maxDate={new Date(dateRange.endDate)}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true
            }
          }}
        />
        <DatePicker
          label="Fecha Final"
          value={new Date(dateRange.endDate)}
          onChange={handleEndDateChange}
          minDate={new Date(dateRange.startDate)}
          maxDate={new Date()}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true
            }
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};