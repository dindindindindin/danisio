import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
// import { styled } from "@mui/material/styles";

// const StyledPhoneInput = styled(PhoneInput)(({ theme }) => ({
//   width: "auto",
// }));

export default function PhoneNumbers(props) {
  const [isAddNumberOpen, setIsAddNumberOpen] = useState(false);
  //phone numbers list state
  const [phoneNumbers, setPhoneNumbers] = useState(props.phoneNumbers);
  //type of contact id (company or personal)
  const [contactTypeId, setContactTypeId] = useState(props.contactTypes[0].id);
  //other add phone number states
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [dialCode, setDialCode] = useState(null);
  const [countryCode, setCountryCode] = useState(null);

  //add number api call
  const handleAddNumber = async (e) => {
    e.preventDefault();
    await axios.post("/api/consultant/contact-settings/new-phone-number", {
      number: phoneNumber,
      dialCode: dialCode,
      countryCode: countryCode,
      contactTypeId: contactTypeId,
    });

    //retrieve numbers again
    const phoneNumbersRes = await axios.get(
      "/api/consultant/contact-settings/get-phone-numbers"
    );
    setPhoneNumbers(phoneNumbersRes.data);

    //states to default
    setContactTypeId(props.contactTypes[0].id);
    setPhoneNumber(null);
    setDialCode(null);
    setIsAddNumberOpen(false);
  };

  //remove number api call
  const handleRemoveNumber = async (e, id) => {
    e.preventDefault();
    await axios.post("/api/consultant/contact-settings/phone-number-remove", {
      numberId: id,
    });

    //retrieve numbers again
    const phoneNumbersRes = await axios.get(
      "/api/consultant/contact-settings/get-phone-numbers"
    );
    setPhoneNumbers(phoneNumbersRes.data);
  };

  const handleWhatsappChange = async (e) => {
    console.log(e.target.value, e.target.numbers);

    if (e.target.value !== "noWhatsapp")
      await axios.put("/api/consultant/contact-settings/whatsapp-update", {
        phoneNumberId: e.target.value,
      });
    else
      await axios.put("/api/consultant/contact-settings/whatsapp-update", {
        phoneNumberId: null,
      });
  };

  return (
    <Box>
      <Box padding="8px 2%" border="2px solid #f0f0f4" borderRadius="5px">
        <Typography marginBottom="8px">Phone Numbers:</Typography>
        {phoneNumbers.map((number) => {
          const formattedNumber =
            "+" +
            number.dial_code +
            " " +
            number.number.slice(number.dial_code.length);
          return (
            <Box
              key={number.id}
              display="flex"
              marginBottom="8px"
              alignItems="center"
            >
              <Typography marginRight="1%" color="#616161">
                {number.type}:
              </Typography>
              <Typography marginRight="1%">{formattedNumber}</Typography>
              <Button onClick={(e) => handleRemoveNumber(e, number.id)}>
                Remove
              </Button>
            </Box>
          );
        })}
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
                      <MenuItem key={type.id} value={type.id}>
                        {type.type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box marginBottom="8px">
                <PhoneInput
                  country={
                    props.consultantCountryCode.length === 0
                      ? "tr"
                      : props.consultantCountryCode[0].code
                  }
                  value={phoneNumber}
                  onChange={(number, data) => {
                    setPhoneNumber(number);
                    setDialCode(data.dialCode);
                    setCountryCode(data.countryCode);
                  }}
                />
              </Box>
            </Box>

            <Button
              sx={{ mr: "1%" }}
              variant="outlined"
              onClick={handleAddNumber}
            >
              Add
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                //states to default
                setContactTypeId(props.contactTypes[0].id);
                setPhoneNumber(null);
                setDialCode(null);
                setIsAddNumberOpen(false);
              }}
            >
              Cancel
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
      <Box
        marginTop="16px"
        padding="8px 2%"
        border="2px solid #f0f0f4"
        borderRadius="5px"
      >
        <Typography>Whatsapp Number:</Typography>
        <form onChange={handleWhatsappChange}>
          <FormControl>
            <RadioGroup
              name="numbers"
              defaultValue={
                props.whatsappNumberId[0].phone_number_id === null
                  ? "noWhatsapp"
                  : props.whatsappNumberId[0].phone_number_id
              }
            >
              {phoneNumbers.map((number) => {
                const formattedNumber =
                  "+" +
                  number.dial_code +
                  " " +
                  number.number.slice(number.dial_code.length);
                return (
                  <FormControlLabel
                    key={number.id}
                    value={number.id}
                    control={<Radio />}
                    label={formattedNumber}
                  />
                );
              })}
              <FormControlLabel
                key="noWhatsapp"
                value="noWhatsapp"
                control={<Radio />}
                label="I'm not using Whatsapp."
              />
            </RadioGroup>
          </FormControl>
        </form>
      </Box>
    </Box>
  );
}
