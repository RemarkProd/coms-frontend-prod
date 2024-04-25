/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-key */
/* eslint-disable camelcase */
import { sentenceCase } from 'change-case';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
// @mui
import {
    Button,
    Card,
    Container,
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
import Select from 'react-select';
// components
import Scrollbar from '../components/scrollbar';
// sections
import {
    getBrandingAssetsService,
    getDistrictsByDivisionService,
    getDistrictsService,
    getDivisionsService,
    getItemCategoriesService,
    getItemListService,
    getItemsByCategory,
    getThanasByDistrictService,
    getThanasService,
    getUserProfileDetails,
} from '../Services/ApiServices';
import SoListHead from '../sections/@dashboard/salesOrders/SoListHeader';
// import SoListToolbar from '../sections/@dashboard/salesOrders/SoListToolbar';

import { useUser } from '../context/UserContext';

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
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.order_number.toString().toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function UserPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [USERLIST, setUserList] = useState([]);

  const [filterDetails, setFilterDetails] = useState({
    division: '',
    district: '',
    thana: '',
    item: '',
    category: '',
  });

  const [account, setAccount] = useState({});
  const { user } = useUser();
  console.log(user);

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

  //   const [soDetails, setsoDetails] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let response = {};
        if (user) response = await getBrandingAssetsService(user); // Call your async function here
        if (response.status === 200) setUserList(response.data);
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [user]);
  console.log(USERLIST);

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

  const [itemCategories, setItemCategories] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let response = {};
        if (user) response = await getItemCategoriesService(user); // Call your async function here
        if (response.status === 200) setItemCategories(response.data);
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [user]);
  console.log(itemCategories);

  const [items, setItems] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let response = {};
        if (filterDetails.category)
          response = await getItemsByCategory(filterDetails.category); // Call your async function here
        else response = await getItemListService(); // Call your async function here

        if (response.status === 200) setItems(response.data);
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [filterDetails.category]);
  console.log(items);

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

  const TABLE_HEAD = [
    { id: 'division_name', label: sentenceCase('division'), alignRight: false },
    { id: 'district_name', label: sentenceCase('district'), alignRight: false },
    { id: 'thana_name', label: sentenceCase('thana'), alignRight: false },
    { id: 'address', label: sentenceCase('address'), alignRight: false },
    { id: 'shop_name', label: sentenceCase('shop'), alignRight: false },
    { id: 'brand', label: sentenceCase('brand'), alignRight: false },
    { id: 'item_name', label: sentenceCase('item_name'), alignRight: false },
    { id: 'item_category', label: sentenceCase('item_category'), alignRight: false },
    { id: 'asset_cost', label: sentenceCase('asset_cost'), alignRight: true },
    { id: 'periodic_expense', label: sentenceCase('periodic_expense'), alignRight: true },
    { id: 'execution_date', label: sentenceCase('execution_date'), alignRight: false },
    { id: 'renew_date', label: sentenceCase('renew_date'), alignRight: false },
    { id: 'supplier_name', label: sentenceCase('supplier_name'), alignRight: false },
    { id: 'remarks', label: sentenceCase('remarks'), alignRight: false },
  ];

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.unit_of_measure);
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

  const addSo = () => {
    navigate('/dashboard/salesOrderForm', { replace: true });
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;
  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredUsers.length && !!filterName;

  // input filtering service
  const [inputValue, setInputValue] = useState('');
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedThana, setSelectedThana] = useState(null);
  const [selectedItemCategories, setSelectedItemCategories] = useState(null);
  const [selectedItems, setSelectedItems] = useState(null);

  //   selecting division
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

  //   selecting itemCategories
  const handleItemCategoriesChange = (selectedOption) => {
    setSelectedItemCategories(selectedOption);
    filterDetails.category = selectedOption.value;
    filterDetails.categoryName = selectedOption.label;
  };

  const handleItemCategoriesInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredItemCategoriesOptions = itemCategories
    .filter((option) => option.segment2.toLowerCase().includes(inputValue.toLowerCase()))
    // .map((option) => ({ value: option.segment1, label: option.segment1 }));
    .map((option) => ({ value: option.category_id, label: option.segment2 }));

  //   selecting items
  const handleItemsChange = (selectedOption) => {
    setSelectedItems(selectedOption);
    filterDetails.item = selectedOption.value;
    filterDetails.itemName = selectedOption.label;
  };

  const handleItemsInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredItemsOptions = items
    .filter((option) => option.description.toLowerCase().includes(inputValue.toLowerCase()))
    // .map((option) => ({ value: option.description, label: option.description }));
    .map((option) => ({ value: option.inventory_item_id, label: option.description }));

  // filter actions
  const onSubmitFilter = () => {
    setUserList(USERLIST);

    let filteredData = USERLIST;

    if (filterDetails.division) {
      filteredData = filteredData.filter((item) => item.division_name === filterDetails.divisionName);
    }

    if (filterDetails.district) {
      filteredData = filteredData.filter((item) => item.district_name === filterDetails.districtName);
    }

    if (filterDetails.thana) {
      filteredData = filteredData.filter((item) => item.thana_name === filterDetails.thanaName);
    }

    if (filterDetails.category) {
      filteredData = filteredData.filter((item) => item.item_category === filterDetails.categoryName);
    }

    if (filterDetails.item) {
      filteredData = filteredData.filter((item) => item.item_name === filterDetails.itemName);
    }

    // if (filterDetails.division) {
    //   filteredData = filteredData.filter((item) => item.division_name === filterDetails.divisionName);
    // }

    setUserList(filteredData);
  };

  const onClearFilter = async () => {
    const response = await getBrandingAssetsService(user);

    if (response.status === 200) {
      setUserList(response.data);

      clearSelection();
    } else {
      alert('Process failed! Please try again');
    }
  };

  function clearSelection() {
    setSelectedDivision(null);
    setSelectedDistrict(null);
    setSelectedThana(null);
    setSelectedItemCategories(null);
    setSelectedItems(null);

    setFilterDetails({
      division: '',
      district: '',
      thana: '',
      item: '',
      category: '',
    });
  }

  return (
    <>
      <Helmet>
        <title> COMS | UOM </title>
      </Helmet>

      <Container>
        <Stack direction="column" mb={2}>
          {/* <div className="col-auto" style={{ marginRight: '20px' }}>
            <label htmlFor="orderNumber" className="col-form-label" style={{ display: 'flex' }}>
              From
              <input
                required
                type="date"
                id="from"
                name="from"
                className="form-control"
                // max={today}
                style={{ marginLeft: '5px' }}
                // value={filterDetails.from}
                // onChange={onFilterDetails}
              />
            </label>
          </div> */}
          {/* <div className="col-auto" style={{ marginRight: '20px' }}>
            <label htmlFor="orderedDate" className="col-form-label" style={{ display: 'flex' }}>
              To
              <input
                required
                type="date"
                id="to"
                name="to"
                className="form-control"
                style={{ marginLeft: '5px' }}
                // max={today}
                // min={filterDetails.from}
                // value={filterDetails.to}
                // onChange={onFilterDetails}
              />
            </label>
          </div> */}
          {/* <div className="col-auto">
            <label htmlFor="amount" className="col-form-label" style={{ display: 'flex' }}>
              Amount
              <input
                required
                id="amount"
                name="amount"
                className="form-control"
                style={{ marginLeft: '5px', width: '125px' }}
                // value={filterDetails.amount}
                // onChange={onFilterDetails}
              />
            </label>
          </div> */}

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

            <div className="col-auto" style={{ display: 'flex', marginRight: '20px' }}>
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

          <Stack direction="row" mb={1}>
            <div className="col-auto" style={{ display: 'flex', marginRight: '20px' }}>
              <span style={{ marginRight: '5px' }}>Category</span>
              <div style={{ width: '200px' }}>
                <Select
                  value={selectedItemCategories}
                  onChange={handleItemCategoriesChange}
                  onInputChange={handleItemCategoriesInputChange}
                  options={filteredItemCategoriesOptions}
                  placeholder="Type to select..."
                  isClearable
                />
              </div>
            </div>

            <div className="col-auto" style={{ display: 'flex', marginRight: '20px' }}>
              <span style={{ marginRight: '5px' }}>Item</span>
              <div style={{ width: '250px' }}>
                <Select
                  value={selectedItems}
                  onChange={handleItemsChange}
                  onInputChange={handleItemsInputChange}
                  options={filteredItemsOptions}
                  placeholder="Type to select..."
                  isClearable
                />
              </div>
            </div>

            <Button onClick={onSubmitFilter}>Filter</Button>
            <Button onClick={onClearFilter}>Clear</Button>
          </Stack>
          {/* <Button onClick={onFilterDate}>Filter</Button>
          <Button onClick={onClearDate}>Clear</Button> */}
        </Stack>

        <Card>
          {/* <SoListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            selectedUsers={selected}
          /> */}

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <SoListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={USERLIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {
                      distribution_id,
                      division_name,
                      district_name,
                      thana_name,
                      address,
                      shop_name,
                      brand,
                      asset_cost,
                      periodic_expense,
                      execution_date,
                      renew_date,
                      supplier_name,
                      remarks,
                      item_name,
                      item_category,
                    } = row;

                    return (
                      <TableRow hover key={distribution_id} tabIndex={-1}>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {division_name}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {district_name}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {thana_name}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {address}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {shop_name}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {brand}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {item_name}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {item_category}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="right">
                          {asset_cost}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="right">
                          {periodic_expense}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {execution_date ? getFormattedDateWithTime(execution_date) : ''}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {renew_date ? getFormattedDateWithTime(renew_date) : ''}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {supplier_name}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {remarks}
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
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={USERLIST.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}
