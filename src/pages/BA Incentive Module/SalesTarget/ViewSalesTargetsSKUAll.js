/* eslint-disable no-restricted-globals */
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
import BaSalesIncentiveFilter from '../../../sections/@dashboard/baIncentiveToolbar/baSalesIncentiveFilter';

// sections
// import { getLoggedInUserDetails, updateUserStatus } from '../Services/ApiServices';
//  import { getUsersDetailsService } from '../Services/GetAllUsersDetails';
import {
  getAllBankDepositsForAccountsService,
  getAllSalesSKUTargets,
  getSalesTargetSKUFilterByDateService,
  getSalesTargetSKUFilterByFromDateService,
  getSalesTargetSKUFilterByToDateService,
  getUserProfileDetails,
  getUsers,
  postSKUService,
  updateUser,
} from '../../../Services/ApiServices';
import { useUser } from '../../../context/UserContext';
import { UserListHead } from '../../../sections/@dashboard/user';
// styles
import '../../../_css/Utils.css';
// custom hooks
import { getFormattedDateWithTime } from '../../../hooks/GetFormattedDateWithTime';
// import { useFormattedDate } from '../hooks/getFormattedDate';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'incentive_type_id', label: 'Incentive Type Id', alignRight: false },
  { id: 'cust_group_id', label: 'Cust Group Id', alignRight: false },
  { id: 'cust_account_id', label: 'Cust Account Id', alignRight: false },
  { id: 'inventory_item_id', label: 'Inventory Item Id', alignRight: false },

  { id: 'start_date', label: 'Start Date', alignRight: false },
  { id: 'end_date', label: 'End Date', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
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
    return filter(array, (_user) => _user.user_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function ShowFndUser() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [salesSKUData, setSalesSKUData] = useState([]);

  const [customerGroups, setCustomerGroups] = useState([]);

  const [customers, setCustomers] = useState([]);

  const [isDisableApprove, setIsDisableApprove] = useState(false);

  const [isDisableBan, setIsDisableBan] = useState(false);

  const [selectedUserEmail, setSelectedUserEmail] = useState('');

  const [editedUsers, setEditedUsers] = useState([]);

  const [exceldata, setExceldata] = useState([]);

  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       const usersDetails = await getFndUserService();

  //       if (usersDetails) setSalesSKUData(usersDetails.data);
  //     } catch (error) {
  //       console.error('Error fetching account details:', error);
  //     }
  //   }

  //   fetchData();
  // }, []);getAllSalesSKUTargets,postSKUService
  // const [salesSKUData, setSalesSKUData] = useState([]);
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

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getAllSalesSKUTargets();
        console.log(response.data);

        if (response) setSalesSKUData(response.data);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, []);
  console.log(salesSKUData);

  useEffect(() => {
    async function fetchData() {
      try {
        if (account) {
          console.log(account.user_id);
          const response = await getAllBankDepositsForAccountsService(user);

          if (response.status === 200) {
            // const filteredList = response.data.filter((item) => item.status === 'RECONCILED');
            // setUserList(response.data);
            const customerGroupList = [...new Set(response.data.map((obj) => obj.customer_group))];
            const customerList = [...new Set(response.data.map((obj) => obj.customer_name))];
            setCustomerGroups(customerGroupList);
            setCustomers(customerList);
          }
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [account]);

  //   useEffect(() => {
  //     async function fetchData() {
  //       try {
  //         const usersDetails = await getUsers();

  //         if (usersDetails) setSalesSKUData(usersDetails.data.data);
  //       } catch (error) {
  //         console.error('Error fetching account details:', error);
  //       }
  //     }

  //     fetchData();
  //   }, []);
  //   console.log(salesSKUData);

  // selecting status
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
      const newSelecteds = salesSKUData.map((n) => n.email);
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

  const handleDateChange = (date, name) => {
    const formattedDate = format(date, 'dd/MM/yy');
    setFilterInfo({ ...filterInfo, [name]: formattedDate });
    // setFilterDetails1({ ...filterDetails1, from: formattedDate });
  };

  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const handleBackdropOpenClose = () => {
    setBackdropOpen(false);
  };
  const handleBackdropOpen = () => {
    setBackdropOpen(true);
  };

  const submitUsers = async () => {
    if (!editedUsers.length > 0) {
      return;
    }
    try {
      handleBackdropOpen();
      const promises = editedUsers.map((value) => {
        const requestBody = {
          userId: salesSKUData[value].user_id,
          lastUpdatedBy: account.user_id,
          endDate: salesSKUData[value].end_date,
          status: salesSKUData[value].status,
        };
        return updateUser(requestBody);
      });

      await Promise.all(promises); // Wait for all updates to complete.

      const usersDetails = await getUsers();
      if (usersDetails) setSalesSKUData(usersDetails.data.data);

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
    try {
      if (exceldata && Array.isArray(exceldata)) {
        for (const row of exceldata) {
          const requestBody = {
            lastUpdateDate: date,
            lastUpdatedBy: account.user_id,
            creationDate: date,
            createdBy: account.user_id,
            lastUpdateLogin: account.user_id,
            custgroupid: row.cust_group_id,
            custAccountId: row.cust_account_id,
            startDate: date,
            endDate: date,
            amount: row.amount,
            incentiveTypeId: row.incentive_type_id,
            inventoryItemId: row.inventory_item_id,
          };
          console.log(requestBody);

          try {
            const postData = await postSKUService(requestBody);

            if (postData.status === 200) {
              console.log(`Row with emp_code ${row.incentive_type_id} successfully added.`);
            } else {
              console.error(`Failed to save row with incentive_type_id ${row.incentive_type_id}`);
            }
          } catch (error) {
            console.error(`Error saving row with incentive_type_id ${row.incentive_type_id}:`, error);
          }
        }
      }
      alert('Submitted Successfully.');
      window.location.reload();
    } catch (error) {
      console.error('Error processing excel data:', error);
    }
  };

  const [filterInfo, setFilterInfo] = useState({
    from: '',
    to: '',
    customer: '',
    group: '',
  });

  const handleFilterInfo = (e) => {
    console.log(e);

    console.log(e.target.name, e.target.value);
    setFilterInfo({ ...filterInfo, [e.target.name]: e.target.value });
  };
  console.log(filterInfo);

  const [fromDate, setFromDate] = useState(null);
  const handleFromDate = (event) => {
    setPage(0);
    setFromDate(event.target.value);
  };
  console.log(fromDate);

  const [toDate, setToDate] = useState(null);
  const handleToDate = (event) => {
    setPage(0);
    setToDate(event.target.value);
  };
  console.log(toDate);

  const handleClearDate = async (event) => {
    const response = await getAllSalesSKUTargets();

    if (response.status === 200) {
      setSalesSKUData([]); // Clear the state first
      setTimeout(() => {
        setSalesSKUData(response.data); // Update with new filtered data
      }, 0);

      setToDate('');
      setFromDate('');
      setFilterInfo({
        from: '',
        to: '',
        customer: '',
        group: '',
      });
    } else {
      alert('Process failed! Please try again');
    }
  };

  function convertToFrontendDate(backendDateString) {
    try {
      const date = new Date(backendDateString);

      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const dayOfMonth = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      const time = date.toTimeString().split(' ')[0];
      // const timezone = date.toTimeString().split(' ')[1];
      const frontendDateString = `${day} ${month} ${dayOfMonth} ${year} ${time}`;

      return frontendDateString;
    } catch (error) {
      console.error('Error while converting date:', error);
      return null;
    }
  }

  const handleDateFilter = async () => {
    let filteredData = salesSKUData;
    console.log('Initial Data:', filteredData);
    console.log('Filter Info:', filterInfo);

    try {
      if (filterInfo.from && filterInfo.to) {
        const fromDate = parseDate(filterInfo.from);
        const toDate = parseDate(filterInfo.to);
        const fromDepositDateBackend = convertToFrontendDate(fromDate);
        const toDepositDateBackend = convertToFrontendDate(toDate);
        const requestBody = {
          fromDate: fromDepositDateBackend,
          toDate: toDepositDateBackend,
        };
        console.log('Request Body (From-To):', requestBody);

        const response = await getSalesTargetSKUFilterByDateService(user, requestBody);
        console.log('API Response (From-To):', response);

        if (response.status === 200) {
          filteredData = response.data;
        }
      } else if (filterInfo.from) {
        console.log("Filtering by 'From' date only.");
        const requestBody = { fromDate: filterInfo.from };
        const response = await getSalesTargetSKUFilterByFromDateService(user, requestBody);
        console.log('API Response (From):', response);

        if (response.status === 200) {
          filteredData = response.data;
        }
      } else if (filterInfo.to) {
        console.log("Filtering by 'To' date only.");
        const requestBody = { toDate: filterInfo.to };
        const response = await getSalesTargetSKUFilterByToDateService(user, requestBody);
        console.log('API Response (To):', response);

        if (response.status === 200) {
          filteredData = response.data;
        }
      }

      if (filterInfo.group) {
        console.log('Filtering by Customer Group:', filterInfo.group);
        filteredData = filteredData.filter((item) => item.customer_group === filterInfo.group);
      }

      if (filterInfo.customer) {
        console.log('Filtering by Customer Name:', filterInfo.customer);
        filteredData = filteredData.filter((item) => item.customer_name === filterInfo.customer);
      }

      console.log('Final Filtered Data:', filteredData);
      setSalesSKUData([]); // Clear the state first
      setTimeout(() => {
        setSalesSKUData(filteredData); // Update with new filtered data
      }, 0);
    } catch (error) {
      console.error('Error during filtering:', error);
    }
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - salesSKUData.length) : 0;

  const filteredUsers = applySortFilter(salesSKUData, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Users Table | COMS </title>
      </Helmet>

      <Container className="indexing fullWidth">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" gutterBottom>
            Sales Targets SKU All
          </Typography>
          <div>
            <Button
              variant="text"
              style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px', marginRight: '10px' }}
              // color="primary"
              startIcon={<Iconify icon="mingcute:send-fill" />}
              onClick={submitUsers}
            >
              Submit
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
              Upload (Sales Targets SKU All){' '}
            </Button>
            {/* <Button
              variant="text"
              style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px' }}
              color="primary"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => {
                navigate('/dashboard/addSalesTargetsSKUAll');
              }}
            >
              Add Sales Targets SKU All
            </Button> */}
          </div>
        </Stack>

        <Card>
          <BaSalesIncentiveFilter
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onFilterDate={handleDateFilter}
            selectedUsers={selected}
            onFromDate={handleFromDate}
            onToDate={handleToDate}
            onClearDate={handleClearDate}
            toDepositDate={toDate}
            fromDepositDate={fromDate}
            filterDetails={filterInfo}
            onFilterDetails={handleFilterInfo}
            customerGroupList={customerGroups}
            customerList={customers}
            onDateChange={handleDateChange}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  enableReadonly
                  rowCount={filteredUsers.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const {
                      incentive_type_id,
                      cust_account_id,
                      cust_group_id,
                      start_date,
                      end_date,
                      inventory_item_id,
                      amount,
                    } = row;
                    const selectedUser = selected.indexOf(incentive_type_id) !== -1;

                    return (
                      <TableRow hover key={incentive_type_id} tabIndex={-1} role="checkbox">
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, user_id)} />
                        </TableCell> */}
                        <TableCell align="left">{incentive_type_id}</TableCell>
                        <TableCell align="left">{cust_group_id}</TableCell>
                        <TableCell align="left">{cust_account_id}</TableCell>
                        <TableCell align="left">{inventory_item_id}</TableCell>

                        <TableCell align="left">{getFormattedDateWithTime(start_date)}</TableCell>
                        <TableCell align="left">{getFormattedDateWithTime(end_date)}</TableCell>
                        <TableCell align="left">{amount}</TableCell>
                        {/* <TableCell align="left">
                          <DatePicker
                            selected={end_date ? parseDate(end_date) : null}
                            onChange={(date) => handleDateChange(date, index)}
                            dateFormat="dd/MM/yy"
                            placeholderText="dd/mm/yy"
                          />
                        </TableCell> */}
                        {/* <TableCell align="left">
                          <div className="col-auto">
                            <div>
                              <Select
                                value={{ value: amount, label: amount }}
                                onChange={(value) => handleOptionChange(value.label, index)}
                                // onInputChange={handleOptionInputChange}
                                options={filteredOptions}
                                placeholder="Type to select..."
                                isClearable
                              />
                            </div>
                          </div>
                        </TableCell> */}

                        {/* <TableCell align="left">
                          <IconButton
                            size="large"
                            color="primary"
                            onClick={() => {
                              const userId = user_id;

                              navigate(`/dashboard/updatefnduser/${userId}`);
                            }}
                          >
                            <Iconify icon={'tabler:edit'} />
                          </IconButton>
                        </TableCell> */}

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
            count={salesSKUData.length}
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
