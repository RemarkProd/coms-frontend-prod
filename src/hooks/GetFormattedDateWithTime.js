// Utility function for formatting date and time
export const getFormattedDateWithTime = (value = new Date()) => {
  const dateObject = new Date(value);

  // Format date components
  const year = String(dateObject.getFullYear()).slice(-2);
  const month = String(dateObject.getMonth() + 1).padStart(2, '0');
  const day = String(dateObject.getDate()).padStart(2, '0');

  // Format time with locale options
  const formattedTime = dateObject.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return `${day}/${month}/${year}    ${formattedTime}`;
};
