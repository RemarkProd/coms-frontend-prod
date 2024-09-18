/* eslint-disable camelcase */
/* eslint-disable no-restricted-globals */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
// @mui
import { Container, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import {
  callReqApprovalFromPanelService,
  getApprovalSequenceService,
  getSalesOrderHeaderService,
  getSalesOrderLinesService,
  getUserProfileDetails,
} from '../Services/ApiServices';
import { useUser } from '../context/UserContext';
import SoListHead from '../sections/@dashboard/user/SoListHead';

// ----------------------------------------------------------------------

export default function Page404() {
  const navigate = useNavigate();
  const { notification_id } = useParams();
  const { header_id } = useParams();

  function getFormattedDate(value) {
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

  const [account, setAccount] = useState({});
  const { user } = useUser();
  console.log(user);

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

  //   const [wfNotifications, setWfNotifications] = useState({});
  //   useEffect(() => {
  //     async function fetchData() {
  //       try {
  //         const wfNotificationsDetails = await getWfNoficationViewService(notification_id); // Call your async function here
  //         console.log(wfNotificationsDetails);
  //         if (wfNotificationsDetails.status === 200) setWfNotifications(wfNotificationsDetails.data); // Set the account details in the component's state
  //       } catch (error) {
  //         // Handle any errors that might occur during the async operation
  //         console.error('Error fetching account details:', error);
  //       }
  //     }

  //     fetchData(); // Call the async function when the component mounts
  //   }, []);
  //   console.log(wfNotifications);

  const [headerDetails, setHeaderDetails] = useState({});
  useEffect(() => {
    async function fetchData() {
      try {
        let soHeaderDetails = {};
        soHeaderDetails = await getSalesOrderHeaderService(header_id); // Call your async function here
        console.log(soHeaderDetails);
        if (soHeaderDetails.status === 200) setHeaderDetails(soHeaderDetails.data); // Set the account details in the component's state
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, []);
  console.log(headerDetails);

  const [lineDetails, setLineDetails] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let soLineDetails = {};
        soLineDetails = await getSalesOrderLinesService(header_id); // Call your async function here
        console.log(soLineDetails);
        if (soLineDetails.status === 200) setLineDetails(soLineDetails.data); // Set the account details in the component's state
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, []);
  console.log(lineDetails);

  const [approvalSequenceDetails, setApprovalSequence] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let soLineDetails = {};
        if (headerDetails) soLineDetails = await getApprovalSequenceService(header_id); // Call your async function here
        console.log(soLineDetails);
        if (soLineDetails.status === 200) setApprovalSequence(soLineDetails.data); // Set the account details in the component's state
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, [headerDetails]);
  console.log(approvalSequenceDetails);

  const TABLE_HEAD = [
    // { id: '' },
    { id: 'unit_of_measure', label: 'Line Number', alignRight: false },
    { id: 'uom_code', label: 'Item', alignRight: false },
    { id: 'inventory_item_code', label: 'Item Code', alignRight: false },
    { id: 'uom_class', label: 'UOM', alignRight: false },
    { id: 'disable_date', label: 'Quantity', alignRight: false },
    { id: 'offer_quantity', label: 'Offer Quantity', alignRight: false },
    { id: 'total_quantity', label: 'Total Quantity', alignRight: false },
    { id: 'description', label: 'Unit Price', alignRight: false },
    { id: 'unit_offer_price', label: 'Unit Offer Price', alignRight: false },
    { id: 'total_price', label: 'Total Price', alignRight: false },
  ];

  const TABLE_HEAD_Approval_Seq = [
    // { id: '' },
    { id: 'unit_of_measure', label: 'SL Num', alignRight: false },
    { id: 'uom_code', label: 'Action Code', alignRight: false },
    { id: 'uom_class', label: 'Action Date', alignRight: false },
    { id: 'disable_date', label: 'Name', alignRight: false },
    { id: 'description', label: 'Note', alignRight: false },
  ];

  const onApprove = async () => {
    const requestBody = {
      pHierarchyId: 1,
      pTransactionID: headerDetails.header_id,
      pTransactionNum: headerDetails.order_number.toString(),
      pAppsUsername: account.full_name,
      //   pNotificationID: wfNotifications.notification_id,
      pApprovalType: 'A',
      pEmpid: 1,
      pNote: 'A',
    };
    const response = await callReqApprovalFromPanelService(requestBody);

    console.log(response);
  };

  const onReject = async () => {
    const requestBody = {
      pHierarchyId: 1,
      pTransactionID: headerDetails.header_id,
      pTransactionNum: headerDetails.order_number.toString(),
      pAppsUsername: account.full_name,
      //   pNotificationID: wfNotifications.notification_id,
      pApprovalType: 'R',
      pEmpid: 1,
      pNote: 'R',
    };
    const response = await callReqApprovalFromPanelService(requestBody);

    console.log(response);
  };

  const onDone = async () => {
    navigate('/dashboard/dashclone', { replace: true });
  };

  const goToUpdateSO = async () => {
    console.log(header_id);
    navigate(`/dashboard/updateSalesOrderForm/${header_id}`, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title> OSMS | Sales Order Form </title>
      </Helmet>

      <Container style={{ padding: '0px 25px', maxWidth: '100%' }}>
        {/* <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" gutterBottom style={{ width: '50%' }}>
            {wfNotifications.subject}
          </Typography>
          <div style={{ width: '50%', textAlign: 'right' }}>
            <Button style={{ whiteSpace: 'nowrap', backgroundColor: 'lightgray', color: 'black' }} onClick={onDone}>
              Done
            </Button>
          </div>
        </Stack> */}
        {/* <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          style={{ marginBottom: '5px' }}
        >
          <Typography variant="h5" gutterBottom>
            Notifications
          </Typography>
        </Stack>
        <div className="row g-3 align-items-center">
          <div className="col-auto" style={{ width: '50%' }}>
            <label htmlFor="fromUser" className="col-form-label" style={{ display: 'flex' }}>
              From
              <span style={{ marginLeft: '10px' }}>{wfNotifications.from_user}</span>
            </label>
          </div>
          <div className="col-auto" style={{ width: '50%' }}>
            <label htmlFor="fromUser" className="col-form-label" style={{ display: 'flex' }}>
              To
              <span style={{ marginLeft: '10px' }}>{wfNotifications.to_user}</span>
            </label>
          </div>
          <div className="col-auto" style={{ width: '50%' }}>
            <label htmlFor="fromUser" className="col-form-label" style={{ display: 'flex' }}>
              ID
              <span style={{ marginLeft: '10px' }}>{wfNotifications.notification_id}</span>
            </label>
          </div>
          <div className="col-auto" style={{ width: '50%' }}>
            <label htmlFor="fromUser" className="col-form-label" style={{ display: 'flex' }}>
              Sent
              <span style={{ marginLeft: '10px' }}>{getFormattedDate(wfNotifications.sent_date)}</span>
            </label>
          </div>
        </div> */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          style={{ marginBottom: '2px', marginTop: '10px' }}
        >
          <Typography variant="h5" gutterBottom>
            Order Headers
          </Typography>
        </Stack>
        <div className="row g-3 align-items-center" style={{ boxShadow: '0 4px 2px -2px rgba(0, 0, 0, 0.2)' }}>
          <div className="col-auto" style={{ width: '33%' }}>
            <label htmlFor="orderNumber" className="col-form-label" style={{ display: 'flex' }}>
              Order Number :<span style={{ marginLeft: '10px' }}>{headerDetails.order_number}</span>
            </label>
          </div>
          <div className="col-auto" style={{ width: '33%' }}>
            <label htmlFor="orderedDate" className="col-form-label" style={{ display: 'flex' }}>
              Ordered Date :<span style={{ marginLeft: '10px' }}>{getFormattedDate(headerDetails.ordered_date)}</span>
            </label>
          </div>
          <div className="col-auto" style={{ width: '33%' }}>
            <label htmlFor="distributor" className="col-form-label" style={{ display: 'flex' }}>
              Customer :<span style={{ marginLeft: '10px' }}>{headerDetails.distributor}</span>
            </label>
          </div>
          <div className="col-auto" style={{ width: '33%' }}>
            <label htmlFor="ship_to" className="col-form-label" style={{ display: 'flex' }}>
              Ship to :<span style={{ marginLeft: '10px' }}>{headerDetails.ship_to}</span>
            </label>
          </div>
          <div className="col-auto" style={{ width: '33%' }}>
            <label htmlFor="shippingMethodCode" className="col-form-label" style={{ display: 'flex' }}>
              Transport Type :<span style={{ marginLeft: '10px' }}>{headerDetails.shipping_method_code}</span>
            </label>
          </div>
          <div className="col-auto" style={{ width: '33%' }}>
            <label htmlFor="special_discount" className="col-form-label" style={{ display: 'flex' }}>
              Special Discount :<span style={{ marginLeft: '10px' }}>{headerDetails.special_discount}</span>
            </label>
          </div>
          <div className="col-auto" style={{ width: '33%' }}>
            <label htmlFor="special_adjustment" className="col-form-label" style={{ display: 'flex' }}>
              Special Adjustment :<span style={{ marginLeft: '10px' }}>{headerDetails.special_adjustment}</span>
            </label>
          </div>
          <div className="col-auto" style={{ width: '33%' }}>
            <label htmlFor="total_price" className="col-form-label" style={{ display: 'flex' }}>
              Total price :<span style={{ marginLeft: '10px' }}>{headerDetails.total_price}</span>
            </label>
          </div>
          <div className="col-auto" style={{ width: '33%' }}>
            <label htmlFor="salesPerson" className="col-form-label" style={{ display: 'flex' }}>
              Ordered By :<span style={{ marginLeft: '10px' }}>{headerDetails.salesrep_id}</span>
            </label>
          </div>
        </div>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          style={{ marginBottom: '5px', marginTop: '10px' }}
        >
          <Typography variant="h5" gutterBottom>
            Order Lines
          </Typography>
        </Stack>
        <TableContainer sx={{ minWidth: 800 }} style={{ boxShadow: '0 4px 2px -2px rgba(0, 0, 0, 0.2)' }}>
          <Table>
            <SoListHead headLabel={TABLE_HEAD} />
            <TableBody>
              {lineDetails.map((value) => (
                <TableRow key={value.line_id} hover tabIndex={-1}>
                  {/* <TableCell padding="checkbox">
                    <Checkbox disabled />
                  </TableCell> */}
                  <TableCell>{value.line_number}</TableCell>
                  <TableCell>{value.ordered_item}</TableCell>
                  <TableCell>{value.inventory_item_code}</TableCell>
                  <TableCell>{value.order_quantity_uom}</TableCell>
                  <TableCell>{value.ordered_quantity}</TableCell>
                  <TableCell>{value.offer_quantity}</TableCell>
                  <TableCell>{value.total_quantity}</TableCell>
                  <TableCell>{value.unit_selling_price}</TableCell>
                  <TableCell>{value.unit_offer_price}</TableCell>
                  <TableCell>{value.total_price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          style={{ marginBottom: '5px', marginTop: '40px' }}
        >
          <Typography variant="h5" gutterBottom>
            Approval Sequence
          </Typography>
        </Stack>
        <TableContainer sx={{ minWidth: 800 }}>
          <Table>
            <SoListHead headLabel={TABLE_HEAD_Approval_Seq} />
            <TableBody>
              {approvalSequenceDetails.map((value) => (
                <TableRow key={value.sl} hover tabIndex={-1}>
                  {/* <TableCell padding="checkbox">
                    <Checkbox disabled />
                  </TableCell> */}
                  <TableCell>{value.sl}</TableCell>
                  <TableCell>{value.action_code}</TableCell>
                  <TableCell> {value.action_date ? getFormattedDate(value.action_date) : null}</TableCell>
                  <TableCell>{value.full_name}</TableCell>
                  <TableCell>{value.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <Grid container spacing={2} style={{ marginTop: '10px' }}>
          <Grid item xs={3}>
            <ButtonGroup variant="contained" aria-label="outlined primary button group" spacing={2}>
              <Button
                style={{ whiteSpace: 'nowrap', marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
                onClick={onApprove}
              >
                Approve
              </Button>
              <Button
                style={{ whiteSpace: 'nowrap', marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
                onClick={onReject}
              >
                Reject
              </Button>
              <Button
                style={{ whiteSpace: 'nowrap', backgroundColor: 'lightgray', color: 'black' }}
                onClick={goToUpdateSO}
              >
                Update Sales Order
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid> */}
      </Container>
    </>
  );
}
