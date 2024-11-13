import { parse } from 'date-fns';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';

DatePickerComponent.propTypes = {
  value: PropTypes.string,
  selectDate: PropTypes.func,
};

export default function DatePickerComponent({ value, selectDate }) {
  const parseDate = (dateString) => parse(dateString, 'dd/MM/yy', new Date());

  return (
    <div>
      <DatePicker
        selected={value ? parseDate(value) : null}
        onChange={(date) => selectDate(date)}
        dateFormat="dd/MM/yy"
        placeholderText="dd/mm/yy"
      />
    </div>
  );
}
