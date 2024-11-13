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
import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
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
import Select from 'react-select';
import {
  dowloadBankDepositReceiptService,
  getAllTerritoryService,
  getAreaService,
  getBeatsService,
  getBrandingAssetsChildItemsService,
  getBrandingAssetsItemImagesService,
  getBrandingAssetsItemsService,
  getRegionService,
  getTerritoriesService,
  getTownsService,
  getUserProfileDetails,
  updateTerritoryRating,
} from '../Services/ApiServices';
// @mui
import { useUser } from '../context/UserContext';
import NewListHead from '../sections/@dashboard/user/NewListHead';
// styles
import '../_css/Utils.css';

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
  { id: 'territory_name', label: 'Name' },
  { id: 'tsm_code', label: 'TSM Code' },
  { id: 'tsm_name', label: 'TSM Name' },
  {
    id: 'distributor_count',
    label: (
      <>
        Distributor <br /> Count
      </>
    ),
  },
  {
    id: 'sales_officer_count',
    label: (
      <>
        SO <br /> Count
      </>
    ),
  },
  {
    id: 'population_count',
    label: (
      <>
        Population <br /> Count
      </>
    ),
  },
  {
    id: 'sales_analysis',
    label: (
      <>
        Sales <br /> Analysis
      </>
    ),
  },
  {
    id: 'collection_analysis',
    label: (
      <>
        Collection <br /> Analysis
      </>
    ),
  },
  {
    id: 'coverage_analysis',
    label: (
      <>
        Coverage <br /> Analysis
      </>
    ),
  },
  { id: 'rating', label: 'Rating' },
  { id: 'rating' },
];

export default function ItemsDashBoard() {
  const navigate = useNavigate();

  const { user } = useUser();
  const [filterDetails, setFilterDetails] = useState({});
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
  const [territoryIds, setTerritoryIds] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [hover, setHover] = useState([]);

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

  const [USERLIST, setUserList] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getAllTerritoryService();
        if (response) setUserList(response.data);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, []);
  console.log(USERLIST);

  useEffect(() => {
    async function fetchTerritoryIds() {
      if (account) {
        try {
          const response = await getAllTerritoryService();
          if (response.status === 200) {
            setTerritoryIds(response.data);
            console.log(territoryIds);

            setRatings(response.data.map((territory) => territory.rating)); // Set initial ratings from response
            setHover(Array(response.data.length).fill(-1)); // Initialize hover array
          }
        } catch (error) {
          console.error('Error fetching territory IDs:', error);
        }
      }
    }
    fetchTerritoryIds();
  }, [account]);
  console.log(ratings);

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

  const [selectedRegion, setSelectedRegion] = useState(null);
  const handleRegionChange = (selectedOption) => {
    setSelectedRegion(selectedOption);
    filterDetails.region = selectedOption.value;
    filterDetails.regionName = selectedOption.label;
    console.log(filterDetails);
  };

  const handleRegionInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredRegionOptions = regions
    .filter((option) => option.region_name.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.region_id, label: option.region_name }));

  //   selecting area
  const [areas, setAreas] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const requestBody = {
          regionId: filterDetails.region,
        };

        let response = {};
        if (filterDetails.region) response = await getAreaService(requestBody); // Call your async function here

        if (response.status === 200) setAreas(response.data);
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [filterDetails.region]);
  console.log(areas);

  const [selectedArea, setSelectedArea] = useState(null);
  const handleAreaChange = (selectedOption) => {
    setSelectedArea(selectedOption);
    filterDetails.area = selectedOption.value;
    filterDetails.areaName = selectedOption.label;
  };

  const handleAreaInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredAreaOptions = areas
    .filter((option) => option.area_name.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.area_id, label: option.area_name }));

  //   selecting territory
  const [territories, setTerritories] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const requestBody = {
          regionId: filterDetails.region,
          areaId: filterDetails.area,
        };

        let response = {};
        if (filterDetails.area) response = await getTerritoriesService(requestBody); // Call your async function here

        if (response.status === 200) setTerritories(response.data);
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [filterDetails.area]);
  console.log(territories);

  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const handleTerritoryChange = (selectedOption) => {
    setSelectedTerritory(selectedOption);
    filterDetails.territory = selectedOption.value;
    filterDetails.territoryName = selectedOption.label;
  };

  const handleTerritoryInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredTerritoryOptions = territories
    .filter((option) => option.territory_name.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.territory_id, label: option.territory_name }));

  //   selecting town
  const [towns, setTowns] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const requestBody = {
          regionId: filterDetails.region,
          areaId: filterDetails.area,
          territoryId: filterDetails.territory,
        };

        let response = {};
        if (filterDetails.territory) response = await getTownsService(requestBody); // Call your async function here

        if (response.status === 200) setTowns(response.data);
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [filterDetails.territory]);
  console.log(towns);

  const [selectedTown, setSelectedTown] = useState(null);
  const handleTownChange = (selectedOption) => {
    setSelectedTown(selectedOption);
    filterDetails.town = selectedOption.value;
    filterDetails.townName = selectedOption.label;
  };

  const handleTownInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredTownOptions = towns
    .filter((option) => option.town_name.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.town_id, label: option.town_name }));

  //   selecting beat
  const [beats, setBeats] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const requestBody = {
          regionId: filterDetails.region,
          areaId: filterDetails.area,
          territoryId: filterDetails.territory,
          townId: filterDetails.town,
        };

        let response = {};
        if (filterDetails.town) response = await getBeatsService(requestBody); // Call your async function here

        if (response.status === 200) setBeats(response.data);
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [filterDetails.town]);
  console.log(beats);

  const [selectedBeat, setSelectedBeat] = useState(null);
  const handleBeatChange = (selectedOption) => {
    setSelectedBeat(selectedOption);
    filterDetails.beat = selectedOption.value;
    filterDetails.beatName = selectedOption.label;
  };

  const handleBeatInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const filteredBeatOptions = beats
    .filter((option) => option.beat_name.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.beat_id, label: option.beat_name }));

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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);
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
      const response = await getAllTerritoryService();
      if (response) {
        let filteredData = response.data;
        console.log(filteredData);

        if (filterDetails.region) {
          filteredData = filteredData.filter((item) => item.region_id === filterDetails.region);
        }

        if (filterDetails.area) {
          filteredData = filteredData.filter((item) => item.area_id === filterDetails.area);
        }

        if (filterDetails.territory) {
          filteredData = filteredData.filter((item) => item.territory_id === filterDetails.territory);
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
    // setSelectedTown(null);
    // setSelectedShop(null);
    // setSelectedBeat(null);

    try {
      const response = await getAllTerritoryService();
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
  };

  const handleRatingChange = async (index, newValue) => {
    const updatedRatings = [...ratings];
    updatedRatings[index] = newValue;
    setRatings(updatedRatings);
    console.log(ratings);

    const territoryId = territoryIds[index].territory_id;
    console.log(territoryId);
    console.log(newValue);

    try {
      await saveRating(territoryId, newValue);
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const saveRating = async (territoryId, rating) => {
    try {
      const response = await updateTerritoryRating(territoryId, rating);
      if (response.status === 200) {
        console.log(`Rating for territory ${territoryId} updated successfully.`);
      } else {
        console.error('Failed to update rating.');
      }
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const handleHoverChange = (index, newHover) => {
    const updatedHover = [...hover];
    updatedHover[index] = newHover;
    setHover(updatedHover);
  };

  return (
    <>
      <Helmet>
        <title> COMS | Assets Tracking </title>
      </Helmet>
      <div className="indexing" style={{ paddingBottom: '0' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <div
            style={{
              width: '20%',
              border: '1px solid lightgrey',
              padding: '10px',
              //   marginRight: '10px',
            }}
          >
            <h6 className="textAlignCenter">Filter Territory</h6>

            <Stack direction="column" gap={1}>
              <div className="col-auto" style={filterFieldStyling}>
                <span style={{ marginRight: '5px', textAlign: 'start' }}>Region</span>
                <div>
                  <Select
                    id="region"
                    name="region"
                    // value={filterDetails.customer ? { value: filterDetails.customer, label: filterDetails.customer } : null}
                    value={selectedRegion}
                    onChange={handleRegionChange}
                    onInputChange={handleRegionInputChange}
                    options={filteredRegionOptions}
                    placeholder="Type to select..."
                    isClearable
                  />
                </div>
              </div>

              <div className="col-auto" style={filterFieldStyling}>
                <span style={{ marginRight: '5px', textAlign: 'start' }}>Area</span>
                <div>
                  <Select
                    value={selectedArea}
                    onChange={handleAreaChange}
                    onInputChange={handleAreaInputChange}
                    options={filteredAreaOptions}
                    placeholder="Type to select..."
                    isClearable
                  />
                </div>
              </div>

              <div className="col-auto" style={filterFieldStyling}>
                <span style={{ marginRight: '5px', textAlign: 'start' }}>Territory</span>
                <div>
                  <Select
                    value={selectedTerritory}
                    onChange={handleTerritoryChange}
                    onInputChange={handleTerritoryInputChange}
                    options={filteredTerritoryOptions}
                    placeholder="Type to select..."
                    isClearable
                  />
                </div>
              </div>

              <div className="col-auto" style={filterFieldStyling}>
                <span style={{ marginRight: '5px', textAlign: 'start' }}>Town</span>
                <div>
                  <Select
                    value={selectedTown}
                    onChange={handleTownChange}
                    onInputChange={handleTownInputChange}
                    options={filteredTownOptions}
                    placeholder="Type to select..."
                    isClearable
                    isDisabled
                  />
                </div>
              </div>

              <div className="col-auto" style={filterFieldStyling}>
                <span style={{ marginRight: '5px', textAlign: 'start' }}>Beat</span>
                <div>
                  <Select
                    value={selectedBeat}
                    onChange={handleBeatChange}
                    onInputChange={handleBeatInputChange}
                    options={filteredBeatOptions}
                    placeholder="Type to select..."
                    isClearable
                    isDisabled
                  />
                </div>
              </div>

              <Stack direction="row" gap={1}>
                <Button variant="contained" size="medium" style={{ width: '50%' }} onClick={handleFilterShops}>
                  Filter
                </Button>

                <Button variant="contained" size="medium" style={{ width: '50%' }} onClick={handleClearFilterShop}>
                  Clear
                </Button>
              </Stack>
            </Stack>
          </div>

          <div style={{ width: '80%', border: '1px solid lightgrey', padding: '10px' }}>
            <h6 className="textAlignCenter">Territory list</h6>

            <TableContainer>
              <Table>
                <NewListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={territoryIds.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {territoryIds.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const {
                      territory_id,
                      tsm_name,
                      tsm_code,
                      territory_name,
                      distributor_count,
                      sales_officer_count,
                      population_count,
                      monthly_sales_actual,
                      monthly_sales_target,
                      monthly_collection_actual,
                      monthly_collection_target,
                      company_outlet_count,
                      total_outlet_count,
                    } = row;

                    return (
                      <TableRow
                        hover
                        key={index}
                        // onClick={() => navigate(`/dashboard/viewTerritoryInsights/${territory_id}`)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f5f5f5' }, // Optional hover background color
                        }}
                      >
                        {/* <TableCell style={combinedStylingForRadioTableCell}>
                            <Radio checked={selectedUser} onChange={(event) => handleClick(event, shop_id)} />
                          </TableCell> */}
                        <TableCell align="left" style={{ paddingRight: '20px' }}>
                          {territory_name}
                        </TableCell>
                        <TableCell align="left" style={{ paddingRight: '20px' }}>
                          {tsm_code}{' '}
                        </TableCell>
                        <TableCell align="left" style={{ paddingRight: '20px' }}>
                          {tsm_name}
                        </TableCell>
                        <TableCell align="right" style={{ paddingRight: '20px' }}>
                          {distributor_count}
                        </TableCell>
                        <TableCell align="right" style={{ paddingRight: '20px' }}>
                          {sales_officer_count}
                        </TableCell>
                        <TableCell align="right" style={{ paddingRight: '20px' }}>
                          {population_count}
                        </TableCell>
                        <TableCell>
                          <div style={{ width: '50px', height: '50px', marginLeft: '0px' }}>
                            <CircularProgressbar
                              value={(monthly_sales_actual / monthly_sales_target) * 100}
                              text={`${monthly_sales_actual}`}
                            />
                          </div>
                        </TableCell>

                        <TableCell>
                          <div style={{ width: '50px', height: '50px', marginLeft: '0px' }}>
                            <CircularProgressbar
                              value={(monthly_collection_actual / monthly_collection_target) * 100}
                              text={`${monthly_collection_actual}`}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div style={{ width: '50px', height: '50px', marginLeft: '0px' }}>
                            <CircularProgressbar
                              value={(company_outlet_count / total_outlet_count) * 100}
                              // text={`${((monthly_collection_actual / monthly_collection_target) * 100).toFixed(1)}%`}
                              text={`${company_outlet_count}`}
                            />
                          </div>
                        </TableCell>

                        <TableCell>
                          {/* <TableCell>{territory.territory_name}</TableCell> */}

                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <Box
                                key={num}
                                onClick={() => handleRatingChange(index, num)}
                                onMouseEnter={() => handleHoverChange(index, num)}
                                onMouseLeave={() => handleHoverChange(index, -1)}
                                sx={{
                                  cursor: 'pointer',
                                  mx: 0.5,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                {/* Highlight stars up to the current rating */}
                                {ratings[index] >= num ? (
                                  <Star
                                    sx={{
                                      color: num <= ratings[index] ? '#1976d2' : '#e0e0e0', // Color last star in the rating range
                                      fontSize: 30,
                                      transition: 'color 0.3s',
                                    }}
                                  />
                                ) : (
                                  <StarBorder
                                    sx={{
                                      color: '#e0e0e0',
                                      fontSize: 30,
                                      transition: 'color 0.3s',
                                    }}
                                  />
                                )}
                              </Box>
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => navigate(`/dashboard/viewTerritoryDetails/${territory_id}`)}
                            variant="contained" // You can choose a variant, like 'outlined' or 'text' as per your design
                          >
                            Details
                          </Button>
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
      </div>
    </>
  );
}
