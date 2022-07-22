import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import { useTranslation } from "next-i18next";
import axios from "axios";
import { useState } from "react";

export default function Countries(props) {
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation(["settings", "countries"]);

  //translate and push into countries array
  const rawCountries = JSON.parse(props.countries);
  const countries = [];
  rawCountries.map((country) => {
    countries.push({
      id: country.id,
      country: t(`countries.${country.country}`, { ns: "countries" }),
      region: t(`regions.${country.region}`, { ns: "countries" }),
    });
  });

  //for removeOption
  let currentCountryIds = props.consultantCountries;

  const handleChange = async (e, values, reason) => {
    setIsLoading(true);

    //add consultant country to db
    if (reason === "selectOption") {
      values.map(async (value) => {
        if (value.country === e.target.innerText) {
          //populate for comparison in removeOption
          currentCountryIds.push(value.id);

          //api call
          try {
            await axios.post("/api/consultant/profile-settings/country-add", {
              id: value.id,
            });
          } catch (err) {
            console.log(err.response.data);
          }
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
          try {
            await axios.post(
              "/api/consultant/profile-settings/country-remove",
              {
                countryId: currentCountryId,
              }
            );
          } catch (err) {
            console.log(err.response.data);
          }
        }
      });
      for (let i = 0; i < currentCountryIds.length; i++) {
        if (currentCountryIds[i] === idToRemove) currentCountryIds.splice(i, 1);
      }
    }
    setIsLoading(false);
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
    <Box
      component="form"
      border="2px solid #f0f0f4"
      borderRadius="5px"
      marginTop="30px"
    >
      <Typography sx={{ margin: "15px 2% 15px 2%" }}>
        {t("settings.profile-settings.relevant-countries")}
      </Typography>
      <Autocomplete
        multiple
        options={getOptions()}
        getOptionLabel={(option) => option.country}
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
      {isLoading ? <LinearProgress sx={{ margin: "0 2% 15px 2%" }} /> : <></>}
    </Box>
  );
}
