/* eslint-disable dot-notation */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-globals */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-key */
/* eslint-disable camelcase */
// import Button from '@mui/material/Button';
import { Button, Container, Grid } from '@mui/material';
import { sentenceCase } from 'change-case';
import { filter } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
// @mui
import { useUser } from '../context/UserContext';
// components
// sections
import {
  addShopItemsService,
  checkUserActionAssignment,
  getAllCustomerService,
  getItemsListService,
  getShopsListService,
  getUserProfileDetails,
} from '../Services/ApiServices';
import DepositListToolbar from '../sections/@dashboard/deposits/shopItemsToolbar';

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

export default function AddShopItems() {
  const tableref = useRef(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [USERLIST, setUserList] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [customers, setCustomers] = useState([]);
  const { user } = useUser();

  const [itemIds, setItemIds] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getItemsListService(user);
        console.log('hhh', response.data);
        if (response) setItemIds(response.data);
        console.log(itemIds);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, []);
  console.log(itemIds);

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

    fetchData();
  }, [account]);
  console.log(canEdit);

  useEffect(() => {
    async function fetchData() {
      try {
        if (account) {
          console.log(account.user_id);
          const response = await getShopsListService(user);

          if (response.status === 200) {
            setUserList(response.data);
            console.log(response.data);
            const uniqueShops = new Set();
            response.data.forEach((obj) => {
              uniqueShops.add(JSON.stringify({ shop_id: obj.shop_id, shop_name: obj.shop_name }));
            });

            const customerList = Array.from(uniqueShops).map((item) => JSON.parse(item));
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

  console.log(customers);

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

  function getFormattedPrice(value) {
    const formattedPrice = new Intl.NumberFormat().format(value);
    console.log(parseInt(formattedPrice, 10));

    return formattedPrice;
  }

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const [filterInfo, setFilterInfo] = useState({
    shopId: '',
    shopName: '',
  });

  const [itemInfo, setItemInfo] = useState({
    description: '',
    inventory_item_id: '',
  });

  const handleFilterInfo = (e) => {
    console.log(e.target.name, e.target.value);
    setItemInfo({ ...itemInfo, [e.target.name]: e.target.value });
  };
  console.log(filterInfo);

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [rows, setRows] = useState([
    {
      description: '',
      inventory_item_id: '',
      startDateActive: '',
      endDateActive: '',
      remarks: '',
    },
  ]);

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: '300px',
    }),
  };

  const [showLines, setShowLines] = useState(false);
  const handleRowSelect = (index, row) => {
    console.log(row);
    const updatedSelectedLines = [...selectedLines];
    const lineIndex = updatedSelectedLines.indexOf(row.lineId);

    const updatedSelectedRows = [...selectedRows];
    const rowIndex = updatedSelectedRows.indexOf(index);

    if (rowIndex === -1) {
      updatedSelectedRows.push(index);
    } else {
      updatedSelectedRows.splice(rowIndex, 1);
    }

    if (lineIndex === -1) {
      updatedSelectedLines.push(row.lineId);
    } else {
      updatedSelectedLines.splice(lineIndex, 1);
    }

    setSelectedRows(updatedSelectedRows);
    setSelectedLines(updatedSelectedLines);
  };
  const handleInputChange = (index, name, value) => {
    // itemInfo.inventory_item_id = selectedOption.value;
    // itemInfo.description = selectedOption.label;
    console.log(index);
    console.log(name);
    console.log(value);
    const updatedRows = [...rows];
    updatedRows[index][name] = value;
    setRows(updatedRows);
  };
  const handleAddRow = () => {
    console.log(rows);
    if (rows.length === 1) setShowLines(true);
    if (showLines)
      setRows([
        ...rows,
        {
          description: '',
          inventory_item_id: '',
          startDateActive: '',
          endDateActive: '',
          remarks: '',
        },
      ]);
    console.log(rows);
  };

  const handleDeleteRows = () => {
    const updatedRows = rows.filter((_, index) => !selectedRows.includes(index));
    setRows(updatedRows);
    setSelectedRows([]);
  };
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  // const handleChange = (selectedOption) => {

  //   console.log(selectedOption);
  //   setSelectedOption(selectedOption);
  //   itemInfo.inventory_item_id = selectedOption.value;
  //   itemInfo.description = selectedOption.label;
  //   // const updatedRows = [...rows];
  //   // updatedRows[index][name] = value;
  //   // console.log(updatedRows);
  //   // setRows(updatedRows);
  // };
  const handleChange = (index, selectedOption) => {
    const updatedRows = [...rows];
    updatedRows[index]['inventory_item_id'] = selectedOption.value;
    updatedRows[index]['description'] = selectedOption.label;
    setRows(updatedRows);
    itemInfo.inventory_item_id = selectedOption.value;
    itemInfo.description = selectedOption.label;
  };
  console.log(itemInfo);

  const handleInputChanges = (inputValue) => {
    console.log(inputValue);
    setInputValue(inputValue);
  };
  const filteredOptions = itemIds
    .filter((option) => option.description.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.inventory_item_id, label: `${option.description}` }));

  const [count, setCount] = useState(0);
  const saveSubMenus = async () => {
    console.log(rows);
    try {
      const filteredArray = rows.filter((item) => Object.values(item).some((value) => value !== ''));

      let c;
      for (c = count; c < filteredArray.length; c++) {
        const lineInfo = filteredArray[c];
        console.log(filterInfo);
        console.log(lineInfo);

        const requestBody = {
          shopName: filterInfo.shopName,
          shopId: filterInfo.shopId,
          assetId: lineInfo.inventory_item_id,
          dateEffective: lineInfo.startDateActive,
          dateIneffective: lineInfo.endDateActive,
          remarks: lineInfo.remarks,
        };
        console.log(requestBody);
        const response = await addShopItemsService(user, requestBody);

        if (response.status !== 200) {
          throw new Error('Process failed! Try again');
        }
      }
      setCount(c);

      alert('Successfully added');
    } catch (error) {
      console.log(error);
      alert('Process failed! Try again');
    }
    window.location.reload();
  };

  return (
    <>
      <Helmet>
        <title> COMS | Deposits </title>
      </Helmet>
      <DepositListToolbar
        numSelected={selected.length}
        filterName={filterName}
        onFilterName={handleFilterByName}
        selectedUsers={selected}
        filterDetails={filterInfo}
        customerGroupList={customerGroups}
        customerList={customers}
      />
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={3} style={{ display: 'flex' }}>
            <Button
              style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
              onClick={saveSubMenus}
            >
              Save
            </Button>
            <Button
              style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
              onClick={handleDeleteRows}
            >
              Delete
            </Button>
            <Button style={{ backgroundColor: 'lightgray', color: 'black' }} onClick={handleAddRow}>
              Add Lines
            </Button>
          </Grid>
        </Grid>
      </Container>
      <form className="form-horizontal" style={{ marginTop: '30px', marginLeft: '57px', marginRight: '20px' }}>
        <div className="table-responsive">
          <table
            className="table table-bordered table-striped table-highlight"
            style={{ tableLayout: 'fixed', width: '100%', marginBottom: '200px' }}
          >
            <colgroup>
              <col style={{ width: '25px' }} />
              <col style={{ width: '220px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '255px' }} />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={() => {
                      // Select or deselect all rows
                      const allRowsSelected = selectedRows.length === rows.length;
                      const newSelectedRows = allRowsSelected ? [] : rows.map((_, index) => index);
                      setSelectedRows(newSelectedRows);
                    }}
                    checked={selectedRows.length === rows.length && rows.length !== 0}
                  />
                </th>
                <th style={{ whiteSpace: 'nowrap' }}>
                  {sentenceCase('Item List')} <span style={{ color: 'red' }}>*</span>
                </th>
                <th style={{ whiteSpace: 'nowrap' }}>{sentenceCase('start_date_active')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{sentenceCase('end_date_active')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{sentenceCase('remarks')}</th>
              </tr>
            </thead>
            <tbody>
              {showLines &&
                rows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="checkbox"
                        onChange={() => handleRowSelect(index, row)}
                        checked={selectedRows.includes(index)}
                      />
                    </td>
                    <td>
                      <Select
                        id="inventory_item_id"
                        name="inventory_item_id"
                        value={row.description ? { value: row.inventory_item_id, label: row.description } : null}
                        onChange={(selectedOption) => handleChange(index, selectedOption)}
                        onInputChange={handleInputChanges}
                        options={filteredOptions}
                        placeholder="Type to select..."
                        isClearable
                        style={{ backgroundColor: 'white', height: '100%' }}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        name="startDateActive"
                        className="form-control"
                        style={{ backgroundColor: 'white' }}
                        onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        name="endDateActive"
                        className="form-control"
                        style={{ backgroundColor: 'white' }}
                        onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                      />
                    </td>
                    <td>
                      <textarea
                        name="remarks"
                        className="form-control"
                        title="Maximum 240 characters are allowed."
                        style={{ height: '35px' }}
                        onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </form>
    </>
  );
}
