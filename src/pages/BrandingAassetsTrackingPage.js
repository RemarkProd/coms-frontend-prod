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
  CircularProgress,
  Radio,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Select from 'react-select';
import {
  dowloadBankDepositReceiptService,
  getAreaService,
  getBeatsService,
  getBrandingAssetsChildItemsService,
  getBrandingAssetsItemImagesService,
  getBrandingAssetsItemsService,
  getRegionService,
  getShopsListService,
  getTerritoriesService,
  getTownsService,
  getUserProfileDetails,
} from '../Services/ApiServices';

// @mui
import { useUser } from '../context/UserContext';
import NewListHead from '../sections/@dashboard/user/NewListHead';

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
  { id: 'shop_number', label: 'Shop No', alignRight: false },
  { id: 'shop_name', label: 'Shop Name', alignRight: false },
  { id: 'mobile', label: 'Mobile', alignRight: false },
  { id: 'owner_name', label: 'Owner', alignRight: false },
  { id: 'category', label: 'Category', alignRight: false },
];
const TABLE_HEADs = [
  { id: '', label: '', alignRight: false },
  { id: 'item_name', label: 'Item Name', alignRight: false },
  // { id: 'Item_category', label: 'Item Category', alignRight: false },
];
const TABLE_HEADss = [
  { id: '', label: '', alignRight: false },
  { id: 'child_item_name', label: 'Child Item Name', alignRight: false },
  // { id: 'child_category', label: 'Child Category', alignRight: false },
];
export default function ItemsDashBoard() {
  const navigate = useNavigate();

  const { user } = useUser();
  const [showShops, setShowShops] = useState(true);
  const [showItems, setShowItems] = useState(false);
  const [showChilds, setShowChilds] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noImages, setNoImages] = useState(false);

  const [filterDetails, setFilterDetails] = useState({});

  //Start From here ////////////////////////////////
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

  console.log(user);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActivateIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setActivateIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
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

  const shopIdNameArray = USERLIST
    ? USERLIST.map(({ shop_id, shop_name, contact_number }) => ({
        shop_id,
        shop_name,
        contact_number,
      }))
    : [];
  console.log(shopIdNameArray);

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
      const response = await getShopsListService(user);
      if (response) {
        let filteredData = response.data;
        console.log(filteredData);

        if (filterDetails.shop) {
          filteredData = filteredData.filter((item) => item.shop_id === filterDetails.shop);
        }

        if (filterDetails.region) {
          filteredData = filteredData.filter((item) => item.region_id === filterDetails.region);
        }

        if (filterDetails.territory) {
          filteredData = filteredData.filter((item) => item.territory_id === filterDetails.territory);
        }

        if (filterDetails.area) {
          filteredData = filteredData.filter((item) => item.area_id === filterDetails.area);
        }

        if (filterDetails.town) {
          filteredData = filteredData.filter((item) => item.town_id === filterDetails.town);
        }

        if (filterDetails.beat) {
          filteredData = filteredData.filter((item) => item.beat_id === filterDetails.beat);
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
    setSelectedTown(null);
    setSelectedShop(null);
    setSelectedBeat(null);

    try {
      const response = await getShopsListService(user);
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
    width: '45%',
    // marginBottom: '5px',
  };

  return (
    <>
      <Helmet>
        <title> COMS | Assets Tracking </title>
      </Helmet>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '-2%' }}>
        <div
          style={{
            height: '50%',
            display: 'flex',
            flexDirection: 'row',
            border: '1px solid lightgrey',
            padding: '2px',
            margin: '5px',
            paddingRight: '10px',
          }}
        >
          <div style={{ width: '40%' }}>
            <h6>Filter shops</h6>

            <Stack direction="row" gap={1} mb={2}>
              {/* <div className="col-auto" style={filterFirstElementStyling}> */}
              <div className="col-auto" style={filterFieldStyling}>
                <span style={{ marginRight: '5px' }}>Region</span>
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
                <span style={{ marginRight: '11px' }}>Town</span>
                <div>
                  <Select
                    value={selectedTown}
                    onChange={handleTownChange}
                    onInputChange={handleTownInputChange}
                    options={filteredTownOptions}
                    placeholder="Type to select..."
                    isClearable
                  />
                </div>
              </div>
            </Stack>

            <Stack direction="row" gap={1} mb={2}>
              <div className="col-auto" style={filterFieldStyling}>
                <span style={{ marginRight: '5px' }}>Area</span>
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
                <span style={{ marginRight: '5px' }}>Beat</span>
                <div>
                  <Select
                    value={selectedBeat}
                    onChange={handleBeatChange}
                    onInputChange={handleBeatInputChange}
                    options={filteredBeatOptions}
                    placeholder="Type to select..."
                    isClearable
                  />
                </div>
              </div>
            </Stack>

            <Stack direction="row" gap={1} mb={2}>
              <div className="col-auto" style={filterFieldStyling}>
                <span style={{ marginRight: '5px' }}>Territory</span>
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
                <span style={{ marginRight: '5px' }}>Shop</span>
                <div>
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
            </Stack>

            <Stack direction="row" gap={1}>
              <Button variant="contained" size="medium" style={{ width: '45%' }} onClick={handleFilterShops}>
                Filter
              </Button>

              <Button variant="contained" size="medium" style={{ width: '45%' }} onClick={handleClearFilterShop}>
                Clear
              </Button>
            </Stack>
          </div>

          <div style={{ width: '60%' }}>
            <h6>Shop list</h6>

            <TableContainer>
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
                          <TableCell style={combinedStylingForRadioTableCell}>
                            <Radio checked={selectedUser} onChange={(event) => handleClick(event, shop_id)} />
                          </TableCell>
                          <TableCell style={combinedStylingForTableCell} align="left">
                            {shop_id}
                          </TableCell>
                          <TableCell style={combinedStylingForTableCell} align="left">
                            {shop_name}
                          </TableCell>
                          <TableCell style={combinedStylingForTableCell} align="left">
                            {contact_number}
                          </TableCell>
                          <TableCell style={combinedStylingForTableCell} align="left">
                            {owner_name}
                          </TableCell>
                          <TableCell style={combinedStylingForTableCell} align="left">
                            {category}
                          </TableCell>
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
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={USERLIST.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </div>
        </div>
        {/* <Button onClick={showItemsList}>Show Items</Button> */}
        {/* <div style={{ width: '40%' }}> */}
        <div
          style={{
            height: '40%',
            display: 'flex',
            flexDirection: 'row',
            // border: '1px solid lightgrey',
            // padding: '2px',
            // margin: '2px',
          }}
        >
          <div style={{ border: '1px solid lightgrey', padding: '2px', margin: '5px', width: '30%' }}>
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

                      const selectedUser = selectedItem.includes(inventory_item_id);

                      return (
                        <TableRow hover key={inventory_item_id} tabIndex={-1} role="radio">
                          <TableCell style={combinedStylingForRadioTableCell}>
                            <Radio
                              checked={selectedUser}
                              onChange={(event) => handleItemClick(event, inventory_item_id)}
                            />
                          </TableCell>
                          <TableCell style={combinedStylingForTableCell} align="left">
                            {item_name}
                          </TableCell>
                          {/* <TableCell style={combinedStylingForTableCell} align="left">
                            {item_category}
                          </TableCell> */}
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
              count={items.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            {/* <Button onClick={showChildsList}>Show Shops</Button> */}
          </div>
          {showimage ? (
            <div
              id="carouselBasicExample"
              className="carousel slide carousel-fade"
              // style={{ marginTop: '20px', marginLeft: '200px', width: '70%' }}
              style={{ border: '1px solid lightgrey', padding: '2px', margin: '5px', width: '40%' }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <CircularProgress />
                  <p>Loading images...</p>
                </div>
              ) : noImages ? (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <p>No images available for this item.</p>
                </div>
              ) : (
                <>
                  {/* <div className="carousel-inner"> */}
                  <div
                    id="carouselMultiItemExample"
                    data-mdb-carousel-init=""
                    className="carousel slide carousel-dark text-center"
                    data-mdb-ride="carousel"
                  >
                    <div className="d-flex justify-content-center mb-2">
                      <button
                        data-mdb-button-init=""
                        className="carousel-control-prev position-relative"
                        type="button"
                        data-mdb-target="#carouselMultiItemExample"
                        data-mdb-slide="prev"
                        onClick={handlePrev}
                      >
                        <span className="carousel-control-prev-icon" aria-hidden="true" />
                        <span className="visually-hidden">Previous</span>
                      </button>
                      <button
                        data-mdb-button-init=""
                        className="carousel-control-next position-relative"
                        type="button"
                        data-mdb-target="#carouselMultiItemExample"
                        data-mdb-slide="next"
                        onClick={handleNext}
                      >
                        <span className="carousel-control-next-icon" aria-hidden="true" />
                        <span className="visually-hidden">Next</span>
                      </button>
                    </div>
                    {imageSrc.map((image, index) => {
                      const record = images[index];

                      return (
                        <div key={index} className={`carousel-item${index === activateIndex ? ' active' : ''}`}>
                          <div style={carouselContentStyle}>
                            <div className="carousel-item active">
                              <div>
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'flex-start',
                                  }}
                                >
                                  <div style={{ width: '50%' }}>
                                    {/* <h5>Reviews</h5> */}
                                    <table>
                                      <th>
                                        <td style={tdStyling}>Reviews</td>
                                      </th>

                                      <tr>
                                        <td style={tdStyling}>Review Status: </td>
                                        <td style={tdStyling}>{record.review_status}</td>
                                      </tr>

                                      <tr>
                                        <td style={tdStyling}>Created By: </td>
                                        <td style={tdStyling}>{record.created_by}</td>
                                      </tr>

                                      <tr>
                                        <td style={tdStyling}>Created On: </td>
                                        <td style={tdStyling}>
                                          {record.creation_date
                                            ? new Date(record.creation_date).toLocaleDateString()
                                            : null}
                                        </td>
                                      </tr>

                                      <tr>
                                        <td style={tdStyling}>Remarks: </td>
                                        <td style={tdStyling}>{record.remarks}</td>
                                      </tr>
                                    </table>
                                  </div>

                                  <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={handleOpen}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        handleOpen();
                                      }
                                    }}
                                    style={{ display: 'inline-block', cursor: 'pointer', width: '50%', height: '50%' }}
                                  >
                                    <img
                                      src={image}
                                      className="card-img-top"
                                      alt={`Slide ${index + 1}`}
                                      style={{ height: '195px' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              style={{
                border: '1px solid lightgrey',
                padding: '2px',
                margin: '5px',
                width: '60%',
                alignItems: 'center',
              }}
            >
              <h6>No item selected</h6>
            </div>
          )}
          <div style={{ border: '1px solid lightgrey', padding: '2px', margin: '5px', width: '30%' }}>
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
                          <TableCell style={{ width: '5px' }} align="left">
                            {' '}
                          </TableCell>
                          <TableCell style={combinedStylingForTableCell} align="left">
                            {description}
                          </TableCell>
                          {/* <TableCell style={combinedStylingForTableCell} align="left">
                            {inventory_item_code}
                          </TableCell> */}
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
              count={items.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
      </div>

      <Dialog fullScreen open={open} onClose={handleClose}>
        <Stack style={{ width: '100px', margin: '5px' }}>
          <Button variant="contained" size="medium" onClick={handleClose}>
            Back
          </Button>
        </Stack>
        {/* <DialogContent> */}
        <div
          style={{
            // height: '100%',
            display: 'flex',
            flexDirection: 'row',
            // border: '1px solid lightgrey',
            // padding: '2px',
            // margin: '2px',
          }}
        >
          {showimage ? (
            <div
              id="carouselBasicExample"
              className="carousel slide carousel-fade"
              // style={{ marginTop: '20px', marginLeft: '200px', width: '70%' }}
              style={{ border: '1px solid lightgrey', padding: '2px', margin: '5px', width: '70%' }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <CircularProgress />
                  <p>Loading images...</p>
                </div>
              ) : noImages ? (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <p>No images available for this item.</p>
                </div>
              ) : (
                <>
                  {/* <div className="carousel-inner"> */}
                  <div
                    id="carouselMultiItemExample"
                    data-mdb-carousel-init=""
                    className="carousel slide carousel-dark text-center"
                    data-mdb-ride="carousel"
                  >
                    <div className="d-flex justify-content-center mb-2">
                      <button
                        data-mdb-button-init=""
                        className="carousel-control-prev position-relative"
                        type="button"
                        data-mdb-target="#carouselMultiItemExample"
                        data-mdb-slide="prev"
                        onClick={handlePrev}
                      >
                        <span className="carousel-control-prev-icon" aria-hidden="true" />
                        <span className="visually-hidden">Previous</span>
                      </button>
                      <button
                        data-mdb-button-init=""
                        className="carousel-control-next position-relative"
                        type="button"
                        data-mdb-target="#carouselMultiItemExample"
                        data-mdb-slide="next"
                        onClick={handleNext}
                      >
                        <span className="carousel-control-next-icon" aria-hidden="true" />
                        <span className="visually-hidden">Next</span>
                      </button>
                    </div>
                    {imageSrc.map((image, index) => {
                      const record = images[index];

                      return (
                        <div key={index} className={`carousel-item${index === activateIndex ? ' active' : ''}`}>
                          <div style={carouselContentStyle}>
                            <div className="carousel-item active">
                              <div>
                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                  <div style={{ width: '50%' }}>
                                    {/* <h5>Reviews</h5> */}
                                    <table>
                                      <th>
                                        <td style={tdStyling}>Reviews</td>
                                      </th>

                                      <tr>
                                        <td style={tdStyling}>Review Status: </td>
                                        <td style={tdStyling}>{record.review_status}</td>
                                      </tr>

                                      <tr>
                                        <td style={tdStyling}>Created By: </td>
                                        <td style={tdStyling}>{record.created_by}</td>
                                      </tr>

                                      <tr>
                                        <td style={tdStyling}>Created On: </td>
                                        <td style={tdStyling}>
                                          {record.creation_date
                                            ? new Date(record.creation_date).toLocaleDateString()
                                            : null}
                                        </td>
                                      </tr>

                                      <tr>
                                        <td style={tdStyling}>Remarks: </td>
                                        <td style={tdStyling}>{record.remarks}</td>
                                      </tr>
                                    </table>
                                  </div>

                                  <img
                                    src={image}
                                    className="card-img-top"
                                    alt={`Slide ${index + 1}`}
                                    style={{ height: '494px' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              style={{
                border: '1px solid lightgrey',
                padding: '2px',
                margin: '5px',
                width: '70%',
                alignItems: 'center',
              }}
            >
              <h6>No item selected</h6>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', width: '30%' }}>
            <div style={{ border: '1px solid lightgrey', padding: '2px', margin: '5px' }}>
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

                        const selectedUser = selectedItem.includes(inventory_item_id);

                        return (
                          <TableRow hover key={inventory_item_id} tabIndex={-1} role="radio">
                            <TableCell style={combinedStylingForRadioTableCell}>
                              <Radio
                                checked={selectedUser}
                                onChange={(event) => handleItemClick(event, inventory_item_id)}
                              />
                            </TableCell>
                            <TableCell style={combinedStylingForTableCell} align="left">
                              {item_name}
                            </TableCell>
                            {/* <TableCell style={combinedStylingForTableCell} align="left">
                            {item_category}
                          </TableCell> */}
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
                count={items.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
              {/* <Button onClick={showChildsList}>Show Shops</Button> */}
            </div>

            <div style={{ border: '1px solid lightgrey', padding: '2px', margin: '5px' }}>
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
                        const { inventory_item_id, description } = row;

                        const selectedUser = selected.indexOf(inventory_item_id) !== -1;

                        return (
                          <TableRow hover key={inventory_item_id} tabIndex={-1} role="checkbox">
                            <TableCell style={{ width: '5px' }} align="left">
                              {' '}
                            </TableCell>
                            <TableCell style={combinedStylingForTableCell} align="left">
                              {description}
                            </TableCell>
                            {/* <TableCell style={combinedStylingForTableCell} align="left">
                            {inventory_item_code}
                          </TableCell> */}
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
                count={childItems.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </div>
        </div>
        {/* </DialogContent> */}
      </Dialog>
    </>
  );
}
