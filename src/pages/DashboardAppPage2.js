import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// components
import Iconify from '../components/iconify';
// sections
import { AppCurrentSubject, AppCurrentVisits, AppTrafficBySite, AppWidgetSummary } from '../sections/@dashboard/app';
import ShowAllWfNotifications from './ShowAllWfNotifications';
// css
import '../_css/Utils.css';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title> Dashboard | COMS </title>
      </Helmet>

      <Container maxWidth={false} disableGutters style={{ width: '100%' }} className="paddingZero">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={12}>
            <ShowAllWfNotifications />
          </Grid>

          <Grid container spacing={2} style={{ margin: '10px 0', width: '100%' }}>
            {/* Left-aligned Grid items */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <AppWidgetSummary title="Weekly Sales" total={714000} icon={'ant-design:android-filled'} />
                </Grid>
                <Grid item xs={12}>
                  <AppWidgetSummary title="New Users" total={1352831} color="info" icon={'ant-design:apple-filled'} />
                </Grid>
                <Grid item xs={12}>
                  <AppWidgetSummary title="Deposits" total={232323} icon={'ant-design:windows-filled'} />
                </Grid>
                <Grid item xs={12}>
                  <AppWidgetSummary
                    title="Item Orders"
                    total={1723315}
                    color="warning"
                    icon={'ant-design:windows-filled'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <AppWidgetSummary title="Bug Reports" total={234} color="error" icon={'ant-design:bug-filled'} />
                </Grid>
              </Grid>
            </Grid>

            {/* Right-aligned Grid item */}
            <Grid item xs={12} md={6}>
              <AppCurrentVisits
                title="Total Sales Order"
                chartData={[
                  { label: 'America', value: 4344 },
                  { label: 'Asia', value: 5435 },
                  { label: 'Europe', value: 1443 },
                  { label: 'Africa', value: 4443 },
                ]}
                chartColors={[
                  theme.palette.primary.main,
                  theme.palette.info.main,
                  theme.palette.warning.main,
                  theme.palette.error.main,
                ]}
              />
              <AppCurrentSubject
                title="Current Subject"
                chartLabels={['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math']}
                chartData={[
                  { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                  { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                  { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
                ]}
                chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
              />
              <AppTrafficBySite
                title="Traffic by Site"
                list={[
                  {
                    name: 'Facebook',
                    value: 323234,
                    icon: <Iconify icon={'eva:facebook-fill'} color="#1877F2" width={32} />,
                  },
                  {
                    name: 'Google',
                    value: 341212,
                    icon: <Iconify icon={'eva:google-fill'} color="#DF3E30" width={32} />,
                  },
                  {
                    name: 'LinkedIn',
                    value: 411213,
                    icon: <Iconify icon={'eva:linkedin-fill'} color="#006097" width={32} />,
                  },
                  {
                    name: 'Twitter',
                    value: 443232,
                    icon: <Iconify icon={'eva:twitter-fill'} color="#1C9CEA" width={32} />,
                  },
                ]}
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
