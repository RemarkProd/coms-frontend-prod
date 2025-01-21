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
import 'react-datepicker/dist/react-datepicker.css';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
// @mui
import {
  Button,
  Card,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { useUser } from '../context/UserContext';
// components
import Scrollbar from '../components/scrollbar';
// sections
import {
  addReplaceAssetsService,
  dowloadBrandingAssetService,
  getBrandingAssetByParentId,
  getBrandingAssetSumReport,
  getBrandingAssetsAllViewData,
  getBrandingAssetsReportService,
  getItemsListByChannelService,
  getShopsListService,
  getUserProfileDetails
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
          const response = await getBrandingAssetsReportService(account.cust_group_id);

          if (response.status === 200) {
            setUserList(response.data);
            const customerGroupList = [...new Set(response.data.map((obj) => obj.shop_name))];
            const customerList = [...new Set(response.data.map((obj) => obj.item_name))];
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

  const [items, setItems] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        if (account) {
          console.log(account);
          const response = await getItemsListByChannelService(account.cust_group_id); // Call your async function here
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
  }, [account]);
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

  const [brandingAssestsSumDetails, setBrandingAssestsSumDetails] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getBrandingAssetSumReport(user);
        console.log(response.data);
        if (response) setBrandingAssestsSumDetails(response.data);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [user]);
  console.log(brandingAssestsSumDetails);

  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleCloseDialog = () => {
    setShowChild(false);
  };

  const [imageSrc, setImageSrc] = useState(null);
  const viewAttachment = async (value) => {
    console.log(value);

    try {
      const filename = value;
      const requestBody = {
        fileName: filename,
      };
      const response = await dowloadBrandingAssetService(user, requestBody);

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

  const viewReplace = async (value) => {
    console.log(value);
    if (value === '') {
      alert('No image for display');
      return;
    }

    try {
      const filename = value;
      const requestBody = {
        fileName: filename,
      };
      const response = await dowloadBrandingAssetService(user, requestBody);

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
    }
  };

  const addReplaceItem = async (value) => {
    try {
      const requestBody = {
        parentDistributionId: value,
      };
      const response = await addReplaceAssetsService(user, requestBody);

      if (response.status === 200) {
        alert('Successfully Call procedure');
      } else {
        alert('Process failed! Please try again');
      }
    } catch (error) {
      alert('Process failed! Please try again');
      console.error('Error during image download:', error);
    }
  };

  const TABLE_HEAD = [
    { id: 'attachment', label: 'Attachment', alignRight: false },
    { id: 'replaced', label: 'Replaced Item', alignRight: false },
    { id: 'item_name', label: 'Item Name', alignRight: false },
    { id: 'item_category', label: 'Item Category', alignRight: false },
    { id: 'inventory_item_id', label: 'Inventory Item Id', alignRight: false },
    { id: 'brand_code', label: 'Brand Code', alignRight: false },
    { id: 'asset_cost', label: 'Asset Cost', alignRight: false },
    { id: 'review_status', label: 'Review Status', alignRight: false },
    { id: 'layout', label: 'Layout', alignRight: false },
    { id: 'shop_name', label: 'Shop Name', alignRight: false },
    { id: 'shop_code', label: 'Shop Code', alignRight: false },
    { id: 'address', label: 'Shop Address', alignRight: false },
    { id: 'region_name', label: 'Region Name', alignRight: false },
    { id: 'area_name', label: 'Area_Name', alignRight: false },
    { id: 'territory_name', label: 'Territory Name', alignRight: false },
    { id: 'town_name', label: 'Town Name', alignRight: false },
    { id: 'beat_name', label: 'Beat Name', alignRight: false },
    { id: 'creation_date', label: 'Creation Date', alignRight: false },
    { id: 'renew_date', label: 'Renew Date', alignRight: false },
    { id: 'periodic_expense', label: 'Periodic Expense', alignRight: false },
    { id: 'supplier_name', label: 'Supplier Name', alignRight: false },
    { id: 'cust_group_name', label: 'Cust Group Name', alignRight: false },
    { id: 'remarks', label: 'Remarks', alignRight: false },
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
    { value: 'To Be Replaced', label: 'To Be Replaced' },
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

  const auditStatusOptions = [
    { value: 'APPROVED', label: 'APPROVED' },
    { value: 'REJECTED', label: 'REJECTED' },
    { value: 'Incomplete', label: 'Incomplete' },
  ];

  const handleAuditStatusChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    filterInfo.audit = selectedOption.value;
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

  const [child, setChild] = useState([]);
  const [showChild, setShowChild] = useState(false);
  const viewChild = async (data) => {
    try {
      setShowChild(true);
      const response = await getBrandingAssetByParentId(data);
      if (response.status === 200) {
        if (response.data.length === 0) {
          alert('Data is not available!');
          setShowChild(false);
          return;
        }

        setChild(response.data);
        await viewReplace(response.data[0].uploaded_filename || '');
      } else {
        alert('Process failed! Try again');
      }
    } catch (error) {
      alert('Process failed! Try again');
      console.log(error);
    }
  };

  const handleClearFilter = async () => {
    try {
      const response = await getBrandingAssetsAllViewData(user);
      setUserList(response.data);

      setFilterInfo({
        shop: '',
        status: '',
        itemName: '',
      });
    } catch (error) {
      alert('Process failed! Try again');
      console.error('Error fetching account details:', error);
    }
  };

  const handleFilter = async () => {
    try {
      setUserList([]);

      const response = await getBrandingAssetsAllViewData(user);
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
    }
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;
  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);
  const isNotFound = !USERLIST.length;

  return (
    <>
      <Helmet>
        <title> COMS | Branding Assets View Page </title>
      </Helmet>

      <div style={{ margin: '0 22px' }}>
        <Stack spacing={1.5} direction="column" mb={3}>
          <div className="col-auto" style={{ marginRight: '20px', display: 'flex' }}>
            <div className="col-auto" style={{ display: 'flex', marginRight: '10px', width: 'auto' }}>
              <span style={{ marginRight: '5px', whiteSpace: 'nowrap' }}>Shop Name</span>
              <div style={{ width: '250px' }}>
                <Select
                  value={filterInfo.shop ? { value: filterInfo.shop, label: filterInfo.shop } : null}
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
              <div style={{ width: '250px' }}>
                <Select
                  value={filterInfo.itemName ? { value: filterInfo.itemName, label: filterInfo.itemName } : null}
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
              <div style={{ width: '240px' }}>
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
            <div className="col-auto" style={{ display: 'none', marginRight: '10px', width: 'auto' }}>
              <span style={{ marginRight: '5px', whiteSpace: 'nowrap' }}>Audit Status</span>
              <div style={{ width: '180px' }}>
                <Select
                  value={filterInfo.audit ? { value: filterInfo.audit, label: filterInfo.audit } : null}
                  onChange={handleAuditStatusChange}
                  options={auditStatusOptions}
                  placeholder="Click to select..."
                  isClearable
                  isSearchable={false}
                />
              </div>
            </div>
            <Button variant="contained" onClick={handleFilter} style={{ margin: '0 1rem' }}>
              Filter
            </Button>
            <Button variant="contained" onClick={handleClearFilter}>
              Clear
            </Button>
          </div>
        </Stack>
        <hr />

        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table ref={tableref}>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={USERLIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                  enableReadonly
                />
                <TableBody>
                  {USERLIST.map((row) => {
                    const {
                      shop_id,
                      address,
                      area_name,
                      asset_cost,
                      beat_name,
                      brand_code,
                      creation_date,
                      cust_group_name,
                      execution_date,
                      inventory_item_id,
                      item_category,
                      item_name,
                      periodic_expense,
                      region_name,
                      remarks,
                      renew_date,
                      review_status,
                      shop_code,
                      shop_name,
                      supplier_name,
                      territory_name,
                      town_name,
                      layout_name,
                      authorization_status,
                      uploaded_filename,
                      distribution_id,
                      parent_distribution_id,
                    } = row;

                    const rowValues = [
                      //   authorization_status,
                      item_name,
                      item_category,
                      inventory_item_id,
                      brand_code,
                      asset_cost,
                      review_status,
                      layout_name,
                      shop_name,
                      shop_code,
                      address,
                      region_name,
                      area_name,
                      territory_name,
                      town_name,
                      beat_name,
                      creation_date,
                      renew_date,
                      periodic_expense,
                      supplier_name,
                      cust_group_name,
                      remarks,
                    ];

                    const selectedUser = selected.indexOf(distribution_id) !== -1;

                    return (
                      <TableRow hover key={distribution_id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell style={{ whiteSpace: 'nowrap', margin: '10px', padding: '10px' }}>
                          <button style={{ width: '100%' }} onClick={(e) => viewAttachment(uploaded_filename)}>
                            View
                          </button>
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap', margin: '10px', padding: '10px' }}>
                          <button style={{ width: '100%' }} onClick={(e) => viewChild(distribution_id)}>
                            Show
                          </button>
                        </TableCell>
                        {rowValues.map((value, index) => (
                          <TableCell
                            key={index}
                            align="left"
                            style={{ whiteSpace: 'nowrap', margin: '10px', padding: '10px' }}
                          >
                            {index === 15 || index === 16 ? getFormattedDateWithTime(value) : value}
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
                      )}
                    </Stack>
                  </DialogContent>
                </Dialog>

                <Dialog open={showChild} fullScreen>
                  <DialogContent style={{ display: 'flex', flexDirection: 'row' }}>
                    {/* Left Side: Item Information */}
                    <Stack style={{ width: '50%' }}>
                      <table>
                        <tr>
                          <td>Item Name:</td>
                          <td>{child[0]?.item_name ?? 'null'}</td>
                        </tr>
                        <tr>
                          <td>Item Category:</td>
                          <td>{child[0]?.item_category ?? 'null'}</td>
                        </tr>
                        <tr>
                          <td>Inventory Item ID:</td>
                          <td>{child[0]?.inventory_item_id ?? 'null'}</td>
                        </tr>
                        <tr>
                          <td>Brand Code:</td>
                          <td>{child[0]?.brand_code ?? 'null'}</td>
                        </tr>
                        <tr>
                          <td>Asset Cost:</td>
                          <td>{child[0]?.asset_cost ?? 'null'}</td>
                        </tr>
                        <tr>
                          <td>Review Status:</td>
                          <td>{child[0]?.review_status ?? 'null'}</td>
                        </tr>
                        <tr>
                          <td>Layout Name:</td>
                          <td>{child[0]?.layout_name ?? 'null'}</td>
                        </tr>
                        <tr>
                          <td>Shop Name:</td>
                          <td>{child[0]?.shop_name ?? 'null'}</td>
                        </tr>
                        <tr>
                          <td>Shop Code:</td>
                          <td>{child[0]?.shop_code ?? 'null'}</td>
                        </tr>
                        <tr>
                          <td>Address:</td>
                          <td>{child[0]?.address ?? 'null'}</td>
                        </tr>
                        <tr>
                          <td>Region Name:</td>
                          <td>{child[0]?.region_name ?? 'null'}</td>
                        </tr>
                        <tr>
                          <td>Area Name:</td>
                          <td>{child[0]?.area_name ?? 'null'}</td>
                        </tr>
                      </table>
                    </Stack>

                    {/* Right Side: Image */}
                    <Stack spacing={1.5} direction="row" style={{ width: '50%', paddingLeft: '20px' }}>
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt="Preview"
                          style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                          loading="lazy"
                        />
                      ) : (
                        <CircularProgress />
                      )}
                    </Stack>
                  </DialogContent>

                  {/* Dialog Actions (Buttons at the bottom) */}
                  <DialogActions style={{ justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ padding: '5px 15px', fontSize: '12px' }} // Smaller size
                      onClick={() => addReplaceItem(child[0]?.parent_distribution_id)} // Access parent_distribution_id from child object
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      style={{ padding: '5px 15px', fontSize: '12px' }} // Smaller size
                      onClick={handleCloseDialog} // Event handler for Cancel button
                    >
                      Cancel
                    </Button>
                  </DialogActions>
                </Dialog>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>
      </div>
    </>
  );
}
