/* eslint-disable no-restricted-globals */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-key */
/* eslint-disable camelcase */
// import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { filter } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import 'react-datepicker/dist/react-datepicker.css';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
// @mui
import {
    Box,
    Button,
    Card,
    CircularProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';
import { useUser } from '../context/UserContext';
// components
import Scrollbar from '../components/scrollbar';
// sections
import {
    getBrandingAssetSumReport,
    getBrandingAssetsViewData,
    getItemsListService,
    getShopsListService,
    getUserProfileDetails,
} from '../Services/ApiServices';
// import DepositListToolbar from '../sections/@dashboard/deposits/depositListToolbar';
import { UserListHead } from '../sections/@dashboard/user';

// ----------------------------------------------------------------------

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
  console.log(query);
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    console.log(filter(array, (_user) => _user.search_all.toLowerCase().indexOf(query.toLowerCase()) !== -1));
    return filter(array, (_user) => _user.search_all.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

function getFormattedDate(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Zero-padding the month
  const day = String(date.getDate()).padStart(2, '0'); // Zero-padding the day

  // return `${day}/${month}/${year}`;
  return `${year}-${month}-${day}`;
}

function getFormattedDateWithTime(value) {
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

function getFormattedPrice(value) {
  const formattedPrice = new Intl.NumberFormat().format(value);
  console.log(parseInt(formattedPrice, 10));

  return formattedPrice;
}

export default function UserPage() {
  const tableref = useRef(null);

  const navigate = useNavigate();

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [USERLIST, setUserList] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rowData, setRowData] = useState({});

  const { user } = useUser();
  console.log(user);

  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const handleOpenFilterDialog = () => {
    setOpenFilterDialog(true);
  };

  const handleCloseFilterDialog = () => {
    setOpenFilterDialog(false);
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

  useEffect(() => {
    async function fetchData() {
      try {
        if (account) {
          const response = await getBrandingAssetSumReport();

          if (response.status === 200) {
            setUserList(response.data);
            // const customerGroupList = [...new Set(response.data.map((obj) => obj.shop_name))];
            // const customerList = [...new Set(response.data.map((obj) => obj.item_name))];
            // setCustomerGroups(customerGroupList);
            // setCustomers(customerList);
          }
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [account]);
  console.log(USERLIST);

  const [items, setItems] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        if (user) {
          const response = await getItemsListService(user); // Call your async function here
          if (response.status === 200) {
            setItems(response.data);
          } // Set the account details in the component's state
        }
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [user]);
  console.log(items);

  const [shopDetails, setShopDetails] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getShopsListService(user);
        console.log(response.data);
        if (response) setShopDetails(response.data);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [user]);
  console.log(shopDetails);

  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const [imageSrc, setImageSrc] = useState(null);

  const TABLE_HEAD = [
    { id: 'cust_group_id', label: 'Cust Group Id', alignRight: false },
    { id: 'cust_group_name', label: 'Cust Group Name', alignRight: false },
    { id: 'area_name', label: 'Area Name', alignRight: false },
    { id: 'asm_code', label: 'Asm Code', alignRight: false },
    { id: 'asm_name', label: 'Asm Name', alignRight: false },
    { id: 'tsm_code', label: 'Tsm Code', alignRight: false },
    { id: 'tsm_name', label: 'Tsm Name', alignRight: false },
    { id: 'so_count', label: 'So Count', alignRight: false },
    { id: 'user_count', label: 'User Count', alignRight: false },
    { id: 'shop_count', label: 'Shop Count', alignRight: false },
  ];

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.cash_receipt_id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const [filterInfo, setFilterInfo] = useState({
    shop: '',
    status: '',
    itemName: '',
  });

  const filteredShopsOptions = shopDetails
    .filter((option) => option.shop_name.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.shop_name, label: option.shop_name }));

  const handleShopNameChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    filterInfo.shop = selectedOption.value;
  };

  const handleShopNameInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const reviewStatusOptions = [
    { value: 'New', label: 'New' },
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Broken', label: 'Broken' },
    { value: 'Fade Out', label: 'Fade Out' },
    { value: 'Not Found', label: 'Not Found' },
    { value: 'Need Repair', label: 'Need Repair' },
  ];

  const handleReviewStatusChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    filterInfo.status = selectedOption.value;
  };

  const filteredItemOptions = items
    .filter((option) => option.description.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.description, label: option.description }));

  const handleItemNameChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    filterInfo.itemName = selectedOption.value;
  };

  const handleItemNameInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const handleClearDate = async () => {
    // Clear the shop filter
    setFilterInfo({
      shop: '',
      status: '',
      itemName: '',
    });

    // Reset the data in the table to show all records
    const response = await getBrandingAssetsViewData(user);
    if (response) setUserList(response.data);

    // setOpenFilterDialog(false); // Close the dialog after clearing the filter
  };

  const handleDateFilter = async () => {
    try {
      setUserList([]);

      const response = await getBrandingAssetsViewData(user);
      if (response) {
        let filteredData = response.data;

        if (filterInfo.shop) {
          filteredData = filteredData.filter((item) => item.shop_name === filterInfo.shop);
        }

        if (filterInfo.itemName) {
          filteredData = filteredData.filter((item) => item.item_name === filterInfo.itemName);
        }

        if (filterInfo.status) {
          filteredData = filteredData.filter((item) => item.review_status === filterInfo.status);
        }

        setUserList(filteredData);
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    } finally {
      setOpenFilterDialog(false);
    }
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;
  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredUsers.length && !!filterName;

  const exportData = filteredUsers.map((item) => ({
    'Cust Group Id': item.cust_group_id,
    'Cust Group Name': item.cust_group_name,
    'Area Name': item.area_name,
    'Asm Code': item.asm_code,
    'Asm Name': item.asm_name,
    'Tsm Code': item.tsm_code,
    'Tsm Name': item.tsm_name,
    'So Count': item.so_count,
    'User Count': item.user_count,
    'Shop Count': item.shop_count,
  }));

  // const closeDialog = () => {
  //   setOpenEdit(false);
  // };

  return (
    <>
      <Helmet>
        <title> COMS | Branding Assets View Page </title>
      </Helmet>

      <div style={{ margin: '0 22px' }}>
        <Box position="relative" width="100%" height="100px">
          {' '}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
            }}
          >
            <CSVLink data={exportData} className="btn btn-success" style={{ width: '120px' }}>
              Export Table
            </CSVLink>
            {/* <Button
              onClick={handleOpenFilterDialog}
              variant="contained"
              sx={{
                margin: 1,
              }}
            >
              Filter Criteria
            </Button> */}
          </Stack>
        </Box>

        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table ref={tableref}>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={filteredUsers.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                  enableReadonly
                />
                <TableBody>
                  {USERLIST.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {
                      cust_group_id,
                      cust_group_name,
                      area_name,
                      asm_code,
                      asm_name,
                      tsm_code,
                      tsm_name,
                      so_count,
                      user_count,
                      shop_count,
                    } = row;

                    const rowValues = [
                      cust_group_id,
                      cust_group_name,
                      area_name,
                      asm_code,
                      asm_name,
                      tsm_code,
                      tsm_name,
                      so_count,
                      user_count,
                      shop_count,
                    ];

                    const selectedUser = selected.indexOf(cust_group_id) !== -1;

                    return (
                      <TableRow hover key={cust_group_id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        {rowValues.map((value, index) => (
                          <TableCell key={index} align="left" style={{ whiteSpace: 'nowrap' }}>
                            {index === 10 || index === 15 ? getFormattedDateWithTime(value) : value}
                          </TableCell>
                        ))}
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

                <Dialog open={open} onClose={handleClose}>
                  <Stack />
                  <DialogContent>
                    <Stack spacing={1.5} direction="row">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: '400px' }}
                          loading="lazy"
                        />
                      ) : (
                        <CircularProgress />
                        // <p>No photo available</p>
                      )}
                    </Stack>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={openFilterDialog}
                  onClose={handleCloseFilterDialog}
                  sx={{ '& .MuiDialog-paper': { maxWidth: '100%', height: '250px' } }}
                >
                  <DialogContent>
                    <Stack spacing={1.5} direction="column">
                      <div className="col-auto" style={{ marginRight: '20px', display: 'flex' }}>
                        <div className="col-auto" style={{ display: 'flex', marginRight: '10px', width: 'auto' }}>
                          <span style={{ marginRight: '5px', whiteSpace: 'nowrap' }}>Shop Name</span>
                          <div style={{ width: '180px' }}>
                            <Select
                              value={filterInfo.shop ? { value: filterInfo.shop, label: filterInfo.shop } : null}
                              // value={selectedOption}
                              // onChange={onFilterDetails}
                              onChange={handleShopNameChange}
                              onInputChange={handleShopNameInputChange}
                              options={filteredShopsOptions}
                              placeholder="Type to select..."
                              isClearable
                            />
                          </div>
                        </div>
                        <div className="col-auto" style={{ display: 'flex', marginRight: '10px', width: 'auto' }}>
                          <span style={{ marginRight: '5px', whiteSpace: 'nowrap' }}>Item Name</span>
                          <div style={{ width: '180px' }}>
                            <Select
                              value={
                                filterInfo.itemName ? { value: filterInfo.itemName, label: filterInfo.itemName } : null
                              }
                              onChange={handleItemNameChange}
                              onInputChange={handleItemNameInputChange}
                              options={filteredItemOptions}
                              placeholder="Type to select..."
                              isClearable
                            />
                          </div>
                        </div>
                        <div className="col-auto" style={{ display: 'flex', marginRight: '10px', width: 'auto' }}>
                          <span style={{ marginRight: '5px', whiteSpace: 'nowrap' }}>Review Status</span>
                          <div style={{ width: '180px' }}>
                            <Select
                              value={filterInfo.status ? { value: filterInfo.status, label: filterInfo.status } : null}
                              onChange={handleReviewStatusChange}
                              options={reviewStatusOptions}
                              placeholder="Click to select..."
                              isClearable
                              isSearchable={false}
                            />
                          </div>
                        </div>
                      </div>
                    </Stack>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleDateFilter}>Filter</Button>
                    <Button onClick={handleClearDate}>Clear</Button>
                    <Button onClick={handleCloseFilterDialog}>Close</Button>
                  </DialogActions>
                </Dialog>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </div>
    </>
  );
}
