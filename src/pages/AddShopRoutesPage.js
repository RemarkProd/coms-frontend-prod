/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Button, Container, Grid } from '@mui/material';
import { sentenceCase } from 'change-case';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addShopRoutesService } from '../Services/ApiServices';

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

  const [rows, setRows] = useState([{}]);

  const [showLines, setShowLines] = useState(false);

  const handleAddRow = () => {
    console.log(rows);
    if (rows.length === 1) setShowLines(true);
    if (showLines)
      setRows([
        ...rows,
        {
          unitOfMeasure: '',
          uomCode: null,
          uomClass: '',
          description: '',
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

    const filteredArrayCopy = [...filteredArray];

    for (const [index, lineInfo] of filteredArrayCopy.entries()) {
      try {
        const requestBody = {
          routeName: lineInfo.routeName,
          routeCategory: lineInfo.routeCategory,
        };
        const response = await addShopRoutesService(requestBody);

        if (response.status === 200) {
          const originalIndex = filteredArray.indexOf(lineInfo);
          if (originalIndex !== -1) {
            filteredArray.splice(originalIndex, 1); // Remove from original array
          }
        } else {
          console.log(response);
        }
      } catch (err) {
        console.log(err.message);
      }
    }

    if (filteredArray.length === 0) {
      console.log(filteredArray);
      navigate('/dashboard/routeMaster', { replace: true });
      // window.location.reload();
    } else {
      setRows(filteredArray);
      alert('Process failed! Try again later');
      // window.location.reload();
    }
  };

  return (
    <>
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={3} style={{ display: 'flex' }}>
            <Button
              style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black', whiteSpace: 'nowrap' }}
              onClick={handleClick}
            >
              Save
            </Button>
            <Button
              style={{ marginRight: '10px', backgroundColor: 'lightgray', color: 'black', whiteSpace: 'nowrap' }}
              onClick={handleDeleteRows}
            >
              Delete
            </Button>
            <Button
              style={{ backgroundColor: 'lightgray', color: 'black', whiteSpace: 'nowrap' }}
              onClick={handleAddRow}
            >
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
                    {sentenceCase('route_name')} <span style={{ color: 'red' }}>*</span>
                  </th>
                  <th>
                    {sentenceCase('route_category')} <span style={{ color: 'red' }}>*</span>
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
                          className="form-control"
                          name="routeName"
                          style={{ backgroundColor: 'white' }}
                          autoComplete="given-name"
                          value={row.routeName}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          required
                          name="routeCategory"
                          className="form-control"
                          style={{ backgroundColor: 'white' }}
                          autoComplete="given-name"
                          value={row.routeCategory}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td>
                      {/* <td>
                        <textarea
                          name="description"
                          className="form-control"
                          title="Maximum 50 characters are allowed."
                          style={{ height: '30px' }}
                          onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                        />
                      </td> */}
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
