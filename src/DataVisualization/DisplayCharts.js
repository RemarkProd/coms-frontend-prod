/* eslint-disable react/self-closing-comp */
/* eslint-disable camelcase */
/* eslint-disable spaced-comment */
/* eslint-disable dot-notation */
/* eslint-disable arrow-body-style */
/* eslint-disable react/void-dom-elements-no-children */
/* eslint-disable no-return-assign */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/* eslint-disable no-unused-vars */
/* eslint-disable vars-on-top */
/* eslint-disable react/no-unknown-property */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-const-assign */
/* eslint-disable no-var */
/* eslint-disable object-shorthand */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-restricted-globals */
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import { parse } from 'date-fns';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { sentenceCase } from 'change-case';
import Select from 'react-select';
import {
  dowloadBankDepositReceiptService,
  getAllBankDepositsForAccountsService,
  getBankReconIdDetails,
  getBrandingAssetsChildItemsService,
  getBrandingAssetsItemImagesService,
  getBrandingAssetsItemsService,
  getCustomerSummaryList,
  getRegionService,
  getShopsListService,
  getUserProfileDetails,
} from '../Services/ApiServices';
// components
import Progressbar from '../components/ProgressBar/Progress_bar';
import Scrollbar from '../components/scrollbar';

// @mui
import { useUser } from '../context/UserContext';

import { UserListHead } from '../sections/@dashboard/user';

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
    return filter(array, (_user) => _user.location_code.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}
const TABLE_HEAD = [
  { id: '', label: '', alignRight: false },
  { id: 'shop_number', label: 'Shop No', alignRight: false },
  { id: 'shop_name', label: 'Shop Name', alignRight: false },
  { id: 'mobile', label: 'Mobile', alignRight: false },
  { id: 'owner_name', label: 'Owner', alignRight: false },
  { id: 'category', label: 'Category', alignRight: false },
];
const TABLE_HEADs = [
  { id: '', label: '', alignRight: false },
  { id: 'item_name', label: 'Item Name', alignRight: false },
  // { id: 'Item_category', label: 'Item Category', alignRight: false },
];
const TABLE_HEADss = [
  { id: '', label: '', alignRight: false },
  { id: 'child_item_name', label: 'Child Item Name', alignRight: false },
  // { id: 'child_category', label: 'Child Category', alignRight: false },
];

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
const parseDate = (dateString) => parse(dateString, 'dd/MM/yy', new Date());
const Accordion = styled((props) => <MuiAccordion disableGutters elevation={0} square {...props} />)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));
export default function DisplayCharts() {
  const navigate = useNavigate();
  const tableref = useRef(null);
  const { user } = useUser();
  const [showShops, setShowShops] = useState(true);
  const [showItems, setShowItems] = useState(false);
  const [showChilds, setShowChilds] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noImages, setNoImages] = useState(false);

  const [filterDetails, setFilterDetails] = useState({});

  //Start From here ////////////////////////////////
  const [inputValue, setInputValue] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [filterItem, setFilterItem] = useState('');
  const [filterChild, setFilterChild] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [selectedItem, setSelectedItem] = useState([]);
  const [account, setAccount] = useState({});
  const [USERSLIST, setUsersList] = useState([]);
  const [USERLIST, setUserList] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rowData, setRowData] = useState({});
  console.log(user);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = React.useState('panel2');

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };
  const handlePrev = () => {
    setActivateIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setActivateIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  useEffect(() => {
    async function fetchData() {
      try {
        if (user) {
          const accountDetails = await getUserProfileDetails(user); // Call your async function here
          if (accountDetails.status === 200) setAccount(accountDetails.data); // Set the account details in the component's state
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
          console.log(account.user_id);
          const response = await getAllBankDepositsForAccountsService(user);

          if (response.status === 200) {
            // const filteredList = response.data.filter((item) => item.status === 'RECONCILED');
            setUsersList(response.data);
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
  console.log(USERSLIST);

  const [summaryCustomerList, setSummaryCustomerList] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        if (user) {
          const customerDetails = await getCustomerSummaryList(); // Call your async function here
          if (customerDetails.status === 200) {
            console.log(customerDetails.data);

            setSummaryCustomerList(customerDetails.data);
          } // Set the account details in the component's state
        }
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [user]);
  console.log(summaryCustomerList);

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
  const shopIdNameArray = USERLIST
    ? USERLIST.map(({ shop_id, shop_name, contact_number }) => ({
        shop_id,
        shop_name,
        contact_number,
      }))
    : [];
  console.log(shopIdNameArray);

  //   selecting Region
  const [regions, setRegions] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let response = {};
        if (user) response = await getRegionService(user); // Call your async function here

        if (response.status === 200) setRegions(response.data);
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [user]);
  console.log(regions);

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

  let TABLE_HEAD = [];
  if (canEdit) {
    TABLE_HEAD = [
      { id: 'attachment', label: 'Receipt Attachment', alignRight: false },
      { id: 'status', label: 'Status', alignRight: false },
      { id: 'remarks', label: 'Remarks', alignRight: false },
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

      // { id: '' },
    ];
  } else {
    TABLE_HEAD = [
      { id: 'attachment', label: 'Receipt Attachment', alignRight: false },
      { id: 'status', label: 'Status', alignRight: false },
      { id: 'remarks', label: 'Remarks', alignRight: false },
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

      // { id: '' },
    ];
  }

  const TABLE_HEAD_SUMMARY = [
    { id: 'customer_group', label: 'Customer Group', alignRight: false },
    { id: 'deposit_amount', label: 'Deposit Amount', alignRight: false },
    { id: 'target_amount', label: 'Target Amount', alignRight: false },
  ];

  const selectedUsers = [];
  const [items, setItems] = useState([]);
  const [childItems, setChildItems] = useState([]);
  const fetchDataForSpecificShop = async (specificElement) => {
    console.log(specificElement);
    try {
      let response = {};
      response = await getBrandingAssetsItemsService(user, parseInt(specificElement, 10));
      console.log(response.data);
      if (response.status === 200) setItems(response.data);
      if (response) {
        setShowItems(true);
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };
  const fetchDataForSpecificItem = async (specificElements) => {
    try {
      setChildItems([]);
      setShowChilds(false);

      let response = {};
      response = await getBrandingAssetsChildItemsService(user, specificElements);
      console.log(response.data);
      if (response.status === 200) {
        setChildItems(response.data);
        setShowChilds(true);
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };

  const [imageSrc, setImageSrc] = useState([]);

  const viewAttachment = async (value) => {
    console.log(value);
    try {
      const filename = value;
      const requestBody = { fileName: filename };
      const response = await dowloadBankDepositReceiptService(user, requestBody);
      if (response.status === 200) {
        const base64String = btoa(
          new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        const dataURL = `data:image/jpeg;base64,${base64String}`;
        setImageSrc((prevImageSrc) => {
          const updatedImages = [...prevImageSrc, dataURL];
          if (updatedImages.length === response.data.length) {
            setLoading(false); // All images have been processed, stop loading
          }
          return updatedImages;
        });
      }
    } catch (error) {
      console.error('Error during image download:', error);
      setLoading(false); // Stop loading on error
    }
  };
  console.log(imageSrc);

  const [images, setImages] = useState([]);
  const fetchImageForSpecificItem = async (specificElements) => {
    try {
      const response = await getBrandingAssetsItemImagesService(user, specificElements);
      console.log(response.data);
      if (response.status === 200 && response.data.length > 0) {
        setImages(response.data);
        response.data.forEach((image) => {
          if (image.uploaded_filename) {
            viewAttachment(image.uploaded_filename);
          } else {
            setImageSrc(['https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png']);
          }
        });
      } else {
        setNoImages(true);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };
  console.log(images);
  console.log(imageSrc);

  const handleClick = (event, name) => {
    console.log(event);
    console.log(event.target.checked);
    console.log(name);
    fetchDataForSpecificShop(name);
    setSelected([name]);
    setShowImage(false);
    setShowChilds(false);
    console.log('toselectedUsers : ', selectedUsers);
  };
  const [showimage, setShowImage] = useState(false);
  const handleItemClick = async (event, inventoryItemId) => {
    // Clear the existing images and set loading state
    setImageSrc([]);
    setLoading(true);
    setNoImages(false);
    setActivateIndex(0);

    await fetchDataForSpecificItem(inventoryItemId);
    await fetchImageForSpecificItem(inventoryItemId);

    console.log(inventoryItemId);
    console.log(images);

    setSelectedItem([inventoryItemId]); // Only one item can be selected with radio button
    setShowImage(true);
  };
  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };
  const handleFilterItem = (event) => {
    setPage(0);
    setFilterItem(event.target.value);
  };
  const handleFilterChild = (event) => {
    setPage(0);
    setFilterChild(event.target.value);
  };
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRequestItemSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.location_id);
      setSelected(newSelecteds);

      return;
    }
    console.log('allselectedUsers : ', selectedUsers);
    setSelected([]);
  };

  const handleSelectItemClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredItems.map((row) => row.inventory_item_id);
      setSelectedItem(newSelecteds);
    } else {
      setSelectedItem([]);
    }
  };
  const carouselContentStyle = {
    display: 'flex',
    // alignItems: 'center', // Center items vertically
    width: '100%',
    justifyContent: 'space-between', // Add space between description and image
  };

  const carouselDescriptionStyle = {
    flex: 1, // Allow the description to take up available space
    marginLeft: '100px', // Add some space between the description and the image
  };

  const carouselImageStyle = {
    flex: 1, // Allow the image to take up available space
    maxWidth: '50%', // Ensure the image does not take up more than half the space
    marginRight: '100px',
  };

  const prevButtonStyle = {
    color: 'black', // Set the color of the button to black
  };

  const nextButtonStyle = {
    color: 'black', // Set the color of the button to black
  };

  const iconStyle = {
    // SVG icon color will also be black
    backgroundImage:
      "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%23000' viewBox='0 0 16 16'%3e%3cpath d='M11.354 1.354a.5.5 0 0 0-.708 0L4.5 7.5l6.146 6.146a.5.5 0 0 0 .708-.708L5.207 7.5l6.147-6.146a.5.5 0 0 0 0-.708z'/%3e%3c/svg%3e\")",
  };
  const nextIconStyle = {
    // Use a forward arrow SVG for the next button icon
    backgroundImage:
      "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%23000' viewBox='0 0 16 16'%3e%3cpath d='M11.354 1.354a.5.5 0 0 0-.708 0L4.5 7.5l6.146 6.146a.5.5 0 0 0 .708-.708L5.207 7.5l6.147-6.146a.5.5 0 0 0 0-.708z' transform='rotate(180 8 8)'/%3e%3c/svg%3e\")",
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERSLIST.length) : 0;
  const filteredUsers = applySortFilter(USERSLIST, getComparator(order, orderBy), filterName);
  const filteredSummaryUsers = applySortFilter(summaryCustomerList, getComparator(order, orderBy), filterName);
  const filteredItems = applySortFilter(items, getComparator(order, orderBy), filterItem);
  const filteredChilds = applySortFilter(childItems, getComparator(order, orderBy), filterChild);
  const isNotFound = !filteredUsers.length && !!filterName;
  const isNotFoundItem = !filteredItems.length && !!filterItem;
  const isNotFoundChild = !filteredChilds.length && !!filterChild;
  const [activateIndex, setActivateIndex] = useState(0);

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  // filering feature
  const handleFilterShops = async () => {
    try {
      const response = await getShopsListService(user);
      if (response) {
        let filteredData = response.data;
        console.log(filteredData);

        if (filterDetails.shop) {
          filteredData = filteredData.filter((item) => item.shop_id === filterDetails.shop);
        }

        if (filterDetails.region) {
          filteredData = filteredData.filter((item) => item.region_id === filterDetails.region);
        }

        if (filterDetails.territory) {
          filteredData = filteredData.filter((item) => item.territory_id === filterDetails.territory);
        }

        if (filterDetails.area) {
          filteredData = filteredData.filter((item) => item.area_id === filterDetails.area);
        }

        if (filterDetails.town) {
          filteredData = filteredData.filter((item) => item.town_id === filterDetails.town);
        }

        if (filterDetails.beat) {
          filteredData = filteredData.filter((item) => item.beat_id === filterDetails.beat);
        }

        setUserList(filteredData);
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };

  const handleClearFilterShop = async () => {
    setFilterDetails({});

    setSelectedRegion(null);
    setSelectedArea(null);
    setSelectedTerritory(null);
    setSelectedTown(null);
    setSelectedShop(null);
    setSelectedBeat(null);

    try {
      const response = await getShopsListService(user);
      if (response) setUserList(response.data);
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };

  // styling css
  const zeroPaddingStyling = {
    padding: '0',
  };

  const zeroMarginStyling = {
    margin: '0',
  };

  const nowrapStyling = {
    whiteSpace: 'nowrap',
  };

  const radioCellStyling = {
    width: '50px',
  };

  const tdStyling = {
    textAlign: 'end',
    paddingLeft: '10px',
  };

  const combinedStylingForTableCell = {
    ...zeroPaddingStyling,
    ...zeroMarginStyling,
    ...nowrapStyling,
  };

  const combinedStylingForRadioTableCell = {
    ...zeroPaddingStyling,
    ...zeroMarginStyling,
    ...nowrapStyling,
    ...radioCellStyling,
  };

  const filterFirstElementStyling = {
    display: 'flex',
    width: '100%',
    paddingRight: '10px',
  };

  const filterFieldStyling = {
    display: 'flex',
    flexDirection: 'column',
    width: '45%',
    // marginBottom: '5px',
  };

  function getFormattedPrice(value) {
    const formattedPrice = new Intl.NumberFormat().format(value);
    console.log(parseInt(formattedPrice, 10));

    return formattedPrice;
  }

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
    const response2 = await getCustomerSummaryList();
    console.log(response.data);

    if (response.status === 200 && response2.status === 200) {
      setUsersList(response.data);
      setSummaryCustomerList(response2.data);
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

  const [selectedOption, setSelectedOption] = useState(null);

  const handlesChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    filterInfo.customer = selectedOption.value;
  };

  const handleInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredOptions = customers
    .filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option, label: option }));

  // for customer group
  const handleGroupChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    filterInfo.group = selectedOption.value;
  };

  const handleGroupInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredGroupOptions = customerGroups
    .filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option, label: option }));

  // for customer status
  const handleStatusChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    filterInfo.status = selectedOption.value;
  };

  const handleStatusInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredStatusOptions = bankReconIdAll
    .filter((option) => option.short_name.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.short_name, label: option.short_name }));

  const handleDateFilter = async () => {
    let filteredSummaryData = summaryCustomerList;
    let filteredData = USERSLIST;

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

    if (filterInfo.amount) {
      filteredSummaryData = filteredSummaryData.filter((item) => item.amount === filterInfo.amount);
    }

    if (filterInfo.group) {
      filteredSummaryData = filteredSummaryData.filter((item) => item.customer_group === filterInfo.group);
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
    console.log(filteredData);

    setUsersList(filteredData);
    setSummaryCustomerList(filteredSummaryData);
  };

  return (
    <>
      <Helmet>
        <title> COMS | Assets Tracking </title>
      </Helmet>

      <div
        style={{
          height: '100%',

          display: 'flex',
          flexDirection: 'row',
          // border: '1px solid lightgrey',
          padding: '2px',
          margin: '5px',
          paddingLeft: '10px',
        }}
      >
        <div style={{ width: '65%' }}>
          <h6>Data Visualization</h6>
          <div>
            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
              <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                <Typography>Customer Summary</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ height: '50%', overflowY: 'auto' }}>
                <h3 className="heading">Progress Bars</h3>

                {filteredSummaryUsers.length > 0
                  ? (() => {
                      const deposits = filteredSummaryUsers.map((customer) => {
                        const deposit = Number(customer.deposit_amount);
                        if (isNaN(deposit)) {
                          console.error(`Invalid deposit amount: ${customer.deposit_amount}`);
                        }
                        return deposit;
                      });
                      console.log('Deposits:', deposits);

                      const maxDeposit = 99999999;
                      console.log('Max Deposit:', maxDeposit);

                      return (
                        <div>
                          {filteredSummaryUsers.map((customer, index) => {
                            const target = Number(customer.target_amount);
                            const deposit = Number(customer.deposit_amount);

                            return (
                              <div key={index} style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                  <h6 style={{ marginRight: '15px', width: '150px', whiteSpace: 'nowrap' }}>
                                    {customer.customer_group}
                                  </h6>

                                  <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                                    <Progressbar
                                      target={target}
                                      deposit={deposit}
                                      maxDeposit={maxDeposit}
                                      height={35}
                                    />

                                    <h6 style={{ marginLeft: '5px', marginTop: '5px', whiteSpace: 'nowrap' }}>100%</h6>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          <div style={{ display: 'flex', marginTop: '10px', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
                              <div
                                style={{
                                  width: '20px',
                                  height: '10px',
                                  backgroundColor: 'SteelBlue',
                                  marginRight: '5px',
                                }}
                              ></div>
                              <span>Expectation</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div
                                style={{
                                  width: '20px',
                                  height: '10px',
                                  backgroundColor: 'DarkOrange',
                                  marginRight: '5px',
                                }}
                              ></div>
                              <span>Progress</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  : null}
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
              <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
                <Typography>View Collections</Typography>
              </AccordionSummary>
              <AccordionDetails>
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
                            bank_recon_id,
                            bank_status,
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
                            <TableRow
                              hover
                              key={cash_receipt_id}
                              tabIndex={-1}
                              role="checkbox"
                              selected={selectedUser}
                              style={{ height: '30px' }} // Adjust row height
                            >
                              <TableCell align="left" style={{ fontSize: '10px', padding: '5px' }}>
                                <button
                                  style={{ width: '100%', fontSize: '10px' }} // Button font size
                                  onClick={() => viewAttachment(uploaded_filename)}
                                >
                                  view
                                </button>
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {bank_status}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {remarks}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {getFormattedDateWithTime(deposit_date)}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {getFormattedDateWithTime(creation_date)}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {company_bank}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {company_account}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {company_name}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {customer_code}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {customer_name}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {customer_group}
                              </TableCell>
                              <TableCell align="right" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {getFormattedPrice(amount)}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {invoice_number}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {deposit_type_name}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {depositor_bank}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {depositor_branch}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {receipt_number}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {depositor_name}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {employee_name}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {user_name}
                              </TableCell>
                              <TableCell align="left" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {reject_reason}
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
                              <Paper sx={{ textAlign: 'center' }}>
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
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Scrollbar>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
              <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                <Typography>Collapsible Group Item #3</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table ref={tableref}>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD_SUMMARY}
                        rowCount={filteredSummaryUsers.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                        enableReadonly
                      />
                      <TableBody>
                        {filteredSummaryUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                          const { deposit_amount, target_amount, customer_group } = row;

                          const selectedUser = selected.indexOf(customer_group) !== -1;

                          return (
                            <TableRow hover key={customer_group} tabIndex={-1} role="checkbox" selected={selectedUser}>
                              <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                                {customer_group}
                              </TableCell>
                              <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                                {getFormattedPrice(deposit_amount)}
                              </TableCell>
                              <TableCell align="left" style={{ whiteSpace: 'nowrap' }}>
                                {getFormattedPrice(target_amount)}
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
                              <Paper sx={{ textAlign: 'center' }}>
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
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredSummaryUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Scrollbar>
              </AccordionDetails>
            </Accordion>
          </div>
        </div>

        <div style={{ borderLeft: '1px solid lightGray' }}>
          <div style={{ width: '80%', marginLeft: '10%' }}>
            <h6>Filter </h6>

            <Stack ml={1} mr={1} direction="column" spacing={2}>
              {/* From Date */}
              <div className="col-auto" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="col-form-label" style={{ marginRight: '10px' }}>
                  From
                </span>
                <div style={{ width: '160px', marginLeft: '20%' }}>
                  <DatePicker
                    selected={filterInfo.from ? parseDate(filterInfo.from) : null}
                    onChange={(date) => handleDateChange(date, 'from')}
                    dateFormat="dd/MM/yy"
                    maxDate={new Date()}
                    placeholderText="dd/mm/yy"
                    className="form-control"
                  />
                </div>
              </div>

              {/* To Date */}
              <div className="col-auto" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="col-form-label" style={{ marginRight: '10px' }}>
                  To
                </span>
                <div style={{ width: '160px', marginLeft: '28%' }}>
                  <DatePicker
                    selected={filterInfo.to ? parseDate(filterInfo.to) : null}
                    onChange={(date) => handleDateChange(date, 'to')}
                    dateFormat="dd/MM/yy"
                    minDate={parseDate(filterInfo.from)}
                    maxDate={new Date()}
                    placeholderText="dd/mm/yy"
                    className="form-control"
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="col-auto" style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="amount" className="col-form-label" style={{ marginRight: '10px' }}>
                  Amount
                </label>
                <input
                  required
                  id="amount"
                  name="amount"
                  className="form-control"
                  style={{ width: '220px', marginLeft: '12%' }}
                  value={filterInfo.amount}
                  onChange={handleFilterInfo}
                />
              </div>

              {/* Bank Status */}
              <div className="col-auto" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="col-form-label" style={{ marginRight: '10px' }}>
                  Bank Status
                </span>
                <div style={{ width: '220px', marginLeft: '13px' }}>
                  <Select
                    value={filterInfo.status ? { value: filterInfo.status, label: filterInfo.status } : null}
                    onChange={handleStatusChange}
                    onInputChange={handleStatusInputChange}
                    options={filteredStatusOptions}
                    placeholder="Type to select..."
                    isClearable
                  />
                </div>
              </div>

              {/* Customer */}
              <div className="col-auto" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="col-form-label" style={{ marginRight: '10px' }}>
                  Customer
                </span>
                <div style={{ width: '220px', marginLeft: '18px' }}>
                  <Select
                    id="customer"
                    name="customer"
                    value={filterInfo.customer ? { value: filterInfo.customer, label: filterInfo.customer } : null}
                    onChange={handlesChange}
                    onInputChange={handleInputChange}
                    options={filteredOptions}
                    placeholder="Type to select..."
                    isClearable
                  />
                </div>
              </div>

              {/* Customer Group */}
              <div className="col-auto" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="col-form-label" style={{ marginRight: '10px' }}>
                  Customer Group
                </span>
                <div style={{ width: '250px' }}>
                  <Select
                    value={filterInfo.group ? { value: filterInfo.group, label: filterInfo.group } : null}
                    onChange={handleGroupChange}
                    onInputChange={handleGroupInputChange}
                    options={filteredGroupOptions}
                    placeholder="Type to select..."
                    isClearable
                  />
                </div>
              </div>

              {/* Username */}
              <div className="col-auto" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="col-form-label" style={{ marginRight: '10px' }}>
                  Username
                </span>
                <input
                  required
                  id="username"
                  name="username"
                  className="form-control"
                  style={{ width: '220px', marginLeft: '10px' }}
                  value={filterInfo.username}
                  onChange={handleFilterInfo}
                />
              </div>

              {/* Filter and Clear Buttons */}
              <Stack direction="row" gap={1}>
                <Button variant="contained" size="medium" style={{ width: '50%' }} onClick={handleDateFilter}>
                  Filter
                </Button>
                <Button variant="contained" size="medium" style={{ width: '50%' }} onClick={handleClearDate}>
                  Clear
                </Button>
              </Stack>
            </Stack>

            {/* <Stack direction="row" gap={1}>
              <Button variant="contained" size="medium" style={{ width: '45%' }} onClick={handleFilterShops}>
                Filter
              </Button>

              <Button variant="contained" size="medium" style={{ width: '45%' }} onClick={handleClearFilterShop}>
                Clear
              </Button>
            </Stack> */}
          </div>
        </div>
      </div>
      {/* <Button onClick={showItemsList}>Show Items</Button> */}
      {/* <div style={{ width: '40%' }}> */}
    </>
  );
}
