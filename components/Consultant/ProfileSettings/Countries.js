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

  const handleChange = (e, value, reason) => {
    console.log("e: ", e, " value: ", value, " reason: ", reason);
  };

  return (
    <Box border="2px solid #f0f0f4" borderRadius="5px" marginTop="30px">
      <form>
        <Typography>
          {t("settings.profile-settings.relevant-countries")}
        </Typography>
        <Autocomplete
          multiple
          options={countries.sort((a, b) => a.region.localeCompare(b.region))}
          getOptionLabel={(option) => option.name}
          groupBy={(option) => option.region}
          filterSelectedOptions
          disableClearable
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
