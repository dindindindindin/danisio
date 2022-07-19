import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useTranslation } from "next-i18next";
import axios from "axios";

export default function Services(props) {
  const { t } = useTranslation(["settings", "services"]);

  //translate and push into countries array
  const services = [];
  props.services.map((service) => {
    services.push({
      id: service.id,
      service: t(`services.${service.service}`, { ns: "services" }),
    });
  });

  //for removeOption
  let currentServiceIds = props.consultantServices;

  const handleChange = async (e, values, reason) => {
    console.log("e: ", e.target, " values: ", values, " reason: ", reason);

    //add consultant country to db
    if (reason === "selectOption") {
      values.map(async (value) => {
        if (value.service === e.target.innerText) {
          //populate for comparison in removeOption
          currentServiceIds.push(value.id);

          //api call
          await axios.post("/api/consultant/profile-settings/service-add", {
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
      currentServiceIds.map(async (currentServiceId) => {
        if (!valueIds.includes(currentServiceId)) {
          idToRemove = currentServiceId;

          //api call
          await axios.post("/api/consultant/profile-settings/service-remove", {
            serviceId: currentServiceId,
          });
        }
      });
      for (let i = 0; i < currentServiceIds.length; i++) {
        if (currentServiceIds[i] === idToRemove) currentServiceIds.splice(i, 1);
      }
    }
  };

  //get sorted list of countries
  const getOptions = () => {
    return services.sort((a, b) => a.service.localeCompare(b.service));
  };

  //prepopulate the autocomplete
  const defaultValues = () => {
    const options = getOptions();
    let defaultValues = [];
    options.map((option) => {
      props.consultantServices.map((id) => {
        if (option.id === id) defaultValues.push(option);
      });
    });
    return defaultValues;
  };

  return (
    <Box border="2px solid #f0f0f4" borderRadius="5px" marginTop="30px">
      <form>
        <Typography sx={{ margin: "15px 2% 15px 2%" }}>
          {t("settings.profile-settings.offered-services")}
        </Typography>
        <Autocomplete
          multiple
          options={getOptions()}
          getOptionLabel={(option) => option.service}
          filterSelectedOptions
          disableClearable
          sx={{ margin: "15px 2% 15px 2%" }}
          defaultValue={defaultValues()}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                label={t("settings.profile-settings.services")}
              />
            );
          }}
          onChange={handleChange}
        />
      </form>
    </Box>
  );
}
