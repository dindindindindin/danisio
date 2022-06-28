import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import SelectCountry from "./SelectCountry";

export default function Addresses(props) {
  const { t } = useTranslation();
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);
  const [countrySelected, setCountrySelected] = useState(() => {
    if (props.meetingCountryId === null) return "";
    else {
      let countryName = "";
      props.countries.map((country) => {
        if (country.id === props.meetingCountryId) {
          countryName = country.name;
        }
      });
      return countryName;
    }
  });

  const NewAddress = () => {
    return (
      <Box component="form" margin="0 2% 15px 2%">
        <TextField
          label={t("settings.meeting-settings.addresses.city")}
          variant="outlined"
          sx={{ marginBottom: "15px" }}
        />
        <TextField
          label={t("settings.meeting-settings.addresses.address")}
          variant="outlined"
          multiline
          fullWidth
          sx={{ marginBottom: "15px" }}
        />
        <Button
          variant="outlined"
          onClick={() => {
            setIsNewAddressOpen(false);
          }}
        >
          {t("settings.meeting-settings.addresses.add")}
        </Button>
      </Box>
    );
  };

  return countrySelected === "" ? (
    <SelectCountry
      countries={props.countries}
      countrySelected={countrySelected}
      setCountrySelected={setCountrySelected}
    />
  ) : (
    <Box border="2px solid #f0f0f4" borderRadius="5px">
      <Box margin="15px 2% 15px 2%" display="flex">
        <Typography alignSelf="center">
          {t("settings.meeting-settings.addresses.country")}{" "}
          {t(`countries.${countrySelected}`)}
        </Typography>
        <Button
          sx={{ marginLeft: "1%" }}
          onClick={() => setCountrySelected(() => "")}
        >
          {t("settings.meeting-settings.addresses.change")}
        </Button>
      </Box>
      <Typography sx={{ margin: "0 2% 15px 2%" }}>
        {t("settings.meeting-settings.addresses.addresses")}
      </Typography>
      {isNewAddressOpen ? (
        <NewAddress />
      ) : (
        <Button
          variant="contained"
          sx={{ margin: "0 0 15px 2%" }}
          onClick={() => setIsNewAddressOpen(true)}
        >
          {t("settings.meeting-settings.addresses.new-address")}
        </Button>
      )}
    </Box>
  );
}
