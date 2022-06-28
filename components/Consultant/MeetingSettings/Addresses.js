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
import Divider from "@mui/material/Divider";

export default function Addresses(props) {
  const { t } = useTranslation();
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);
  //selected country states
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
          setCountryStateVariant(country.state_variant);
        }
      });
      return countryName;
    }
  });
  //addresses array
  const [addresses, setAddresses] = useState(props.addresses);
  //add new address form states
  const [newSelectedCityId, setNewSelectedCityId] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [isNewAddressPrimary, setIsNewAddressPrimary] = useState(false);
  console.log(addresses);
  const handleNewAddressSubmit = async (e) => {
    e.preventDefault();

    //insert into consultant_addresses
    await axios.post("/api/consultant/meeting-settings/new-address", {
      cityId: newSelectedCityId,
      address: newAddress,
      isPrimary: isNewAddressPrimary,
    });

    //retrieve addresses again
    const addressesRes = await axios.get(
      "/api/consultant/meeting-settings/get-addresses"
    );
    setAddresses(addressesRes.data);

    //set states back to default values
    setNewSelectedCityId(null);
    setNewAddress("");
    setIsNewAddressPrimary(false);
  };

  //populate new selected city state
  const handleNewCityChange = (e, value, reason) => {
    if (reason === "selectOption") setNewSelectedCityId(value.id);
    else if (reason === "removeOption") setNewSelectedCityId(null);
  };

  const getCityOptions = () => {
    //if country has states then return sorted by states
    if (countryHasStates)
      return props.cities.sort((a, b) => a.state.localeCompare(b.state));
    else return props.cities.sort((a, b) => a.city.localeCompare(b.city));
  };

  //component to call for each address
  const Address = (props) => (
    <Box>
      <Box display="flex" margin="8px 2% 8px 2%">
        <Typography marginRight="2%">
          <strong>City:</strong> {props.city}
        </Typography>
        {countryHasStates ? (
          <Typography>
            <strong>{countryStateVariant}:</strong> {props.state}
          </Typography>
        ) : (
          <></>
        )}
      </Box>
      <Box margin="8px 2% 8px 2%">
        <Typography marginBottom="8px">
          <strong>Address:</strong> {props.address}
        </Typography>
        {props.isPrimary ? (
          <Typography color="primary">Primary Address</Typography>
        ) : (
          <></>
        )}
      </Box>
      <Box display="flex" margin="0 2% 16px 2%">
        <Button variant="outlined" sx={{ marginRight: "1%" }}>
          Edit
        </Button>
        <Button variant="outlined" color="error">
          Remove
        </Button>
      </Box>
      <Divider />
    </Box>
  );

  //render when Add New Address button is clicked
  const renderNewAddress = (
    <Box component="form" margin="16px 2% 16px 2%">
      {countryHasStates ? (
        <Autocomplete
          options={getCityOptions()}
          getOptionLabel={(option) => option.city} //return null?
          groupBy={(option) => option.state}
          sx={{ marginBottom: "16px" }}
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
          sx={{ marginBottom: "16px" }}
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
        multiline
        fullWidth
        sx={{ marginBottom: "15px" }}
        onChange={(e) => setNewAddress(e.target.value)}
      />
      <FormControlLabel
        control={
          <Checkbox
            onChange={(e) => setIsNewAddressPrimary(e.target.checked)}
          />
        }
        label="Primary address: appears on profile."
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
      <Button
        variant="outlined"
        type="submit"
        color="warning"
        onClick={(e) => {
          setIsNewAddressOpen(false);
        }}
      >
        Cancel
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
      <Box margin="16px 2% 16px 2%" display="flex">
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
      <Divider />
      <Typography sx={{ margin: "8px 2% 8px 2%" }}>
        {t("settings.meeting-settings.addresses.addresses")}
      </Typography>
      {addresses.map((address) => (
        <Address
          key={address.id}
          addressId={address.id}
          city={address.city}
          state={address.state}
          address={address.address}
          isPrimary={address.is_primary}
        />
      ))}
      {isNewAddressOpen ? (
        renderNewAddress
      ) : (
        <Button
          variant="contained"
          sx={{ margin: "16px 0 16px 2%" }}
          onClick={() => setIsNewAddressOpen(true)}
        >
          {t("settings.meeting-settings.addresses.new-address")}
        </Button>
      )}
    </Box>
  );
}
