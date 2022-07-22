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
import LinearProgress from "@mui/material/LinearProgress";
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

  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(false);
  const [isAddNumberLoading, setIsAddNumberLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const { t } = useTranslation("contact-settings");

  //add number api call
  const handleAddNumber = async (e) => {
    e.preventDefault();

    setIsAddButtonDisabled(true);
    setIsAddNumberLoading(true);

    try {
      await axios.post("/api/consultant/contact-settings/new-phone-number", {
        number: phoneNumber,
        dialCode: dialCode,
        countryCode: countryCode,
        contactTypeId: contactTypeId,
      });
    } catch (err) {
      if (err.response.data.errorCode === "same-number-same-user") {
        setErrors({ addNumber: t("same-number-same-user") });
        setIsAddNumberLoading(false);
        setIsAddButtonDisabled(false);
        return;
      } else if (err.response.data.errorCode === "same-number-different-user") {
        setErrors({ addNumber: t("same-number-different-user") });
        setIsAddNumberLoading(false);
        setIsAddButtonDisabled(false);
        return;
      }
      console.log(err.response.data);
    }

    //states to default
    setContactTypeId(props.contactTypes[0].id);
    setPhoneNumber(null);
    setDialCode(null);
    setErrors({});

    setIsAddNumberOpen(false);
    setIsAddButtonDisabled(false);
    setIsAddNumberLoading(false);

    //retrieve numbers again
    try {
      var phoneNumbersRes = await axios.get(
        "/api/consultant/contact-settings/get-phone-numbers"
      );
    } catch (err) {
      console.log(err.response.data);
    }
    setPhoneNumbers(phoneNumbersRes.data);
  };

  //remove number api call
  const handleRemoveNumber = async (e, id) => {
    e.preventDefault();

    try {
      await axios.post("/api/consultant/contact-settings/phone-number-remove", {
        numberId: id,
      });
    } catch (err) {
      console.log(err.response.data);
    }

    //retrieve numbers again
    try {
      var phoneNumbersRes = await axios.get(
        "/api/consultant/contact-settings/get-phone-numbers"
      );
    } catch (err) {
      console.log(err.response.data);
    }
    setPhoneNumbers(phoneNumbersRes.data);
  };

  const handleWhatsappChange = async (e) => {
    console.log(e.target.value, e.target.numbers);

    if (e.target.value !== "noWhatsapp")
      try {
        await axios.put("/api/consultant/contact-settings/whatsapp-update", {
          phoneNumberId: e.target.value,
        });
      } catch (err) {
        console.log(err.response.data);
      }
    else
      try {
        await axios.put("/api/consultant/contact-settings/whatsapp-update", {
          phoneNumberId: null,
        });
      } catch (err) {
        console.log(err.response.data);
      }
  };

  return (
    <Box>
      <Box padding="8px 2%" border="2px solid #f0f0f4" borderRadius="5px">
        <Typography marginBottom="8px">{t("phone-numbers")}:</Typography>
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
                {t(`${number.type}`)}:
              </Typography>
              <Typography marginRight="1%">{formattedNumber}</Typography>
              <Button onClick={(e) => handleRemoveNumber(e, number.id)}>
                {t("remove")}
              </Button>
            </Box>
          );
        })}
        {isAddNumberOpen ? (
          <Box>
            <Box display="flex" flexWrap="wrap">
              <Box marginBottom="8px" marginRight="1%">
                <FormControl>
                  <InputLabel>{t("contact-type")}</InputLabel>
                  <Select
                    value={contactTypeId}
                    label={t("contact-type")}
                    onChange={(e) => setContactTypeId(e.target.value)}
                  >
                    {props.contactTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {t(`${type.type}`)}
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
            <Typography variant="body2" color="error">
              {errors.addNumber}
            </Typography>
            {isAddNumberLoading ? <LinearProgress sx={{ mb: "8px" }} /> : <></>}
            <Button
              sx={{ mr: "1%" }}
              variant="outlined"
              disabled={isAddButtonDisabled}
              onClick={handleAddNumber}
            >
              {t("add")}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                //states to default
                setContactTypeId(props.contactTypes[0].id);
                setPhoneNumber(null);
                setDialCode(null);
                setIsAddNumberOpen(false);
                setErrors({});
              }}
            >
              {t("cancel")}
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={(e) => {
              setIsAddNumberOpen(true);
            }}
          >
            {t("add-number")}
          </Button>
        )}
      </Box>
      <Box
        marginTop="16px"
        padding="8px 2%"
        border="2px solid #f0f0f4"
        borderRadius="5px"
      >
        <Typography>{t("whatsapp-number")}:</Typography>
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
                label={t("not-using-whatsapp")}
              />
            </RadioGroup>
          </FormControl>
        </form>
      </Box>
    </Box>
  );
}
