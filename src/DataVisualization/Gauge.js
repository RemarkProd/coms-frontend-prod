import { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useUser } from '../context/UserContext';
import { getSoSalesTargetIncentiveService, getUserProfileDetails } from '../Services/ApiServices';

const SalesGauge = () => {
  const { user } = useUser();
  const [account, setAccount] = useState({});
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user) {
          const accountDetails = await getUserProfileDetails(user);
          if (accountDetails.status === 200) setAccount(accountDetails.data);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        if (account) {
          const response = await getSoSalesTargetIncentiveService(user);
          if (response.status === 200) {
            setSalesData(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [account, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const salesTarget = salesData.sales_target_amount || 0;
  const collectedSales = salesData.sale_amount || 0;
  const currentDay = salesData.current_day || 15; // Assuming default day 15 if not provided
  const daysInMonth = 30; // Assuming 30 days for simplicity

  // Calculate percentage of the sales target achieved
  const percentage = salesTarget ? Math.min((collectedSales / salesTarget) * 100, 100) : 0;

  // Calculate the rotation for the day indicator (0 to 360 degrees)
  const dayPercentage = (currentDay / daysInMonth) * 100;

  return (
    <div style={{ width: '250px', margin: 'auto', position: 'relative', textAlign: 'center' }}>
      <CircularProgressbar
        value={percentage}
        text={`${Math.round(percentage)}%`}
        styles={buildStyles({
          pathColor: '#4caf50', // Green path for progress
          textColor: '#333', // Dark text color
          trailColor: '#d6d6d6', // Light gray trail
          backgroundColor: '#f3f3f3',
        })}
      />
      {/* Dot indicator for days */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `rotate(${(dayPercentage / 100) * 360}deg) translate(-50%, -130px)`,
          width: '12px',
          height: '12px',
          backgroundColor: '#ff5722', // Orange dot
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          Collected: {collectedSales.toLocaleString()} / Target: {salesTarget.toLocaleString()}
        </p>
        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
          Day: {currentDay} / {daysInMonth}
        </p>
      </div>
    </div>
  );
};

export default SalesGauge;
