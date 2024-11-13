/* eslint-disable no-restricted-globals */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-key */
/* eslint-disable camelcase */
// import Button from '@mui/material/Button';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
// @mui
import { Card, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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
  getBankReconIdDetails,
  getDepositTypesService,
  getTerritoryCompetitorsService,
  getTerritoryListsService,
  getTerritoryPerInsightsCompetitorsService,
  getUserProfileDetails,
  upldateBankDepositService,
  uploadBankDepositAttachmentService,
} from '../Services/ApiServices';
// css
import '../sections/@dashboard/deposits/depositStyle.css';

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
    const filteredArray = array.filter((_user) => {
      const searchValue = _user.search_all ? _user.search_all.toLowerCase() : '';
      return searchValue.includes(query.toLowerCase());
    });
    console.log(filteredArray);
    return filteredArray;
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

  const [territoryIds, setTerritoryIds] = useState([]);

  const [selectedTerritoryId, setSelectedTerritoryId] = useState(null);
  const { territory_id } = useParams(); // Get territory_id from URL params
  const [territoryLists, setTerritoryLists] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [allCompetitors, setAllCompetitors] = useState([]);
  console.log(territory_id);

  useEffect(() => {
    if (territory_id) {
      console.log(territory_id);

      const fetchData = async () => {
        try {
          const territoryResponse = await getTerritoryListsService(territory_id);
          console.log(territoryResponse);

          if (territoryResponse.status === 200) {
            setTerritoryLists(territoryResponse.data);
          }
          console.log(territoryLists);

          const competitorsResponse = await getTerritoryPerInsightsCompetitorsService(territory_id);
          if (competitorsResponse.status === 200) {
            setCompetitors(competitorsResponse.data);
          }
          console.log(competitors);

          const allCompetitorsResponse = await getTerritoryCompetitorsService(territory_id);
          if (allCompetitorsResponse.status === 200) {
            setAllCompetitors(allCompetitorsResponse.data);
          }
        } catch (error) {
          console.error('Error fetching data for selected territory:', error);
        }
      };

      fetchData();
    }
  }, [territory_id]);
  console.log(territoryLists);

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
      { id: 'territory_name', label: 'Territory Name', alignRight: false },
      { id: 'town_name', label: 'Town Name', alignRight: false },
      { id: 'ambassador_name', label: 'Ambassador Name', alignRight: false },
      { id: 'distributor_count', label: 'Distributor Count', alignRight: false },
      { id: 'sales_officer_count', label: 'Sales Officer Count', alignRight: false },
      { id: 'total_outlet_count', label: 'Total Outlet Count', alignRight: false },
      { id: 'company_outlet_count', label: 'Company Outlet Count', alignRight: false },
      { id: 'population_count', label: 'Population Count', alignRight: false },
      { id: 'monthly_sales_actual', label: 'Monthly Sales Actual', alignRight: false },
      { id: 'monthly_sales_target', label: 'Monthly Sales Target', alignRight: false },
      { id: 'monthly_collection_actual', label: 'Monthly Collection Actual', alignRight: false },
      { id: 'monthly_collection_target', label: 'Monthly Collection Target', alignRight: false },
      { id: 'competitor_name', label: 'Competitor Name', alignRight: false },
      { id: 'competitor_monthly_sales', label: 'Competitor Monthly Sales', alignRight: false },
      { id: 'bill_board_count', label: 'Bill Board Count', alignRight: false },

      // { id: '' },
    ];
  } else {
    TABLE_HEAD = [
      { id: 'territory_name', label: 'Territory Name', alignRight: false },
      { id: 'town_name', label: 'Town Name', alignRight: false },
      { id: 'ambassador_name', label: 'Ambassador Name', alignRight: false },
      { id: 'distributor_count', label: 'Distributor Count', alignRight: false },
      { id: 'sales_officer_count', label: 'Sales Officer Count', alignRight: false },
      { id: 'total_outlet_count', label: 'Total Outlet Count', alignRight: false },
      { id: 'company_outlet_count', label: 'Company Outlet Count', alignRight: false },
      { id: 'population_count', label: 'Population Count', alignRight: false },
      { id: 'monthly_sales_actual', label: 'Monthly Sales Actual', alignRight: false },
      { id: 'monthly_sales_target', label: 'Monthly Sales Target', alignRight: false },
      { id: 'monthly_collection_actual', label: 'Monthly Collection Actual', alignRight: false },
      { id: 'monthly_collection_target', label: 'Monthly Collection Target', alignRight: false },
      { id: 'competitor_name', label: 'Competitor Name', alignRight: false },
      { id: 'competitor_monthly_sales', label: 'Competitor Monthly Sales', alignRight: false },
      { id: 'bill_board_count', label: 'Bill Board Count', alignRight: false },
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
    stutus: '',
    username: '',
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
        status: '',
        username: '',
      });
    } else {
      alert('Process failed! Please try again');
    }
  };
  const parseDate = (dateString) => parse(dateString, 'dd/MM/yy', new Date());
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
    let filteredData = USERLIST;

    if (filterInfo.from && filterInfo.to) {
      const toDate = parseDate(filterInfo.to);
      const fromDate = parseDate(filterInfo.from);
      const fromDepositDateBackend = convertToFrontendDate(fromDate);
      const toDepositDateBackend = convertToFrontendDate(toDate);
      const requestBody = {
        toDepositDate: toDepositDateBackend,
        fromDepositDate: fromDepositDateBackend,
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

    if (filterInfo.status) {
      filteredData = filteredData.filter((item) => item.bank_status === filterInfo.status);
    }

    if (filterInfo.username) {
      filteredData = filteredData.filter((item) => item.user_name === filterInfo.username);
    }

    setUserList(filteredData);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;
  const filteredUsers = applySortFilter(competitors, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredUsers.length && !!filterName;

  const exportData = filteredUsers.map((item) => ({
    Status: item.status,
    'Doc Value': item.doc_sequence_value,
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
      lastUpdatedBy: account.user_id,
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

      <div>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} className="actionButton">
          <CSVLink data={exportData} className="btn btn-success">
            Export Table
          </CSVLink>
        </Stack>

        <Card>
          {/* <DepositListToolbar
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
            bankstatuslist={bankReconIdAll}
          /> */}

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TableBody>
                  {/* Territory ID Selection Row */}
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ borderBottom: '1px solid #000', paddingBottom: '8px' }}>
                      {territoryLists.length > 0 ? (
                        <div key={territoryLists.territory_id} style={{ margin: '5px' }}>
                          <strong>{territoryLists[0].territory_name || `ID: ${territoryLists[0].territory_id}`}</strong>
                        </div>
                      ) : (
                        <div>No territory data available</div>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      colSpan={4} // Adjust to match the total columns in your layout
                      align="center"
                      sx={{
                        borderBottom: '1px solid #000',
                        paddingBottom: '8px',
                        fontWeight: 'bold',
                        fontSize: '20px',
                        textAlign: 'left',
                      }}
                    >
                      <strong>Territory Name:</strong> {territoryLists[0]?.territory_name || 'N/A'}
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <strong>TSM Manager Name:</strong> {territoryLists[0]?.full_name || 'N/A'}
                    </TableCell>
                  </TableRow>

                  {/* Territory Details Row */}
                  <TableRow>
                    {/* Territory Lists Table */}

                    <TableCell
                      colSpan={1}
                      align="left"
                      sx={{ width: '30%', verticalAlign: 'top', border: '1px solid #000' }} // Add border to each cell
                    >
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell align="left" sx={{ border: '1px solid #000', height: '80px' }}>
                                <strong>Town Name</strong>
                              </TableCell>
                              <TableCell align="left" sx={{ border: '1px solid #000' }}>
                                <strong>Ambassador Name</strong>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {territoryLists.map((territoryRow, index) => (
                              <TableRow key={`territory-${index}`}>
                                <TableCell
                                  align="left"
                                  sx={{ border: '1px solid #000' }} // Add border to each cell
                                >
                                  {territoryRow.town_name}
                                </TableCell>
                                <TableCell
                                  align="left"
                                  sx={{ border: '1px solid #000' }} // Add border to each cell
                                >
                                  {territoryRow.ambassador_name}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </TableCell>

                    {/* Competitors Data in Middle Table Cell */}
                    <TableCell
                      colSpan={1}
                      align="left"
                      sx={{ width: '40%', verticalAlign: 'top', border: '1px solid #000' }} // Add border to each cell
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          fontSize: '20px',
                        }}
                      >
                        {competitors.map((competitorRow, index) => (
                          <>
                            <div
                              key={`competitor-${index}`}
                              style={{
                                padding: '5px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #000',
                              }}
                            >
                              <strong style={{ flex: '0 0 auto' }}>Distributor Count:</strong>
                              <span style={{ flex: '1 1 auto', textAlign: 'right' }}>
                                {competitorRow.distributor_count}
                              </span>
                            </div>
                            <div
                              key={`sales-officer-${index}`}
                              style={{
                                padding: '5px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #000',
                              }}
                            >
                              <strong style={{ flex: '0 0 auto' }}>Sales Officer Count:</strong>
                              <span style={{ flex: '1 1 auto', textAlign: 'right' }}>
                                {competitorRow.sales_officer_count}
                              </span>
                            </div>
                            <div
                              key={`total-outlet-${index}`}
                              style={{
                                padding: '5px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #000',
                              }}
                            >
                              <strong style={{ flex: '0 0 auto' }}>Total Outlet Count:</strong>
                              <span style={{ flex: '1 1 auto', textAlign: 'right' }}>
                                {competitorRow.total_outlet_count}
                              </span>
                            </div>
                            <div
                              key={`company-outlet-${index}`}
                              style={{
                                padding: '5px',
                                borderBottom: '1px solid #000',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <strong style={{ flex: '0 0 auto' }}>Company Outlet Count:</strong>
                              <span style={{ flex: '1 1 auto', textAlign: 'right' }}>
                                {competitorRow.company_outlet_count}
                              </span>
                            </div>
                            <div
                              key={`population-${index}`}
                              style={{
                                padding: '5px',
                                borderBottom: '1px solid #000',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <strong style={{ flex: '0 0 auto' }}>Population Count:</strong>
                              <span style={{ flex: '1 1 auto', textAlign: 'right' }}>
                                {competitorRow.population_count}
                              </span>
                            </div>
                            <div
                              key={`monthly-sales-actual-${index}`}
                              style={{
                                padding: '5px',
                                borderBottom: '1px solid #000',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <strong style={{ flex: '0 0 auto' }}>Monthly Sales Actual:</strong>
                              <span style={{ flex: '1 1 auto', textAlign: 'right' }}>
                                {getFormattedPrice(competitorRow.monthly_sales_actual)}
                              </span>
                            </div>
                            <div
                              key={`monthly-sales-target-${index}`}
                              style={{
                                padding: '5px',
                                borderBottom: '1px solid #000',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <strong style={{ flex: '0 0 auto' }}>Monthly Sales Target:</strong>
                              <span style={{ flex: '1 1 auto', textAlign: 'right' }}>
                                {getFormattedPrice(competitorRow.monthly_sales_target)}
                              </span>
                            </div>
                            <div
                              key={`monthly-collection-actual-${index}`}
                              style={{
                                padding: '5px',
                                borderBottom: '1px solid #000',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <strong style={{ flex: '0 0 auto' }}>Monthly Collection Actual:</strong>
                              <span style={{ flex: '1 1 auto', textAlign: 'right' }}>
                                {getFormattedPrice(competitorRow.monthly_collection_actual)}
                              </span>
                            </div>
                            <div
                              key={`monthly-collection-target-${index}`} // Fixed the key syntax
                              style={{
                                padding: '5px',
                                // borderBottom: '1px solid #000', // Add border here
                                paddingBottom: '8px', // Add padding for spacing
                                paddingTop: '8px', // Add padding for spacing
                                width: '100%', // Ensure full width
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  width: '100%', // Ensure this div also takes full width
                                }}
                              >
                                <strong style={{ flex: '0 0 auto' }}>Monthly Collection Target:</strong>
                                <span style={{ flex: '1 1 auto', textAlign: 'right' }}>
                                  {getFormattedPrice(competitorRow.monthly_collection_target)}
                                </span>
                              </div>
                            </div>
                          </>
                        ))}
                      </div>
                    </TableCell>

                    {/* All Competitors Data in Last Table Cell */}
                    <TableCell
                      colSpan={1}
                      align="left"
                      sx={{ width: '30%', verticalAlign: 'top', border: '1px solid #000' }} // Add border to each cell
                    >
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell align="left" sx={{ border: '1px solid #000' }}>
                                <strong>Competitor Name</strong>
                              </TableCell>
                              <TableCell align="right" sx={{ border: '1px solid #000' }}>
                                <strong>Competitor Monthly Average Sales</strong>
                              </TableCell>
                              <TableCell align="right" sx={{ border: '1px solid #000' }}>
                                <strong>Bill Board Count</strong>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {allCompetitors.map((allCompetitorRow, index) => (
                              <TableRow key={`allCompetitor-${index}`}>
                                <TableCell align="left" sx={{ border: '1px solid #000' }}>
                                  {allCompetitorRow.competitor_name}
                                </TableCell>
                                <TableCell align="right" sx={{ border: '1px solid #000' }}>
                                  {getFormattedPrice(allCompetitorRow.competitor_monthly_sales)}
                                </TableCell>
                                <TableCell align="right" sx={{ border: '1px solid #000' }}>
                                  {allCompetitorRow.bill_board_count}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          {/* <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          /> */}
        </Card>
      </div>
    </>
  );
}
