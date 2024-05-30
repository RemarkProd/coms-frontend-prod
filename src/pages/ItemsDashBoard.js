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
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Button,
  Checkbox,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import Select from 'react-select';
import {
  dowloadBankDepositReceiptService,
  getBrandingAssetsChildItemsService,
  getBrandingAssetsItemImagesService,
  getBrandingAssetsItemsService,
  getDistrictsByDivisionService,
  getDistrictsService,
  getDivisionsService,
  getRouteMasterService,
  getShopsListService,
  getThanasByDistrictService,
  getThanasService,
  getUserProfileDetails,
} from '../Services/ApiServices';

// @mui
import { useUser } from '../context/UserContext';
import NewListHead from '../sections/@dashboard/user/NewListHead';
import NewListToolbar from '../sections/@dashboard/user/NewListToolbar';

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
  { id: 'shop_number', label: 'Shop Number', alignRight: false },
  { id: 'shop_name', label: 'Shop Name', alignRight: false },
  { id: 'mobile', label: 'Mobile', alignRight: false },
  { id: 'owner_name', label: 'Owner Name', alignRight: false },
  { id: 'category', label: 'Category', alignRight: false },
];
const TABLE_HEADs = [
  { id: '', label: '', alignRight: false },
  { id: 'item_name', label: 'Item Name', alignRight: false },
  { id: 'Item_category', label: 'Item Category', alignRight: false },
];
const TABLE_HEADss = [
  { id: 'child_item_name', label: 'Child Item Name', alignRight: false },
  { id: 'child_category', label: 'Child Category', alignRight: false },
];
export default function ItemsDashBoard() {
  const navigate = useNavigate();

  const { user } = useUser();
  const [showShops, setShowShops] = useState(true);
  const [showItems, setShowItems] = useState(false);
  const [showChilds, setShowChilds] = useState(false);

  const [filterDetails, setFilterDetails] = useState({
    division: '',
    district: '',
    thana: '',
    route: '',
    shop: '',
    mobile: '',
  });

  //Start From here ////////////////////////////////
  const [inputValue, setInputValue] = useState('');
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedThana, setSelectedThana] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
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

  console.log(user);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActivateIndex((prevIndex) => (prevIndex === 0 ? 2 : prevIndex - 1));
  };

  const handleNext = () => {
    setActivateIndex((prevIndex) => (prevIndex === 2 ? 0 : prevIndex + 1));
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

  const [divisions, setDivisions] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let response = {};
        if (user) response = await getDivisionsService(user); // Call your async function here
        if (response.status === 200) setDivisions(response.data);
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [user]);
  console.log(divisions);

  const [districts, setDistricts] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let response = {};
        if (filterDetails.division)
          response = await getDistrictsByDivisionService(user, filterDetails.division); // Call your async function here
        else response = await getDistrictsService(user); // Call your async function here
        if (response.status === 200) setDistricts(response.data);
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [filterDetails.division]);
  console.log(districts);

  const [thanas, setThanas] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let response = {};
        if (filterDetails.district)
          response = await getThanasByDistrictService(user, filterDetails.district); // Call your async function here
        else response = await getThanasService(user); // Call your async function here
        if (response.status === 200) setThanas(response.data);
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [filterDetails.district]);
  console.log(thanas);

  const [routes, setRoutes] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let response = {};
        if (filterDetails.thana) response = await getRouteMasterService(); // Call your async function here

        if (response.status === 200) setRoutes(response.data);
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [filterDetails.thana]);
  console.log(routes);

  const [USERLIST, setUserList] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getShopsListService(user);
        console.log(response.data);
        if (response) setUserList(response.data);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [user]);
  console.log(USERLIST);
  const shopIdNameArray = USERLIST.map(({ shop_id, shop_name, contact_number }) => ({
    shop_id,
    shop_name,
    contact_number,
  }));
  console.log(shopIdNameArray);

  const handleDivisionChange = (selectedOption) => {
    setSelectedDivision(selectedOption);
    filterDetails.division = selectedOption.value;
    filterDetails.divisionName = selectedOption.label;
  };

  const handleDivisionInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredDivisionOptions = divisions
    .filter((option) => option.division_name.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.division_id, label: option.division_name }));
  // .map((option) => ({ value: option.division_name, label: option.division_name }));

  //   selecting District
  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption);
    filterDetails.district = selectedOption.value;
    filterDetails.districtName = selectedOption.label;
  };

  const handleDistrictInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredDistrictOptions = districts
    .filter((option) => option.district_name.toLowerCase().includes(inputValue.toLowerCase()))
    // .map((option) => ({ value: option.district_name, label: option.district_name }));
    .map((option) => ({ value: option.district_id, label: option.district_name }));

  //   selecting Thana
  const handleThanaChange = (selectedOption) => {
    setSelectedThana(selectedOption);
    filterDetails.thana = selectedOption.value;
    filterDetails.thanaName = selectedOption.label;
  };

  const handleThanaInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredThanaOptions = thanas
    .filter((option) => option.thana_name.toLowerCase().includes(inputValue.toLowerCase()))
    // .map((option) => ({ value: option.thana_name, label: option.thana_name ? option.thana_name : '' }));
    .map((option) => ({ value: option.thana_id, label: option.thana_name ? option.thana_name : '' }));

  const handleRouteChange = (selectedOption) => {
    setSelectedRoute(selectedOption);
    filterDetails.route = selectedOption.value;
    filterDetails.routeName = selectedOption.label;
  };

  const handleRouteInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredRouteOptions = routes
    .filter((option) => option.route_name.toLowerCase().includes(inputValue.toLowerCase()))
    // .map((option) => ({ value: option.district_name, label: option.district_name }));
    .map((option) => ({ value: option.route_id, label: option.route_name }));

  const handleShopChange = (selectedOption) => {
    setSelectedShop(selectedOption);
    filterDetails.shop = selectedOption.value;
    filterDetails.shopName = selectedOption.label;
  };

  const handleShopInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredShopOptions = shopIdNameArray
    .filter((option) => option.shop_name.toLowerCase().includes(inputValue.toLowerCase()))
    // .map((option) => ({ value: option.district_name, label: option.district_name }));
    .map((option) => ({ value: option.shop_id, label: option.shop_name }));

  const handleContactChange = (selectedOption) => {
    setSelectedContact(selectedOption);
    filterDetails.shop = selectedOption.value;
    filterDetails.shopName = selectedOption.label;
  };

  const handleContactInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredContactOptions = shopIdNameArray
    .filter((option) => option.contact_number.toLowerCase().includes(inputValue.toLowerCase()))
    // .map((option) => ({ value: option.district_name, label: option.district_name }));
    .map((option) => ({ value: option.shop_id, label: option.contact_number }));

  const selectedUsers = [];
  const selectedItems = [];
  const [items, setItems] = useState([]);
  const [childItems, setChildItems] = useState([]);
  const fetchDataForSpecificShop = async (specificElement) => {
    console.log(specificElement);
    try {
      let response = {};
      response = await getBrandingAssetsItemsService(user, parseInt(specificElement, 10));
      console.log(response);
      if (response.status === 200) setItems(response.data);
      if (response) {
        setShowItems(true);
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };
  const fetchDataForSpecificItem = async (specificElements) => {
    console.log(specificElements);
    try {
      let response = {};
      response = await getBrandingAssetsChildItemsService(user, specificElements);
      console.log(response);
      if (response.status === 200) setChildItems(response.data);
      if (response) {
        setShowChilds(true);
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };
  console.log(childItems);

  const [images, setImages] = useState([]);
  const fetchImageForSpecificItem = async (specificElements) => {
    console.log(specificElements);
    try {
      let response = {};
      response = await getBrandingAssetsItemImagesService(user, specificElements);
      console.log(response.data);
      if (response.status === 200) setImages(response.data);
      if (response) {
        setShowChilds(true);
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };
  console.log(images);

  const handleClick = (event, name) => {
    fetchDataForSpecificShop(name);
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
    console.log('toselectedUsers : ', selectedUsers);
  };
  const handleItemClick = (event, inventoryItemId) => {
    fetchDataForSpecificItem(inventoryItemId);
    fetchImageForSpecificItem(inventoryItemId);
    const selectedIndex = selectedItem.indexOf(inventoryItemId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedItem, inventoryItemId];
    } else {
      newSelected = selectedItem.filter((id) => id !== inventoryItemId);
    }

    setSelectedItem(newSelected);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);
  const filteredItems = applySortFilter(items, getComparator(order, orderBy), filterItem);
  const filteredChilds = applySortFilter(childItems, getComparator(order, orderBy), filterChild);
  const isNotFound = !filteredUsers.length && !!filterName;
  const isNotFoundItem = !filteredItems.length && !!filterItem;
  const isNotFoundChild = !filteredChilds.length && !!filterChild;
  const [activateIndex, setActivateIndex] = useState(0);
  const img = [
    'https://mdbcdn.b-cdn.net/img/Photos/Slides/img%20(15).webp',
    'https://mdbcdn.b-cdn.net/img/Photos/Slides/img%20(22).webp',
    'https://mdbcdn.b-cdn.net/img/Photos/Slides/img%20(23).webp',
  ];

  const [imageSrc, setImageSrc] = useState();
  if(images){
  for (let i = 0; i < images.length; i++) {
    viewAttachment(images[i]);
  }
}
  const viewAttachment = async (value) => {
    console.log(value);
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
  console.log(imageSrc);
  return (
    <>
      <Helmet>
        <title> COMS | System Menu </title>
      </Helmet>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" gutterBottom>
            Item DashBoard
          </Typography>
        </Stack>
        <div style={{ width: '200px' }}>
          <Stack direction="column" mb={2}>
            <Stack direction="row" mb={1}>
              <div className="col-auto" style={{ display: 'flex', marginRight: '20px', width: 'auto' }}>
                <span style={{ marginRight: '5px' }}>Division</span>
                <div style={{ width: '200px' }}>
                  <Select
                    id="division"
                    name="division"
                    // value={filterDetails.customer ? { value: filterDetails.customer, label: filterDetails.customer } : null}
                    value={selectedDivision}
                    onChange={handleDivisionChange}
                    onInputChange={handleDivisionInputChange}
                    options={filteredDivisionOptions}
                    placeholder="Type to select..."
                    isClearable
                  />
                </div>
              </div>

              <div className="col-auto" style={{ display: 'flex', marginRight: '25px' }}>
                <span style={{ marginRight: '5px' }}>District</span>
                <div style={{ width: '200px' }}>
                  <Select
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    onInputChange={handleDistrictInputChange}
                    options={filteredDistrictOptions}
                    placeholder="Type to select..."
                    isClearable
                  />
                </div>
              </div>

              <div className="col-auto" style={{ display: 'flex', marginRight: '20px' }}>
                <span style={{ marginRight: '5px' }}>Thana</span>
                <div style={{ width: '200px' }}>
                  <Select
                    value={selectedThana}
                    onChange={handleThanaChange}
                    onInputChange={handleThanaInputChange}
                    options={filteredThanaOptions}
                    placeholder="Type to select..."
                    isClearable
                  />
                </div>
              </div>
            </Stack>
          </Stack>
          <Stack direction="row" mb={1}>
            <div className="col-auto" style={{ display: 'flex', marginRight: '35px' }}>
              <span style={{ marginRight: '18px' }}>Route</span>
              <div style={{ width: '200px' }}>
                <Select
                  value={selectedRoute}
                  onChange={handleRouteChange}
                  onInputChange={handleRouteInputChange}
                  options={filteredRouteOptions}
                  placeholder="Type to select..."
                  isClearable
                />
              </div>
            </div>

            <div className="col-auto" style={{ display: 'flex', marginRight: '20px' }}>
              <span style={{ marginRight: '5px' }}>Shop</span>
              <div style={{ width: '200px' }}>
                <Select
                  value={selectedShop}
                  onChange={handleShopChange}
                  onInputChange={handleShopInputChange}
                  options={filteredShopOptions}
                  placeholder="Type to select..."
                  isClearable
                />
              </div>
            </div>
            <div className="col-auto" style={{ display: 'flex', marginRight: '20px' }}>
              <span style={{ marginRight: '5px' }}>Mobile</span>
              <div style={{ width: '200px' }}>
                <Select
                  value={selectedContact}
                  onChange={handleContactChange}
                  onInputChange={handleContactInputChange}
                  options={filteredContactOptions}
                  placeholder="Type to select..."
                  isClearable
                />
              </div>
            </div>

            <Button>Filters</Button>
          </Stack>
        </div>
        <TableContainer>
          <NewListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            selectedUsers={selected}
          />
          <Table>
            <NewListHead
              order={order}
              orderBy={orderBy}
              headLabel={TABLE_HEAD}
              rowCount={USERLIST.length}
              numSelected={selected.length}
              onRequestSort={handleRequestSort}
              onSelectAllClick={handleSelectAllClick}
            />
            <TableBody>
              {showShops ? (
                filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                  const { shop_id, shop_name, owner_name, contact_number, category } = row;

                  const selectedUser = selected.indexOf(shop_id) !== -1;

                  return (
                    <TableRow hover key={shop_id} tabIndex={-1} role="checkbox">
                      <TableCell padding="checkbox">
                        <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, shop_id)} />
                      </TableCell>
                      <TableCell align="left">{shop_id}</TableCell>
                      <TableCell align="left">{shop_name}</TableCell>
                      <TableCell align="left">{contact_number}</TableCell>
                      <TableCell align="left">{owner_name}</TableCell>
                      <TableCell align="left">{category}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography variant="body2">No data available</Typography>
                  </TableCell>
                </TableRow>
              )}
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={USERLIST.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        {/* <Button onClick={showItemsList}>Show Items</Button> */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', marginTop: '30px' }}>
          <div style={{ flex: '1' }}>
            <TableContainer>
              <Table>
                <NewListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEADs}
                  rowCount={items.length}
                  numSelected={selectedItem.length}
                  onFilterName={handleFilterItem}
                  onRequestSort={handleRequestItemSort}
                  onSelectAllClick={handleSelectItemClick}
                />
                <TableBody>
                  {showItems ? (
                    filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { inventory_item_id, item_category, item_name } = row;

                      const selectedUser = selectedItem.indexOf(inventory_item_id) !== -1;

                      return (
                        <TableRow hover key={inventory_item_id} tabIndex={-1} role="checkbox">
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedUser}
                              onChange={(event) => handleItemClick(event, inventory_item_id)}
                            />
                          </TableCell>
                          <TableCell align="left">{item_category}</TableCell>
                          <TableCell align="left">{item_name}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        <Typography variant="body2">No data available</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFoundItem && (
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={USERLIST.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            {/* <Button onClick={showChildsList}>Show Shops</Button> */}
          </div>
          <div style={{ flex: '1' }}>
            <TableContainer>
              <Table>
                <NewListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEADss}
                  rowCount={childItems.length}
                  numSelected={selected.length}
                  onFilterName={handleFilterChild}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {showChilds ? (
                    filteredChilds.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { inventory_item_id, description, inventory_item_code } = row;

                      const selectedUser = selected.indexOf(inventory_item_id) !== -1;

                      return (
                        <TableRow hover key={inventory_item_id} tabIndex={-1} role="checkbox">
                          {/* <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedUser}
                              onChange={(event) => handleClick(event, inventory_item_id)}
                            />
                          </TableCell> */}
                          <TableCell align="left">{description}</TableCell>
                          <TableCell align="left">{inventory_item_code}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        <Typography variant="body2">No data available</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFoundChild && (
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={USERLIST.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
        <div
          id="carouselBasicExample"
          className="carousel slide carousel-fade"
          style={{ marginTop: '20px', marginLeft: '300px', width: '50%' }}
        >
          <div className="carousel-indicators">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                type="button"
                className={index === activeIndex ? 'active' : ''}
                onClick={() => setActiveIndex(index)}
                aria-current={index === activeIndex ? 'true' : undefined}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
          <div className="carousel-inner">
            {img.map((image, index) => {
              const record = images[index]; // Get the corresponding record for this image
              return (
                <div key={index} className={`carousel-item${index === activateIndex ? ' active' : ''}`}>
                  <img src={image} className="d-block w-100" alt={`Slide ${index + 1}`} />
                  <div className="carousel-caption d-none d-md-block">
                    {/* <h5>{`Slide ${index + 1} label`}</h5> */}
                    <p>
                      {record ? (
                        <>
                          <span>Record Type: {record.RECORD_TYPE}</span>
                          <br />
                          <span>Shop Name: {record.shop_name}</span>
                          <br />
                          <span>Date Effective: {new Date(record.execution_date).toLocaleDateString()}</span>
                        </>
                      ) : (
                        'No description available'
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="carousel-control-prev" type="button" onClick={handlePrev}>
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" onClick={handleNext}>
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </Container>
          
    </>
  );
}
