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

  const handleChange = async (e, values, reason) => {
    console.log("e: ", e.target, " values: ", values, " reason: ", reason);

    //add consultant country to db
    if (reason === "selectOption") {
      values.map(async (value) => {
        if (value.name === e.target.innerText) {
          await axios.post("/api/consultant/profile-settings/country-add", {
            id: value.id,
          });
        }
      });
    }

    if (reason === "removeOption") {
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
        <Typography>
          {t("settings.profile-settings.relevant-countries")}
        </Typography>
        <Autocomplete
          multiple
          options={getOptions()}
          getOptionLabel={(option) => option.name}
          groupBy={(option) => option.region}
          filterSelectedOptions
          disableClearable
          defaultValue={defaultValues()}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("settings.profile-settings.countries")}
            />
          )}
          onChange={handleChange}
        />
      </form>
    </Box>
  );
}
