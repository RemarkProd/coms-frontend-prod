// @mui
import { LoadingButton } from '@mui/lab';
import { CircularProgress, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
// services
import {
  addAllItemFromSapService,
  getCustomerGroupService,
  getItemsFromSapService,
  getUserProfileDetails
} from '../Services/ApiServices';
// css
import '../_css/Utils.css';

// ----------------------------------------------------------------------

export default function TestSapApiPage() {
  const { user } = useUser();

  const getCustomers = async () => {
    try {
      return await getItemsFromSapService();
    } catch (error) {
      console.error('Error fetching customers:', error);
      return null; // Return null or an empty array to handle the error case
    }
  };

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

  const [customerGroups, setCustomerGroups] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        if (account) {
          const response = await getCustomerGroupService(user);

          if (response.status === 200) {
            setCustomerGroups(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [account]);
  console.log(customerGroups);

  const [inputValue, setInputValue] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const filteredOptions = customerGroups
    .filter((option) => option.cust_group_name.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.cust_group_id, label: option.cust_group_name }));

  const handleChange = (selectedOption) => {
    setSelectedGroup(selectedOption.value);
  };

  const handleInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  const addCustomer = async () => {
    setOpen(true);
    const items = await getCustomers();

    if (items && items.data) {
      const customerList = items.data.items;
      console.log(customerList);

      try {
        const requestBody = {
          content: customerList || [],
        };
        const response = await addAllItemFromSapService(requestBody);

        if (response.status !== 200) {
          alert('Error adding customers. Please check the console for details.');
          console.log(response.data);
        }
      } catch (error) {
        console.error('Error adding customers:', error);
        alert('Error adding customers. Please check the console for details.');
      } finally {
        handleClose();
      }
    } else {
      alert('Process failed! Try again.');
    }
  };

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Stack align="center" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Typography variant="h5" color="text.secondary">
          Add Items from SAP service
        </Typography>
      </Stack>

      <Stack
        align="center"
        alignItems="center"
        justifyContent="space-between"
        sx={{ my: 2 }}
        flexDirection={'row'}
        className="indexing"
      >
        {/* <div className="col-auto" style={{ display: 'flex', marginRight: '20px', width: 'auto' }}>
          <span style={{ marginRight: '5px' }}>Customer Group</span>
          <div>
            <Select
              id="customer"
              name="customer"
              // value={filterDetails.customer ? { value: filterDetails.customer, label: filterDetails.customer } : null}
              // value={selectedOption}
              onChange={handleChange}
              onInputChange={handleInputChange}
              options={filteredOptions}
              placeholder="Type to select..."
              isClearable
            />
          </div>
        </div> */}
        <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={addCustomer}>
          Add Customers
        </LoadingButton>
      </Stack>

      <Dialog open={open}>
        {/* <Dialog open={open} onClose={handleClose}> */}
        <Stack />
        <DialogContent style={{ overflow: 'hidden' }}>
          <Stack spacing={1.5} direction="row" style={{ justifyContent: 'center' }}>
            <div>
              <CircularProgress />
            </div>
          </Stack>

          <Stack spacing={1.5} direction="row">
            <p style={{ justifyContent: 'center' }}>
              Items are loading. Please keep patient until process is completed.
            </p>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={addCustomerAddress}>
        Create SO
      </LoadingButton> */}
    </>
  );
}
