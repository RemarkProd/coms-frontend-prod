/* eslint-disable object-shorthand */
/* eslint-disable camelcase */
import 'bootstrap/dist/css/bootstrap.min.css';

const Progress_bar = ({ target, deposit, maxDeposit, height }) => {
  console.log(target, deposit, maxDeposit, height);

  const progress = maxDeposit > 0 ? (deposit / maxDeposit) * 100 : 0;
  console.log(progress);

  let bgColor;
  if (progress < 10) {
    bgColor = 'Red';
  } else if (progress < 20) {
    bgColor = 'Crimson';
  } else if (progress < 30) {
    bgColor = 'IndianRed';
  } else if (progress < 40) {
    bgColor = 'Orange';
  } else if (progress < 50) {
    bgColor = 'DarkOrange';
  } else if (progress < 60) {
    bgColor = 'SeaGreen';
  } else if (progress < 70) {
    bgColor = 'Olive';
  } else if (progress < 80) {
    bgColor = 'SpringGreen';
  } else if (progress < 90) {
    bgColor = 'MediumSeaGreen';
  } else {
    bgColor = 'green';
  }

  return (
    <div
      className="progress"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: height,
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'SteelBlue',
        margin: '0px 0',
        border: 'none', // Ensures no border is applied
        borderRadius: '0px', // Ensures no border-radius is applied
      }}
    >
      <div
        // className="progress-bar progress-bar-striped progress-bar-animated"
        className="progress-bar"
        role="progressbar"
        aria-valuenow={progress.toFixed(2)}
        aria-valuemin="0"
        aria-valuemax="100"
        style={{
          width: `${Math.min(progress, 100)}%`,
          backgroundColor: 'DarkOrange',
          height: height * 0.5,
          color: 'black',
          // borderTopRightRadius: '8px',
          // borderBottomRightRadius: '8px',
          // borderTopLeftRadius: progress >= 100 ? '8px' : '0px',
          // borderBottomLeftRadius: progress >= 100 ? '8px' : '0px',
        }}
      >
        {`${progress.toFixed(2)}%`}
      </div>
    </div>
  );
};

export default Progress_bar;
