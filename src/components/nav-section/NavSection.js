import PropTypes from 'prop-types';
import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import { Box, List, ListItemText } from '@mui/material';
//
import { useNavItem } from '../../context/NavContext';
import SvgColor from '../svg-color';
import { StyledNavItem, StyledNavItemIcon } from './styles';

// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [], ...other }) {
  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {data.map((item) => (
          <NavItem key={item.title} item={item} />
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
};

function NavItem({ item }) {
  const { title, path, info } = item;
  const icon = '/assets/icons/navbar/ic_analytics.svg';
  // const { selectedItem, setSelectedItem } = useNavItem();
  const { setMenuItem } = useNavItem();

  const handleClick = () => {
    // setSelectedItem(item);
    setMenuItem(item);
  };

  return (
    <StyledNavItem
      component={RouterLink}
      to={path}
      sx={{
        '&.active': {
          color: 'text.primary',
          bgcolor: 'action.selected',
          fontWeight: 'fontWeightBold',
        },
      }}
      onClick={handleClick}
    >
      {/* <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon> */}
      <StyledNavItemIcon>
        <SvgColor src={icon} sx={{ width: 1, height: 1 }} />
      </StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />

      {info && info}
    </StyledNavItem>
  );
}
