import PropTypes from 'prop-types';
import { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
// @mui
import { Button, Dialog, DialogContent, DialogTitle, Grid, OutlinedInput, Stack, Toolbar } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
// component
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
  onFilterName: PropTypes.func,
  selectedUsers: PropTypes.array,
  enableDelete: PropTypes.bool,
  user: PropTypes.object,
  filterDetails: PropTypes.object,
  onFilterDetails: PropTypes.func,
  customerGroupList: PropTypes.array,
  customerList: PropTypes.array,
  onDateChange: PropTypes.func,
};

export default function UserListToolbar({
  numSelected,
  selectedUsers,
  user,
  filterDetails,
  customerGroupList,
  customerList,
}) {
  console.log(UserListToolbar);
  const [open, setOpen] = useState(false);
  const [rowData, setRowData] = useState({});
  const [enableFilter, setEnableFilter] = useState(true);
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
  //   const displayFilter = enableFilter ? 'Hide' : 'Show';

  const handleChange = (selectedOption) => {
    console.log(selectedOption);
    setSelectedOption(selectedOption);
    filterDetails.shopName = selectedOption.label;
    filterDetails.shopId = selectedOption.value;
  };
  console.log(filterDetails);

  const handleInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredOptions = customerList
    .filter((option) => option.shop_name.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.shop_id, label: `${option.shop_name}` }));

  // for customer group
  const handleGroupChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    filterDetails.group = selectedOption.value;
  };

  const handleGroupInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  return (
    <StyledRoot
      sx={{
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {enableFilter && (
        <Stack ml={1} mr={1}>
          <Stack direction="row" alignItems="center" justifyContent="flex-start">
            <div
              className="col-auto"
              style={{ display: 'flex', marginRight: '20px', width: 'auto', marginLeft: '25px' }}
            >
              <span style={{ marginRight: '5px' }}>Shop Name</span>
              <div style={{ width: '425px' }}>
                <Select
                  id="customer"
                  name="customer"
                  value={
                    filterDetails.shopName ? { value: filterDetails.shopName, label: filterDetails.shopName } : null
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
          </Stack>
        </Stack>
      )}

      {/* {enableDelete && numSelected > 0 ? (
        <Tooltip title="Reject" style={{ color: 'crimson' }}>
          <IconButton onClick={handleClickOpen}>
            <Iconify icon="eva:trash-2-fill" />
            <span style={{ fontSize: '20px' }}>Reject</span>
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <Button onClick={() => setEnableFilter(!enableFilter)}> */}
      {/* <Iconify icon="ic:round-filter-list" /> */}
      {/* {displayFilter} */}
      {/* </Button>
        </Tooltip>
      )} */}

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
