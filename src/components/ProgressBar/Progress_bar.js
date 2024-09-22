/* eslint-disable object-shorthand */
/* eslint-disable camelcase */
import 'bootstrap/dist/css/bootstrap.min.css';

const Progress_bar = ({ target, deposit, maxDeposit, height }) => {
  console.log(target, deposit, maxDeposit, height);

  // Calculate the progress as a percentage of the maxDeposit
  const progress = maxDeposit > 0 ? (deposit / maxDeposit) * 100 : 0;
  console.log(progress);

  // Determine the background color based on the progress value
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
        position: 'relative', // Set parent div to relative for absolute positioning within
      }}
    >
      <div
        className="progress-bar progress-bar-striped progress-bar-animated"
        role="progressbar"
        aria-valuenow={progress.toFixed(2)}
        aria-valuemin="0"
        aria-valuemax="100"
        style={{
          width: `${Math.min(progress, 100)}%`, // Width based on progress percentage
          backgroundColor: 'darkorange', // Dynamic color based on progress value
          height: height * 0.5, // Child div height
          color: 'black',
          position: 'relative', // Set to relative to keep the text aligned inside
        }}
      >
        {/* If progress is >= 90, display the text inside the progress bar */}
        {progress >= 95 && <span style={{ marginLeft: '90%' }}>{`${progress.toFixed(2)}%`}</span>}
      </div>

      {/* If progress is < 90, display the text outside but close to the progress bar */}
      {progress < 90 && (
        <span
          style={{
            position: 'absolute', // Position text absolutely within the parent
            left: `${progress}%`, // Position the text based on the progress percentage
            transform: 'translateX(5px)', // Add some space between the bar and the text
            color: 'black', // Ensure text color stands out from the background
          }}
        >
          {`${progress.toFixed(2)}%`}
        </span>
      )}
    </div>
  );
};

export default Progress_bar;
