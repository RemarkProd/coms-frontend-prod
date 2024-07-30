/* eslint-disable import/no-unresolved */
/* eslint-disable camelcase */

import { filter } from 'lodash';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { read, utils } from 'xlsx';
// @mui

import {
  Button,
  Card,
  Container,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Typography,
} from '@mui/material';

// components
import ExcelListHead from 'src/sections/@dashboard/user/ExcelListHead';
import ExcelListToolbar from 'src/sections/@dashboard/user/ExcelListToolbar';
import { postReconciledDataExcelService } from '../Services/ApiServices';
import Scrollbar from '../components/scrollbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Status', alignRight: false },
  { id: 'value', label: 'remarks', alignRight: false },
  { id: 'id', label: 'DepositDate', alignRight: false },
  { id: 'id', label: 'CompanyBank', alignRight: false },
  { id: 'id', label: 'CompanyAccount', alignRight: false },
  { id: 'id', label: 'CompanyName', alignRight: false },
  { id: 'id', label: 'CustomerCode', alignRight: false },
  { id: 'id', label: 'CustomerName', alignRight: false },
  { id: 'id', label: 'CustomerGroup', alignRight: false },
  { id: 'id', label: 'Amount', alignRight: false },
  { id: 'id', label: 'InvoiceNumber', alignRight: false },
  { id: 'id', label: 'DepositType', alignRight: false },
  { id: 'id', label: 'DepositFromBank', alignRight: false },
  { id: 'id', label: 'DepositFromBranch', alignRight: false },
  { id: 'id', label: 'ReceiptNumber', alignRight: false },
  { id: 'age', label: 'Depositor', alignRight: false },
  { id: 'name', label: 'Employee', alignRight: false },
  { id: 'value', label: 'UserName', alignRight: false },
  { id: 'id', label: 'GLDate', alignRight: false },
  { id: 'id', label: 'GLAmount', alignRight: false },
  { id: 'id', label: 'CashReceiptId', alignRight: false },
];
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
    return filter(array, (_user) => _user.location_code.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function UploadReconciledDepositsExcel() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [USERLIST, setUserList] = useState([]);

  const [exceldata, setExceldata] = useState([]);

  const [isDisableApprove, setIsDisableApprove] = useState(false);

  const [isDisableBan, setIsDisableBan] = useState(false);

  const [selectedUserEmail, setSelectedUserEmail] = useState('');
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
  const formattedData = exceldata.map((item) => ({
    cashReceiptId: item.CashReceiptId,
    status: item.Status,
    depositDate: item.DepositDate,
    // entryDate: item.EntryDate,
    // companyBank: item.CompanyBank,
    // companyAccount: item.CompanyAccount,
    // companyName: item.CompanyName,
    payFromCustomer: item.PayFromCustomer,
    // customerName: item.CustomerName,
    // customerGroup: item.CustomerGroup,
    amount: item.Amount,
    // invoiceNumber: item.InvoiceNumber,
    // depositType: item.DepositType,
    // depositFromBank: item.DepositFromBank,
    // depositFromBranch: item.DepositFromBranch,
    // receiptNumber: item.ReceiptNumber,
    glDate: item.GLDate,
    glAmount: item.GLAmount,
    // depositor: item.Depositor,
    // employee: item.Employee,
    // userName: item.UserName,
    remarks: item.Remarks,
    // id: item.ID,
    // age: item.AGE,
    // name: item.NAME,
    // value: item.VALUE,
  }));
  console.log(formattedData);

  const saveExcelData = async () => {
    let postData;
    try {
      if (formattedData) {
        postData = await postReconciledDataExcelService(formattedData);
      }
      console.log('Hola', postData);
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
    if (postData.status === 200) {
      alert('Succefully Added');
      window.location.reload();
    }
  };

  const handleCloseMenu = () => {
    setOpen(null);
    window.location.reload();
  };

  const approveUser = async () => {
    const body = {
      status: 'approved',
      email: selectedUserEmail,
    };

    handleCloseMenu();
    window.location.reload();
  };

  const banUser = async () => {
    const body = {
      status: 'banned',
      email: selectedUserEmail,
    };

    handleCloseMenu();
    window.location.reload();
  };

  const handleRequestSort = (event, property) => {
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
    console.log('toselectedUsers : ', selectedUsers);
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
  console.log(exceldata);
  const paginatedData = exceldata.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - exceldata.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Upload Reconciled Deposits | COMS </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Upload Reconciled Deposits
          </Typography>
          <div>
            <input type="file" onChange={handleChange} />
          </div>
        </Stack>

        <Card>
          <ExcelListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            selectedUsers={selected}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ExcelListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={exceldata.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />

                <TableBody>
                  {paginatedData.length ? (
                    paginatedData.map((info, index) => (
                      <tr key={index}>
                        <td>{info.Status}</td>
                        <td>{info.Remarks}</td>
                        <td>{info.DepositDate}</td>
                        <td>{info.EntryDate}</td>
                        <td>{info.CompanyBank}</td>
                        <td>{info.CompanyAccount}</td>
                        <td>{info.PayFromCustomer}</td>
                        <td>{info.CustomerName}</td>
                        <td>{info.CustomerGroup}</td>
                        <td>{info.Amount}</td>
                        <td>{info.InvoiceNumber}</td>
                        <td>{info.DepositType}</td>
                        <td>{info.DepositFromBank}</td>
                        <td>{info.DepositFromBranch}</td>
                        <td>{info.ReceiptNumber}</td>
                        <td>{info.Depositor}</td>
                        <td>{info.Employee}</td>
                        <td>{info.UserName}</td>
                        <td>{info.GLDate}</td>
                        <td>{info.GLAmount}</td>
                        <td>{info.CashReceiptId}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', height: '100px', verticalAlign: 'middle' }}>
                        <h2>Data Not Present</h2>
                      </td>
                    </tr>
                  )}
                  {emptyRows > 0 && (
                    <tr style={{ height: 53 * emptyRows }}>
                      <td colSpan={4} />
                    </tr>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={exceldata.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
        {/* <button
          data-mdb-button-init=""
          className="carousel-control-prev position-relative"
          type="button"
          data-mdb-target="#carouselMultiItemExample"
          data-mdb-slide="prev"
          onClick={saveExcelData}
        /> */}

        <Button style={{ backgroundColor: 'lightgray', color: 'black' }} onClick={saveExcelData}>
          Add Excel Data to DB
        </Button>
      </Container>
    </>
  );
}
