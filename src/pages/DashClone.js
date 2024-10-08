import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../_css/Utils.css';
import { useNavItem } from '../context/NavContext';
import DashboardAppPage from './DashboardAppPage';
import DashboardAppPage2 from './DashboardAppPage2';

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
  const { selectedItem, removeMenuItem } = useNavItem();
  // console.log(selectedItem);
  useEffect(() => {
    removeMenuItem();
  }, []);

  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box>
      {/* <Box sx={{ borderBottom: 1, borderColor: 'white' }} style={{ marginLeft: '73px' }}> */}
      <Box className="indexing" sx={{ borderBottom: 1, borderColor: 'white' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab {...a11yProps(0)} label="Notifications" />
          <Tab {...a11yProps(1)} label="Notifications History" />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <DashboardAppPage />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <DashboardAppPage2 />
      </CustomTabPanel>
    </Box>
  );
}
