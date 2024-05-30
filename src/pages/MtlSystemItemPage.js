/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-key */
/* eslint-disable camelcase */
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { sentenceCase } from 'change-case';
import { format } from 'date-fns';
import { filter, findIndex } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Card,
  Checkbox,
  Container,
  DialogTitle,
  Grid,
  IconButton,
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
// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { getSytemItems, updateSystemItems } from '../Services/ApiServices';
// import AddSystemItemsDialog from '../sections/@dashboard/items/AddSystemItemsDialog';
import SystemItemListToolbar from '../sections/@dashboard/items/SystemItemListToolbar';
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
    console.log(filter(array, (_user) => _user.description.toLowerCase().indexOf(query.toLowerCase()) !== -1));
    return filter(array, (_user) => _user.description.toLowerCase().indexOf(query.toLowerCase()) !== -1);
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

  useEffect(() => {
    async function fetchData() {
      try {
        const usersDetails = await getSytemItems();

        if (usersDetails) {
          const systemItems = usersDetails.data.results.map((data) => updateSystemItemsInfo(data));
          setUserList(systemItems);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, []);

  function updateSystemItemsInfo(data) {
    if (data.last_update_date) {
      const date = new Date(data.last_update_date);

      data.last_update_date = format(date, 'yyyy-MM-dd');
    }

    if (data.creation_date) {
      const date = new Date(data.creation_date);

      data.creation_date = format(date, 'yyyy-MM-dd');
    }

    if (data.start_date_active) {
      const date = new Date(data.start_date_active);

      data.start_date_active = format(date, 'yyyy-MM-dd');
    }

    if (data.end_date_active) {
      const date = new Date(data.end_date_active);

      data.end_date_active = format(date, 'yyyy-MM-dd');
    }

    return data;
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

  const [open, setOpen] = useState(false);
  const [rowData, setRowData] = useState(null);

  const onValueChange = (e) => {
    console.log(rowData);
    setRowData({ ...rowData, [e.target.name]: e.target.value });
  };

  const handleClickOpen = (row) => {
    console.log(row);
    setRowData(row);
    // setOpen(true);
    const encodedRow = encodeURIComponent(JSON.stringify(row));
    console.log(encodedRow);
    navigate(`/dashboard/addSystemItem/${encodedRow}`, { replace: true });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = async () => {
    const {
      inventory_item_id,
      organization_id,
      inventory_item_code,
      description,
      primary_uom_code,
      primary_unit_of_measure,
      // enabled_flag,
      start_date_active,
      end_date_active,
      buyer_id,
      min_minmax_quantity,
      max_minmax_quantity,
      minimum_order_quantity,
      maximum_order_quantity,
    } = rowData;

    try {
      const currentDay = new Date().toJSON();

      const requestBody = {
        inventoryItemId: inventory_item_id,
        organizationId: organization_id,
        inventoryItemCode: inventory_item_code,
        description: rowData.description ? rowData.description : '',
        primaryUomCode: primary_uom_code,
        primaryUnitOfMeasure: primary_unit_of_measure,
        lastUpdateDate: currentDay,
        lastUpdatedBy: 'Admin',
        // enabledFlag: enabled_flag,
        startDateActive: start_date_active || null,
        endDateActive: end_date_active || null,
        buyerId: buyer_id,
        minMinmaxQuantity: min_minmax_quantity,
        maxMinmaxQuantity: max_minmax_quantity,
        minimumOrderQuantity: minimum_order_quantity,
        maximumOrderQuantity: maximum_order_quantity,
      };

      const response = await updateSystemItems(requestBody);

      if (response.status === 200) {
        alert('Successfully updated!');
      } else {
        console.log(response);
        alert('Process failed! Try again later');
      }

      handleClose();
      navigate('/dashboard/items', { replace: true });
      // window.location.reload();
      console.log(requestBody);
    } catch (err) {
      console.log(err.message);
      alert('Process failed! Try again later');
    }
    // } else {
    //   setErrors(newErrors);
    // }
  };

  // const TABLE_HEAD = Object.keys(USERLIST[0]).map((column => ({id: column, label: sentenceCase(column), alignRight: false})));
  // TABLE_HEAD.push({id: ''})
  const TABLE_HEAD = [
    // { id: 'inventory_item_id', label: sentenceCase('inventory_item_id'), alignRight: false },
    { id: 'organization_id', label: 'Org ID', alignRight: false },
    { id: 'inventory_item_code', label: sentenceCase('item_code'), alignRight: false },
    { id: 'description', label: sentenceCase('description'), alignRight: false },
    { id: 'primary_uom_code', label: 'UOM', alignRight: false },
    // { id: 'primary_unit_of_measure', label: sentenceCase('primary_unit_of_measure'), alignRight: false },
    { id: 'enabled_flag', label: sentenceCase('enabled'), alignRight: false },
    { id: 'start_date_active', label: sentenceCase('start_date_active'), alignRight: false },
    { id: 'end_date_active', label: sentenceCase('end_date_active'), alignRight: false },
    // { id: 'buyer_id', label: sentenceCase('buyer_id'), alignRight: false },
    { id: 'min_minmax_quantity', label: sentenceCase('min_minmax_quantity'), alignRight: false },
    { id: 'max_minmax_quantity', label: sentenceCase('max_minmax_quantity'), alignRight: false },
    { id: 'minimum_order_quantity', label: sentenceCase('minimum_order_quantity'), alignRight: false },
    { id: 'maximum_order_quantity', label: sentenceCase('maximum_order_quantity'), alignRight: false },
    { id: '' },
  ];

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => {
        const ss = { itemId: n.inventory_item_id, orgId: n.organization_id };
        return ss;
      });
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  // const handleSelectAllClick = (event) => {
  //   if (event.target.checked) {
  //     const newSelecteds = USERLIST.map((n) => n.inventory_item_id);
  //     setSelected(newSelecteds);
  //     return;
  //   }
  //   setSelected([]);
  // };
  const handleClick = (event, name) => {
    const selectedIndex = findIndex(selected, (user) => user.itemId === name.itemId && user.orgId === name.orgId);

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

  const addItemMaster = () => {
    // navigate('/dashboard/add-uom');
    navigate('/dashboard/addSystemItem/null', { replace: true });
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);
  console.log(filteredUsers);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> COMS | System Items </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Item Master
          </Typography>
          <Button
            variant="text"
            startIcon={<Iconify icon="eva:plus-fill" />}
            color="primary"
            onClick={addItemMaster}
            style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px' }}
          >
            Add Item Master
          </Button>
        </Stack>

        <Card>
          <SystemItemListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            selectedUsers={selected}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
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
                    console.log(row);
                    const {
                      inventory_item_id,
                      organization_id,
                      inventory_item_code,
                      description,
                      primary_uom_code,
                      // primary_unit_of_measure,
                      enabled_flag,
                      start_date_active,
                      end_date_active,
                      // buyer_id,
                      min_minmax_quantity,
                      max_minmax_quantity,
                      minimum_order_quantity,
                      maximum_order_quantity,
                    } = row;

                    const rowValues = [
                      // inventory_item_id,
                      organization_id,
                      inventory_item_code,
                      description,
                      primary_uom_code,
                      // primary_unit_of_measure,
                      enabled_flag,
                      start_date_active,
                      end_date_active,
                      // buyer_id,
                      min_minmax_quantity,
                      max_minmax_quantity,
                      minimum_order_quantity,
                      maximum_order_quantity,
                    ];
                    // const selectedUser = selected.indexOf(inventory_item_id) !== -1;
                    // const selectedUser = selected.indexOf(inventory_item_id) !== -1 && selected.indexOf(organization_id) !== -1;
                    // const selectedUser = selected.indexOf({ itemId: inventory_item_id, orgId: organization_id }) !== -1;
                    const selectedUser =
                      selected.findIndex(
                        (object) => object.itemId === inventory_item_id && object.orgId === organization_id
                      ) !== -1;

                    return (
                      <TableRow hover key={inventory_item_id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedUser}
                            // onChange={(event) => handleClick(event, inventory_item_id)}
                            onChange={(event) =>
                              handleClick(event, { itemId: inventory_item_id, orgId: organization_id })
                            }
                          />
                          {/* <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, inventory_item_id)} /> */}
                        </TableCell>

                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {organization_id}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {inventory_item_code}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {description}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {primary_uom_code}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {enabled_flag}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {getFormattedDateWithTime(start_date_active)}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {getFormattedDateWithTime(end_date_active)}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {min_minmax_quantity}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {max_minmax_quantity}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {minimum_order_quantity}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                          {maximum_order_quantity}
                        </TableCell>

                        {/* {rowValues.map((value) => (
                          <TableCell style={{ whiteSpace: 'nowrap' }} align="left">
                            {value}
                          </TableCell>
                        ))} */}

                        <TableCell padding="checkbox">
                          <IconButton size="large" color="primary" onClick={() => handleClickOpen(row)}>
                            <Iconify icon={'tabler:edit'} />
                          </IconButton>
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

                {rowData && (
                  <Dialog fullScreen open={open} onClose={handleClose}>
                    <DialogTitle>Edit Item Master</DialogTitle>
                    <Stack />
                    <DialogContent>
                      <Stack spacing={1.5} direction="row">
                        {/* <div>
                          <label htmlFor="inventory_item_id">{sentenceCase('inventory_item_id')}: </label>
                          <input
                            required
                            disabled={isDisable}
                            type="number"
                            name="inventory_item_id"
                            id="inventory_item_id"
                            title="Maximum 25 characters are allowed."
                            style={{ backgroundColor: 'white' }}
                            value={rowData.inventory_item_id}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div> */}
                        <div>
                          <label htmlFor="inventory_item_code">{sentenceCase('inventory_item_code')}: </label>
                          <input
                            required
                            name="inventory_item_code"
                            id="inventory_item_code"
                            title="Maximum 40 characters are allowed."
                            style={{ backgroundColor: 'white' }}
                            value={rowData.inventory_item_code}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>
                        <div>
                          <label htmlFor="primary_uom_code">{sentenceCase('primary_uom_code')}: </label>
                          <input
                            name="primary_uom_code"
                            id="primary_uom_code"
                            title="Maximum 3 characters are allowed."
                            style={{ backgroundColor: 'white' }}
                            value={rowData.primary_uom_code}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>
                        <div>
                          <label htmlFor="primary_unit_of_measure">{sentenceCase('primary_unit_of_measure')}: </label>
                          <input
                            name="primary_unit_of_measure"
                            id="primary_unit_of_measure"
                            title="Maximum 25 characters are allowed."
                            style={{ backgroundColor: 'white' }}
                            value={rowData.primary_unit_of_measure}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>
                        {/* <div>
                          <label htmlFor="enabled_flag">{sentenceCase('enabled_flag')}: </label>
                          <input
                            required
                            disabled={isDisable}
                            name="enabled_flag"
                            id="enabled_flag"
                            title="Maximum 1 character is allowed."
                            style={{ backgroundColor: 'white' }}
                            value={rowData.enabled_flag}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div> */}
                        <div>
                          <label htmlFor="start_date_active">{sentenceCase('start_date_active')}: </label>
                          <input
                            type="date"
                            name="start_date_active"
                            id="start_date_active"
                            style={{ backgroundColor: 'white' }}
                            value={rowData.start_date_active}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>
                        <div>
                          <label htmlFor="end_date_active">{sentenceCase('end_date_active')}: </label>
                          <input
                            type="date"
                            name="end_date_active"
                            id="end_date_active"
                            style={{ backgroundColor: 'white' }}
                            value={rowData.end_date_active}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>
                        <div>
                          <label htmlFor="buyer_id">{sentenceCase('buyer_id')}: </label>
                          <input
                            type="number"
                            name="buyer_id"
                            id="buyer_id"
                            title="Maximum 9 digits are allowed."
                            style={{ backgroundColor: 'white' }}
                            value={rowData.buyer_id}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>
                        <div>
                          <label htmlFor="min_minmax_quantity">{sentenceCase('min_minmax_quantity')}: </label>
                          <input
                            type="number"
                            name="min_minmax_quantity"
                            id="min_minmax_quantity"
                            style={{ backgroundColor: 'white' }}
                            value={rowData.min_minmax_quantity}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>
                        <div>
                          <label htmlFor="max_minmax_quantity">{sentenceCase('max_minmax_quantity')}: </label>
                          <input
                            type="number"
                            name="max_minmax_quantity"
                            id="max_minmax_quantity"
                            style={{ backgroundColor: 'white' }}
                            value={rowData.max_minmax_quantity}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>
                        <div>
                          <label htmlFor="minimum_order_quantity">{sentenceCase('minimum_order_quantity')}: </label>
                          <input
                            type="number"
                            name="minimum_order_quantity"
                            id="minimum_order_quantity"
                            style={{ backgroundColor: 'white' }}
                            value={rowData.minimum_order_quantity}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>
                        <div>
                          <label htmlFor="maximum_order_quantity">{sentenceCase('maximum_order_quantity')}: </label>
                          <input
                            type="number"
                            name="maximum_order_quantity"
                            id="maximum_order_quantity"
                            style={{ backgroundColor: 'white' }}
                            value={rowData.maximum_order_quantity}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>
                        <div>
                          <label htmlFor="description">{sentenceCase('description')}: </label>
                          <textarea
                            name="description"
                            id="description"
                            title="Maximum 240 characters are allowed."
                            style={{ height: '30px' }}
                            value={rowData.description}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>
                      </Stack>
                      <Grid container spacing={2} style={{ marginTop: '25px' }}>
                        <Grid item xs={3} style={{ display: 'flex' }}>
                          <Button
                            style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
                            onClick={handleEdit}
                          >
                            Submit
                          </Button>
                          <Button
                            style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
                            onClick={handleClose}
                          >
                            Back
                          </Button>
                        </Grid>
                      </Grid>
                    </DialogContent>
                    {/* <DialogActions>
                      <Button autoFocus onClick={handleEdit}>
                        Submit
                      </Button>
                      <Button onClick={handleClose} autoFocus>
                        Cancel
                      </Button>
                    </DialogActions> */}
                  </Dialog>
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
