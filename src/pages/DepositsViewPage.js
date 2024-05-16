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
import { format, parse } from 'date-fns';
import { useUser } from '../context/UserContext';
// components
import Scrollbar from '../components/scrollbar';
// sections
import {
  checkUserActionAssignment,
  deleteBankDepositAttachmentService,
  dowloadBankDepositReceiptService,
  getAllBankDepositsForAccountsService,
  getAllCustomerService,
  getBankAccountsViewService,
  getBankBranchesByBankService,
  getBankDepositViewFilterByDateService,
  getBankDepositViewFilterByFromDateService,
  getBankDepositViewFilterByToDateService,
  getBankListService,
  getDepositTypesService,
  getUserProfileDetails,
  upldateBankDepositService,
  uploadBankDepositAttachmentService,
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
  const [rowData, setRowData] = useState({});

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

  const [bankList, setBankList] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getBankListService();

        if (response.status === 200) {
          setBankList(response.data);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, []);
  console.log(bankList);

  const [bankBranchList, setBankBranchList] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        if (rowData.company_cust_bank_id) {
          const response = await getBankBranchesByBankService(rowData.company_cust_bank_id);

          if (response.status === 200) {
            setBankBranchList(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [rowData.company_cust_bank_id]);
  console.log(bankBranchList);

  const [customerBankAccountList, setCustomerBankAccountList] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        if (user) {
          const response = await getBankAccountsViewService(user);

          if (response.status === 200) {
            setCustomerBankAccountList(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [user]);
  console.log(customerBankAccountList);

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
      { id: 'entry_date', label: 'Entry Date', alignRight: false },
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
      { id: 'entry_date', label: 'Entry Date', alignRight: false },
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

  const handleDateChange = (date, name) => {
    const formattedDate = format(date, 'dd/MM/yy');
    setFilterInfo({ ...filterInfo, [name]: formattedDate });
    // setFilterDetails1({ ...filterDetails1, from: formattedDate });
  };

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

  const parseDate = (dateString) => {
    return parse(dateString, 'dd/MM/yy', new Date());
  };

  const handleDateFilter = async () => {
    let filteredData = USERLIST;

    if (filterInfo.from && filterInfo.to) {
      const requestBody = {
        toDepositDate: parseDate(filterInfo.to),
        fromDepositDate: parseDate(filterInfo.from),
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
    'Entry Date': getFormattedDateWithTime(item.creation_date),
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
  const [openEdit, setOpenEdit] = useState(false);

  const onValueChange = (e) => {
    setRowData({ ...rowData, [e.target.name]: e.target.value });
  };

  const closeDialog = () => {
    setFilteredCustomerList([]);
    setShowFilteredCustomerList(false);

    setFilteredPaymentMethodList([]);
    setShowFilteredPaymentMethodList(false);

    setFilteredPaymentTypeList([]);
    setShowFilteredPaymentTypeList(false);

    setFilteredDepositorBankList([]);
    setShowFilteredDepositorBankList(false);

    setFilteredDepositorBankBranchList([]);
    setShowFilteredDepositorBankBranchList(false);

    setFilteredCompanyBankAccountList([]);
    setShowFilteredCompanyBankAccountList(false);

    setOpenEdit(false);
  };

  const openEditDialog = (event) => {
    console.log(event);
    setRowData(event);
    setOpenEdit(true);
  };

  const onEditDeposit = async () => {
    const requestBody = {
      depositDate: rowData.deposit_date,
      amount: rowData.amount,
      payFromCustomer: rowData.pay_from_customer,
      depositTypeId: rowData.deposit_type_id,
      depositorName: rowData.depositor_name,
      companyCustBankId: rowData.company_cust_bank_id,
      companyCustBankBranchId: rowData.company_cust_bank_branch_id,
      remittanceBankAccountId: rowData.remittance_bank_account_id,
      receiptNumber: rowData.receipt_number,
      invoiceNumber: rowData.invoice_number,
      uploadedFilename: rowData.uploaded_filename,
      remarks: rowData.remarks,
      lastUpdatedBy: user.user_id,
      cashReceiptId: rowData.cash_receipt_id,
    };
    const response = await upldateBankDepositService(user, requestBody);

    const alertMessage = response.status === 200 ? 'Updated successfully' : 'Process failed! Try again';
    alert(alertMessage);
    closeDialog();
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

  // payment type
  const paymentTypeList = depositTypeList.filter((value) => value.deposit_type_name === rowData.deposit_type_name);
  const [filteredPaymentTypeList, setFilteredPaymentTypeList] = useState([]);
  const [showPaymentTypeList, setShowFilteredPaymentTypeList] = useState(false);

  const handleInputPaymentTypeChange = (event) => {
    setShowFilteredPaymentTypeList(true);

    const input = event.target.value;
    const name = 'deposit_type';
    setRowData({ ...rowData, [name]: input });

    const filtered = paymentTypeList.filter((item) => item.deposit_type.toLowerCase().includes(input.toLowerCase()));
    setFilteredPaymentTypeList(filtered);
  };

  const handlePaymentTypeClick = (value) => {
    const name1 = 'deposit_type';
    const name2 = 'deposit_type_id';
    setRowData({
      ...rowData,
      [name1]: value.deposit_type,
      [name2]: value.deposit_type_id,
    });

    setShowFilteredPaymentTypeList(false);
  };

  // depositor bank
  const [filteredDepositorBankList, setFilteredDepositorBankList] = useState([]);
  const [showDepositorBankList, setShowFilteredDepositorBankList] = useState(false);

  const handleInputDepositorBankChange = (event) => {
    setShowFilteredDepositorBankList(true);

    const input = event.target.value;
    const name = 'depositor_bank';
    setRowData({ ...rowData, [name]: input });

    const filtered = bankList.filter((item) => item.bank_name.toLowerCase().includes(input.toLowerCase()));
    setFilteredDepositorBankList(filtered);
  };

  const handleDepositorBankClick = (value) => {
    const name1 = 'depositor_bank';
    const name2 = 'company_cust_bank_id';
    setRowData({
      ...rowData,
      [name1]: value.bank_name,
      [name2]: value.bank_id,
    });

    setShowFilteredDepositorBankList(false);
  };

  // depositor bank Branch
  const [filteredDepositorBankBranchList, setFilteredDepositorBankBranchList] = useState([]);
  const [showDepositorBankBranchList, setShowFilteredDepositorBankBranchList] = useState(false);

  const handleInputDepositorBankBranchChange = (event) => {
    setShowFilteredDepositorBankBranchList(true);

    const input = event.target.value;
    const name = 'depositor_branch';
    setRowData({ ...rowData, [name]: input });

    const filtered = bankBranchList.filter((item) => item.bank_branch_name.toLowerCase().includes(input.toLowerCase()));
    setFilteredDepositorBankBranchList(filtered);
  };

  const handleDepositorBankBranchClick = (value) => {
    const name1 = 'depositor_branch';
    const name2 = 'company_cust_bank_branch_id';
    setRowData({
      ...rowData,
      [name1]: value.bank_branch_name,
      [name2]: value.bank_branch_id,
    });

    setShowFilteredDepositorBankBranchList(false);
  };

  // company bank account
  const [filteredCompanyBankAccountList, setFilteredCompanyBankAccountList] = useState([]);
  const [showCompanyBankAccountList, setShowFilteredCompanyBankAccountList] = useState(false);

  const handleInputCompanyBankAccountChange = (event) => {
    setShowFilteredCompanyBankAccountList(true);

    const input = event.target.value;
    const name = 'company_account';
    setRowData({ ...rowData, [name]: input });

    const list = customerBankAccountList.filter((value) => value.deposit_type_set_id === rowData.deposit_type_set_id);
    console.log(list);
    const filtered = list.filter((item) => item.bank_account_name.toLowerCase().includes(input.toLowerCase()));
    setFilteredCompanyBankAccountList(filtered);
  };

  const handleCompanyBankAccountClick = (value) => {
    const name1 = 'company_account';
    const name2 = 'remittance_bank_account_id';
    const name3 = 'company_bank';
    const name4 = 'company_name';
    setRowData({
      ...rowData,
      [name1]: value.bank_account_name,
      [name2]: value.bank_account_id,
      [name3]: value.bank_name,
      [name4]: value.company_name,
    });

    setShowFilteredCompanyBankAccountList(false);
  };

  // image upload and delete method
  const uplodPhoto = async (event, existedFileName) => {
    try {
      const selectedFile = event.target.files[0];

      if (selectedFile) {
        console.log('Selected file:', selectedFile);

        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await uploadBankDepositAttachmentService(user, formData);
        console.log(uploadResponse.data);

        if (uploadResponse.status === 200) {
          const requestBody = {
            fileName: existedFileName,
          };
          const deleteResponse = await deleteBankDepositAttachmentService(user, requestBody);

          if (deleteResponse.status === 200) {
            const input = uploadResponse.data.value;
            const name = 'uploaded_filename';
            setRowData({ ...rowData, [name]: input });
          } else {
            throw new Error('File delete failed!');
          }
        } else {
          throw new Error('File upload failed!');
        }
      } else {
        throw new Error('File not selected!');
      }
    } catch (error) {
      console.log(error.message);
      alert('Process failed! Try again');
    }
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
            onDateChange={handleDateChange}
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
                      creation_date,
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
                          {/* {getFormattedDate(deposit_date)} */}
                          {getFormattedDateWithTime(creation_date)}
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
                      {rowData.deposit_type_name && (
                        <TextField
                          name="deposit_type"
                          label="Payment Type"
                          autoComplete="given-name"
                          fullWidth
                          style={{ backgroundColor: 'white' }}
                          InputLabelProps={{ shrink: true }}
                          value={rowData.deposit_type ? rowData.deposit_type : ''}
                          onChange={(e) => handleInputPaymentTypeChange(e)}
                        />
                      )}
                      {showPaymentTypeList && (
                        <ul
                          style={{
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            zIndex: 1,
                          }}
                        >
                          {filteredPaymentTypeList.map((suggestion, index) => (
                            <MenuItem key={index} onClick={() => handlePaymentTypeClick(suggestion)}>
                              {suggestion.deposit_type}
                            </MenuItem>
                          ))}
                        </ul>
                      )}
                      {rowData.deposit_type_set_id === 11 && (
                        <TextField
                          name="depositor_name"
                          label="Depositor Name"
                          autoComplete="given-name"
                          fullWidth
                          style={{ backgroundColor: 'white' }}
                          InputLabelProps={{ shrink: true }}
                          value={rowData.depositor_name ? rowData.depositor_name : ''}
                          onChange={(e) => onValueChange(e)}
                        />
                      )}
                      {rowData.deposit_type_set_id === 11 && (
                        <TextField
                          name="depositor_bank"
                          label="Depositor Bank"
                          autoComplete="given-name"
                          fullWidth
                          style={{ backgroundColor: 'white' }}
                          InputLabelProps={{ shrink: true }}
                          value={rowData.depositor_bank ? rowData.depositor_bank : ''}
                          onChange={(e) => handleInputDepositorBankChange(e)}
                        />
                      )}
                      {showDepositorBankList && (
                        <ul
                          style={{
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            zIndex: 1,
                          }}
                        >
                          {filteredDepositorBankList.map((suggestion, index) => (
                            <MenuItem key={index} onClick={() => handleDepositorBankClick(suggestion)}>
                              {suggestion.bank_name}
                            </MenuItem>
                          ))}
                        </ul>
                      )}
                      {rowData.deposit_type_set_id === 11 && (
                        <TextField
                          name="depositor_branch"
                          label="Depositor Branch"
                          autoComplete="given-name"
                          fullWidth
                          style={{ backgroundColor: 'white' }}
                          InputLabelProps={{ shrink: true }}
                          value={rowData.depositor_branch ? rowData.depositor_branch : ''}
                          onChange={(e) => handleInputDepositorBankBranchChange(e)}
                        />
                      )}
                      {showDepositorBankBranchList && (
                        <ul
                          style={{
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            zIndex: 1,
                          }}
                        >
                          {filteredDepositorBankBranchList.map((suggestion, index) => (
                            <MenuItem key={index} onClick={() => handleDepositorBankBranchClick(suggestion)}>
                              {suggestion.bank_branch_name}
                            </MenuItem>
                          ))}
                        </ul>
                      )}
                      {rowData.deposit_type_set_id && (
                        <TextField
                          fullWidth
                          name="company_account"
                          label={rowData.deposit_type_name === 'MFS' ? 'Company Account' : 'Company Wallet'}
                          autoComplete="given-name"
                          style={{ backgroundColor: 'white' }}
                          InputLabelProps={{ shrink: true }}
                          value={rowData.company_account ? rowData.company_account : ''}
                          onChange={(e) => handleInputCompanyBankAccountChange(e)}
                        />
                      )}
                      {showCompanyBankAccountList && (
                        <ul
                          style={{
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            zIndex: 1,
                          }}
                        >
                          {filteredCompanyBankAccountList.map((suggestion, index) => (
                            <MenuItem key={index} onClick={() => handleCompanyBankAccountClick(suggestion)}>
                              {suggestion.bank_account_name}, {suggestion.bank_name}, {suggestion.company_name}
                            </MenuItem>
                          ))}
                        </ul>
                      )}
                      <TextField
                        disabled
                        name="company_bank"
                        label="Company Bank"
                        autoComplete="given-name"
                        fullWidth
                        style={{ backgroundColor: 'white' }}
                        InputLabelProps={{ shrink: true }}
                        value={rowData.company_bank ? rowData.company_bank : ''}
                      />
                      <TextField
                        disabled
                        name="company_name"
                        label="Company Name"
                        autoComplete="given-name"
                        fullWidth
                        style={{ backgroundColor: 'white' }}
                        InputLabelProps={{ shrink: true }}
                        value={rowData.company_name ? rowData.company_name : ''}
                      />
                      {rowData.deposit_type_set_id && (
                        <TextField
                          fullWidth
                          name="receipt_number"
                          label={
                            rowData.deposit_type_name === 'CHEQUE'
                              ? 'Cheque Number'
                              : rowData.deposit_type_name === 'MFS'
                              ? 'Transaction ID'
                              : 'Receipt Number'
                          }
                          autoComplete="given-name"
                          style={{ backgroundColor: 'white' }}
                          InputLabelProps={{ shrink: true }}
                          value={rowData.receipt_number ? rowData.receipt_number : ''}
                          onChange={(e) => onValueChange(e)}
                        />
                      )}
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
                      <div style={{ display: 'flex' }}>
                        <TextField
                          required
                          type="file"
                          name="uploaded_filename"
                          label="Deposit Attachment"
                          autoComplete="given-name"
                          fullWidth
                          // style={{ backgroundColor: 'white' }}
                          onChange={(e) => uplodPhoto(e, rowData.uploaded_filename)}
                          InputLabelProps={{ shrink: true }}
                        />
                        <Button
                          style={{ marginLeft: '10px', backgroundColor: 'lightgray', color: 'black' }}
                          onClick={() => viewAttachment(rowData.uploaded_filename)}
                        >
                          View
                        </Button>
                      </div>
                      <TextareaAutosize
                        name="remarks"
                        placeholder="Remarks"
                        style={{ width: '100%', height: '55px' }}
                        value={rowData.remarks ? rowData.remarks : ''}
                        onChange={(e) => onValueChange(e)}
                      />
                    </Stack>

                    <Grid container spacing={2} style={{ marginTop: '5px' }}>
                      <Grid item xs={3} style={{ display: 'flex' }}>
                        <Button
                          style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
                          onClick={onEditDeposit}
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
