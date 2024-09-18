/* eslint-disable no-else-return */
/* eslint-disable camelcase */
import { format } from 'date-fns';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Card,
  Container,
  Link,
  MenuItem,
  Paper,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { getAllWfNotificationsService, getLoggedInUserDetails, getOrderNumberService } from '../Services/ApiServices';
// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
// import { getLoggedInUserDetails, updateUserStatus } from '../Services/ApiServices';
//  import { getUsersDetailsService } from '../Services/GetAllUsersDetails';

import { useUser } from '../context/UserContext';
import ShowWfNotiHead from '../sections/@dashboard/user/ShowWfNotiHead';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  // { id: 'notification_id', label: 'Organization ID', alignRight: false },

  { id: 'fromuser', label: 'From User', alignRight: false },
  { id: 'message', label: 'Message', alignRight: false },
  { id: 'sentDate', label: 'Sent Date', alignRight: false },
];
const selectedUsers = [];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  if (query) {
    return filter(array, (_user) => {
      const notificationId = _user.notification_id;
      const lowerCaseQuery = query.toLowerCase();

      if (typeof notificationId === 'string') {
        return notificationId.toLowerCase().indexOf(lowerCaseQuery) !== -1;
      } else if (typeof notificationId === 'number') {
        return notificationId.toString().indexOf(lowerCaseQuery) !== -1;
      }

      return false;
    });
  }

  return stabilizedThis.map((el) => el[0]);
}

export default function ShowAllWfNotifications() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [USERLIST, setUserList] = useState([]);

  const [isDisableApprove, setIsDisableApprove] = useState(false);

  const [isDisableBan, setIsDisableBan] = useState(false);

  const [selectedUserEmail, setSelectedUserEmail] = useState('');

  // const [user, setUser] = useState('');
  const currentDate = new Date();

  const lastTwoDigitsOfYear = String(currentDate.getFullYear()).slice(-2);
  const formattedDate = format(currentDate, `dd/MM/${lastTwoDigitsOfYear}`);
  console.log('lastTwoDigitsOfYear', lastTwoDigitsOfYear);
  console.log('formattedDate', formattedDate);
  function getFormattedDate(value) {
    const dateObject = new Date(value);

    // Extract date and time components
    const formattedDate = dateObject.toLocaleDateString();
    const formattedTime = dateObject.toLocaleTimeString();
    const date = new Date(formattedDate);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}    ${formattedTime}`;
  }
  const generateNumber = async () => {
    const now = new Date();
    const h = '0001';
    const month = String(now.getMonth() + 1).padStart(2, '0');
    console.log(month);
    const months = String(now.getMonth() + 2).padStart(2, '0');
    console.log(months);
    const day = String(now.getDate()).padStart(2, '0');
    console.log(day);

    const results = `${day}${month}${h}`;
    const resultss = `${day}${months}${h}`;
    const usersDetails = await getOrderNumberService(results, resultss);

    if (usersDetails.data[0].max !== null) {
      console.log(usersDetails.data[0].max + 1);
      return usersDetails.data[0].max + 1;
    } else {
      console.log(results);
      return results;
    }
  };

  const generatedNumber1 = generateNumber();
  console.log(generatedNumber1);

  const { user } = useUser();
  console.log(user);

  useEffect(() => {
    async function fetchData() {
      try {
        if (user) {
          const usersDetailslogin = await getLoggedInUserDetails(user);
          const requestbody = {
            userId: usersDetailslogin.data.id,
          };
          const usersAllDetails = await getAllWfNotificationsService(requestbody);

          if (usersAllDetails) setUserList(usersAllDetails.data);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [user]);

  const handleOpenMenu = (event, status, email) => {
    if (status === 'approved') setIsDisableApprove(true);
    else setIsDisableApprove(false);

    if (status === 'banned') setIsDisableBan(true);
    else setIsDisableBan(false);

    setSelectedUserEmail(email);

    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const approveUser = async () => {
    const body = {
      status: 'approved',
      email: selectedUserEmail,
    };

    handleCloseMenu();
    window.location.reload();
  };

  const banUser = async () => {
    const body = {
      status: 'banned',
      email: selectedUserEmail,
    };

    handleCloseMenu();
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.email);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    selectedUsers.push(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
    console.log(typeof selectedUsers);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> HR Locations | COMS </title>
      </Helmet>

      <Container className="paddingZero fullWidth">
        <Stack mb={1}>
          <Typography variant="h5" gutterBottom>
            List for Approval
          </Typography>
        </Stack>

        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ShowWfNotiHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={USERLIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {
                      notification_id,

                      from_user,
                      subject,
                      sent_date,
                    } = row;
                    const selectedUser = selected.indexOf(notification_id) !== -1;

                    return (
                      <TableRow hover key={notification_id} tabIndex={-1}>
                        <TableCell align="left">{from_user}</TableCell>
                        <TableCell align="left">
                          <Link
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              navigate(`/dashboard/wfNotificationView/${notification_id}`);
                            }}
                          >
                            {subject}
                          </Link>
                        </TableCell>
                        <TableCell align="left">{getFormattedDate(sent_date)}</TableCell>

                        <Popover
                          open={Boolean(open)}
                          anchorEl={open}
                          onClose={handleCloseMenu}
                          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                          PaperProps={{
                            sx: {
                              p: 1,
                              width: 140,
                              '& .MuiMenuItem-root': {
                                px: 1,
                                typography: 'body2',
                                borderRadius: 0.75,
                              },
                            },
                          }}
                        >
                          <MenuItem sx={{ color: 'success.main' }} disabled={isDisableApprove} onClick={approveUser}>
                            <Iconify icon={'mdi:approve'} sx={{ mr: 2 }} />
                            Appoved
                          </MenuItem>

                          <MenuItem sx={{ color: 'error.main' }} disabled={isDisableBan} onClick={banUser}>
                            <Iconify icon={'mdi:ban'} sx={{ mr: 2 }} />
                            Banned
                          </MenuItem>
                        </Popover>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={USERLIST.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}
