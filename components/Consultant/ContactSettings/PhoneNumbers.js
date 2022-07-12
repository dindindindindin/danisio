import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import Chip from "@mui/material/Chip";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import Divider from "@mui/material/Divider";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
// import { styled } from "@mui/material/styles";

// const StyledPhoneInput = styled(PhoneInput)(({ theme }) => ({
//   width: "auto",
// }));

export default function PhoneNumbers(props) {
  const [phoneNumbers, setPhoneNumbers] = useState(props.phoneNumbers);
  const [contactTypeId, setContactTypeId] = useState(props.contactTypes[0].id);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [dialCode, setDialCode] = useState(null);
  const [countryCode, setCountryCode] = useState(null);
  const [isAddNumberOpen, setIsAddNumberOpen] = useState(false);

  const handleAddNumber = async (e) => {
    e.preventDefault();
    await axios.post("/api/consultant/contact-settings/new-phone-number", {
      number: phoneNumber,
      dialCode: dialCode,
      countryCode: countryCode,
      contactTypeId: contactTypeId,
    });

    const phoneNumbersRes = await axios.get(
      "/api/consultant/contact-settings/get-phone-numbers"
    );

    setPhoneNumbers(phoneNumbersRes.data);
  };

  return (
    <Box padding="8px 2%" border="2px solid #f0f0f4" borderRadius="5px">
      <Typography marginBottom="16px">Phone Numbers:</Typography>
      {phoneNumbers.map((number) => (
        <Typography>{number.number}</Typography>
      ))}
      {isAddNumberOpen ? (
        <Box>
          <Box display="flex" flexWrap="wrap">
            <Box marginBottom="8px" marginRight="1%">
              <FormControl>
                <InputLabel>Contact Type</InputLabel>
                <Select
                  value={contactTypeId}
                  label="ContactType"
                  onChange={(e) => setContactTypeId(e.target.value)}
                >
                  {props.contactTypes.map((type) => (
                    <MenuItem value={type.id}>{type.type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box marginBottom="8px">
              <PhoneInput
                country="tr"
                value={phoneNumber}
                onChange={(number, data) => {
                  setPhoneNumber(number);
                  setDialCode(data.dialCode);
                  setCountryCode(data.countryCode);
                }}
              />
            </Box>
          </Box>
          <Button variant="outlined" onClick={handleAddNumber}>
            Add
          </Button>
        </Box>
      ) : (
        <Button
          variant="contained"
          onClick={(e) => {
            setIsAddNumberOpen(true);
          }}
        >
          Add Number
        </Button>
      )}
    </Box>
  );
}
