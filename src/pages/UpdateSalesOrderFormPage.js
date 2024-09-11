/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-globals */
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
// @mui
import {
  Button,
  ButtonGroup,
  Container,
  Grid,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import {
  addSalesOrderLinesService,
  callReqApprovalFromPanelService,
  callSoApprovalService,
  deleteSalesOrderHeaderService,
  deleteSalesOrderLinesService,
  getApprovalSequenceService,
  getCustomerListService,
  getFgItemListService,
  getSalesOrderHeaderService,
  getSalesOrderLinesService,
  getUserProfileDetails,
  // addSalesOrderHeaderService,
  updateSalesOrderHeaderService,
  updateSalesOrderLineService,
} from '../Services/ApiServices';

// import { UserListHead } from '../sections/@dashboard/user';
import { useUser } from '../context/UserContext';
import SoListHead from '../sections/@dashboard/salesOrders/SoListHeader';
// ----------------------------------------------------------------------

export default function Page404() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const { header_id } = useParams();
  console.log('headerId', header_id);

  function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getFormattedDate(value) {
    const date = new Date(value);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  function getFormattedPrice(value) {
    const formattedPrice = new Intl.NumberFormat().format(value);
    console.log(parseInt(formattedPrice, 10));

    return formattedPrice;
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

  const [inventoryItemIds, setInventoryItemIds] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getFgItemListService();
        if (response) setInventoryItemIds(response.data);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, []);
  console.log(inventoryItemIds);

  const [soHeaderDetails, setSoHeaderDetails] = useState({});
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getSalesOrderHeaderService(parseInt(header_id, 10));
        if (response) setSoHeaderDetails(response.data);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, []);
  console.log('soHeaderDetails', soHeaderDetails);

  const [soLineDetails, setSoLineDetails] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getSalesOrderLinesService(parseInt(header_id, 10));
        const updatedData = response.data.map((line) => ({
          ...line,
          selectedItemName: line.ordered_item,
          selectedItem: {},
          showList: false,
        }));
        console.log(updatedData);
        // if (response) setSoLineDetails(response.data);
        if (response) setSoLineDetails(updatedData);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, []);
  console.log('soLineDetails', soLineDetails);

  const [approvalSequenceDetails, setApprovalSequence] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getApprovalSequenceService(parseInt(header_id, 10)); // Call your async function here
        if (response.status === 200) setApprovalSequence(response.data); // Set the account details in the component's state
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, []);
  console.log(approvalSequenceDetails);

  const [filteredItemList, setFilteredItemList] = useState([]);

  //   const [headerInfo, setHeaderInfo] = useState({});
  const onChangeHeader = (e) => {
    setSoHeaderDetails({ ...soHeaderDetails, [e.target.name]: e.target.value });
  };
  const [showLines, setShowLines] = useState(true);
  const [headerDetails, setHeaderDetails] = useState({
    headerId: null,
    orderNumber: null,
  });

  let sumTotalPrice = 0;
  soLineDetails.forEach((element) => {
    sumTotalPrice +=
      (element.selectedItem.unit_price ? element.selectedItem.unit_price : element.unit_selling_price) *
      element.ordered_quantity;
  });
  // row.selectedItem.unit_price ? row.selectedItem.unit_price : row.unit_selling_price
  console.log(sumTotalPrice);

  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // const firstLine = soLineDetails.length > 0 ? soLineDetails[0] : {};

        // Data for the first section with one value per row in the first column
        const firstSectionData = [
          [
            'Order Number',
            'Ordered Date',
            'Customer',
            'Ship to',
            'Transport Type',
            'Special Discount',
            'Special Adjustment',
            'Total Price',
          ],
          [
            soHeaderDetails.order_number,
            getFormattedDate(soHeaderDetails.ordered_date),
            soHeaderDetails.distributor,
            customerRows.ship_to_address ? customerRows.ship_to_address : soHeaderDetails.ship_to,
            soHeaderDetails.shipping_method_code || '',
            soHeaderDetails.special_discount,
            soHeaderDetails.special_adjustment,
            getFormattedPrice(sumTotalPrice),
          ],
        ];

        // Header for the remaining line items
        const remainingRowsHeader = [
          'Item',
          'UOM',
          'Quantity',
          'Offer Quantity',
          'Total Quantity',
          'Unit Price',
          'Unit Offer Price',
          'Total Price',
        ];

        // Remaining rows data for the items
        const remainingLineRows = soLineDetails.map((line) => [
          line.selectedItem?.description || line.selectedItemName || '',
          line.selectedItem?.primary_uom_code || line.order_quantity_uom || '',
          line.ordered_quantity || '',
          line.offer_quantity ? line.ordered_quantity : 0,
          parseInt(line.offer_quantity || 0, 10) + parseInt(line.ordered_quantity || 0, 10),
          line.unit_price || line.unit_selling_price || 0,
          line.ordered_quantity
            ? getFormattedPrice(
                (line.ordered_quantity * (line.unit_price || line.unit_selling_price)) /
                  (parseInt(line.offer_quantity || 0, 10) + parseInt(line.ordered_quantity || 0, 10))
              )
            : line.unit_price || 0,
          getFormattedPrice(
            line.ordered_quantity *
              (line.selectedItem.unit_price ? line.selectedItem.unit_price : line.unit_selling_price)
          ),
        ]);

        const totalRow = ['', '', '', '', '', '', 'Total', getFormattedPrice(sumTotalPrice)];

        const exportOrderLinesData = [...firstSectionData, [], remainingRowsHeader, ...remainingLineRows, totalRow];

        console.log('Export Data:', exportOrderLinesData);
        setCsvData(exportOrderLinesData);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [soHeaderDetails, soLineDetails]);

  const saveHeader = async () => {
    const shipToValue = soHeaderDetails.ship_to ? soHeaderDetails.ship_to : '';
    const requestBody = {
      lastUpdatedBy: account.user_id,
      shippingMethodCode: soHeaderDetails.shipping_method_code ? soHeaderDetails.shipping_method_code : '',
      description: soHeaderDetails.description ? soHeaderDetails.description : '',
      // shipTo: soHeaderDetails.ship_to ? soHeaderDetails.ship_to : '',
      shipTo: customerRows.ship_to_address ? customerRows.ship_to_address : shipToValue,
      specialDiscount: parseInt(soHeaderDetails.special_discount, 10),
      specialAdjustment: parseInt(soHeaderDetails.special_adjustment, 10),
      // totalPrice: soHeaderDetails.total_price,
      totalPrice: sumTotalPrice,
      distributor: customerRows.accountName ? customerRows.accountName : account.full_name,
      soldToOrgId: customerRows.custAccountId ? customerRows.custAccountId : account.ship_to_org_id,
      shipToOrgId: customerRows.custAccountId ? customerRows.custAccountId : account.ship_to_org_id,
      invoiceToOrgId: customerRows.custAccountId ? customerRows.custAccountId : account.ship_to_org_id,
      deliverToOrgId: customerRows.custAccountId ? customerRows.custAccountId : account.ship_to_org_id,
      soldToContactId: customerRows.custAccountId ? customerRows.custAccountId : account.ship_to_org_id,
      shipToContactId: customerRows.custAccountId ? customerRows.custAccountId : account.ship_to_org_id,
      invoiceToContactId: customerRows.custAccountId ? customerRows.custAccountId : account.ship_to_org_id,
      deliverToContactId: customerRows.custAccountId ? customerRows.custAccountId : account.ship_to_org_id,
    };
    console.log(requestBody);

    const response = await updateSalesOrderHeaderService(soHeaderDetails.header_id, requestBody);
    if (response.status === 200) {
      console.log(response.data);
      saveLines();
    } else {
      alert('Process failed! Try again');
    }
  };

  const handleAddRow = () => {
    // if (rows.length === 1) setShowLines(true);
    if (showLines) {
      setSoLineDetails([
        ...soLineDetails,
        {
          line_id: null,
          org_id: null,
          header_id: null,
          line_type_id: null,
          line_number: null,
          ordered_item: '',
          request_date: null,
          promise_date: null,
          schedule_ship_date: null,
          order_quantity_uom: '',
          pricing_quantity: null,
          pricing_quantity_uom: null,
          cancelled_quantity: null,
          shipped_quantity: null,
          ordered_quantity: null,
          fulfilled_quantity: null,
          shipping_quantity: null,
          shipping_quantity_uom: null,
          delivery_lead_time: null,
          tax_exempt_flag: null,
          tax_exempt_number: null,
          tax_exempt_reason_code: null,
          ship_from_org_id: null,
          ship_to_org_id: null,
          invoice_to_org_id: null,
          deliver_to_org_id: null,
          ship_to_contact_id: null,
          deliver_to_contact_id: null,
          invoice_to_contact_id: null,
          sold_from_org_id: null,
          sold_to_org_id: null,
          cust_po_number: null,
          inventory_item_id: null,
          tax_date: null,
          tax_code: null,
          tax_rate: null,
          price_list_id: null,
          pricing_date: null,
          shipment_number: null,
          agreement_id: null,
          shipment_priority_code: null,
          shipping_method_code: null,
          freight_carrier_code: null,
          freight_terms_code: null,
          fob_point_code: null,
          tax_point_code: null,
          payment_term_id: null,
          invoicing_rule_id: null,
          accounting_rule_id: null,
          source_document_type_id: null,
          source_document_id: null,
          source_document_line_id: null,
          item_revision: null,
          unit_selling_price: null,
          unit_list_price: null,
          tax_value: null,
          creation_date: '',
          created_by: null,
          last_update_date: null,
          last_updated_by: null,
          last_update_login: null,
          sort_order: null,
          item_type_code: null,
          cancelled_flag: null,
          open_flag: '',
          booked_flag: '',
          salesrep_id: null,
          order_source_id: null,
          selectedItemName: '',
          selectedItem: {},
          showList: false,
        },
      ]);
    }
  };

  const handleInputChange = (index, name, value) => {
    setShowSaveLine(false);
    const updatedRows = [...soLineDetails];
    updatedRows[index][name] = value;
    setSoLineDetails(updatedRows);
    console.log(soLineDetails);
  };

  //   const handleInputChange = (index, name, value) => {
  //     setShowSaveLine(false);
  //     const updatedRows = [...rows];
  //     updatedRows[index][name] = value;
  //     setRows(updatedRows);
  //   };

  const [showApprovalButton, setShowApprovalButton] = useState(false);

  const submitRequisition = async () => {
    if (confirm('Are you sure for this requisition?')) {
      if (
        soHeaderDetails.authorization_status === 'Incomplete' ||
        soHeaderDetails.authorization_status === 'APPROVED'
      ) {
        const requestBody = {
          pHierarchyId: 1,
          pTransactionId: soHeaderDetails.header_id,
          pTransactionNum: soHeaderDetails.order_number.toString(),
          pAppsUsername: account.user_name,
          pNotificationId: 1,
          pApprovalType: 'A',
          pEmpid: 1,
          pNote: 'A',
          pAuthorizationStatus: soHeaderDetails.authorization_status,
        };
        const response = await callSoApprovalService(requestBody);

        if (response.status === 200) {
          navigate('/dashboard/dashclone', { replace: true });
        } else {
          alert('Process failed! Please try later');
        }
      } else {
        const requestBody = {
          pHierarchyId: 1,
          pTransactionID: soHeaderDetails.header_id,
          pTransactionNum: soHeaderDetails.order_number.toString(),
          pAppsUsername: account.user_name,
          pNotificationID: 1,
          pApprovalType: 'A',
          pEmpid: 1,
          pNote: 'test',
        };
        const response = await callReqApprovalFromPanelService(requestBody);

        if (response.status === 200) {
          navigate('/dashboard/dashclone', { replace: true });
        } else {
          alert('Process failed! Please try later');
        }
      }

      // window.location.reload();
    }
  };

  const rejectRequisition = async () => {
    if (confirm('Are you sure for this requisition?')) {
      const requestBody = {
        pHierarchyId: 1,
        pTransactionID: soHeaderDetails.header_id,
        pTransactionNum: soHeaderDetails.order_number.toString(),
        pAppsUsername: account.user_name,
        pNotificationID: 1,
        pApprovalType: 'R',
        pEmpid: 1,
        pNote: 'test',
      };
      const response = await callReqApprovalFromPanelService(requestBody);

      if (response.status === 200) {
        alert('Successfull!');
        navigate('/dashboard/dashclone', { replace: true });
      } else {
        alert('Process failed! Please try later');
      }
      // window.location.reload();
    }
  };

  const saveLines = async () => {
    // const filteredArray = rows.filter((item) => Object.values(item).some((value) => value !== ''));
    const filteredArray = soLineDetails.filter((item) => Object.values(item).some((value) => value !== ''));
    console.log(filteredArray);

    filteredArray.forEach(async (lineInfo, index) => {
      console.log(lineInfo.line_id);
      console.log(lineInfo);
      if (lineInfo.line_id) {
        console.log(lineInfo);
        const requestBody = {
          // headerId: headerDetails.headerId,
          // lineNumber: index + 1,
          // inventoryItemId: lineInfo.inventory_item_id,
          inventoryItemId: lineInfo.selectedItem.inventory_item_id
            ? lineInfo.selectedItem.inventory_item_id
            : lineInfo.inventory_item_id,
          // creationDate: getCurrentDate(),
          // createdBy: account.user_id,
          // orderedItem: lineInfo.ordered_item,
          orderedItem: lineInfo.selectedItem.description ? lineInfo.selectedItem.description : lineInfo.ordered_item,
          orderQuantityUom: lineInfo.order_quantity_uom,
          orderedQuantity: lineInfo.ordered_quantity,
          // soldFromOrgId: lineInfo.soldFromOrgId,
          unitSellingPrice: lineInfo.selectedItem.unit_price
            ? lineInfo.selectedItem.unit_price
            : lineInfo.unit_selling_price,
          totalPrice:
            (lineInfo.selectedItem.unit_price ? lineInfo.selectedItem.unit_price : lineInfo.unit_selling_price) *
            lineInfo.ordered_quantity,
          offerQuantity: lineInfo.offer_quantity,
          totalQuantity: parseInt(lineInfo.offer_quantity, 10) + parseInt(lineInfo.ordered_quantity, 10),
          // unitOfferPrice:
          //   (lineInfo.ordered_quantity * lineInfo.selectedItem.unit_price) /
          //   (parseInt(lineInfo.offerQuantity, 10) + parseInt(lineInfo.orderedQuantity, 10)),
          unitOfferPrice:
            (lineInfo.ordered_quantity *
              (lineInfo.selectedItem.unit_price ? lineInfo.selectedItem.unit_price : lineInfo.unit_selling_price)) /
            (parseInt(lineInfo.offer_quantity, 10) + parseInt(lineInfo.ordered_quantity, 10)),
        };
        console.log(requestBody);

        // const response = await addSalesOrderLinesService(requestBody);
        const response = await updateSalesOrderLineService(lineInfo.line_id, requestBody);

        if (response.status === 200) {
          console.log(response.data);

          // setShowApprovalButton(true);
          // handleInputChange(index, 'lineId', response.data.headerInfo[0].line_id);
          // setShowSaveLine(true);
        } else {
          setShowApprovalButton(false);
        }
      } else {
        console.log(lineInfo);
        const requestBody = {
          headerId: soHeaderDetails.header_id,
          lineNumber: index + 1,
          inventoryItemId: lineInfo.selectedItem.inventory_item_id,
          // inventoryItemId: lineInfo.selectedItem.inventory_item_id
          //   ? lineInfo.selectedItem.inventory_item_id
          //   : lineInfo.inventory_item_id,
          // creationDate: getCurrentDate(),
          createdBy: account.user_id,
          orderedItem: lineInfo.selectedItem.description,
          // orderedItem: lineInfo.selectedItem.description ? lineInfo.selectedItem.description : lineInfo.description,
          orderQuantityUom: lineInfo.selectedItem.primary_uom_code,
          orderedQuantity: lineInfo.ordered_quantity,
          soldFromOrgId: lineInfo.sold_from_org_id,
          // unitSellingPrice: lineInfo.unit_selling_price,
          // totalPrice: lineInfo.unit_selling_price * lineInfo.ordered_quantity,
          unitSellingPrice: lineInfo.selectedItem.unit_price
            ? lineInfo.selectedItem.unit_price
            : lineInfo.unit_selling_price,
          totalPrice:
            (lineInfo.selectedItem.unit_price ? lineInfo.selectedItem.unit_price : lineInfo.unit_selling_price) *
            lineInfo.ordered_quantity,
        };
        console.log(requestBody);

        const response = await addSalesOrderLinesService(requestBody);

        if (response.status === 200) {
          console.log(response.data);

          setShowApprovalButton(true);
          handleInputChange(index, 'lineId', response.data.headerInfo[0].line_id);
          setShowSaveLine(true);
        } else {
          setShowApprovalButton(false);
        }
      }
    });
  };

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [showSaveLine, setShowSaveLine] = useState(false);

  // Function to handle row selection
  const handleRowSelect = (index, row) => {
    console.log(row);
    console.log(index);
    const updatedSelectedLines = [...selectedLines];
    const lineIndex = updatedSelectedLines.indexOf(row.lineId);
    console.log(lineIndex);

    const updatedSelectedRows = [...selectedRows];
    const rowIndex = updatedSelectedRows.indexOf(index);

    if (rowIndex === -1) {
      updatedSelectedRows.push(index);
    } else {
      updatedSelectedRows.splice(rowIndex, 1);
    }

    if (lineIndex === -1) {
      updatedSelectedLines.push(row.line_id);
    } else {
      updatedSelectedLines.splice(lineIndex, 1);
    }

    setSelectedRows(updatedSelectedRows);
    setSelectedLines(updatedSelectedLines);

    console.log(updatedSelectedLines);
    console.log(updatedSelectedRows);

    console.log(selectedLines);
  };

  const handleDeleteRows = () => {
    const updatedRows = soLineDetails.filter((_, index) => !selectedRows.includes(index));
    setSoLineDetails(updatedRows);
    setSelectedRows([]);
  };

  //   const handleDeleteRows = () => {
  //     const updatedRows = rows.filter((_, index) => !selectedRows.includes(index));
  //     setRows(updatedRows);
  //     setSelectedRows([]);
  //   };

  //   const onChecked = (event) => {
  //     setHeaderInfo({ ...headerInfo, [event.target.name]: event.target.checked });
  //   };

  const handleDeleteLines = () => {
    console.log(selectedLines);
    selectedLines.forEach(async (line) => {
      console.log(line);
      await deleteSalesOrderLinesService(line);
    });
    setSelectedLines([]);
  };

  const onClickDelete = async () => {
    // const isEmptyObject =
    //   Object.values(soLineDetails[0]).every((value) => value === null || value === '') &&
    //   !Object.values(headerDetails).every((value) => value === null);
    // console.log(isEmptyObject);

    if (
      selectedLines.length === 0 &&
      soLineDetails.length > 0 &&
      !Object.values(soLineDetails[0]).every((value) => value === null || value === '')
    ) {
      alert('Please select lines to delete');
    } else if (selectedLines.length === 0 && soLineDetails.length === 0) {
      if (confirm('Are you sure to delete the requisition?')) {
        await deleteSalesOrderHeaderService(soHeaderDetails.order_number);
        window.location.reload();
      }
    } else if (selectedLines.length > 0 && soLineDetails.length > 0) {
      if (confirm('Are you sure to delete the lines?')) {
        handleDeleteLines();
        handleDeleteRows();
      }
    }
  };

  // const [isReadOnly, setIsReadOnly] = useState(false);

  const handleInputItemChange = (index, event) => {
    const input = event.target.value;
    const name = 'selectedItemName';
    const show = 'showList';

    const updatedRows = [...soLineDetails];
    updatedRows[index][name] = input;
    updatedRows[index][show] = true;
    setSoLineDetails(updatedRows);
    console.log(soLineDetails);

    // Filter the original list based on the input
    console.log(inventoryItemIds);
    const filtered = inventoryItemIds.filter((item) => item.description.toLowerCase().includes(input.toLowerCase()));
    setFilteredItemList(filtered);
  };

  //   const handleInputItemChange = (index, event) => {
  //     const input = event.target.value;
  //     const name = 'selectedItemName';
  //     const show = 'showList';

  //     const updatedRows = [...rows];
  //     updatedRows[index][name] = input;
  //     updatedRows[index][show] = true;
  //     setRows(updatedRows);
  //     console.log(rows);

  //     // Filter the original list based on the input
  //     console.log(inventoryItemIds);
  //     const filtered = inventoryItemIds.filter((item) => item.description.toLowerCase().includes(input.toLowerCase()));
  //     setFilteredItemList(filtered);
  //   };

  const handleMenuItemClick = (index, item) => {
    const name = 'selectedItemName';
    const selected = 'selectedItem';
    const show = 'showList';

    const updatedRows = [...soLineDetails];
    updatedRows[index][name] = item.description;
    updatedRows[index][selected] = item;
    updatedRows[index][show] = false;
    setSoLineDetails(updatedRows);
    console.log(soLineDetails);
    inputRef.current.focus();
  };

  //   const handleMenuItemClick = (index, item) => {
  //     const name = 'selectedItemName';
  //     const selected = 'selectedItem';
  //     const show = 'showList';

  //     const updatedRows = [...rows];
  //     updatedRows[index][name] = item.description;
  //     updatedRows[index][selected] = item;
  //     updatedRows[index][show] = false;
  //     setRows(updatedRows);
  //     console.log(rows);
  //   };

  const TABLE_HEAD_Approval_Seq = [
    // { id: '' },
    { id: 'unit_of_measure', label: 'SL Num', alignRight: false },
    { id: 'uom_code', label: 'Action Code', alignRight: false },
    { id: 'uom_class', label: 'Action Date', alignRight: false },
    { id: 'disable_date', label: 'Name', alignRight: false },
    { id: 'description', label: 'Note', alignRight: false },
  ];

  const shipToChangable = soHeaderDetails.authorization_status === null;

  // const onApprove = async () => {
  //   const requestBody = {
  //     pHierarchyId: 1,
  //     pTransactionID: headerDetails.header_id,
  //     pTransactionNum: headerDetails.order_number.toString(),
  //     pAppsUsername: account.full_name,
  //     pNotificationID: wfNotifications.notification_id,
  //     pApprovalType: 'A',
  //     pEmpid: 1,
  //     pNote: 'A',
  //   };
  //   const response = await callReqApprovalFromPanelService(requestBody);

  //   console.log(response);
  // };

  // const onReject = async () => {
  //   const requestBody = {
  //     pHierarchyId: 1,
  //     pTransactionID: headerDetails.header_id,
  //     pTransactionNum: headerDetails.order_number.toString(),
  //     pAppsUsername: account.full_name,
  //     pNotificationID: wfNotifications.notification_id,
  //     pApprovalType: 'R',
  //     pEmpid: 1,
  //     pNote: 'R',
  //   };
  //   const response = await callReqApprovalFromPanelService(requestBody);

  //   console.log(response);
  // };

  const [customerRows, setCustomerRows] = useState([
    {
      custAccountId: null,
      accountNumber: '',
      accountName: '',
      ship_to_address: '',
      showList: false,
    },
  ]);

  const [customerList, setCustomerList] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getCustomerListService(user); // Call your async function here
        if (response.status === 200) setCustomerList(response.data); // Set the account details in the component's state
      } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error('Error fetching account details:', error);
      }
    }

    fetchData(); // Call the async function when the component mounts
  }, []);
  console.log(customerList);

  const [filteredCustomerList, setFilteredCustomerList] = useState([]);

  const handleInputCustomerChange = (event) => {
    const input = event.target.value;
    console.log(input);

    const username = 'accountName';
    const show = 'showList';

    const updatedRows = [...customerRows];
    updatedRows[username] = input;
    updatedRows[show] = true;

    const distributor = 'distributor';
    setSoHeaderDetails({ ...soHeaderDetails, [distributor]: input });

    setCustomerRows(updatedRows);
    console.log(customerRows);

    const filtered = customerList.filter((item) => item.full_name.toLowerCase().includes(input.toLowerCase()));
    setFilteredCustomerList(filtered);
    console.log(filteredCustomerList);
  };

  const handleCustomerClick = (item) => {
    console.log(item);
    const name = 'accountName';
    const selected = 'custAccountId';
    const address = 'ship_to_address';
    const show = 'showList';

    const updatedRows = [...customerRows];
    updatedRows[name] = item.full_name;
    // setSelectedCustomer(item.full_name);
    updatedRows[selected] = item.cust_account_id;
    updatedRows[address] = item.ship_to_address;
    updatedRows[show] = false;

    setCustomerRows(updatedRows);
    const headerShipTo = 'ship_to';
    const deliverToContactId = 'deliver_to_contact_id';
    const deliverToOrgId = 'deliver_to_org_id';
    const distributor = 'distributor';
    const invoiceToContactId = 'invoice_to_contact_id';
    const invoiceToOrgId = 'invoice_to_org_id';
    const shipToContactId = 'ship_to_contact_id';
    const shipToOrgId = 'ship_to_org_id';
    const soldToContactId = 'sold_to_contact_id';
    const soldToOrgId = 'sold_to_org_id';

    setSoHeaderDetails({ ...soHeaderDetails, [headerShipTo]: item.ship_to_address });
    setSoHeaderDetails({ ...soHeaderDetails, [deliverToContactId]: item.cust_account_id });
    setSoHeaderDetails({ ...soHeaderDetails, [deliverToOrgId]: item.cust_account_id });
    setSoHeaderDetails({ ...soHeaderDetails, [distributor]: item.full_name });
    setSoHeaderDetails({ ...soHeaderDetails, [invoiceToContactId]: item.cust_account_id });
    setSoHeaderDetails({ ...soHeaderDetails, [invoiceToOrgId]: item.cust_account_id });
    setSoHeaderDetails({ ...soHeaderDetails, [shipToContactId]: item.cust_account_id });
    setSoHeaderDetails({ ...soHeaderDetails, [shipToOrgId]: item.cust_account_id });
    setSoHeaderDetails({ ...soHeaderDetails, [soldToContactId]: item.cust_account_id });
    setSoHeaderDetails({ ...soHeaderDetails, [soldToOrgId]: item.cust_account_id });

    console.log(customerRows);
  };

  return (
    <>
      <Helmet>
        <title> COMS | Update Customer Order </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" gutterBottom>
            Update Customer Order
          </Typography>
          <CSVLink data={csvData} className="btn btn-success">
            Export Table
          </CSVLink>
        </Stack>
        <div className="row g-3 align-items-center">
          <Stack direction="row" alignItems="center" justifyContent="flex-start">
            <div className="col-auto" style={{ width: '160px', marginRight: '15px' }}>
              <label htmlFor="orderNumber" className="col-form-label" style={{ display: 'flex', fontSize: '13px' }}>
                Order Number
                <input
                  type="number"
                  id="orderNumber"
                  name="orderNumber"
                  className="form-control"
                  style={{ marginLeft: '7px' }}
                  // value={headerDetails.orderNumber}
                  value={soHeaderDetails.order_number}
                  readOnly
                />
              </label>
            </div>
            <div className="col-auto" style={{ width: '160px', marginRight: '15px' }}>
              <label htmlFor="orderedDate" className="col-form-label" style={{ display: 'flex', fontSize: '13px' }}>
                Ordered Date
                <input
                  type="text"
                  id="orderedDate"
                  className="form-control"
                  style={{ marginLeft: '7px' }}
                  value={getFormattedDate(soHeaderDetails.ordered_date)}
                  readOnly
                />
              </label>
            </div>
            {/* <div className="col-auto" style={{ width: '180px', marginRight: '15px' }}>
              <label
                htmlFor="special_discount"
                className="col-form-label"
                style={{ display: 'flex', fontSize: '13px' }}
              >
                Customer
                <input
                  type="number"
                  id="special_discount"
                  name="special_discount"
                  className="form-control"
                  style={{ marginLeft: '7px' }}
                  defaultValue={soHeaderDetails.distributor}
                  readOnly
                />
              </label>
            </div> */}
            <div className="col-auto" style={{ marginRight: '15px' }}>
              <label htmlFor="distributor" className="col-form-label" style={{ display: 'flex', fontSize: '13px' }}>
                Customer
                <input
                  type="text"
                  name="distributor"
                  id="distributor"
                  className="form-control"
                  style={{
                    marginLeft: '7px',
                    height: '30px', // Set a fixed height for the input field
                    boxSizing: 'border-box',
                  }}
                  // value={selectedCustomer}
                  value={soHeaderDetails.distributor}
                  // value={customerRows.accountName ? customerRows.accountName : account.full_name}
                  onChange={(e) => handleInputCustomerChange(e)}
                />
                {customerRows.showList && (
                  <ul
                    style={{
                      zIndex: 1, // Ensure the dropdown is above other content
                    }}
                  >
                    {filteredCustomerList.map((item, itemIndex) => (
                      <>
                        <MenuItem key={itemIndex} value={item} onClick={() => handleCustomerClick(item)}>
                          {item.full_name}
                        </MenuItem>
                      </>
                    ))}
                  </ul>
                )}
              </label>
            </div>

            <div className="col-auto" style={{ width: '430px' }}>
              <label htmlFor="ship_to" className="col-form-label" style={{ display: 'flex', fontSize: '13px' }}>
                Ship to
                <input
                  type="text"
                  id="ship_to"
                  name="ship_to"
                  className="form-control"
                  style={{ marginLeft: '5px' }}
                  // value={soHeaderDetails.ship_to ship_to_address}
                  value={customerRows.ship_to_address ? customerRows.ship_to_address : soHeaderDetails.ship_to}
                  // readOnly={!shipToChangable}
                />
              </label>
            </div>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="flex-start">
            {/* <div className="col-auto" style={{ width: '180px', marginRight: '15px', height: '38px' }}>
              <label
                htmlFor="shipping_method_code"
                className="col-form-label"
                style={{ display: 'flex', fontSize: '13px', height: '38px' }}
              >
                Transport Type
                <Select
                  id="shipping_method_code"
                  name="shipping_method_code"
                  className="form-control"
                  // style={{ marginLeft: '7px' }}
                  style={{ marginLeft: '7px', height: '38px', width: '390px', backgroundColor: 'white' }}
                  defaultValue={soHeaderDetails.shipping_method_code}
                  onChange={(e) => onChangeHeader(e)}
                >
                  <MenuItem value="Self">Self</MenuItem>
                  <MenuItem value="Company">Company</MenuItem>
                  <MenuItem value="Rental">Rental</MenuItem>
                  <MenuItem value="Courier">Courier</MenuItem>
                </Select>
              </label>
            </div> */}
            <div className="col-auto" style={{ width: '180px', marginRight: '15px' }}>
              <label
                htmlFor="shippingMethodCode"
                className="col-form-label"
                style={{ display: 'flex', fontSize: '13px' }}
              >
                Transport Type
                {/* <select
                  id="shippingMethodCode"
                  name="shippingMethodCode"
                  className="form-control"
                  style={{ marginLeft: '7px' }}
                  onChange={(e) => onChangeHeader(e)}
                >
                  <option value="Self">Self</option>
                  <option value="Company">Company</option>
                  <option value="Rental">Rental</option>
                  <option value="Courier">Courier</option>
                </select> */}
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  name="shipping_method_code"
                  style={{ marginLeft: '7px', height: '38px', width: '390px', backgroundColor: 'white' }}
                  onChange={(e) => onChangeHeader(e)}
                  // defaultValue="Self"
                  value={soHeaderDetails.shipping_method_code || ''}
                >
                  <MenuItem value="Self">Self</MenuItem>
                  <MenuItem value="Company">Company</MenuItem>
                  <MenuItem value="Rental">Rental</MenuItem>
                  <MenuItem value="Courier">Courier</MenuItem>
                </Select>
              </label>
            </div>
            <div className="col-auto" style={{ width: '180px', marginRight: '15px' }}>
              <label
                htmlFor="special_discount"
                className="col-form-label"
                style={{ display: 'flex', fontSize: '13px' }}
              >
                Special Discount
                <input
                  type="number"
                  id="special_discount"
                  name="special_discount"
                  className="form-control"
                  style={{ marginLeft: '7px' }}
                  defaultValue={soHeaderDetails.special_discount}
                  onChange={(e) => onChangeHeader(e)}
                />
              </label>
            </div>
            <div className="col-auto" style={{ width: '180px', marginRight: '15px' }}>
              <label
                htmlFor="special_adjustment"
                className="col-form-label"
                style={{ display: 'flex', fontSize: '13px' }}
              >
                Special Adjustment
                <input
                  type="number"
                  id="special_adjustment"
                  name="special_adjustment"
                  className="form-control"
                  style={{ marginLeft: '7px' }}
                  defaultValue={soHeaderDetails.special_adjustment}
                  onChange={(e) => onChangeHeader(e)}
                />
              </label>
            </div>
            {/* <div className="col-auto" style={{ width: '500px' }}>
              <label htmlFor="description" className="col-form-label" style={{ display: 'flex', fontSize: '13px' }}>
                Description
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  style={{ marginLeft: '7px', height: '30px', width: '390px' }}
                  value={soHeaderDetails.description}
                  onChange={(e) => {
                    onChangeHeader(e);
                  }}
                />
              </label>
            </div> */}
            <div className="col-auto" style={{ width: '160px', marginRight: '15px' }}>
              <label htmlFor="total_price" className="col-form-label" style={{ display: 'flex', fontSize: '13px' }}>
                Total price
                <input
                  type="text"
                  id="total_price"
                  name="total_price"
                  className="form-control"
                  // style={{ textAlign: 'right' }}
                  value={getFormattedPrice(sumTotalPrice)}
                  readOnly
                />
              </label>
            </div>
          </Stack>
        </div>
        <form className="form-horizontal" style={{ marginTop: '20px' }}>
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-highlight">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={() => {
                        // Select or deselect all rows
                        const allRowsSelected = selectedRows.length === soLineDetails.length;
                        const newSelectedRows = allRowsSelected ? [] : soLineDetails.map((_, index) => index);
                        // const allRowsSelected = selectedRows.length === rows.length;
                        // const newSelectedRows = allRowsSelected ? [] : rows.map((_, index) => index);
                        setSelectedRows(newSelectedRows);
                      }}
                      checked={selectedRows.length === soLineDetails.length && soLineDetails.length !== 0}
                      //   checked={selectedRows.length === rows.length && rows.length !== 0}
                    />
                  </th>
                  {/* <th>Line Number</th> */}
                  <th style={{ width: '420px' }}>
                    Item <span style={{ color: 'red' }}>*</span>
                  </th>
                  <th style={{ width: '50px', textAlign: 'center' }}>UOM</th>
                  <th style={{ textAlign: 'right' }}>
                    Quantity <span style={{ color: 'red' }}>*</span>
                  </th>
                  <th style={{ textAlign: 'right' }}>Offer Quantity</th>
                  <th style={{ textAlign: 'right' }}>Total Quantity</th>
                  {/* <th>Sold From Org ID</th> */}
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Unit Offer Price</th>
                  <th style={{ textAlign: 'right' }}>Total Price</th>
                </tr>
              </thead>
              <tbody>
                {showLines &&
                  soLineDetails.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          onChange={() => handleRowSelect(index, row)}
                          checked={selectedRows.includes(index)}
                        />
                      </td>
                      {/* <td>
                        <input type="number" className="form-control" name="lineNumber" value={index + 1} readOnly />
                      </td> */}
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          // style={{ width: '420px' }}
                          style={{
                            textAlign: 'left',
                            width: '420px',
                            height: '50%',
                            border: 'none',
                            background: 'none',
                            outline: 'none',
                          }}
                          value={row.selectedItemName}
                          defaultValue={row.ordered_item}
                          onChange={(e) => handleInputItemChange(index, e)}
                        />
                        {row.showList && (
                          <ul style={{ marginTop: '18px' }}>
                            {filteredItemList.map((item, itemIndex) => (
                              <>
                                <MenuItem key={itemIndex} value={item} onClick={() => handleMenuItemClick(index, item)}>
                                  {item.description}
                                </MenuItem>
                              </>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          name="primary_uom_code"
                          readOnly
                          value={row.selectedItem.primary_uom_code}
                          // style={{ width: '80px', textAlign: 'center' }}
                          style={{
                            textAlign: 'center',
                            width: '50px',
                            height: '50%',
                            border: 'none',
                            background: 'none',
                            outline: 'none',
                          }}
                          defaultValue={row.order_quantity_uom}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          name="ordered_quantity"
                          defaultValue={row.ordered_quantity}
                          // style={{ textAlign: 'right' }}
                          style={{
                            textAlign: 'right',
                            width: '78px',
                            height: '50%',
                            border: 'none',
                            background: 'none',
                            outline: 'none',
                          }}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                          ref={inputRef}
                        />
                      </td>
                      {/* <td>
                        <input
                          type="number"
                          className="form-control"
                          name="soldFromOrgId"
                          defaultValue={row.sold_from_org_id}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td> */}
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          name="offer_quantity"
                          style={{
                            textAlign: 'right',
                            width: '100%',
                            height: '50%',
                            border: 'none',
                            background: 'none',
                            outline: 'none',
                          }}
                          defaultValue={row.offer_quantity ? row.ordered_quantity : 0}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          name="totalQuantity"
                          style={{
                            textAlign: 'right',
                            width: '100%',
                            height: '50%',
                            border: 'none',
                            background: 'none',
                            outline: 'none',
                          }}
                          // value={row.selectedItem.unit_price ? row.selectedItem.unit_price : row.unit_selling_price}
                          value={
                            parseInt(row.offer_quantity ? row.offer_quantity : 0, 10) +
                            parseInt(row.ordered_quantity ? row.ordered_quantity : 0, 10)
                          }
                          // value={parseInt(row.offer_quantity, 10) + parseInt(row.ordered_quantity, 10)}
                          readOnly
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          name="unit_selling_price"
                          value={row.selectedItem.unit_price ? row.selectedItem.unit_price : row.unit_selling_price}
                          // style={{ textAlign: 'right' }}
                          style={{
                            textAlign: 'right',
                            width: '90px',
                            height: '50%',
                            border: 'none',
                            background: 'none',
                            outline: 'none',
                          }}
                          readOnly
                          //   onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: 'right', height: '50%' }}>
                        <input
                          type="text"
                          className="form-control"
                          name="unitOfferPrice"
                          style={{
                            textAlign: 'right',
                            width: '100px',
                            height: '50%',
                            border: 'none',
                            background: 'none',
                            outline: 'none',
                          }}
                          value={
                            // getFormattedPrice(
                            //   (row.ordered_quantity *
                            //     (row.selectedItem.unit_price ? row.selectedItem.unit_price : row.unit_selling_price)) /
                            //     (parseInt(row.offer_quantity ? row.offer_quantity : 0, 10) +
                            //       parseInt(row.ordered_quantity ? row.ordered_quantity : 0, 10))
                            // )
                            row.ordered_quantity
                              ? getFormattedPrice(
                                  (row.ordered_quantity *
                                    (row.selectedItem.unit_price
                                      ? row.selectedItem.unit_price
                                      : row.unit_selling_price)) /
                                    (parseInt(row.offer_quantity ? row.offer_quantity : 0, 10) +
                                      parseInt(row.ordered_quantity, 10))
                                )
                              : row.selectedItem.unit_price
                              ? row.selectedItem.unit_price
                              : 0
                          }
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          name="unitSellingPrice"
                          // style={{ textAlign: 'right' }}
                          style={{
                            textAlign: 'right',
                            width: '100px',
                            height: '50%',
                            border: 'none',
                            background: 'none',
                            outline: 'none',
                          }}
                          value={getFormattedPrice(
                            row.ordered_quantity *
                              (row.selectedItem.unit_price ? row.selectedItem.unit_price : row.unit_selling_price)
                          )}
                          readOnly
                        />
                      </td>
                    </tr>
                  ))}
                <tr>
                  <td />
                  <td>Total</td>
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td style={{ textAlign: 'right', paddingRight: '11px' }}>{getFormattedPrice(sumTotalPrice)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <ButtonGroup variant="contained" aria-label="outlined primary button group" spacing={2}>
              <Button
                style={{ whiteSpace: 'nowrap', marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
                onClick={saveHeader}
              >
                Save
              </Button>
              <Button
                style={{ whiteSpace: 'nowrap', marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
                onClick={onClickDelete}
              >
                Delete
              </Button>
              <Button
                style={{
                  whiteSpace: 'nowrap',
                  display: shipToChangable ? 'block' : 'none',
                  backgroundColor: 'lightgray',
                  marginRight: '10px',
                  color: 'black',
                }}
                // disabled={showApprovalButton === 'none'}
                onClick={submitRequisition}
              >
                Approval
              </Button>
              <Button
                style={{
                  whiteSpace: 'nowrap',
                  backgroundColor: 'lightgray',
                  marginRight: '10px',
                  color: 'black',
                  display: shipToChangable ? 'none' : 'block',
                }}
                onClick={submitRequisition}
              >
                Approve
              </Button>
              <Button
                style={{
                  whiteSpace: 'nowrap',
                  // display: showApprovalButton,
                  backgroundColor: 'lightgray',
                  marginRight: '10px',
                  color: 'black',
                  display: shipToChangable ? 'none' : 'block',
                }}
                // disabled={showApprovalButton === 'none'}
                onClick={rejectRequisition}
                disabled={soHeaderDetails.authorization_status === 'Incomplete'}
              >
                Reject
              </Button>
              <Button
                style={{ whiteSpace: 'nowrap', backgroundColor: 'lightgray', color: 'black' }}
                onClick={handleAddRow}
              >
                Add Lines
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>

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
                  <TableCell>{value.action_date ? getFormattedDate(value.action_date) : null}</TableCell>
                  <TableCell>{value.full_name}</TableCell>
                  <TableCell>{value.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}
