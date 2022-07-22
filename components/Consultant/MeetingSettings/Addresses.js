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
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";

export default function Addresses(props) {
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isNewLocationOpen, setIsNewLocationOpen] = useState(false);
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
  //selected country states
  const [isSelectCountryLoading, setIsSelectCountryLoading] = useState(false);
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
  //fetched arrays
  const [addresses, setAddresses] = useState(props.addresses);
  const [locations, setLocations] = useState(props.locations);
  const [cities, setCities] = useState(props.cities);
  //add new address form states
  const [isNewAddressLoading, setIsNewAddressLoading] = useState(false);
  const [isNewAddressAddButtonDisabled, setIsNewAddressAddButtonDisabled] =
    useState(false);
  const [newSelectedCityId, setNewSelectedCityId] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [isNewAddressPrimary, setIsNewAddressPrimary] = useState(false);
  //edit address form states
  const [isEditAddressLoading, setIsEditAddressLoading] = useState(false);
  const [
    isEditAddressUpdateButtonDisabled,
    setIsEditAddressUpdateButtonDisabled,
  ] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [editSelectedCity, setEditSelectedCity] = useState(null);
  const [editSelectedCityId, setEditSelectedCityId] = useState(null);
  const [editAddress, setEditAddress] = useState("");
  const [isEditAddressPrimary, setIsEditAddressPrimary] = useState(false);
  //add new location form states
  const [isNewLocationLoading, setIsNewLocationLoading] = useState(false);
  const [isNewLocationAddButtonDisabled, setIsNewLocationAddButtonDisabled] =
    useState(false);
  const [newLocationSelectedCityId, setNewLocationSelectedCityId] =
    useState(null);
  const [newLocation, setNewLocation] = useState("");
  //edit location form states
  const [isEditLocationLoading, setIsEditLocationLoading] = useState(false);
  const [
    isEditLocationUpdateButtonDisabled,
    setIsEditLocationUpdateButtonDisabled,
  ] = useState(false);
  const [editLocationId, setEditLocationId] = useState(null);
  const [editLocationSelectedCity, setEditLocationSelectedCity] =
    useState(null);
  const [editLocationSelectedCityId, setEditLocationSelectedCityId] =
    useState(null);
  const [editLocation, setEditLocation] = useState("");

  const [errors, setErrors] = useState({});

  const { t } = useTranslation(["settings", "countries"]);

  //inside a function?
  const countries = [];
  props.countries.map((country) => {
    countries.push({
      id: country.id,
      country: t(`countries.${country.country}`, { ns: "countries" }),
      region: t(`regions.${country.region}`, { ns: "countries" }),
    });
  });

  const handleCountryChange = async (e, value, reason) => {
    setIsSelectCountryLoading(true);

    //update meeting country in db
    if (reason === "selectOption") {
      //api call
      try {
        await axios.put(
          "/api/consultant/meeting-settings/meeting-country-update",
          {
            countryId: value.id,
          }
        );
      } catch (err) {
        console.log(err.response.data);
      }

      //retrieve cities again
      try {
        var citiesRes = await axios.post(
          "/api/consultant/meeting-settings/get-cities",
          { countryId: value.id }
        );
      } catch (err) {
        console.log(err.response.data);
      }
      setCities(citiesRes.data);

      //update the parent state
      setCountrySelected(() => {
        let countrySelected;
        props.countries.map((country) => {
          if (country.id === value.id) {
            countrySelected = country.country;
          }
        });
        return countrySelected;
      });

      //update parent states
      props.countries.map((country) => {
        if (country.id === value.id) {
          setCountryHasStates(Boolean(country.has_states));
          setCountryStateVariant(country.state_variant);
        }
      });

      //retrieve addresses again
      try {
        var addressesRes = await axios.get(
          "/api/consultant/meeting-settings/get-addresses"
        );
      } catch (err) {
        console.log(err.response.data);
      }
      setAddresses(addressesRes.data);

      //retrieve locations again
      try {
        var locationsRes = await axios.get(
          "/api/consultant/meeting-settings/get-locations"
        );
      } catch (err) {
        console.log(err.response.data);
      }
      setLocations(locationsRes.data);

      //currently useless
    } else if (reason === "removeOption") {
      //update as null in db
      try {
        await axios.put(
          "/api/consultant/meeting-settings/meeting-country-remove"
        );
      } catch (err) {
        console.log(err.response.data);
      }
    }
    setIsSelectCountryLoading(false);
  };

  const handleNewAddressSubmit = async (e) => {
    e.preventDefault();

    if (newSelectedCityId === null) {
      setErrors({ newAddressCity: true });
      return;
    } else if (newAddress === "") {
      setErrors({ newAddress: true });
      return;
    }

    setIsNewAddressAddButtonDisabled(true);
    setIsNewAddressLoading(true);

    //insert into consultant_addresses
    try {
      await axios.post("/api/consultant/meeting-settings/new-address", {
        cityId: newSelectedCityId,
        address: newAddress,
        isPrimary: isNewAddressPrimary,
      });
    } catch (err) {
      console.log(err.response.data);
    }

    //set states back to default values
    setNewSelectedCityId(null);
    setNewAddress("");
    setIsNewAddressPrimary(false);

    setIsNewAddressOpen(false);
    setIsNewAddressAddButtonDisabled(false);
    setIsNewAddressLoading(false);

    //retrieve addresses again
    try {
      var addressesRes = await axios.get(
        "/api/consultant/meeting-settings/get-addresses"
      );
    } catch (err) {
      console.log(err.response.data);
    }
    setAddresses(addressesRes.data);
  };

  //remove address by id
  const handleAddressRemove = async (addressId) => {
    //api call
    try {
      await axios.post("/api/consultant/meeting-settings/address-remove", {
        addressId: addressId,
      });
    } catch (err) {
      console.log(err.response.data);
    }

    //retrieve addresses again
    try {
      var addressesRes = await axios.get(
        "/api/consultant/meeting-settings/get-addresses"
      );
    } catch (err) {
      console.log(err.response.data);
    }
    setAddresses(addressesRes.data);
  };

  //populate new selected city state
  const handleNewAddressCityChange = (e, value, reason) => {
    if (reason === "selectOption") setNewSelectedCityId(value.id);
    else if (reason === "removeOption") setNewSelectedCityId(null);
  };

  const handleEditAddressSubmit = async (e) => {
    e.preventDefault();

    if (editSelectedCityId === null) {
      setErrors({ editAddressCity: true });
      return;
    } else if (editAddress === "") {
      setErrors({ editAddress: true });
      return;
    }

    setIsEditAddressUpdateButtonDisabled(true);
    setIsEditAddressLoading(true);

    //insert into consultant_addresses
    try {
      await axios.put("/api/consultant/meeting-settings/address-update", {
        cityId: editSelectedCityId,
        address: editAddress,
        isPrimary: isEditAddressPrimary,
        addressId: editAddressId,
      });
    } catch (err) {
      console.log(err.response.data);
    }

    //set states back to default values
    setEditSelectedCityId(null);
    setEditAddress("");
    setIsEditAddressPrimary(false);

    setIsEditAddressOpen(false);
    setIsEditAddressUpdateButtonDisabled(false);
    setIsEditAddressLoading(false);

    //retrieve addresses again
    try {
      var addressesRes = await axios.get(
        "/api/consultant/meeting-settings/get-addresses"
      );
    } catch (err) {
      console.log(err.response.data);
    }
    setAddresses(addressesRes.data);
  };

  //populate edit selected city state
  const handleEditAddressCityChange = (e, value, reason) => {
    if (reason === "selectOption") {
      setEditSelectedCityId(value.id);
      setEditSelectedCity(value);
    } else if (reason === "removeOption") setEditSelectedCityId(null);
  };

  const handleNewLocationSubmit = async (e) => {
    e.preventDefault();

    if (newLocationSelectedCityId === null) {
      setErrors({ newLocationCity: true });
      return;
    } else if (newLocation === "") {
      setErrors({ newLocation: true });
      return;
    }

    setIsNewLocationAddButtonDisabled(true);
    setIsNewLocationLoading(true);

    //insert into consultant_locations
    try {
      await axios.post("/api/consultant/meeting-settings/new-location", {
        cityId: newLocationSelectedCityId,
        location: newLocation,
      });
    } catch (err) {
      console.log(err.response.data);
    }
    //set states back to default values
    setNewLocationSelectedCityId(null);
    setNewLocation("");
    setIsNewLocationOpen(false);
    setIsNewLocationAddButtonDisabled(false);
    setIsNewLocationLoading(false);

    //retrieve locations again
    try {
      var locationsRes = await axios.get(
        "/api/consultant/meeting-settings/get-locations"
      );
    } catch (err) {
      console.log(err.response.data);
    }
    setLocations(locationsRes.data);
  };

  //remove address by id
  const handleLocationRemove = async (locationId) => {
    //api call
    try {
      await axios.post("/api/consultant/meeting-settings/location-remove", {
        locationId: locationId,
      });
    } catch (err) {
      console.log(err.response.data);
    }

    //retrieve locations again
    try {
      var locationsRes = await axios.get(
        "/api/consultant/meeting-settings/get-locations"
      );
    } catch (err) {
      console.log(err.response.data);
    }
    setLocations(locationsRes.data);
  };

  //populate new selected city
  const handleNewLocationCityChange = (e, value, reason) => {
    if (reason === "selectOption") setNewLocationSelectedCityId(value.id);
    else if (reason === "removeOption") setNewLocationSelectedCityId(null);
  };

  const handleEditLocationSubmit = async (e) => {
    e.preventDefault();

    if (editLocationSelectedCityId === null) {
      setErrors({ editLocationCity: true });
      return;
    } else if (editLocation === "") {
      setErrors({ editLocation: true });
      return;
    }

    setIsEditLocationUpdateButtonDisabled(true);
    setIsEditLocationLoading(true);

    //update consultant_locations
    try {
      await axios.put("/api/consultant/meeting-settings/location-update", {
        cityId: editLocationSelectedCityId,
        location: editLocation,
        locationId: editLocationId,
      });
    } catch (err) {
      console.log(err.response.data);
    }

    //set states back to default values
    setEditLocationSelectedCityId(null);
    setEditLocation("");

    setIsEditLocationOpen(false);
    setIsEditLocationUpdateButtonDisabled(false);
    setIsEditLocationLoading(false);

    //retrieve locations again
    try {
      var locationsRes = await axios.get(
        "/api/consultant/meeting-settings/get-locations"
      );
    } catch (err) {
      console.log(err.response.data);
    }
    setLocations(locationsRes.data);
  };

  //populate edit selected city state
  const handleEditLocationCityChange = (e, value, reason) => {
    if (reason === "selectOption") {
      setEditLocationSelectedCityId(value.id);
      setEditLocationSelectedCity(value);
    } else if (reason === "removeOption") setEditLocationSelectedCityId(null);
  };

  const getCityOptions = () => {
    //if country has states then return sorted by states
    if (countryHasStates)
      return cities.sort((a, b) => a.state.localeCompare(b.state));
    else return cities.sort((a, b) => a.city.localeCompare(b.city));
  };

  //get sorted list (by region) of countries
  const getCountryOptions = () => {
    return countries.sort((a, b) => a.region.localeCompare(b.region));
  };

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
                helperText={
                  errors.newAddressCity
                    ? t("settings.meeting-settings.addresses.select-city")
                    : ""
                }
                label={t("settings.meeting-settings.addresses.city")}
              />
            );
          }}
          onChange={handleNewAddressCityChange}
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
                helperText={
                  errors.newAddressCity
                    ? t("settings.meeting-settings.addresses.select-city")
                    : ""
                }
                label={t("settings.meeting-settings.addresses.city")}
              />
            );
          }}
          onChange={handleNewAddressCityChange}
        />
      )}

      <TextField
        label={t("settings.meeting-settings.addresses.address")}
        variant="outlined"
        helperText={
          !errors.newAddress
            ? t("settings.meeting-settings.addresses.no-company-name")
            : t("settings.meeting-settings.addresses.enter-address")
        }
        multiline
        fullWidth
        sx={{ marginBottom: "8px" }}
        onChange={(e) => setNewAddress(e.target.value)}
      />
      <FormControlLabel
        control={
          <Checkbox
            onChange={(e) => setIsNewAddressPrimary(e.target.checked)}
          />
        }
        label={t("settings.meeting-settings.addresses.primary-checkbox")}
      />
      {isNewAddressLoading ? (
        <LinearProgress sx={{ marginBottom: "8px", marginTop: "8px" }} />
      ) : (
        <></>
      )}
      <Box display="flex" marginBottom="8px" marginTop="8px">
        <Button
          variant="outlined"
          type="submit"
          sx={{ mr: "1%" }}
          disabled={isNewAddressAddButtonDisabled}
          onClick={(e) => {
            handleNewAddressSubmit(e);
          }}
        >
          {t("settings.meeting-settings.addresses.add")}
        </Button>
        <Button
          variant="outlined"
          color="warning"
          onClick={(e) => {
            setIsNewAddressOpen(false);
            setErrors({});
          }}
        >
          {t("settings.meeting-settings.addresses.cancel")}
        </Button>
      </Box>
    </Box>
  );

  //render when clicked edit address
  const renderEditAddress = () => {
    return (
      <Box component="form" margin="16px 2% 16px 2%">
        {countryHasStates ? (
          <Autocomplete
            options={getCityOptions()}
            getOptionLabel={(option) => option.city} //return null?
            groupBy={(option) => option.state}
            value={editSelectedCity}
            sx={{ marginBottom: "16px" }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  helperText={
                    errors.editAddressCity
                      ? t("settings.meeting-settings.addresses.select-city")
                      : ""
                  }
                  label={t("settings.meeting-settings.addresses.city")}
                />
              );
            }}
            onChange={handleEditAddressCityChange}
          />
        ) : (
          <Autocomplete
            options={getCityOptions()}
            getOptionLabel={(option) => option.city}
            disableClearable
            value={editSelectedCity}
            sx={{ marginBottom: "16px" }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  helperText={
                    errors.editAddressCity
                      ? t("settings.meeting-settings.addresses.select-city")
                      : ""
                  }
                  label={t("settings.meeting-settings.addresses.city")}
                />
              );
            }}
            onChange={handleEditAddressCityChange}
          />
        )}

        <TextField
          label={t("settings.meeting-settings.addresses.address")}
          variant="outlined"
          multiline
          fullWidth
          value={editAddress}
          helperText={
            !errors.editAddress
              ? t("settings.meeting-settings.addresses.no-company-name")
              : t("settings.meeting-settings.addresses.enter-address")
          }
          sx={{ marginBottom: "8px" }}
          onChange={(e) => setEditAddress(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isEditAddressPrimary}
              onChange={(e) => setIsEditAddressPrimary(e.target.checked)}
            />
          }
          label={t("settings.meeting-settings.addresses.primary-checkbox")}
        />
        {isEditAddressLoading ? (
          <LinearProgress sx={{ marginBottom: "8px", marginTop: "8px" }} />
        ) : (
          <></>
        )}
        <Box display="flex" marginBottom="8px" marginTop="8px">
          <Button
            variant="outlined"
            type="submit"
            sx={{ mr: "1%" }}
            disabled={isEditAddressUpdateButtonDisabled}
            onClick={(e) => {
              handleEditAddressSubmit(e);
            }}
          >
            {t("settings.meeting-settings.addresses.update")}
          </Button>
          <Button
            variant="outlined"
            type="submit"
            color="warning"
            onClick={(e) => {
              setIsEditAddressOpen(false);
              setErrors({});
            }}
          >
            {t("settings.meeting-settings.addresses.cancel")}
          </Button>
        </Box>
        <Divider />
      </Box>
    );
  };

  //component to call for each address
  const Address = (props) => {
    return (
      <Box>
        <Box display="flex" margin="8px 2% 8px 2%">
          <Typography marginRight="2%">
            <strong>{t("settings.meeting-settings.addresses.city")}:</strong>{" "}
            {props.city}
          </Typography>
          {countryHasStates ? (
            <Typography>
              <strong>
                {t(`countries.state-variant.${countryStateVariant}`, {
                  ns: "countries",
                })}
                :
              </strong>{" "}
              {props.state}
            </Typography>
          ) : (
            <></>
          )}
        </Box>
        <Box margin="8px 2% 8px 2%">
          <Typography marginBottom="8px">
            <strong>{t("settings.meeting-settings.addresses.address")}:</strong>{" "}
            {props.address}
          </Typography>
          {props.isPrimary ? (
            <Typography color="primary">
              {t("settings.meeting-settings.addresses.primary-address")}
            </Typography>
          ) : (
            <></>
          )}
        </Box>
        <Box display="flex" margin="0 2% 16px 2%">
          <Button
            variant="outlined"
            sx={{ marginRight: "1%" }}
            onClick={() => {
              //get the default value of edit city
              const cities = getCityOptions();
              for (let i = 0; i < cities.length; i++) {
                if (cities[i].id === props.cityId) {
                  console.log[cities[i]];
                  setEditSelectedCity(cities[i]);
                }
              }
              setIsNewAddressOpen(false);
              setEditAddressId(props.addressId);
              setEditSelectedCityId(props.cityId);
              setEditAddress(props.address);
              setIsEditAddressPrimary(Boolean(props.isPrimary));
              setIsEditAddressOpen(true);
            }}
          >
            {t("settings.meeting-settings.addresses.edit")}
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleAddressRemove(props.addressId)}
          >
            {t("settings.meeting-settings.addresses.remove")}
          </Button>
        </Box>
        <Divider />
      </Box>
    );
  };

  //render when Add New Location button is clicked
  const renderNewLocation = (
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
                helperText={
                  errors.newLocationCity
                    ? t("settings.meeting-settings.addresses.select-city")
                    : ""
                }
                label={t("settings.meeting-settings.addresses.city")}
              />
            );
          }}
          onChange={handleNewLocationCityChange}
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
                helperText={
                  errors.newLocationCity
                    ? t("settings.meeting-settings.addresses.select-city")
                    : ""
                }
                label={t("settings.meeting-settings.addresses.city")}
              />
            );
          }}
          onChange={handleNewLocationCityChange}
        />
      )}

      <TextField
        label={t("settings.meeting-settings.addresses.location")}
        variant="outlined"
        multiline
        fullWidth
        helperText={
          errors.newLocation
            ? t("settings.meeting-settings.addresses.enter-location")
            : ""
        }
        placeholder={t(
          "settings.meeting-settings.addresses.location-default-value"
        )}
        sx={{ marginBottom: "8px" }}
        onChange={(e) => setNewLocation(e.target.value)}
      />
      {isNewLocationLoading ? (
        <LinearProgress sx={{ marginBottom: "8px", marginTop: "8px" }} />
      ) : (
        <></>
      )}
      <Box display="flex" marginBottom="8px" marginTop="8px">
        <Button
          variant="outlined"
          type="submit"
          sx={{ mr: "1%" }}
          disabled={isNewLocationAddButtonDisabled}
          onClick={(e) => {
            handleNewLocationSubmit(e);
          }}
        >
          {t("settings.meeting-settings.addresses.add")}
        </Button>
        <Button
          variant="outlined"
          color="warning"
          onClick={(e) => {
            setIsNewLocationOpen(false);
            setErrors({});
          }}
        >
          {t("settings.meeting-settings.addresses.cancel")}
        </Button>
      </Box>
    </Box>
  );

  //render when clicked edit location
  const renderEditLocation = () => {
    return (
      <Box component="form" margin="16px 2% 16px 2%">
        {countryHasStates ? (
          <Autocomplete
            options={getCityOptions()}
            getOptionLabel={(option) => option.city} //return null?
            groupBy={(option) => option.state}
            value={editLocationSelectedCity}
            sx={{ marginBottom: "16px" }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  helperText={
                    errors.editLocationCity
                      ? t("settings.meeting-settings.addresses.select-city")
                      : ""
                  }
                  label={t("settings.meeting-settings.addresses.city")}
                />
              );
            }}
            onChange={handleEditLocationCityChange}
          />
        ) : (
          <Autocomplete
            options={getCityOptions()}
            getOptionLabel={(option) => option.city}
            disableClearable
            value={editLocationSelectedCity}
            sx={{ marginBottom: "16px" }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  helperText={
                    errors.editLocationCity
                      ? t("settings.meeting-settings.addresses.select-city")
                      : ""
                  }
                  label={t("settings.meeting-settings.addresses.city")}
                />
              );
            }}
            onChange={handleEditLocationCityChange}
          />
        )}

        <TextField
          label={t("settings.meeting-settings.addresses.location")}
          variant="outlined"
          multiline
          fullWidth
          placeholder={t(
            "settings.meeting-settings.addresses.location-default-value"
          )}
          value={editLocation}
          helperText={
            errors.editLocation
              ? t("settings.meeting-settings.addresses.enter-location")
              : ""
          }
          sx={{ marginBottom: "8px" }}
          onChange={(e) => setEditLocation(e.target.value)}
        />
        {isEditLocationLoading ? (
          <LinearProgress sx={{ marginBottom: "8px", marginTop: "8px" }} />
        ) : (
          <></>
        )}
        <Box display="flex" marginBottom="8px" marginTop="8px">
          <Button
            variant="outlined"
            type="submit"
            sx={{ mr: "1%" }}
            disabled={isEditLocationUpdateButtonDisabled}
            onClick={(e) => {
              handleEditLocationSubmit(e);
            }}
          >
            {t("settings.meeting-settings.addresses.update")}
          </Button>
          <Button
            variant="outlined"
            type="submit"
            color="warning"
            onClick={(e) => {
              setIsEditLocationOpen(false);
              setErrors({});
            }}
          >
            {t("settings.meeting-settings.addresses.cancel")}
          </Button>
        </Box>
        <Divider />
      </Box>
    );
  };

  //component to call for each address
  const Location = (props) => {
    return (
      <Box>
        <Box display="flex" margin="8px 2% 8px 2%">
          <Typography marginRight="2%">
            <strong>{t("settings.meeting-settings.addresses.city")}:</strong>{" "}
            {props.city}
          </Typography>
          {countryHasStates ? (
            <Typography>
              <strong>
                {t(`countries.state-variant.${countryStateVariant}`, {
                  ns: "countries",
                })}
                :
              </strong>{" "}
              {props.state}
            </Typography>
          ) : (
            <></>
          )}
        </Box>
        <Box margin="8px 2% 8px 2%">
          <Typography marginBottom="8px">
            <strong>
              {t("settings.meeting-settings.addresses.location")}:
            </strong>{" "}
            {props.location}
          </Typography>
        </Box>
        <Box display="flex" margin="0 2% 16px 2%">
          <Button
            variant="outlined"
            sx={{ marginRight: "1%" }}
            onClick={() => {
              //get the default value of edit location city
              const cities = getCityOptions();
              for (let i = 0; i < cities.length; i++) {
                if (cities[i].id === props.cityId) {
                  console.log[cities[i]];
                  setEditLocationSelectedCity(cities[i]);
                }
              }
              setIsNewLocationOpen(false);
              setEditLocationId(props.locationId);
              setEditLocationSelectedCityId(props.cityId);
              setEditLocation(props.location);
              setIsEditLocationOpen(true);
            }}
          >
            {t("settings.meeting-settings.addresses.edit")}
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleLocationRemove(props.locationId)}
          >
            {t("settings.meeting-settings.addresses.remove")}
          </Button>
        </Box>
        <Divider />
      </Box>
    );
  };

  return countrySelected === "" ? (
    <Box component="form" border="2px solid #f0f0f4" borderRadius="5px">
      <Typography sx={{ margin: "15px 2% 15px 2%" }}>
        {t("settings.meeting-settings.addresses.country-first")}:
      </Typography>
      <Autocomplete
        options={getCountryOptions()}
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
      {isSelectCountryLoading ? (
        <LinearProgress sx={{ margin: "0 2% 15px 2%" }} />
      ) : (
        <></>
      )}
    </Box>
  ) : (
    <Box border="2px solid #f0f0f4" borderRadius="5px">
      <Box margin="16px 2% 16px 2%" display="flex">
        <Typography alignSelf="center">
          {t("settings.meeting-settings.addresses.country")}:{" "}
          {t(`countries.${countrySelected}`, { ns: "countries" })}
        </Typography>
        <Button
          sx={{ marginLeft: "1%" }}
          onClick={() => {
            alert(
              t("settings.meeting-settings.addresses.country-change-alert")
            );
            setCountrySelected(() => "");
          }}
        >
          {t("settings.meeting-settings.addresses.change")}
        </Button>
      </Box>
      <Divider />

      {isEditAddressOpen ? (
        renderEditAddress()
      ) : (
        <Box>
          <Box margin="8px 2% 8px 2%" display="flex" alignItems="center">
            <Typography sx={{ marginRight: "1%" }}>
              {t("settings.meeting-settings.addresses.addresses")}:
            </Typography>
            <Typography variant="body2" color="GrayText">
              {t("settings.meeting-settings.addresses.addresses-example")}
            </Typography>
          </Box>
          {addresses.map((address) => (
            <Address
              key={address.id}
              addressId={address.id}
              city={address.city}
              state={address.state}
              address={address.address}
              isPrimary={address.is_primary}
              cityId={address.city_id}
            />
          ))}
        </Box>
      )}
      {isNewAddressOpen ? (
        renderNewAddress
      ) : (
        <Button
          variant="contained"
          sx={{ margin: "16px 0 16px 2%" }}
          onClick={() => {
            setIsEditAddressOpen(false);
            setIsNewAddressOpen(true);
          }}
        >
          {t("settings.meeting-settings.addresses.new-address")}
        </Button>
      )}
      <Divider />
      {isEditLocationOpen ? (
        renderEditLocation()
      ) : (
        <Box>
          <Box margin="8px 2% 8px 2%" display="flex" alignItems="center">
            <Typography sx={{ marginRight: "1%" }}>
              {t("settings.meeting-settings.addresses.locations")}:
            </Typography>
            <Typography variant="body2" color="GrayText">
              {t("settings.meeting-settings.addresses.locations-example")}
            </Typography>
          </Box>
          {locations.map((location) => (
            <Location
              key={location.id}
              locationId={location.id}
              city={location.city}
              state={location.state}
              location={location.location}
              cityId={location.city_id}
            />
          ))}
        </Box>
      )}
      {isNewLocationOpen ? (
        renderNewLocation
      ) : (
        <Button
          variant="contained"
          sx={{ margin: "16px 0 16px 2%" }}
          onClick={() => {
            setIsEditLocationOpen(false);
            setIsNewLocationOpen(true);
          }}
        >
          {t("settings.meeting-settings.addresses.new-location")}
        </Button>
      )}
    </Box>
  );
}
