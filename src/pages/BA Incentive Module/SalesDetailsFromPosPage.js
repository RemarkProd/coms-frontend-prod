// @mui
import { LoadingButton } from '@mui/lab';
import { CircularProgress, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { useUser } from '../../context/UserContext';

// services
import {
  addSalesDetailsFromPosService,
  getSalesCountFromPosService,
  getSalesDetailsFromPosMediasoftService,
  getUserProfileDetails,
} from '../../Services/ApiServices';
// css
import '../../_css/Utils.css';

// ----------------------------------------------------------------------

export default function TestSapApiPage() {
  const { user } = useUser();

  function getFormattedDate(value) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Zero-padding the month
    const day = String(date.getDate()).padStart(2, '0'); // Zero-padding the day

    // return `${day}/${month}/${year}`;
    return `${year}-${month}-${day}`;
  }

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

  const [selectedDate, setSelectedDate] = useState(false);

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const integratePos = async () => {
    setOpen(true);

    try {
      const salesDate = getFormattedDate(selectedDate);

      const salesCount = await getSalesCountFromPosService(salesDate);
      const pageNo = Math.ceil(salesCount / 500);

      let allItems = [];

      const fetchPromises = [];
      for (let i = 1; i <= pageNo; i += 1) {
        fetchPromises.push(getSalesDetailsFromPosMediasoftService(salesDate, i));
      }

      const responses = await Promise.all(fetchPromises);

      responses.forEach((response, index) => {
        if (response.status === 200) {
          const sales = response.data.Data || [];
          allItems = allItems.concat(sales);
        } else {
          console.error(`Failed to fetch sales details for page ${index + 1}`);
          throw new Error('Error fetching sales details. Please check the console for details.');
        }
      });

      if (allItems.length > 0) {
        const requestBody = {
          content: allItems,
          userId: account.user_id,
        };

        const response = await addSalesDetailsFromPosService(requestBody);

        if (response.status === 200) {
          alert('Sales details added successfully.');
        } else {
          console.error('Error adding sales details:', response.data);
          alert('Error adding sales details. Please check the console for details.');
        }
      } else {
        alert('No sales data found to process.');
      }
    } catch (error) {
      console.error('An error occurred during the process:', error);
      alert('An error occurred. Please check the console for details.');
    } finally {
      handleClose();
    }
  };

  return (
    <>
      <Stack align="center" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Typography variant="h5" color="text.secondary">
          Sales details from pos system
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
        <div className="col-auto" style={{ marginRight: '20px', display: 'flex' }}>
          <span className="col-form-label" style={{ display: 'flex', marginRight: '5px' }}>
            Select a date
          </span>
          <div style={{ marginLeft: '5px' }}>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yy"
              placeholderText="dd/mm/yy"
              className="form-control"
            />
          </div>
        </div>

        <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={integratePos}>
          Add Sales Details
        </LoadingButton>
      </Stack>

      <Dialog open={open}>
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
    </>
  );
}
