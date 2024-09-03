/* eslint-disable react/no-unknown-property */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-undef */
/* eslint-disable import/named */

import { Button, Container, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  addUserAssign,
  getFndUserIds,
  getMenusDetails,
  getSelectIdsMenus,
  updateMenuService,
} from '../Services/ApiServices';
import { useUser } from '../context/UserContext';

// Add this import statement

export default function MenuCreation() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [userInput, setUserInput] = useState('');
  // const [user, setUser] = useState('');
  const [showMenuLines, setShowMenuLines] = useState(false);
  const [selectid, setSelectid] = useState('');
  const [list, setList] = useState([]);
  const [menuslist, setMenuslist] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [account, setAccount] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAssignNewMenuButton, setShowAssignNewMenuButton] = useState(false);

  const [menurows, setMenuRows] = useState([
    {
      menuId: '',
      userId: '',
      userName: '',
      fromDate: null,
      toDate: null,
      showList: false,
    },
  ]);

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
        const response = await getFndUserIds();
        console.log(response);
        if (response.status === 200) {
          setList(response.data);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
      console.log(list);
    }

    fetchData();
  }, []);

  const [menuids, setMenuIds] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getMenusDetails(user);
        console.log('hhh', response);
        if (response) setMenuIds(response.data);
        console.log(menuids);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        // const response = await getSelectIdsMenus(user, selectid);
        if (menurows[0].userId) {
          console.log(menurows);
          const response = await getSelectIdsMenus(user, menurows[0].userId);
          console.log(response);
          if (response.status === 200) {
            setMenuslist(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
      // console.log(list);
    }

    fetchData();
  }, [menurows]);
  console.log(menuslist);

  function clearMenu() {
    setMenuRows([
      {
        menuId: '',
        userId: '',
        userName: '',
        fromDate: null,
        toDate: null,
        showList: false,
      },
    ]);
    setMenuslist([]);
  }
  const [count, setCount] = useState(0);
  const saveSubMenus = async () => {
    try {
      const filteredArray = menurows.filter((item) => Object.values(item).some((value) => value !== ''));

      let c;
      for (c = count; c < filteredArray.length; c++) {
        const lineInfo = filteredArray[c];
        console.log(lineInfo);

        const requestBody = {
          menuId: lineInfo.menuId,
          userId: lineInfo.userId,
          fromDate: lineInfo.fromDate,
          toDate: lineInfo.toDate,
        };

        const response = await addUserAssign(requestBody);

        if (response.status !== 200) {
          throw new Error('Process failed! Try again');
        }
      }
      setCount(c);
      setShowAssignNewMenuButton(false);
      setShowMenuLines(false);
      clearMenu();

      alert('Successfully added');
      navigate('/dashboard/menuassign');
    } catch (error) {
      console.log(error);
      alert('Process failed! Try again');
    }
    // window.location.reload();
  };

  const handleAddRow = () => {
    if (menurows.length === 1) setShowMenuLines(true);
    if (showMenuLines) {
      setMenuRows([
        ...menurows,
        {
          menuId: '',
          userId: '',
          userName: '',

          showList: false,
        },
      ]);
    }
    console.log(menurows);
  };

  const handleInputChanges = (index, name, value) => {
    console.log('index', index);
    console.log('name', name);
    console.log('value', value);
    const updatedRows = [...menurows];
    updatedRows[index][name] = value;
    // setSelectedItem(null);
    setMenuRows(updatedRows);
  };

  const handleDateChanges = (index, name, value) => {
    const updatedList = [...menuslist];
    updatedList[index][name] = value;

    setMenuslist(updatedList);
  };

  const handleInputItemChange = (index, event) => {
    console.log(event);
    const input = event.target.value;

    const username = 'userName';

    const show = 'showList';

    const updatedRows = [...menurows];

    updatedRows[index][username] = input;

    updatedRows[index][show] = true;

    setMenuRows(updatedRows);
    console.log(menurows);

    // Filter the original list based on the input

    const filtered = list.filter((item) => item.user_name.toLowerCase().includes(input.toLowerCase()));
    setFilteredList(filtered);
  };

  const handleMenuItemClick = (index, item) => {
    console.log(index);
    console.log(item.user_id);
    console.log(item.user_name);
    setSelectid(item.user_id);
    console.log(selectid);

    const name = 'userId';
    const username = 'userName';
    const show = 'showList';

    const updatedRows = [...menurows];
    updatedRows[index][name] = item.user_id;
    updatedRows[index][username] = item.user_name;

    updatedRows[index][show] = false;
    console.log(updatedRows);
    setMenuRows(updatedRows);
    setSelectedItem(item);
    setShowAssignNewMenuButton(true);
  };

  const handleClose = () => {
    clearMenu();
    // window.location.reload();
    // setOpen(false);
    navigate('/dashboard/menuassign');
  };

  const saveUpdateMenu = async () => {
    try {
      await Promise.all(menuslist.map((menuInfo) => updateMenuDates(menuInfo)));
      alert('Successfully updated!');
    } catch (error) {
      console.error('Error updating menu: ', error);
    }
  };

  const updateMenuDates = async (value) => {
    try {
      const requestBody = {
        userId: value.user_id,
        menuId: value.menu_id,
        fromDate: value.from_date,
        toDate: value.to_date,
      };
      const response = await updateMenuService(user, requestBody);
    } catch (error) {
      console.error('Error updating menu dates:', error);
      throw error;
    }
  };

  function getFormattedDate(value) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Zero-padding the month
    const day = String(date.getDate()).padStart(2, '0'); // Zero-padding the day

    // return `${day}/${month}/${year}`;
    return `${year}-${month}-${day}`;
  }

  function getFormattedCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Zero-padding the month
    const day = String(currentDate.getDate()).padStart(2, '0'); // Zero-padding the day

    return `${year}-${month}-${day}`;
  }

  const filteredMenuOptions = menuids.map((option) => ({ value: option.menu_id, label: option.menu_description }));

  return (
    <>
      <Helmet>
        <title> COMS | System Menu </title>
      </Helmet>
      <Container style={{ display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="left" mb={3}>
          <Typography variant="h4" gutterBottom style={{ whiteSpace: 'nowrap', marginRight: '10px' }}>
            User Menu Assignment
          </Typography>
          <input
            select
            type="text"
            name="userId"
            placeholder="Type to select User"
            className="form-control"
            value={menurows[0].userName}
            onChange={(e) => handleInputItemChange(0, e)}
            style={{ width: '30%', height: '35px' }}
          />
          <div
            style={{
              marginLeft: '2px',
              // border: '1px dotted lightgray',
              borderRadius: '5px',
              maxHeight: '70px',
              width: '40%',
              overflow: 'auto',
              // backgroundColor: 'white'
            }}
          >
            {menurows[0].showList && (
              <ul>
                {filteredList.map((item, itemIndex) => (
                  <MenuItem key={itemIndex} defaultValue={item.user_name} onClick={(e) => handleMenuItemClick(0, item)}>
                    {item.user_name}
                  </MenuItem>
                ))}
              </ul>
            )}
          </div>
        </Stack>
        <Grid container spacing={2} style={{ display: 'flex', flexDirection: 'row', marginLeft: '0px' }}>
          <div style={{ width: '100%' }}>
            <form className="form-horizontal">
              <div className="table-responsive">
                <table className="table table-bordered table-striped table-highlight">
                  <thead>
                    <tr>
                      {/* <th>
                        User Name <span style={{ color: 'red' }}>*</span>
                      </th> */}
                      <th style={{ width: '40%' }}>Active Menu</th>
                      <th style={{ width: '30%' }}>From Date</th>
                      <th>To Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItem &&
                      menuslist.length > 0 &&
                      menuslist.map((item, i) => (
                        <tr key={i}>
                          <td>{item.menu_description}</td>
                          <td>
                            <input
                              type="date"
                              className="form-control"
                              name="from_date"
                              value={item.from_date ? getFormattedDate(item.from_date) : getFormattedCurrentDate()}
                              onChange={(e) => handleDateChanges(i, e.target.name, e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              className="form-control"
                              name="to_date"
                              value={item.to_date ? getFormattedDate(item.to_date) : ''}
                              onChange={(e) => handleDateChanges(i, e.target.name, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <Grid item xs={6} style={{ display: 'flex', flexDirection: 'row' }}>
                <Button
                  style={{
                    marginRight: '10px',
                    fontWeight: 'bold',
                    color: 'black',
                    backgroundColor: 'lightgray',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={saveUpdateMenu}
                >
                  Update Menu
                </Button>
                <Button
                  style={{
                    fontWeight: 'bold',
                    color: 'black',
                    backgroundColor: 'lightgray',
                    whiteSpace: 'nowrap',
                    marginRight: '10px',
                  }}
                  onClick={handleClose}
                >
                  Clear
                </Button>
                {showAssignNewMenuButton && (
                  <Button
                    style={{
                      fontWeight: 'bold',
                      color: 'black',
                      backgroundColor: 'lightgray',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={(e) => setShowMenuLines(true)}
                  >
                    Assign new menu
                  </Button>
                )}
              </Grid>
            </form>
          </div>

          {showMenuLines && (
            <div className="table-responsive" style={{ marginTop: '20px', width: '100%' }}>
              <table className="table table-bordered table-striped table-highlight">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>
                      Select Menu <span style={{ color: 'red' }}>*</span>
                    </th>
                    <th style={{ width: '30%' }}>From Date</th>
                    <th>To Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {/* <Select
                        value={menurows[0].menuId}
                        onChange={(e) => handleInputChanges(0, e.target.name, e.target.value)}
                        options={filteredMenuOptions}
                        placeholder="Type to select..."
                        isClearable
                      /> */}
                      <TextField
                        select
                        fullWidth
                        name="menuId"
                        value={menurows[0].menuId}
                        onChange={(e) => handleInputChanges(0, e.target.name, e.target.value)}
                      >
                        <MenuItem value={null}>
                          <em />
                        </MenuItem>
                        {menuids &&
                          menuids.map((id, index) => (
                            <MenuItem key={index} value={id.menu_id}>
                              {id.menu_description}
                            </MenuItem>
                          ))}
                      </TextField>
                    </td>
                    <td>
                      <input
                        type="date"
                        className="form-control"
                        name="fromDate"
                        value={menurows[0].fromDate || getFormattedCurrentDate()}
                        onChange={(e) => handleInputChanges(0, e.target.name, e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="form-control"
                        name="toDate"
                        value={menurows[0].toDate}
                        onChange={(e) => handleInputChanges(0, e.target.name, e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <Button
                style={{
                  marginRight: '10px',
                  fontWeight: 'bold',
                  color: 'black',
                  backgroundColor: 'lightgray',
                  whiteSpace: 'nowrap',
                }}
                onClick={saveSubMenus}
              >
                Assign menu
              </Button>
            </div>
          )}
        </Grid>
      </Container>
    </>
  );
}
