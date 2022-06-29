import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import { useTranslation } from "next-i18next";

export default function SelectCountry(props) {
  const { t } = useTranslation();
  console.log(props.countries);
  //inside a function?
  const countries = [];
  props.countries.map((country) => {
    countries.push({
      id: country.id,
      country: t(`countries.${country.country}`),
      region: t(`regions.${country.region}`),
    });
  });

  const handleCountryChange = async (e, value, reason) => {
    //update meeting country in db
    if (reason === "selectOption") {
      //api call
      await axios.put(
        "/api/consultant/meeting-settings/meeting-country-update",
        {
          countryId: value.id,
        }
      );

      //update the parent state
      props.setCountrySelected(() => {
        let countrySelected;
        props.countries.map((country) => {
          if (country.id === value.id) {
            countrySelected = country.country;
          }
        });
        return countrySelected;
      });

      //retrieve cities again
      const citiesRes = await axios.post(
        "/api/consultant/meeting-settings/get-cities",
        { countryId: value.id }
      );
      props.setCities(citiesRes.data);

      //update parent states
      props.countries.map((country) => {
        if (country.id === value.id) {
          props.setCountryHasStates(Boolean(country.has_states));
          props.setCountryStateVariant(country.state_variant);
        }
      });

      //retrieve addresses again
      const addressesRes = await axios.get(
        "/api/consultant/meeting-settings/get-addresses"
      );
      props.setAddresses(addressesRes.data);

      //currently useless
    } else if (reason === "removeOption") {
      //update as null in db
      await axios.put(
        "/api/consultant/meeting-settings/meeting-country-remove"
      );
    }
  };

  //get sorted list (by region) of countries
  const getOptions = () => {
    return countries.sort((a, b) => a.region.localeCompare(b.region));
  };

  return (
    <Box component="form" border="2px solid #f0f0f4" borderRadius="5px">
      <Typography sx={{ margin: "15px 2% 15px 2%" }}>
        {t("settings.meeting-settings.addresses.country-first")}
      </Typography>
      <Autocomplete
        options={getOptions()}
        getOptionLabel={(option) => option.country}
        groupBy={(option) => option.region}
        disableClearable
        sx={{ margin: "0 2% 15px 2%" }}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              label={t("settings.profile-settings.countries")}
            />
          );
        }}
        onChange={handleCountryChange}
      />
    </Box>
  );
}
