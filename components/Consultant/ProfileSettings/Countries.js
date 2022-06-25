import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import axios from "axios";

export default function Countries(props) {
  const { t } = useTranslation();
  const countries = JSON.parse(props.countries);

  //for removeOption
  let currentCountryIds = props.consultantCountries;

  const handleChange = async (e, values, reason) => {
    console.log("e: ", e.target, " values: ", values, " reason: ", reason);

    //add consultant country to db
    if (reason === "selectOption") {
      values.map(async (value) => {
        if (value.name === e.target.innerText) {
          //populate for comparison in removeOption
          currentCountryIds.push(value.id);

          //api call
          await axios.post("/api/consultant/profile-settings/country-add", {
            id: value.id,
          });
        }
      });
    }

    if (reason === "removeOption") {
      let valueIds = [];
      let idToRemove = null;
      values.map((value) => valueIds.push(value.id));

      //check the missing country in values
      currentCountryIds.map(async (currentCountryId) => {
        if (!valueIds.includes(currentCountryId)) {
          idToRemove = currentCountryId;

          //api call
          await axios.post("/api/consultant/profile-settings/country-remove", {
            countryId: currentCountryId,
          });
        }
      });
      for (let i = 0; i < currentCountryIds.length; i++) {
        if (currentCountryIds[i] === idToRemove) currentCountryIds.splice(i, 1);
      }
    }
  };

  //get sorted list of countries
  const getOptions = () => {
    return countries.sort((a, b) => a.region.localeCompare(b.region));
  };

  //prepopulate the autocomplete
  const defaultValues = () => {
    const options = getOptions();
    let defaultValues = [];
    options.map((option) => {
      props.consultantCountries.map((id) => {
        if (option.id === id) defaultValues.push(option);
      });
    });
    return defaultValues;
  };

  return (
    <Box border="2px solid #f0f0f4" borderRadius="5px" marginTop="30px">
      <form>
        <Typography sx={{ margin: "15px 2% 15px 2%" }}>
          {t("settings.profile-settings.relevant-countries")}
        </Typography>
        <Autocomplete
          multiple
          options={getOptions()}
          getOptionLabel={(option) => option.name}
          groupBy={(option) => option.region}
          filterSelectedOptions
          disableClearable
          sx={{ margin: "15px 2% 15px 2%" }}
          defaultValue={defaultValues()}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                label={t("settings.profile-settings.countries")}
              />
            );
          }}
          onChange={handleChange}
        />
      </form>
    </Box>
  );
}
