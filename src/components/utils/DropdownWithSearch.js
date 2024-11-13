import PropTypes from 'prop-types';
import Select from 'react-select';

// ----------------------------------------------------------------------

Dropdown.propTypes = {
  list: PropTypes.array,
  id: PropTypes.string,
  name: PropTypes.string,
};

export default function Dropdown({ list, id, name }) {
  const [filterDetails, setFilterDetails] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const filteredOptions = list
    .filter((option) => option.name.toLowerCase().includes(inputValue.toLowerCase()))
    .map((option) => ({ value: option.id, label: option.name }));

  const handleOptionChange = (selected) => {
    setSelectedOption(selected);
    filterDetails.id = selected.value;
    filterDetails.name = selected.label;
  };

  const handleOptionInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  return (
    <div className="col-auto">
      <span style={{ marginRight: '5px' }}>Town</span>
      <div>
        <Select
          value={selectedOption}
          onChange={handleOptionChange}
          onInputChange={handleOptionInputChange}
          options={filteredOptions}
          placeholder="Type to select..."
          isClearable
          isDisabled
        />
      </div>
    </div>
  );
}
