/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-key */
/* eslint-disable camelcase */
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { sentenceCase } from 'change-case';
import { filter } from 'lodash';
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
import { deleteShopRoutesService, getRouteMasterService, updateShopRoutesService } from '../Services/ApiServices';
import UomListToolbar from '../sections/@dashboard/uom/UomListToolbar';
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
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.route_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
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
        const response = await getRouteMasterService();

        if (response.status === 200) {
          setUserList(response.data);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, []);

  const [open, setOpen] = useState(false);
  const [rowData, setRowData] = useState(null);

  const onValueChange = (e) => {
    console.log(rowData);
    setRowData({ ...rowData, [e.target.name]: e.target.value });
  };

  const handleClickOpen = (row) => {
    console.log(row);
    setRowData(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const isDisable = true;

  const handleEdit = async () => {
    const { route_id, route_name, route_category } = rowData;
    try {
      const requestBody = {
        route_id,
        route_name,
        route_category,
      };
      const response = await updateShopRoutesService(requestBody);

      if (response.status === 200) {
        alert('Successfully updated!');
      } else {
        console.log(response);
        alert('Process failed! Try again later');
      }

      handleClose();
      navigate('/dashboard/routeMaster', { replace: true });
      // window.location.reload();
    } catch (err) {
      console.log(err.message);
      alert('Process failed! Try again later');
    }
  };

  const TABLE_HEAD = [
    { id: 'route_name', label: sentenceCase('route_name'), alignRight: false },
    { id: 'route_category', label: sentenceCase('route_category'), alignRight: false },
    { id: '' },
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

  const addRoutes = () => {
    navigate('/dashboard/routeMaster/add', { replace: true });
  };

  const deleteRoutes = async () => {
    const result = selected.map(async (element) => {
      try {
        const response = await deleteShopRoutesService(element);

        const alertMessage = response.status === 200 ? response.data.message : 'Service failed! Try again';
        alert(alertMessage);
        window.location.reload();
      } catch (err) {
        console.log(err.message);
      }
    });
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> COMS | Routes </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Route Master
          </Typography>
          <Button
            variant="text"
            startIcon={<Iconify icon="eva:plus-fill" />}
            color="primary"
            onClick={addRoutes}
            style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px' }}
          >
            Add Routes
          </Button>
        </Stack>

        <Card>
          <UomListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            selectedUsers={selected}
            onDeleteRoutes={deleteRoutes}
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
                    const { route_id, route_name, route_category } = row;
                    const rowValues = [route_name, route_category];
                    const selectedUser = selected.indexOf(route_id) !== -1;

                    return (
                      <TableRow hover key={route_id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, route_id)} />
                        </TableCell>

                        {rowValues.map((value) => (
                          <TableCell align="left">{value}</TableCell>
                        ))}

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
                    <DialogTitle>Edit UOM</DialogTitle>
                    <Stack />
                    <DialogContent>
                      <Stack
                        spacing={1}
                        direction="row" // Set the direction to "row" for horizontal alignment
                        alignItems="center"
                      >
                        <div>
                          <label htmlFor="route_name">Route Name: </label>
                          <input
                            required
                            id="route_name"
                            name="route_name"
                            value={rowData.route_name}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>

                        <div>
                          <label htmlFor="route_category">Route Category: </label>
                          <input
                            required
                            id="route_category"
                            name="route_category"
                            value={rowData.route_category}
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
