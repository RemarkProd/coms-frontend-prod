/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-undef */
/* eslint-disable camelcase */
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { filter } from 'lodash';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { read, utils } from 'xlsx';
// @mui
import {
  Button,
  Card,
  Container,
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
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
// components
import { format, parse } from 'date-fns';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import FndUserToollist from '../../../sections/@dashboard/user/fndUserToollist';
// sections
// import { getLoggedInUserDetails, updateUserStatus } from '../Services/ApiServices';
//  import { getUsersDetailsService } from '../Services/GetAllUsersDetails';
import {
  getAllIncentiveDistributionService,
  getUserProfileDetails,
  getUsers,
  postIncentiveDistributionService,
  updateUser,
} from '../../../Services/ApiServices';
import { useUser } from '../../../context/UserContext';
import { UserListHead } from '../../../sections/@dashboard/user';
// styles
import '../../../_css/Utils.css';
// custom hooks
// import { useFormattedDate } from '../hooks/getFormattedDate';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'cust_group_id', label: 'Cust Group Id', alignRight: false },
  { id: 'recipient_groups_id', label: 'Recipient Groups Id', alignRight: false },
  { id: 'incentive_pct', label: 'Incentive Pct', alignRight: false },
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
    return filter(array, (_user) => _user.cust_group_id.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function ViewIncentiveDistributionAll() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [recipients, setRecipients] = useState([]);

  const [isDisableApprove, setIsDisableApprove] = useState(false);

  const [isDisableBan, setIsDisableBan] = useState(false);

  const [selectedUserEmail, setSelectedUserEmail] = useState('');

  const [editedUsers, setEditedUsers] = useState([]);
  const [exceldata, setExceldata] = useState([]);

  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       const usersDetails = await getFndUserService();

  //       if (usersDetails) setRecipients(usersDetails.data);
  //     } catch (error) {
  //       console.error('Error fetching account details:', error);
  //     }
  //   }

  //   fetchData();
  // }, []);
  // const [recipients, setRecipients] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getAllIncentiveDistributionService();
        console.log(response.data);

        if (response) setRecipients(response.data);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, []);
  console.log(recipients);

  const [filterDetails, setFilterDetails] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState('');

  // const filteredOptions = list
  //   .filter((option) => option.name.toLowerCase().includes(inputValue.toLowerCase()))
  //   .map((option) => ({ value: option.id, label: option.name }));
  const filteredOptions = [
    { value: 'active', label: 'active' },
    { value: 'inactive', label: 'inactive' },
    { value: 'hold', label: 'hold' },
  ];

  const handleOptionChange = (value, index) => {
    const updatedList = [...recipients];
    const name = 'status';
    updatedList[index][name] = value;

    if (!editedUsers.includes(index)) {
      editedUsers.push(index);
    }

    setRecipients(updatedList);
  };

  const handleOptionInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

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
    window.location.reload();
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
    window.location.reload();
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = recipients.map((n) => n.email);
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

  const parseDate = (dateString) => parse(dateString, 'dd/MM/yy', new Date());

  const handleDateChange = (date, index) => {
    const formattedDate = format(date, 'dd/MM/yy');
    const updatedList = [...recipients];
    const name = 'end_date';
    updatedList[index][name] = formattedDate;

    console.log('before', editedUsers);
    if (!editedUsers.includes(index)) {
      editedUsers.push(index);
    }
    console.log('after', editedUsers);

    setRecipients(updatedList);
  };

  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const handleBackdropOpenClose = () => {
    setBackdropOpen(false);
  };
  const handleBackdropOpen = () => {
    setBackdropOpen(true);
  };

  const [account, setAccount] = useState({});
  useEffect(() => {
    async function fetchData() {
      try {
        if (user) {
          const accountDetails = await getUserProfileDetails(user); // Call your async function here
          if (accountDetails.status === 200) {
            setAccount(accountDetails.data);
          } // Set the account details in the component's state
        }
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [user]);
  console.log(account);

  const submitUsers = async () => {
    if (!editedUsers.length > 0) {
      return;
    }
    try {
      handleBackdropOpen();
      const promises = editedUsers.map((value) => {
        const requestBody = {
          userId: recipients[value].user_id,
          lastUpdatedBy: account.user_id,
          endDate: recipients[value].end_date,
          status: recipients[value].status,
        };
        return updateUser(requestBody);
      });

      await Promise.all(promises); // Wait for all updates to complete.

      const usersDetails = await getUsers();
      if (usersDetails) setRecipients(usersDetails.data.data);

      handleBackdropOpenClose();
    } catch (error) {
      console.error('Error in submitting users or fetching account details:', error);
    }
  };
  const file_type = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];
  const handleChange = (e) => {
    const selected_file = e.target.files[0];
    console.log(selected_file.type);
    if (selected_file && file_type.includes(selected_file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = read(e.target.result);
        const sheet = workbook.SheetNames;
        if (sheet.length) {
          const data = utils.sheet_to_json(workbook.Sheets[sheet[0]]);
          setExceldata(data);
        }
      };
      reader.readAsArrayBuffer(selected_file);
    }
  };
  console.log(exceldata);

  const [openUploadExcelDialog, setOpenUploadExcelDialog] = useState(false);
  const handleCloseDialog = () => {
    setOpenUploadExcelDialog(false);
  };

  const handleOpenDialog = () => {
    setOpenUploadExcelDialog(true);
  };
  const date = new Date();
  const saveExcelData = async () => {
    console.log(exceldata);

    try {
      if (exceldata && Array.isArray(exceldata)) {
        for (const row of exceldata) {
          const requestBody = {
            custGroupId: row.cust_group_id,
            recipientGroupsId: row.recipient_groups_id,
            incentivePct: row.incentive_pct,
            lastUpdateDate: date,
            lastUpdatedBy: account.user_id,
            creationDate: date,
            createdBy: account.user_id,
            lastUpdateLogin: account.user_id,
          };
          console.log(requestBody);

          try {
            const postData = await postIncentiveDistributionService(requestBody);

            if (postData.status === 200) {
              console.log(`Row with cust_group_id ${row.cust_group_id} successfully added.`);
            } else {
              console.error(`Failed to save row with cust_group_id ${row.cust_group_id}`);
            }
          } catch (error) {
            console.error(`Error saving row with cust_group_id ${row.cust_group_id}:`, error);
          }
        }
      }
      alert('Submitted Successfully.');
      window.location.reload();
    } catch (error) {
      console.error('Error processing excel data:', error);
    }
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - recipients.length) : 0;

  const filteredUsers = applySortFilter(recipients, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Incentive Groups | COMS </title>
      </Helmet>

      <Container className="indexing fullWidth">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" gutterBottom>
            Incentive Distribution
          </Typography>
          <div>
            {/* <Button
              variant="text"
              style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px', marginRight: '10px' }}
              // color="primary"
              startIcon={<Iconify icon="mingcute:send-fill" />}
              onClick={submitUsers}
            >
              Submit
            </Button> */}
            <Button
              variant="text"
              style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px' }}
              color="primary"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => {
                navigate('/dashboard/addincentivedistribution');
              }}
            >
              Add Incentive Distribution
            </Button>
            <Button
              style={{ backgroundColor: 'lightgray', color: 'black', marginLeft: '12px' }}
              onClick={handleOpenDialog}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOpenDialog();
                }
              }}
            >
              Upload (Incentive Distribution){' '}
            </Button>
          </div>
        </Stack>

        <Card>
          <FndUserToollist
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            selectedUsers={selected}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  enableReadonly
                  rowCount={recipients.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const { cust_group_id, recipient_groups_id, incentive_pct } = row;
                    const selectedUser = selected.indexOf(cust_group_id) !== -1;

                    return (
                      <TableRow hover key={cust_group_id} tabIndex={-1} role="checkbox">
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, user_id)} />
                        </TableCell> */}
                        <TableCell align="left">{cust_group_id}</TableCell>
                        <TableCell align="left">{recipient_groups_id}</TableCell>
                        <TableCell align="left">{incentive_pct}</TableCell>

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
            count={recipients.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        <Backdrop
          sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
          open={backdropOpen}
          // onClick={handleClose}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Dialog open={openUploadExcelDialog} onClose={handleCloseDialog}>
          <Stack />
          <DialogContent>
            <Stack spacing={2.5} direction="row">
              <Typography sx={{ fontWeight: 'bold' }}>Upload Excel -&gt;</Typography>
              <div style={{ marginLeft: '10px' }}>
                <input type="file" onChange={handleChange} />
              </div>
              <div>
                <Button style={{ backgroundColor: 'lightgray', color: 'black' }} onClick={saveExcelData}>
                  Upload
                </Button>
              </div>
            </Stack>
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
}
