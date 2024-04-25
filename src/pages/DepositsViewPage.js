/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-key */
/* eslint-disable camelcase */
// import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { sentenceCase } from 'change-case';
import { filter } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Button,
  Card,
  CircularProgress,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  TextField,
  TextareaAutosize,
  Typography,
} from '@mui/material';

import { useUser } from '../context/UserContext';
// components
import Scrollbar from '../components/scrollbar';
// sections
import {
  checkUserActionAssignment,
  dowloadBankDepositReceiptService,
  getAllBankDepositsForAccountsService,
  getAllCustomerService,
  getBankDepositViewFilterByDateService,
  getBankDepositViewFilterByFromDateService,
  getBankDepositViewFilterByToDateService,
  getDepositTypesService,
  getUserProfileDetails,
} from '../Services/ApiServices';
import Iconify from '../components/iconify';
import DepositListToolbar from '../sections/@dashboard/deposits/depositListToolbar';
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

  const { user } = useUser();
  console.log(user);

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

  const [canEdit, setCanEdit] = useState(false);
  useEffect(() => {
    async function fetchData() {
      try {
        if (account) {
          const requestBody = {
            userId: account.user_id,
            actionId: 1,
          };
          const accountDetails = await checkUserActionAssignment(user, requestBody); // Call your async function here

          if (accountDetails.status === 200) {
            setCanEdit(accountDetails.data.value);
          } // Set the account details in the component's state
        }
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [account]);
  console.log(canEdit);

  useEffect(() => {
    async function fetchData() {
      try {
        if (account) {
          console.log(account.user_id);
          const response = await getAllBankDepositsForAccountsService(user);

          if (response.status === 200) {
            // const filteredList = response.data.filter((item) => item.status === 'RECONCILED');
            setUserList(response.data);
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
  console.log(USERLIST);

  const [customerList, setCustomerList] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        if (account) {
          const response = await getAllCustomerService(user);

          if (response.status === 200) {
            setCustomerList(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [account]);
  console.log(customerList);

  const [depositTypeList, setDepositTypeList] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        if (account) {
          const response = await getDepositTypesService(user);

          if (response.status === 200) {
            setDepositTypeList(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [account]);
  console.log(depositTypeList);

  function getFormattedPrice(value) {
    const formattedPrice = new Intl.NumberFormat().format(value);
    console.log(parseInt(formattedPrice, 10));

    return formattedPrice;
  }

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const [imageSrc, setImageSrc] = useState(null);
  const viewAttachment = async (value) => {
    try {
      const filename = value;
      const requestBody = {
        fileName: filename,
      };
      const response = await dowloadBankDepositReceiptService(user, requestBody);

      if (response.status === 200) {
        const base64String = btoa(
          new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        const dataURL = `data:image/jpeg;base64,${base64String}`;
        setImageSrc(dataURL);
      } else {
        console.log('Image download failed. Server returned status:', response.status);
      }
    } catch (error) {
      console.error('Error during image download:', error);
    } finally {
      setOpen(true); // This will be executed regardless of success or failure
    }
  };

  let TABLE_HEAD = [];
  if (canEdit) {
    TABLE_HEAD = [
      { id: 'attachment', label: 'Receipt Attachment', alignRight: false },
      { id: 'status', label: 'Status', alignRight: false },
      { id: 'deposit_date', label: 'Deposit Date', alignRight: false },
      { id: 'company_bank_name', label: 'Company Bank', alignRight: false },
      { id: 'deposit_bank_account', label: 'Company Account', alignRight: false },
      { id: 'company_name', label: 'Company Name', alignRight: false },
      { id: 'customer_code', label: 'Customer Code', alignRight: false },
      { id: 'customer', label: 'Customer Name', alignRight: false },
      { id: 'customer_group', label: 'Customer Group', alignRight: false },
      { id: 'amount', label: sentenceCase('amount'), alignRight: true },
      { id: 'invoice_number', label: 'Invoice Number', alignRight: false },
      { id: 'type', label: 'Deposit Type', alignRight: false },
      { id: 'deposit_bank', label: 'Deposit From Bank', alignRight: false },
      { id: 'deposit_bank_branch', label: 'Deposit From Branch', alignRight: false },
      { id: 'receipt_number', label: 'Receipt Number', alignRight: false },
      { id: 'depositor', label: 'Depositor', alignRight: false },
      { id: 'employee_name', label: 'Employee', alignRight: false },
      { id: 'user_name', label: 'User Name', alignRight: false },
      { id: 'reject_reason', label: 'Reject Reason', alignRight: false },
      { id: 'remarks', label: 'Remarks', alignRight: false },
      { id: 'edit', label: 'Edit', alignRight: false },
      // { id: '' },
    ];
  } else {
    TABLE_HEAD = [
      { id: 'attachment', label: 'Receipt Attachment', alignRight: false },
      { id: 'status', label: 'Status', alignRight: false },
      { id: 'deposit_date', label: 'Deposit Date', alignRight: false },
      { id: 'company_bank_name', label: 'Company Bank', alignRight: false },
      { id: 'deposit_bank_account', label: 'Company Account', alignRight: false },
      { id: 'company_name', label: 'Company Name', alignRight: false },
      { id: 'customer_code', label: 'Customer Code', alignRight: false },
      { id: 'customer', label: 'Customer Name', alignRight: false },
      { id: 'customer_group', label: 'Customer Group', alignRight: false },
      { id: 'amount', label: sentenceCase('amount'), alignRight: true },
      { id: 'invoice_number', label: 'Invoice Number', alignRight: false },
      { id: 'type', label: 'Deposit Type', alignRight: false },
      { id: 'deposit_bank', label: 'Deposit From Bank', alignRight: false },
      { id: 'deposit_bank_branch', label: 'Deposit From Branch', alignRight: false },
      { id: 'receipt_number', label: 'Receipt Number', alignRight: false },
      { id: 'depositor', label: 'Depositor', alignRight: false },
      { id: 'employee_name', label: 'Employee', alignRight: false },
      { id: 'user_name', label: 'User Name', alignRight: false },
      { id: 'reject_reason', label: 'Reject Reason', alignRight: false },
      { id: 'remarks', label: 'Remarks', alignRight: false },
      // { id: '' },
    ];
  }
  // const TABLE_HEAD = [
  //   { id: 'attachment', label: 'Receipt Attachment', alignRight: false },
  //   { id: 'status', label: 'Status', alignRight: false },
  //   { id: 'deposit_date', label: 'Deposit Date', alignRight: false },
  //   { id: 'company_bank_name', label: 'Company Bank', alignRight: false },
  //   { id: 'deposit_bank_account', label: 'Company Account', alignRight: false },
  //   { id: 'company_name', label: 'Company Name', alignRight: false },
  //   { id: 'customer_code', label: 'Customer Code', alignRight: false },
  //   { id: 'customer', label: 'Customer Name', alignRight: false },
  //   { id: 'customer_group', label: 'Customer Group', alignRight: false },
  //   { id: 'amount', label: sentenceCase('amount'), alignRight: true },
  //   { id: 'invoice_number', label: 'Invoice Number', alignRight: false },
  //   { id: 'type', label: 'Deposit Type', alignRight: false },
  //   { id: 'deposit_bank', label: 'Deposit From Bank', alignRight: false },
  //   { id: 'deposit_bank_branch', label: 'Deposit From Branch', alignRight: false },
  //   { id: 'receipt_number', label: 'Receipt Number', alignRight: false },
  //   { id: 'depositor', label: 'Depositor', alignRight: false },
  //   { id: 'employee_name', label: 'Employee', alignRight: false },
  //   { id: 'user_name', label: 'User Name', alignRight: false },
  //   { id: 'reject_reason', label: 'Reject Reason', alignRight: false },
  //   { id: 'remarks', label: 'Remarks', alignRight: false },
  //   // { id: '' },
  // ];

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
    console.log(selected);
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

  const [filterInfo, setFilterInfo] = useState({
    from: '',
    to: '',
    amount: '',
    group: '',
  });

  const handleFilterInfo = (e) => {
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
    const response = await getAllBankDepositsForAccountsService(user);

    if (response.status === 200) {
      setUserList(response.data);
      setToDate('');
      setFromDate('');
      setFilterInfo({
        from: '',
        to: '',
        amount: '',
        customer: '',
        group: '',
      });
    } else {
      alert('Process failed! Please try again');
    }
  };

  const handleDateFilter = async () => {
    let filteredData = USERLIST;

    if (filterInfo.from && filterInfo.to) {
      const requestBody = {
        toDepositDate: filterInfo.to,
        fromDepositDate: filterInfo.from,
      };
      const response = await getBankDepositViewFilterByDateService(user, requestBody);

      console.log(response.data);

      if (response.status === 200) {
        filteredData = response.data;
      }
    }

    if (filterInfo.from && !filterInfo.to) {
      console.log('from');
      const requestBody = {
        fromDepositDate: filterInfo.from,
      };
      const response = await getBankDepositViewFilterByFromDateService(user, requestBody);

      console.log(response.data);

      if (response.status === 200) {
        filteredData = response.data;
      }
    }

    if (filterInfo.to && !filterInfo.from) {
      console.log('to');
      const requestBody = {
        toDepositDate: filterInfo.to,
      };
      const response = await getBankDepositViewFilterByToDateService(user, requestBody);

      console.log(response.data);

      if (response.status === 200) {
        filteredData = response.data;
      }
    }

    if (filterInfo.amount) {
      filteredData = filteredData.filter((item) => item.amount === filterInfo.amount);
    }

    if (filterInfo.group) {
      filteredData = filteredData.filter((item) => item.customer_group === filterInfo.group);
    }

    if (filterInfo.customer) {
      filteredData = filteredData.filter((item) => item.customer_name === filterInfo.customer);
    }

    setUserList(filteredData);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;
  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredUsers.length && !!filterName;

  const exportData = filteredUsers.map((item) => ({
    Status: item.status,
    'Deposit Date': getFormattedDateWithTime(item.deposit_date),
    'Company Bank': item.company_bank,
    'Company Account': item.company_account,
    'Company Name': item.company_name,
    'Customer Code': item.customer_code,
    'Customer Name': item.customer_name,
    'Customer Group': item.customer_group,
    Amount: item.amount,
    'Invoice Number': item.invoice_number,
    'Deposit Type': item.deposit_type_name,
    'Deposit From Bank': item.depositor_bank,
    'Deposit From Branch': item.depositor_branch,
    'Receipt Number': item.receipt_number,
    Depositor: item.depositor_name,
    Employee: item.employee_name,
    'User Name': item.user_name,
    'Reject Reason': item.reject_reason,
    Remarks: item.remarks,
  }));

  // edit features
  const [rowData, setRowData] = useState({});
  const [openEdit, setOpenEdit] = useState(false);

  const onValueChange = (e) => {
    console.log(rowData);
    setRowData({ ...rowData, [e.target.name]: e.target.value });
  };

  const closeDialog = () => {
    setFilteredCustomerList([]);
    setShowFilteredCustomerList(false);

    setFilteredPaymentMethodList([]);
    setShowFilteredPaymentMethodList(false);

    setOpenEdit(false);
  };
  const openEditDialog = (event) => {
    console.log(event);
    setRowData(event);
    setOpenEdit(true);
  };

  const [filteredCustomerList, setFilteredCustomerList] = useState([]);
  const [showCustomerList, setShowFilteredCustomerList] = useState(false);

  const handleInputCustomerChange = (event) => {
    setShowFilteredCustomerList(true);

    const input = event.target.value;
    const name = 'customer_name';
    setRowData({ ...rowData, [name]: input });

    console.log(customerList);
    const filtered = customerList.filter((item) => item.full_name.toLowerCase().includes(input.toLowerCase()));
    console.log(filtered);
    setFilteredCustomerList(filtered);
  };

  const handleCustomerClick = (value) => {
    const cName = value.full_name;
    const cId = value.cust_account_id;

    const name1 = 'customer_name';
    const name2 = 'pay_from_customer';
    setRowData({
      ...rowData,
      [name1]: cName,
      [name2]: cId,
    });

    setShowFilteredCustomerList(false);
  };

  // payment method
  const paymentMethodList = [...new Set(depositTypeList.map((value) => value.deposit_type_name))];
  const [filteredPaymentMethodList, setFilteredPaymentMethodList] = useState([]);
  const [showPaymentMethodList, setShowFilteredPaymentMethodList] = useState(false);

  const handleInputPaymentMethodChange = (event) => {
    setShowFilteredPaymentMethodList(true);

    const input = event.target.value;
    const name = 'deposit_type_name';
    setRowData({ ...rowData, [name]: input });

    const filtered = paymentMethodList.filter((item) => item.toLowerCase().includes(input.toLowerCase()));
    console.log(filtered);
    setFilteredPaymentMethodList(filtered);
  };

  const handlePaymentMethodClick = (value) => {
    const name1 = 'deposit_type_name';
    setRowData({ ...rowData, [name1]: value });

    setShowFilteredPaymentMethodList(false);
  };

  return (
    <>
      <Helmet>
        <title> COMS | Deposits </title>
      </Helmet>

      <div style={{ margin: '0 22px' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          {/* <Typography variant="h4" gutterBottom>
            Deposit Collections
          </Typography> */}
          {/* <Button
            variant="text"
            startIcon={<Iconify icon="icon-park:reject" />}
            color="primary"
            onClick={() => approveDeposits(selected)}
            style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px' }}
          >
            Back to New
          </Button>
          <Button
            startIcon={<Iconify icon="mdi-chevron-double-down" />}
            style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px', textAlign: 'right' }}
            onClick={onDownload}
          >
            Export
          </Button> */}
          <CSVLink data={exportData} className="btn btn-success">
            Export Table
          </CSVLink>
        </Stack>

        <Card>
          <DepositListToolbar
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
          />

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
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {
                      amount,
                      cash_receipt_id,
                      company_account,
                      company_bank,
                      company_name,
                      deposit_date,
                      deposit_type_name,
                      depositor_bank,
                      depositor_branch,
                      depositor_name,
                      full_name,
                      receipt_number,
                      remarks,
                      status,
                      uploaded_filename,
                      user_name,
                      employee_name,
                      invoice_number,
                      customer_name,
                      reject_reason,
                      customer_code,
                      customer_group,
                    } = row;

                    const selectedUser = selected.indexOf(cash_receipt_id) !== -1;

                    return (
                      <TableRow hover key={cash_receipt_id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, cash_receipt_id)} />
                        </TableCell> */}

                        <TableCell align="left">
                          <button style={{ width: '100%' }} onClick={() => viewAttachment(uploaded_filename)}>
                            view
                          </button>
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {status}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {/* {getFormattedDate(deposit_date)} */}
                          {getFormattedDateWithTime(deposit_date)}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {company_bank}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {company_account}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {company_name}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {customer_code}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {customer_name}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {customer_group}
                        </TableCell>
                        <TableCell align="right" style={{ whiteSpace: 'nowrap' }}>
                          {getFormattedPrice(amount)}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {invoice_number}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {deposit_type_name}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {depositor_bank}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {depositor_branch}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {receipt_number}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {depositor_name}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {employee_name}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {user_name}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {reject_reason}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {remarks}
                        </TableCell>
                        {canEdit && (
                          <TableCell padding="checkbox">
                            <IconButton size="large" color="primary" onClick={(e) => openEditDialog(row)}>
                              <Iconify icon={'tabler:edit'} />
                            </IconButton>
                          </TableCell>
                        )}
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

                <Dialog open={openEdit} onClose={closeDialog}>
                  <DialogTitle style={{ color: 'crimson' }}>Edit Collections</DialogTitle>
                  <Stack />
                  <DialogContent>
                    <Stack spacing={2} direction={'column'}>
                      <TextField
                        type="date"
                        name="deposit_date"
                        label="Deposit Date"
                        autoComplete="given-name"
                        fullWidth
                        style={{ backgroundColor: 'white' }}
                        onChange={(e) => onValueChange(e)}
                        InputLabelProps={{ shrink: true }}
                        value={rowData.deposit_date ? getFormattedDate(rowData.deposit_date) : ''}
                      />
                      <TextField
                        fullWidth
                        type="number"
                        name="amount"
                        label="Amount"
                        autoComplete="given-name"
                        // style={{ backgroundColor: 'white' }}
                        onChange={(e) => onValueChange(e)}
                        InputLabelProps={{ shrink: true }}
                        value={rowData.amount ? rowData.amount : null}
                      />
                      <TextField
                        fullWidth
                        name="customer_name"
                        label="Customer"
                        autoComplete="given-name"
                        style={{ backgroundColor: 'white' }}
                        onChange={(e) => handleInputCustomerChange(e)}
                        InputLabelProps={{ shrink: true }}
                        value={rowData.customer_name ? rowData.customer_name : ''}
                      />
                      {showCustomerList && (
                        <ul
                          style={{
                            // position: 'absolute',
                            // top: '100%',
                            // left: 0,
                            // width: '100%',
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            zIndex: 1,
                          }}
                        >
                          {filteredCustomerList.map((suggestion, index) => (
                            <MenuItem key={index} onClick={() => handleCustomerClick(suggestion)}>
                              {suggestion.full_name}
                            </MenuItem>
                          ))}
                        </ul>
                      )}
                      <TextField
                        name="paymentMethod"
                        label="Payment Method"
                        autoComplete="given-name"
                        fullWidth
                        style={{ backgroundColor: 'white' }}
                        InputLabelProps={{ shrink: true }}
                        value={rowData.deposit_type_name ? rowData.deposit_type_name : ''}
                        onChange={(e) => handleInputPaymentMethodChange(e)}
                      />
                      {showPaymentMethodList && (
                        <ul
                          style={{
                            // position: 'absolute',
                            // top: '100%',
                            // left: 0,
                            // width: '100%',
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            zIndex: 1,
                          }}
                        >
                          {filteredPaymentMethodList.map((suggestion, index) => (
                            <MenuItem key={index} onClick={() => handlePaymentMethodClick(suggestion)}>
                              {suggestion}
                            </MenuItem>
                          ))}
                        </ul>
                      )}
                      <TextField
                        name="company_bank"
                        label="Company Bank"
                        autoComplete="given-name"
                        fullWidth
                        style={{ backgroundColor: 'white' }}
                        InputLabelProps={{ shrink: true }}
                        value={rowData.company_bank ? rowData.company_bank : ''}
                        onChange={(e) => onValueChange(e)}
                      />
                      <TextField
                        name="company_name"
                        label="Company Name"
                        autoComplete="given-name"
                        fullWidth
                        style={{ backgroundColor: 'white' }}
                        InputLabelProps={{ shrink: true }}
                        value={rowData.company_name ? rowData.company_name : ''}
                        onChange={(e) => onValueChange(e)}
                      />
                      <TextField
                        name="invoice_number"
                        label="Invoice Number"
                        autoComplete="given-name"
                        fullWidth
                        style={{ backgroundColor: 'white' }}
                        InputLabelProps={{ shrink: true }}
                        value={rowData.invoice_number ? rowData.invoice_number : ''}
                        onChange={(e) => onValueChange(e)}
                      />
                      <TextField
                        required
                        type="file"
                        name="depositAttachment"
                        label="Deposit Attachment"
                        autoComplete="given-name"
                        fullWidth
                        // style={{ backgroundColor: 'white' }}
                        // onChange={(e) => uplodPhoto(e)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextareaAutosize
                        name="remarks"
                        placeholder="Remarks"
                        style={{ width: '100%', height: '55px' }}
                        value={rowData.remarks ? rowData.remarks : ''}
                        onChange={(e) => onValueChange(e)}
                      />
                    </Stack>

                    {/* <Container>
                      <LoadingButton fullWidth size="large" type="submit" variant="contained">
                        Submit
                      </LoadingButton>
                    </Container> */}

                    <Grid container spacing={2} style={{ marginTop: '5px' }}>
                      <Grid item xs={3} style={{ display: 'flex' }}>
                        <Button
                          style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
                          // onClick={rejectDeposits}
                        >
                          Submit
                        </Button>
                        <Button
                          style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
                          onClick={closeDialog}
                        >
                          Cancel
                        </Button>
                      </Grid>
                    </Grid>
                  </DialogContent>
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
