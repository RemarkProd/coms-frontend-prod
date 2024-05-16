import PropTypes from 'prop-types';
// @mui
import { IconButton, InputAdornment, OutlinedInput, Toolbar, Tooltip, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
// component
import Iconify from '../../../components/iconify';
import { disableUomDetails } from '../../../Services/ApiServices';

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
  onDeleteRoutes: PropTypes.func,
};

export default function UserListToolbar({ numSelected, filterName, onFilterName, selectedUsers, onDeleteRoutes }) {
  const deleteSelectedUser = async () => {
    const result = selectedUsers.map(async (element) => {
      try {
        const date = new Date().toJSON();

        const requestBody = {
          unitOfMeasure: element,
          disableDate: date,
        };

        const response = await disableUomDetails(requestBody);

        const alertMessage = response.status === 200 ? response.data.message : 'Service failed! Try again';
        alert(alertMessage);
        window.location.reload();
      } catch (err) {
        console.log(err.message);
      }
    });
  };

  const searchPlaceHolder = onDeleteRoutes ? 'Search route...' : 'Search uom...';

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
          // placeholder="Search uom..."
          placeholder={searchPlaceHolder}
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          }
        />
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          {onDeleteRoutes ? (
            <IconButton onClick={onDeleteRoutes}>
              <Iconify icon="eva:trash-2-fill" />
            </IconButton>
          ) : (
            <IconButton onClick={deleteSelectedUser}>
              <Iconify icon="eva:trash-2-fill" />
            </IconButton>
          )}
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      )}
    </StyledRoot>
  );
}
