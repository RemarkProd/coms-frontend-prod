/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-key */
/* eslint-disable camelcase */
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { sentenceCase } from 'change-case';
import { format } from 'date-fns';
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
import { getUomDetails, updateUomDetails } from '../Services/ApiServices';
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
    return filter(array, (_user) => _user.unit_of_measure.toLowerCase().indexOf(query.toLowerCase()) !== -1);
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
        const usersDetails = await getUomDetails();

        if (usersDetails) {
          const uom = usersDetails.data.map((data) => updateUomInfo(data));
          setUserList(uom);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, []);

  function updateUomInfo(uom) {
    if (uom.last_update_date) {
      const date = new Date(uom.last_update_date);

      uom.last_update_date = format(date, 'dd-MM-yyyy');
    }

    if (uom.creation_date) {
      const date = new Date(uom.creation_date);

      uom.creation_date = format(date, 'dd-MM-yyyy');
    }

    if (uom.disable_date) {
      const date = new Date(uom.disable_date);

      uom.disable_date = format(date, 'dd-MM-yyyy');
    }

    return uom;
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
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const isDisable = true;

  const handleEdit = async () => {
    const { unit_of_measure, uom_code, uom_class, last_update_date, last_updated_by, created_by, creation_date } =
      rowData;
    try {
      const uomBody = {
        unitOfMeasure: unit_of_measure,
        uomCode: uom_code,
        uomClass: uom_class,
        lastUpdateDate: last_update_date,
        lastUpdatedBy: last_updated_by,
        createdBy: created_by,
        creationDate: creation_date,
        description: rowData.description ? rowData.description : '',
      };

      const response = await updateUomDetails(uomBody);

      if (response.status === 200) {
        alert('Successfully updated!');
      } else {
        console.log(response);
        alert('Process failed! Try again later');
      }

      handleClose();
      navigate('/dashboard/uom', { replace: true });
      // window.location.reload();
      console.log(uomBody);
    } catch (err) {
      console.log(err.message);
      alert('Process failed! Try again later');
    }
  };

  // const TABLE_HEAD = Object.keys(USERLIST[0]).map((column => ({id: column, label: sentenceCase(column), alignRight: false})));
  // TABLE_HEAD.push({id: ''})
  const TABLE_HEAD = [
    // { id: '' },
    { id: 'unit_of_measure', label: sentenceCase('unit_of_measure'), alignRight: false },
    { id: 'uom_code', label: sentenceCase('uom_code'), alignRight: false },
    { id: 'uom_class', label: sentenceCase('uom_class'), alignRight: false },
    { id: 'disable_date', label: sentenceCase('disable_date'), alignRight: false },
    { id: 'description', label: sentenceCase('description'), alignRight: false },
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

  const addCustomer = () => {
    // navigate('/dashboard/add-uom');
    navigate('/dashboard/customers/add', { replace: true });
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> COMS | Customers </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Customers
          </Typography>
          <Button
            variant="text"
            startIcon={<Iconify icon="eva:plus-fill" />}
            color="primary"
            onClick={addCustomer}
            style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px' }}
          >
            Add Customers
          </Button>
        </Stack>

        <Card>
          <UomListToolbar
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
                    const { unit_of_measure, uom_code, uom_class, disable_date, description } = row;
                    const rowValues = [unit_of_measure, uom_code, uom_class, disable_date, description];
                    const selectedUser = selected.indexOf(unit_of_measure) !== -1;

                    return (
                      <TableRow hover key={unit_of_measure} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, unit_of_measure)} />
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
                          <label htmlFor="unit_of_measure">Unit of Measure: </label>
                          <input
                            required
                            id="unit_of_measure"
                            name="unit_of_measure"
                            title="Maximum 25 characters are allowed."
                            value={rowData.unit_of_measure}
                            onChange={(e) => onValueChange(e)}
                            disabled={isDisable}
                          />
                        </div>

                        <div>
                          <label htmlFor="uom_code">UOM Code: </label>
                          <input
                            required
                            id="uom_code"
                            name="uom_code"
                            title="Maximum 3 characters are allowed."
                            value={rowData.uom_code}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>

                        <div>
                          <label htmlFor="uom_class">UOM Class: </label>
                          <input
                            required
                            id="uom_class"
                            name="uom_class"
                            title="Maximum 10 characters are allowed."
                            value={rowData.uom_class}
                            onChange={(e) => onValueChange(e)}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                          <label htmlFor="description">Description: </label>
                          <textarea
                            id="description"
                            name="description"
                            title="Maximum 50 characters are allowed."
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
