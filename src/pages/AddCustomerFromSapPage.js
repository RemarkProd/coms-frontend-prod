// @mui
import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';
// services
import { addCustomersFromSap, addCustomersFromSapErrorLog, getCustomersFromSap } from '../Services/ApiServices';

// ----------------------------------------------------------------------

export default function TestSapApiPage() {
  const getCustomers = async () => {
    try {
      return await getCustomersFromSap();
    } catch (error) {
      console.error('Error fetching customers:', error);
      return null; // Return null or an empty array to handle the error case
    }
  };

  const addCustomerAddress = async () => {
    try {
      const customers = await getCustomers();

      console.log(customers.data.to_BusinessPartnerAddress.__deferred.uri);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const addCustomer = async () => {
    const customers = await getCustomers();
    if (customers && customers.data) {
      const customerList = customers.data;
      console.log(customerList);
      try {
        await Promise.all(
          customerList.map(async (element) => {
            const requestBody = {
              businessPartner: element.BusinessPartner || '',
              businessPartnerFullname: element.BusinessPartnerFullName || '',
              businessPartnerCategory: parseInt(element.BusinessPartnerCategory, 10) || null,
              businessPartnerGrouping: element.BusinessPartnerGrouping || '',
              businessPartnerIdByExtSystem: element.BusinessPartnerIDByExtSystem || '',
              businessPartnerType: element.BusinessPartnerType || '',
            };
            const response = await addCustomersFromSap(requestBody);

            if (response.status !== 200) {
              const requestBody = {
                businessPartner: element.BusinessPartner || '',
                errorCode: response.code || '',
                errorMessage: response.message || '',
              };
              await addCustomersFromSapErrorLog(requestBody);
            }
          })
        );

        alert('Successfully added!');
      } catch (error) {
        console.error('Error adding customers:', error);
      }
    } else {
      alert('Process failed! Try again');
    }
  };

  return (
    <>
      <Stack align="center" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Add Customers from SAP service
        </Typography>
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={addCustomer}>
        Add Customers
      </LoadingButton>

      {/* <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={addCustomerAddress}>
        Create SO
      </LoadingButton> */}
    </>
  );
}
