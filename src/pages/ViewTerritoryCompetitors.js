import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { getTerritoryAllIdsService, getUserProfileDetails, updateTerritoryRating } from '../Services/ApiServices';

const labels = {
  1: 'Useless',
  2: 'Poor',
  3: 'Ok',
  4: 'Good',
  5: 'Excellent',
};

export default function TerritoryCompetitorsPage() {
  const { user } = useUser();
  const [account, setAccount] = useState({});
  const [territoryIds, setTerritoryIds] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [hover, setHover] = useState([]);

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
    async function fetchTerritoryIds() {
      if (account) {
        try {
          const response = await getTerritoryAllIdsService();
          if (response.status === 200) {
            setTerritoryIds(response.data);
            console.log(territoryIds);

            setRatings(response.data.map((territory) => territory.rating)); // Set initial ratings from response
            setHover(Array(response.data.length).fill(-1)); // Initialize hover array
          }
        } catch (error) {
          console.error('Error fetching territory IDs:', error);
        }
      }
    }
    fetchTerritoryIds();
  }, [account]);
  console.log(ratings);

  const handleRatingChange = async (index, newValue) => {
    const updatedRatings = [...ratings];
    updatedRatings[index] = newValue;
    setRatings(updatedRatings);
    console.log(ratings);

    const territoryId = territoryIds[index].territory_id;
    try {
      await saveRating(territoryId, newValue);
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const saveRating = async (territoryId, rating) => {
    try {
      const response = await updateTerritoryRating(territoryId, rating);
      if (response.status === 200) {
        console.log(`Rating for territory ${territoryId} updated successfully.`);
      } else {
        console.error('Failed to update rating.');
      }
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const handleHoverChange = (index, newHover) => {
    const updatedHover = [...hover];
    updatedHover[index] = newHover;
    setHover(updatedHover);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Territory Name</TableCell>
            <TableCell>Rating</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {territoryIds.map((territory, index) => (
            <TableRow key={territory.territory_name}>
              <TableCell>{territory.territory_name}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Box
                      key={num}
                      onClick={() => handleRatingChange(index, num)}
                      onMouseEnter={() => handleHoverChange(index, num)}
                      onMouseLeave={() => handleHoverChange(index, -1)}
                      sx={{
                        cursor: 'pointer',
                        mx: 0.5,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {/* Highlight stars up to the current rating */}
                      {ratings[index] >= num ? (
                        <Star
                          sx={{
                            color: num <= ratings[index] ? '#1976d2' : '#e0e0e0', // Color last star in the rating range
                            fontSize: 30,
                            transition: 'color 0.3s',
                          }}
                        />
                      ) : (
                        <StarBorder
                          sx={{
                            color: '#e0e0e0',
                            fontSize: 30,
                            transition: 'color 0.3s',
                          }}
                        />
                      )}
                    </Box>
                  ))}
                  <Box sx={{ ml: 2, width: 75, textAlign: 'left' }}>
                    {labels[hover[index] !== -1 ? hover[index] : ratings[index]]}
                  </Box>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
