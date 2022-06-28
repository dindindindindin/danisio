import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import SelectCountry from "./SelectCountry";

export default function Addresses(props) {
  const { t } = useTranslation();
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);
  const [countryHasStates, setCountryHasStates] = useState(false);
  const [countryStateVariant, setCountryStateVariant] = useState(null);

  const [countrySelected, setCountrySelected] = useState(() => {
    if (props.meetingCountryId === null) return "";
    else {
      let countryName = "";
      props.countries.map((country) => {
        if (country.id === props.meetingCountryId) {
          countryName = country.country;
          setCountryHasStates(country.has_states);
          setCountryStateVariant(country.state_variant); //will be a problem?
        }
      });
      return countryName;
    }
  });
  const [addresses, setAddresses] = useState(props.addresses);
  const [newSelectedCityId, setNewSelectedCityId] = useState(null);
  const [autocompleteNewCityValue, setAutocompleteNewCityValue] =
    useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [isNewAddressPrimary, setIsNewAddressPrimary] = useState(false);

  console.log(props.addresses);

  const handleNewAddressSubmit = async (e) => {
    e.preventDefault();
    console.log("inside handle");
    await axios.post("/api/consultant/meeting-settings/new-address", {
      cityId: newSelectedCityId,
      address: newAddress,
      isPrimary: isNewAddressPrimary,
    });

    const addressesRes = await axios.get(
      "/api/consultant/meeting-settings/get-addresses"
    );

    setAddresses(addressesRes.data);
  };

  const handleNewAddressChange = (e) => {
    setNewAddress(e.target.value);
    console.log(newAddress);
  };

  const handleNewCityChange = (e, value, reason) => {
    console.log("e: ", e.target, " value: ", value, " reason: ", reason);

    if (reason === "selectOption") setNewSelectedCityId(value.id);
    else if (reason === "removeOption") setNewSelectedCityId(null);
  };

  const getCityOptions = () => {
    //if country has states then return sorted by states
    if (countryHasStates)
      return props.cities.sort((a, b) => a.state.localeCompare(b.state));
    else return props.cities.sort((a, b) => a.city.localeCompare(b.city));
  };

  const Address = (props) => (
    <Box display="flex">
      <Typography>City: {props.city}</Typography>{" "}
      {countryHasStates ? (
        <Typography>
          {countryStateVariant}: {props.state}
        </Typography>
      ) : (
        <></>
      )}
      <Typography>Address: {props.address}</Typography>
    </Box>
  );

  //render when Add New Address button is clicked
  const renderNewAddress = (
    <Box component="form" margin="0 2% 15px 2%">
      {countryHasStates ? (
        <Autocomplete
          options={getCityOptions()}
          getOptionLabel={(option) => option.city}
          groupBy={(option) => option.state}
          sx={{ marginBottom: "15px" }}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                label={t("settings.meeting-settings.addresses.city")}
              />
            );
          }}
          onChange={handleNewCityChange}
        />
      ) : (
        <Autocomplete
          options={getCityOptions()}
          getOptionLabel={(option) => option.city}
          disableClearable
          sx={{ marginBottom: "15px" }}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                label={t("settings.meeting-settings.addresses.city")}
              />
            );
          }}
          onChange={handleNewCityChange}
        />
      )}

      <TextField
        label={t("settings.meeting-settings.addresses.address")}
        variant="outlined"
        value={newAddress}
        multiline
        fullWidth
        sx={{ marginBottom: "15px" }}
        onChange={handleNewAddressChange}
      />
      <FormControlLabel
        control={
          <Checkbox
            onChange={(e) => setIsNewAddressPrimary(e.target.checked)}
          />
        }
        label="Primary address."
      />
      <Button
        variant="outlined"
        type="submit"
        onClick={(e) => {
          handleNewAddressSubmit(e);
          setIsNewAddressOpen(false);
        }}
      >
        {t("settings.meeting-settings.addresses.add")}
      </Button>
    </Box>
  );

  return countrySelected === "" ? (
    <SelectCountry
      countries={props.countries}
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
      {addresses.map((address) => (
        <Address
          city={address.city}
          state={address.state}
          address={address.address}
        />
      ))}
      {isNewAddressOpen ? (
        renderNewAddress
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
