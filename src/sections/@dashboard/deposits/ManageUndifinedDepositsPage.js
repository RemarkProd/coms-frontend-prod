/* eslint-disable no-restricted-globals */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-key */
/* eslint-disable camelcase */
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

// @mui
import {
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

import { CSVLink } from 'react-csv';
import { read, utils } from 'xlsx';
import { useUser } from '../../../context/UserContext';
// components
import Scrollbar from '../../../components/scrollbar';
// sections
import {
  dowloadBankDepositReceiptService,
  getBankReconIdDetails,
  getUndefinedDepositsService,
  getUserProfileDetails,
  postUndefinedDepositsFromExcelService,
} from '../../../Services/ApiServices';
// import SystemItemListToolbar from '../sections/@dashboard/items/SystemItemListToolbar';
import { UserListHead } from '../user';
import './depositStyle.css';

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
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
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
  // const tableref = useRef(null);

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
  const [exceldata, setExceldata] = useState([]);
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

  const [bankReconIdAll, setBankReconIdAll] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        if (user) {
          const bankReconIdDetails = await getBankReconIdDetails(user); // Call your async function here
          if (bankReconIdDetails.status === 200) {
            setBankReconIdAll(bankReconIdDetails.data);
          } // Set the account details in the component's state
        }
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [user]);
  console.log(bankReconIdAll);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getUndefinedDepositsService();

        if (response.status === 200) {
          // const filteredList = response.data.filter((item) => item.status === 'NEW' || item.status === 'REVERSED');
          setUserList(response.data);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [account]);
  console.log(USERLIST);

  function getFormattedPrice(value) {
    const formattedPrice = new Intl.NumberFormat().format(value);
    console.log(parseInt(formattedPrice, 10));

    return formattedPrice;
  }

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
  function changeDateFormat(inputDate) {
    console.log('Original Input:', inputDate);

    // Split the date and time components
    const parts = inputDate.split(/[\s/]+/);

    if (parts.length !== 3) {
      console.error("Invalid date format. Expected format: 'DD/MM/YY HH:MM:SS AM/PM'");
      return null;
    }

    const [datePart, timePart, meridian] = parts;

    // Parse the date part
    const dateParts = datePart.split('/');
    if (dateParts.length !== 3) {
      console.error("Invalid date part. Expected format: 'DD/MM/YY'");
      return null;
    }

    const [day, month, year] = dateParts.map(Number);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error('Invalid day, month, or year value.');
      return null;
    }

    // Handle the 12-hour format
    const timeParts = timePart.split(':');
    if (timeParts.length !== 3) {
      console.error("Invalid time part. Expected format: 'HH:MM:SS'");
      return null;
    }

    const [hours, minutes, seconds] = timeParts.map(Number);

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      console.error('Invalid hours, minutes, or seconds value.');
      return null;
    }

    let hour = hours;

    if (meridian === 'PM' && hours !== 12) {
      hour += 12;
    } else if (meridian === 'AM' && hours === 12) {
      hour = 0;
    }

    // Construct a valid date string in the format 'YYYY-MM-DDTHH:MM:SS'
    const fullYear = year < 100 ? year + 2000 : year; // Adjusting the year if needed

    const date = new Date(fullYear, month - 1, day, hour, minutes, seconds);

    if (isNaN(date.getTime())) {
      console.error('Failed to create a valid Date object.');
      return null;
    }

    const formattedDate = date.toISOString();

    console.log('Formatted Date:', formattedDate);
    return formattedDate;
  }
  const formattedData = exceldata.map((item) => {
    let convertedDate = null;
    const bankStmDate = item.bank_stm_date;

    console.log(typeof bankStmDate);

    if (typeof bankStmDate === 'number') {
      convertedDate = bankStmDate ? new Date((bankStmDate - (25567 + 2)) * 86400 * 1000) : null;
      console.log(typeof convertedDate);
    }

    return {
      document_number: item.document_number,
      bank_stm_date:
        typeof bankStmDate === 'number'
          ? convertedDate
            ? convertedDate.toISOString().split('T')[0]
            : ''
          : changeDateFormat(bankStmDate),
      company_code: item.company_code,
      bank_name: item.bank_name,
      bank_account_num: item.bank_account_num,
      description: item.description,
      amount: item.amount,
      remarks: item.remarks,
      status: item.status,
      bank_account_id: item.bank_account_id,
      deposit_type_id: item.deposit_type_id,
    };
  });

  console.log(formattedData);

  const saveExcelData = async () => {
    let postData;

    try {
      if (formattedData) {
        postData = await postUndefinedDepositsFromExcelService(formattedData);
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
    if (postData.status === 200) {
      alert('Succefully Added');
      handleCloseDialog();
      try {
        const response = await getUndefinedDepositsService();

        if (response.status === 200) {
          // const filteredList = response.data.filter((item) => item.status === 'NEW' || item.status === 'REVERSED');
          setUserList(response.data);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }
  };

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const [openUploadExcelDialog, setOpenUploadExcelDialog] = useState(false);
  const handleCloseDialog = () => {
    setOpenUploadExcelDialog(false);
  };

  const handleOpenDialog = () => {
    setOpenUploadExcelDialog(true);
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

  const TABLE_HEAD = [
    { id: 'document_number', label: 'Document Number', alignRight: false },
    { id: 'bank_stm_date', label: 'Bank Stm Date', alignRight: false },
    { id: 'deposit_type_id', label: 'Deposit Type Id', alignRight: false },
    { id: 'bank_account_id', label: 'Bank Account Id', alignRight: false },
    { id: 'bank_account_num', label: 'Bank Account Num', alignRight: false },
    { id: 'amount', label: 'Amount', alignRight: false },
    { id: 'company_code', label: 'Company Code', alignRight: false },
    { id: 'description', label: 'Description', alignRight: false },
    { id: 'remarks', label: 'Remarks', alignRight: false },
    { id: 'status', label: 'Status', alignRight: false },
    // { id: 'bank_name', label: 'Bank Name', alignRight: false },
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;
  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredUsers.length && !!filterName;

  const exportData = filteredUsers.map((item) => ({
    document_number: item.document_number,
    bank_stm_date: getFormattedDateWithTime(item.bank_stm_date),
    deposit_type_id: item.deposit_type_id,
    bank_account_id: item.bank_account_id,
    bank_account_num: item.bank_account_num,
    amount: item.amount,
    company_code: item.company_code,
    description: item.description,
    remarks: item.remarks,
    status: item.status,
    // bank_name: item.bank_name,
  }));

  return (
    <>
      <Helmet>
        <title> COMS | Deposits </title>
      </Helmet>

      <div>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} className="actionButton">
          {/* <Typography variant="h4" gutterBottom>
            Deposit Collection List
          </Typography> */}
          {/* <Button
            variant="text"
            startIcon={<Iconify icon="mdi:approve" />}
            color="primary"
            onClick={() => approveDeposits(selected)}
            style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px', marginRight: '20px' }}
          >
            Reconcile
          </Button> */}
          {/* <Button
            variant="text"
            startIcon={<Iconify icon="mdi:approve" />}
            color="primary"
            onClick={() => approveDeposits(selected)}
            style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px' }}
          >
            Reject
          </Button> */}
          {/* <Button
            startIcon={<Iconify icon="mdi-chevron-double-down" />}
            style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px', textAlign: 'right' }}
            onClick={onDownload}
          >
            Export
          </Button> */}

          <CSVLink data={exportData} className="btn btn-success">
            Export Table
          </CSVLink>
          <Button
            style={{ backgroundColor: 'lightgray', color: 'black', marginLeft: '12px' }}
            onClick={handleOpenDialog}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleOpenDialog();
              }
            }}
          >
            Upload Excel Data{' '}
          </Button>
        </Stack>

        <Card>
          {/* <DepositListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onFilterDate={handleDateFilter}
            selectedUsers={selected}
            enableDelete
            user={user}
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
            bankstatuslist={bankReconIdAll}
          /> */}

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
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
                      document_number,
                      bank_stm_date,
                      company_code,
                      bank_name,
                      bank_account_num,
                      description,
                      amount,
                      remarks,
                      status,
                      bank_account_id,
                      deposit_type_id,
                    } = row;

                    const selectedUser = selected.indexOf(document_number) !== -1;
                    // const selectedUser = selected.findIndex((object) => object.itemId === cash_receipt_id) !== -1;

                    return (
                      <TableRow hover key={document_number} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        {/* <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedUser}
                            onChange={(event) => handleClick(event, cash_receipt_id)}
                            // onChange={(event) => handleClick(event, { itemId: cash_receipt_id })}
                          />
                        </TableCell> */}
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {document_number}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {getFormattedDateWithTime(bank_stm_date)}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {deposit_type_id}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {bank_account_id}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {bank_account_num}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {amount}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {company_code}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {description}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {remarks}
                        </TableCell>
                        <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                          {status}
                        </TableCell>
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
