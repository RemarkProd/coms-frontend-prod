/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Button, Container, Grid } from '@mui/material';
import { sentenceCase } from 'change-case';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResponsiveDialog() {
  const navigate = useNavigate();

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);

  // Function to handle row selection
  const handleRowSelect = (index, row) => {
    console.log(row);
    const updatedSelectedLines = [...selectedLines];
    const lineIndex = updatedSelectedLines.indexOf(row.lineId);

    const updatedSelectedRows = [...selectedRows];
    const rowIndex = updatedSelectedRows.indexOf(index);

    if (rowIndex === -1) {
      updatedSelectedRows.push(index);
    } else {
      updatedSelectedRows.splice(rowIndex, 1);
    }

    if (lineIndex === -1) {
      updatedSelectedLines.push(row.lineId);
    } else {
      updatedSelectedLines.splice(lineIndex, 1);
    }

    setSelectedRows(updatedSelectedRows);
    setSelectedLines(updatedSelectedLines);
  };

  const [rows, setRows] = useState([
    {
      customerId: null,
      customerCode: '',
      customerName: '',
      address: '',
      email: '',
      phone: '',
      group: '',
    },
  ]);

  const [showLines, setShowLines] = useState(false);

  const handleAddRow = () => {
    console.log(rows);
    if (rows.length === 1) setShowLines(true);
    if (showLines)
      setRows([
        ...rows,
        {
          customerId: null,
          customerCode: '',
          customerName: '',
          address: '',
          email: '',
          phone: '',
          group: '',
        },
      ]);
    console.log(rows);
  };

  const handleDeleteRows = () => {
    const updatedRows = rows.filter((_, index) => !selectedRows.includes(index));
    setRows(updatedRows);
    setSelectedRows([]);
  };

  const handleInputChange = (index, name, value) => {
    const updatedRows = [...rows];
    updatedRows[index][name] = value;
    setRows(updatedRows);
  };

  const handleClick = async () => {
    const filteredArray = rows.filter((item) => Object.values(item).some((value) => value !== ''));
    console.log(filteredArray);

    // for (const [index, lineInfo] of filteredArray.entries()) {
    //   const date = new Date().toJSON();

    //   try {
    //     const uomBody = {
    //       unitOfMeasure: lineInfo.unitOfMeasure,
    //       uomCode: lineInfo.uomCode,
    //       uomClass: lineInfo.uomClass,
    //       lastUpdateDate: date,
    //       lastUpdatedBy: 'Admin',
    //       createdBy: 'Admin',
    //       creationDate: date,
    //       description: lineInfo.description,
    //     };

    //     const response = await addUomDetails(uomBody);

    //     console.log(response);

    //     if (response.status === 200) {
    //       // alert('Successfully added!');
    //       filteredArray.splice(index, 1);
    //     } else {
    //       console.log(response);
    //       // alert('Process failed! Try again later');
    //     }
    //   } catch (err) {
    //     console.log(err.message);
    //     // alert('Process failed! Try again later');
    //   }
    // }

    // if (filteredArray.length === 0) {
    //   console.log(filteredArray);
    //   navigate('/dashboard/uom', { replace: true });
    //   // window.location.reload();
    // } else {
    //   setRows(filteredArray);
    //   alert('Process failed! Try again later');
    //   // window.location.reload();
    // }
  };

  return (
    <>
      <Container>
        {/* <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" gutterBottom>
            Requisition Form
          </Typography>
        </Stack> */}
        <Grid container spacing={2}>
          <Grid item xs={3} style={{ display: 'flex' }}>
            <Button style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }} onClick={handleClick}>
              Save
            </Button>
            <Button
              style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black' }}
              onClick={handleDeleteRows}
            >
              Delete
            </Button>
            <Button style={{ backgroundColor: 'lightgray', color: 'black' }} onClick={handleAddRow}>
              Add Lines
            </Button>
          </Grid>
        </Grid>

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
                        const allRowsSelected = selectedRows.length === rows.length;
                        const newSelectedRows = allRowsSelected ? [] : rows.map((_, index) => index);
                        setSelectedRows(newSelectedRows);
                      }}
                      checked={selectedRows.length === rows.length && rows.length !== 0}
                    />
                  </th>
                  <th>
                    {sentenceCase('customer_id')} <span style={{ color: 'red' }}>*</span>
                  </th>
                  <th>
                    {sentenceCase('customer_code')} <span style={{ color: 'red' }}>*</span>
                  </th>
                  <th>
                    {sentenceCase('customer_name')} <span style={{ color: 'red' }}>*</span>
                  </th>
                  <th>
                    Address <span style={{ color: 'red' }}>*</span>
                  </th>
                  <th>
                    Email <span style={{ color: 'red' }}>*</span>
                  </th>
                  <th>
                    Phone <span style={{ color: 'red' }}>*</span>
                  </th>
                  <th>
                    {sentenceCase('customer_group')} <span style={{ color: 'red' }}>*</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {showLines &&
                  rows.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          onChange={() => handleRowSelect(index, row)}
                          checked={selectedRows.includes(index)}
                        />
                      </td>
                      <td>
                        <input
                          required
                          type="number"
                          className="form-control"
                          name="customerId"
                          style={{ backgroundColor: 'white' }}
                          autoComplete="given-name"
                          value={row.customerId}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          required
                          name="customerCode"
                          className="form-control"
                          style={{ backgroundColor: 'white' }}
                          autoComplete="given-name"
                          value={row.customerCode}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          required
                          name="customerName"
                          className="form-control"
                          style={{ backgroundColor: 'white' }}
                          autoComplete="given-name"
                          value={row.customerName}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                      <td>
                        <textarea
                          name="address"
                          className="form-control"
                          style={{ height: '30px' }}
                          value={row.address}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          required
                          name="email"
                          className="form-control"
                          style={{ backgroundColor: 'white' }}
                          autoComplete="given-name"
                          value={row.email}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          required
                          name="phone"
                          className="form-control"
                          style={{ backgroundColor: 'white' }}
                          autoComplete="given-name"
                          value={row.phone}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          required
                          name="group"
                          className="form-control"
                          style={{ backgroundColor: 'white' }}
                          autoComplete="given-name"
                          value={row.group}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </form>
      </Container>
    </>
  );
}
