import { parse } from 'date-fns';
import PropTypes from 'prop-types';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
// @mui
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
// component
import Iconify from '../../../components/iconify';
import { approveBankDepositService, rejectBankDepositService } from '../../../Services/ApiServices';

// ----------------------------------------------------------------------

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    width: 320,
    boxShadow: theme.customShadows.z8,
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

// ----------------------------------------------------------------------

UserListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  toDepositDate: PropTypes.string,
  fromDepositDate: PropTypes.string,
  onFilterName: PropTypes.func,
  selectedUsers: PropTypes.array,
  enableDelete: PropTypes.bool,
  user: PropTypes.object,
  onFromDate: PropTypes.func,
  onToDate: PropTypes.func,
  onFilterDate: PropTypes.func,
  onClearDate: PropTypes.func,
  filterDetails: PropTypes.object,
  onFilterDetails: PropTypes.func,
  customerGroupList: PropTypes.array,
  customerList: PropTypes.array,
  onDateChange: PropTypes.func,
  bankstatuslist: PropTypes.array,
};

export default function UserListToolbar({
  numSelected,
  filterName,
  onFilterName,
  selectedUsers,
  enableDelete,
  user,
  onFromDate,
  onToDate,
  onFilterDate,
  onClearDate,
  toDepositDate,
  fromDepositDate,
  filterDetails,
  onFilterDetails,
  customerGroupList,
  customerList,
  onDateChange,
}) {
  const [open, setOpen] = useState(false);
  const [rowData, setRowData] = useState({});
  const [enableFilter, setEnableFilter] = useState(false);
  // const [toDate, setToDate] = useState(toDepositDate);

  const onValueChange = (e) => {
    setRowData({ ...rowData, [e.target.name]: e.target.value });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const rejectDeposits = async () => {
    try {
      const approvalPromises = selectedUsers.map(async (element) => {
        const requestBody = {
          action: 'REJECTED',
          cashReceiptId: element,
        };
        const response = await approveBankDepositService(user, requestBody);

        const rejectRequestBody = {
          rejectReason: rowData.reason,
          cashReceiptId: element,
        };
        const rejectResponse = await rejectBankDepositService(user, rejectRequestBody);
      });

      await Promise.all(approvalPromises);

      console.log('Successfully rejected!');
      window.location.reload();
    } catch (error) {
      console.error('Error during deposit approval:', error);
    }
  };

  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const displayFilter = enableFilter ? 'Hide' : 'Show';

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    filterDetails.customer = selectedOption.value;
  };

  const handleInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredOptions = customerList
    .filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option, label: option }));

  // for customer group
  const handleGroupChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    filterDetails.group = selectedOption.value;
  };

  const handleGroupInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredGroupOptions = customerGroupList
    .filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option, label: option }));

  // for customer status
  const handleStatusChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    filterDetails.status = selectedOption.value;
  };

  const handleStatusInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const today = new Date().toISOString().split('T')[0];

  const parseDate = (dateString) => parse(dateString, 'dd/MM/yy', new Date());

  return (
    <StyledRoot
      sx={{
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <StyledSearch
          value={filterName}
          onChange={onFilterName}
          placeholder="Search deposit..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          }
        />
      )}

      {enableFilter && (
        <Stack ml={1} mr={1}>
          <Stack direction="row" alignItems="center" justifyContent="flex-start">
            <div className="col-auto" style={{ marginRight: '20px', display: 'flex' }}>
              <span className="col-form-label" style={{ display: 'flex', marginRight: '5px' }}>
                From
              </span>
              <div style={{ marginLeft: '5px', width: '125px' }}>
                <DatePicker
                  selected={filterDetails.from ? parseDate(filterDetails.from) : null}
                  onChange={(date) => onDateChange(date, 'from')}
                  dateFormat="dd/MM/yy"
                  maxDate={new Date()}
                  placeholderText="dd/mm/yy"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-auto" style={{ marginRight: '20px', display: 'flex' }}>
              <span className="col-form-label" style={{ display: 'flex', marginRight: '5px' }}>
                To
              </span>
              <div style={{ marginLeft: '5px', width: '125px' }}>
                <DatePicker
                  selected={filterDetails.to ? parseDate(filterDetails.to) : null}
                  onChange={(date) => onDateChange(date, 'to')}
                  dateFormat="dd/MM/yy"
                  minDate={parseDate(filterDetails.from)}
                  maxDate={new Date()}
                  placeholderText="dd/mm/yy"
                  className="form-control"
                />
              </div>
            </div>

            <Button onClick={onFilterDate}>Filter</Button>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="flex-start">
            <div className="col-auto" style={{ display: 'flex', marginRight: '20px', width: 'auto' }}>
              <span style={{ marginRight: '5px' }}>Customer</span>
              <div style={{ width: '190px' }}>
                <Select
                  id="customer"
                  name="customer"
                  value={
                    filterDetails.customer ? { value: filterDetails.customer, label: filterDetails.customer } : null
                  }
                  // value={selectedOption}
                  // onChange={onFilterDetails}
                  onChange={handleChange}
                  onInputChange={handleInputChange}
                  options={filteredOptions}
                  placeholder="Type to select..."
                  isClearable
                />
              </div>
            </div>

            <div className="col-auto" style={{ display: 'flex', marginRight: '20px', width: 'auto' }}>
              <span style={{ marginRight: '5px' }}>Customer Group</span>

              <div style={{ width: '190px' }}>
                {/* Customer Group */}
                <Select
                  value={filterDetails.group ? { value: filterDetails.group, label: filterDetails.group } : null}
                  // value={selectedOption}
                  // onChange={onFilterDetails}
                  onChange={handleGroupChange}
                  onInputChange={handleGroupInputChange}
                  options={filteredGroupOptions}
                  placeholder="Type to select..."
                  isClearable
                />
              </div>
            </div>

            <Button onClick={onClearDate}>Clear</Button>
          </Stack>
        </Stack>
      )}

      {enableDelete && numSelected > 0 ? (
        <Tooltip title="Reject" style={{ color: 'crimson' }}>
          <IconButton onClick={handleClickOpen}>
            <Iconify icon="eva:trash-2-fill" />
            <span style={{ fontSize: '20px' }}>Reject</span>
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <Button onClick={() => setEnableFilter(!enableFilter)}>
            {/* <Iconify icon="ic:round-filter-list" /> */}
            {displayFilter}
          </Button>
        </Tooltip>
      )}

      {/* {reject && ( */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle style={{ color: 'crimson' }}>Are you sure to reject the deposits?</DialogTitle>
        <Stack />
        <DialogContent>
          <Stack spacing={1} direction="row" alignItems="center">
            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', width: '100%' }}>
              {/* <label htmlFor="reason">Reason: </label> */}
              <textarea
                id="reason"
                name="reason"
                placeholder="Specify a reason for your rejection.."
                style={{ width: '100%' }}
                value={rowData.reason}
                onChange={(e) => onValueChange(e)}
              />
            </div>
          </Stack>

          <Grid container spacing={2} style={{ marginTop: '5px' }}>
            <Grid item xs={3} style={{ display: 'flex' }}>
              <Button
                style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
                onClick={rejectDeposits}
              >
                Submit
              </Button>
              <Button
                style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
                onClick={handleClose}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      {/* )} */}
    </StyledRoot>
  );
}
