import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import { Button, Container, Stack } from '@mui/material';
import {
  getSalesMasterDetailsByInvoiceService,
  getSalesMasterDetailsService,
  postSalesMasterDetailsService,
} from '../Services/ApiServices';

export default function BasicTabs() {
  const manageSalesMaster = async () => {
    try {
      const requestBody = {
        fromDate: reqInfo.fromDate,
        toDate: reqInfo.toDate,
        companyCode: reqInfo.companyCode,
      };
      console.log(requestBody);
      const response = await getSalesMasterDetailsService(requestBody);

      if (response.status === 200) {
        const responses = response.data;
        console.log(responses);

        const postRequests = responses.map(async (salesDetail) => {
          const materialIdList = salesDetail.itemDetails.map((obj) => obj.MaterialId);

          const postRequestBody = {
            SaleId: salesDetail.saleId,
            CompanyCode: salesDetail.companyCode,
            CompanyName: salesDetail.companyName,
            InvoiceNo: salesDetail.invoiceNo,
            PartyId: salesDetail.partyId,
            PartyName: salesDetail.partyName,
            ServedBy: salesDetail.servedBy ? salesDetail.servedBy : '',
            Phone: salesDetail.phone,
            PaymentMode: salesDetail.paymentMode ? salesDetail.paymentMode : '',
            HarlanCash: salesDetail.harlanCash,
            MaterialIds: materialIdList,
          };
          return postSalesMasterDetailsService(postRequestBody);
        });

        const postResponses = await Promise.all(postRequests);
        alert('Data fetched successfully');
      }
    } catch (error) {
      console.error('Error during sales master management:', error);
    }
  };

  const [reqInfo, setReqInfo] = useState({
    fromDate: '',
    toDate: '',
    companyCode: '',
  });

  const onChangeDate = (e) => {
    setReqInfo({ ...reqInfo, [e.target.name]: e.target.value });
  };

  const [invoiceInfo, setInvoiceInfo] = useState(null);
  const onChangeInvoice = (e) => {
    // setInvoiceInfo({ ...invoiceInfo, [e.target.name]: e.target.value });
    setInvoiceInfo(e.target.value);
  };

  const manageSalesMasterByInvoice = async () => {
    try {
      const requestBody = {
        invoiceNo: invoiceInfo,
      };
      const response = await getSalesMasterDetailsByInvoiceService(requestBody);

      if (response.status === 200) {
        const responses = response.data;
        console.log(responses);

        const postRequests = responses.map(async (salesDetail) => {
          const materialIdList = salesDetail.saleDetails.map((obj) => obj.MaterialId);

          const postRequestBody = {
            SaleId: salesDetail.saleId,
            CompanyCode: salesDetail.companyCode,
            CompanyName: salesDetail.companyName,
            InvoiceNo: salesDetail.invoiceNo,
            PartyId: salesDetail.partyId,
            PartyName: salesDetail.partyName,
            ServedBy: salesDetail.servedBy ? salesDetail.servedBy : '',
            Phone: salesDetail.phone,
            PaymentMode: salesDetail.paymentMode ? salesDetail.paymentMode : '',
            HarlanCash: salesDetail.harlanCash,
            MaterialIds: materialIdList,
          };
          return postSalesMasterDetailsService(postRequestBody);
        });

        const postResponses = await Promise.all(postRequests);
        alert('Data fetched successfully');
      }
    } catch (error) {
      console.error('Error during sales master management:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title> Vat Sales Master | COMS </title>
      </Helmet>

      <Container>
        <Stack alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Manage Vat Sales Master
          </Typography>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ marginRight: '5px' }}>
                From <span style={{ color: 'red' }}>*</span>
              </span>
              <input
                type="date"
                id="fromDate"
                name="fromDate"
                style={{ borderRadius: '5px', marginRight: '20px' }}
                onChange={(e) => onChangeDate(e)}
              />
              <span style={{ marginRight: '5px' }}>
                To <span style={{ color: 'red' }}>*</span>
              </span>
              <input
                type="date"
                id="toDate"
                name="toDate"
                style={{ borderRadius: '5px', marginRight: '20px' }}
                onChange={(e) => onChangeDate(e)}
              />
              <span style={{ marginRight: '5px' }}>Company code</span>
              <input
                id="companyCode"
                name="companyCode"
                placeholder="company code + X"
                style={{ borderRadius: '5px' }}
                onChange={(e) => onChangeDate(e)}
              />
            </div>

            <Button
              variant="text"
              style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px' }}
              color="primary"
              onClick={() => {
                manageSalesMaster();
              }}
            >
              Submit
            </Button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ marginRight: '5px' }}>
                Invoice no <span style={{ color: 'red' }}>*</span>
              </span>
              <input
                id="invoiceNo"
                name="invoiceNo"
                style={{ borderRadius: '5px', marginRight: '20px' }}
                onChange={(e) => onChangeInvoice(e)}
              />
            </div>

            <Button
              variant="text"
              style={{ backgroundColor: 'lightgray', color: 'black', padding: '9px' }}
              color="primary"
              onClick={() => {
                manageSalesMasterByInvoice();
              }}
            >
              Submit
            </Button>
          </div>
        </Stack>
      </Container>
    </>
  );
}
