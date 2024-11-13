/* eslint-disable camelcase */
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import ShowIdentifiedDepositsPage from '../sections/@dashboard/deposits/ShowIdentifiedDepositsPage';
import ViewTerritoryCompetitors from './ViewTerritoryCompetitors';
import ViewTerritoryInsights from './ViewTerritoryInsights';

// Inside the BasicTabs component:

// css
import '../_css/Utils.css';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const { territory_id } = useParams();
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Box className="indexing">
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab {...a11yProps(0)} label="Territory Insights" />
          <Tab {...a11yProps(1)} label="Customer Insights" />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <ViewTerritoryInsights territory_id={territory_id} /> {/* Pass as prop */}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <ViewTerritoryCompetitors />
      </CustomTabPanel>
    </div>
  );
}
