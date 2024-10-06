/* eslint-disable no-lonely-if */
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';

/* eslint-disable object-shorthand */
/* eslint-disable camelcase */

const Progress_bar = ({ target, deposit, height, viewMode, threshold_1, threshold_2 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');

  const getFormattedPrice = (value) => new Intl.NumberFormat().format(Math.floor(value));

  const validTarget = target > 0 ? target : 1; // Avoid division by zero
  const progressPercentage = Math.min((deposit / validTarget) * 100, 100);
  const incompleteAmount = target - deposit;
  const isComplete = deposit >= target;

  // Directly set tooltip content in event handlers
  const handleMouseEnter = (viewMode) => {
    setIsHovered(true);

    if (viewMode === 'percentage') {
      if (isComplete) {
        if (target < deposit) {
          const isOverComplete = deposit - target;
          console.log(typeof isOverComplete);

          console.log(isOverComplete);

          setTooltipContent(
            <>
              ✔️Target complete! Now <span style={{ color: 'LawnGreen' }}>{getFormattedPrice(isOverComplete)}</span>{' '}
              deposit ahead.
            </>
          );
        } else {
          setTooltipContent(
            <>
              <span style={{ color: 'green' }}>✔️Congratulations</span> 🏆 Target complete!{' '}
              <span style={{ color: 'blue' }}>🎉</span>
            </>
          );
        }
      } else {
        console.log(progressPercentage);

        setTooltipContent(
          <>
            💡 Incomplete: <span style={{ color: 'orange' }}>{(100 - progressPercentage).toFixed(2)}%</span> remaining
          </>
        );
      }
    } else {
      if (isComplete) {
        if (target < deposit) {
          const isOverComplete = deposit - target;
          console.log(isOverComplete);

          setTooltipContent(
            <>
              ✔️Target complete!! Now <span style={{ color: 'LawnGreen' }}>{getFormattedPrice(isOverComplete)}</span>{' '}
              deposit ahead.
            </>
          );
        } else {
          setTooltipContent(
            <>
              <span style={{ color: 'green' }}>✔️Congratulations</span> 🏆 Target complete!{' '}
              <span style={{ color: 'blue' }}>🎉</span>
            </>
          );
        }
      } else {
        console.log(progressPercentage);

        setTooltipContent(
          <>
            💡 Incomplete: <span style={{ color: 'OrangeRed' }}>{getFormattedPrice(incompleteAmount)}</span> (
            <span style={{ color: 'orange' }}>{(100 - progressPercentage).toFixed(2)}%</span> remaining)
          </>
        );
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTooltipContent('');
  };

  // Dynamic background gradient based on thresholds
  const gradientBackground = `linear-gradient(to right,
    FireBrick 0%,
    FireBrick ${threshold_1}%,
    Gold ${threshold_1}%,
    Gold ${threshold_1 + threshold_2}%,
    ForestGreen ${threshold_1 + threshold_2}%,
    ForestGreen 100%)`;

  const styles = {
    progressContainer: {
      height: height,
      width: '80%',
      margin: '0px 0',
      position: 'relative',
      background: gradientBackground,
      overflow: 'visible', // Allow tooltip to overflow the progress container
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
      transition: 'background 0.4s ease',
    },
    progressBar: {
      width: `${progressPercentage}%`,
      backgroundColor: 'rgb(211, 211, 211)',
      height: height * 0.5,
      position: 'absolute',
      top: 10,
      left: 0,
      zIndex: 1,
      // borderTopRightRadius: '10px',
      // borderBottomRightRadius: '10px',
      transition: 'width 0.4s ease, transform 0.2s ease',
      boxShadow: isHovered ? '0 4px 10px rgba(0, 0, 0, 0.5)' : '0 2px 5px rgba(0, 0, 0, 0.2)',
      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      border: '2px solid rgba(0, 0, 0, 0.3)', // Added subtle border
      backgroundImage: `linear-gradient(45deg, rgba(255, 255, 255, 0.3) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.3) 75%, transparent 75%, transparent)`,
      backgroundSize: '10px 10px', // Smaller stripes (size of each stripe)
      animation: 'move-stripes 0.1s linear infinite', // Animated stripes
    },
    progressText: {
      position: 'absolute',
      right: '10px',
      color: 'black',
      fontWeight: 'bold',
      fontSize: '14px',
    },
    tooltip: {
      position: 'absolute',
      bottom: `${height + 20}px`, // Set above the progress bar (height + extra space)
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '5px',
      visibility: isHovered ? 'visible' : 'hidden', // Show on hover
      opacity: isHovered ? 1 : 0, // Control appearance with opacity
      transition: 'opacity 0.2s ease',
      zIndex: 10, // Ensure tooltip is on top of the progress bar
      whiteSpace: 'nowrap',
    },
  };

  return (
    <div
      className="progress-container"
      style={styles.progressContainer}
      onMouseEnter={() => handleMouseEnter(viewMode)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tooltip for progress information */}
      <div style={styles.tooltip}>{tooltipContent}</div>

      {/* Dynamic progress bar */}
      <div
        className="progress-bar progress-bar-striped progress-bar-animated"
        role="progressbar"
        aria-valuenow={deposit.toFixed(2)}
        aria-valuemin="0"
        aria-valuemax={validTarget.toFixed(2)}
        style={styles.progressBar}
      >
        {viewMode === 'percentage' ? (
          <span style={styles.progressText}>{`${progressPercentage.toFixed(2)}%`}</span>
        ) : (
          <span style={styles.progressText}>{getFormattedPrice(deposit)}</span>
        )}
      </div>
    </div>
  );
};

export default Progress_bar;
