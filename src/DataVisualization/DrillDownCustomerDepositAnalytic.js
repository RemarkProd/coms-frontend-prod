import { FieldChooser, PivotGrid } from 'devextreme-react/pivot-grid';
import 'devextreme/dist/css/dx.light.css';
import { useEffect, useState } from 'react';
import { getDrillDownCustomerDepositAnalytic, getUserProfileDetails } from '../Services/ApiServices';
import { useUser } from '../context/UserContext'; // Assuming you have a user context

const PivotGridTable = () => {
  const [usersList, setUsersList] = useState([]);
  const { user } = useUser();
  const [account, setAccount] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        if (user) {
          const accountDetails = await getUserProfileDetails(user);
          if (accountDetails.status === 200) {
            setAccount(accountDetails.data);
          }
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [user]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (account) {
          const response = await getDrillDownCustomerDepositAnalytic(user);
          if (response.status === 200) {
            setUsersList(response.data);
          }
          console.log(response.data);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    }

    fetchData();
  }, [account]);
  const handleContentReady = (e) => {
    // Hide the grand total row
    console.log(e.component.getDataSource());
    console.log(document.getElementsByClassName('dx-row-total dx-grandtotal'));
    // const paragraph = document.getElementsByClassName('dx-row-total dx-grandtotal');
    // paragraph.disabled = false;
    // paragraph.classList.toggle('custom-background');
    // e.component.getDataSource().collapseAll('column');
    //   const grandTotalRow = document.querySelector('dx-row-total dx-grandtotal');
    // if (grandTotalRow) {
    //   grandTotalRow.style.display = 'none';
    // }

    const elements = document.querySelectorAll('.dx-row-total.dx-grandtotal');
    // const grandTotalRow = document.querySelector('.dx-column-grand-total.dx-row-total');
    // if (grandTotalRow) {
    //   grandTotalRow.style.visibility = 'hidden';
    // }
    elements.forEach((element) => {
      const elements = document.querySelector(
        '#pivotGrid > div.dx-pivotgrid-container > table > tr:nth-child(3) > td.dx-area-column-cell > div > div > div > div.dx-scrollable-content > table > thead > tr:nth-child(1) > td'
      );
      //   elements.style.visibility = 'hidden';
      elements.innerText = 'All Deposites According to the Time Period';
      element.style.fontWeight = 'bold';
      // elements.style.fontWeight = 'bold';
      console.log(elements);
      // if (element.innerText.trim() === 'Grand Total') {
      //   const grandTotalRow = element.closest('.dx-row-total');
      //   grandTotalRow.style.visibility = 'hidden';
      // }
    });
    //  const elements2=document.querySelector('#pivotGrid > div.dx-pivotgrid-container > table > tr.dx-bottom-row > td.dx-area-row-cell.dx-bottom-border > div > div > div > div.dx-scrollable-content > table > tbody > tr:nth-child(3) > td');
    //  elements2.innerText = 'Total';

    // elements.forEach((element) => {
    //   if (element.innerText.trim() === 'Grand Total') {
    //     element.innerText = 'Deposite According to the Time Period'; // Change the inner text to the new name
    //     element.style.fontWeight = 'bold';
    //   }
    // });
    // dx-row-total dx-grandtotal dx-last-cell
    // dx-row-total dx-grandtotal
    // elements.forEach((element) => {
    //   if (element.innerText.trim() === 'Grand Total') {
    //     // Check if it's a row or column grand total
    //     const parentCell = element.closest('.dx-row-total');
    //     if (parentCell.classList.contains('dx-column-grand-total')) {
    //       element.innerText = 'Deposite According to the Time Period'; // Change the inner text to the new name

    //     }
    //   }
    // });

    // const elements = document.querySelectorAll('.dx-row-total.dx-grandtotal');
    // elements.forEach((element) => {
    //   if (element.innerText.trim() === 'Grand Total') {
    //     const grandTotalRow = element.closest('.dx-row-total');
    //     grandTotalRow.style.visibility = 'hidden';
    //   }
    // });
  };

  // Modify data source structure
  const samplesData = usersList.map((item) => ({
    __rowHeader__: 'Customer Group',
    __rowsHeader__: 'Customer Name',
    __rowssHeader__: 'Deposite Type Name',
    __colHeader__: 'Today Deposite',
    __col2Header__: 'Seven Day Deposite',
    __col3Header__: 'Monthly Deposite',
    customerGroup: item.customer_group,
    customerName: item.customer_name,
    depositDate: item.deposit_date,
    depositTypeName: item.deposit_type_name,
    todaysDeposit: item.todays_deposit,
    sevenDayDeposit: item.seven_day_deposit,
    monthlyDeposit: item.monthly_deposit,
  }));

  const datasSource = {
    store: {
      type: 'array',
      key: 'depositDate',
      data: samplesData,
    },
    fields: [
      {
        caption: 'Row Header',
        dataField: '__rowHeader__',
        area: 'row',
      },
      {
        caption: 'Customer Group ',
        dataField: 'customerGroup',
        area: 'row',
       
      },

      {
        caption: 'Row Header',
        dataField: '__rowsHeader__',
        area: 'row',
      },

      {
        caption: 'Customer Name',
        dataField: 'customerName',
        area: 'row',
      },
      {
        caption: 'Row Header',
        dataField: '__rowssHeader__',
        area: 'row',
      },
      {
        caption: 'Deposit Type Name',
        dataField: 'depositTypeName',
        area: 'row',
      },

      {
        caption: "Today's Deposit",
        dataField: 'todaysDeposit',
        area: 'data',
        dataType: 'number',
        summaryType: 'sum',
        format: 'currency',
      },

      // Seven Day Deposit
      {
        caption: 'Seven Day Deposit',
        dataField: 'sevenDayDeposit',
        area: 'data',
        dataType: 'number',
        summaryType: 'sum',
        format: 'currency',
      },

      // Monthly Deposit
      {
        caption: 'Monthly Deposit',
        dataField: 'monthlyDeposit',
        area: 'data',
        dataType: 'number',
        summaryType: 'sum',
        format: 'currency',
      },
    ],

    // showColumnGrandTotals: false,
  };

  return (
    <>
      <PivotGrid
        id="pivotGrid"
        showBorders
        dataSource={datasSource}
        allowSorting
        allowSortingBySummary
        allowFiltering
        height={600}
        width={'100%'}
        onContentReady={handleContentReady}
      >
        {datasSource.fields.map((field) => (
          <FieldChooser key={field.dataField} dataField={field.dataField} caption={field.caption} area={field.area} />
        ))}
      </PivotGrid>
    </>
  );
};

export default PivotGridTable;
