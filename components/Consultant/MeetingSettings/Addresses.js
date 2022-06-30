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

export default function Addresses(props) {
  const { t } = useTranslation();
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isNewLocationOpen, setIsNewLocationOpen] = useState(false);
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
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
  //fetched arrays
  const [addresses, setAddresses] = useState(props.addresses);
  const [locations, setLocations] = useState(props.locations);
  const [cities, setCities] = useState(props.cities);
  //add new address form states
  const [newSelectedCityId, setNewSelectedCityId] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [isNewAddressPrimary, setIsNewAddressPrimary] = useState(false);
  //edit address form states
  const [editAddressId, setEditAddressId] = useState(null);
  const [editSelectedCity, setEditSelectedCity] = useState(null);
  const [editSelectedCityId, setEditSelectedCityId] = useState(null);
  const [editAddress, setEditAddress] = useState("");
  const [isEditAddressPrimary, setIsEditAddressPrimary] = useState(false);
  //add new location form states
  const [newLocationSelectedCityId, setNewLocationSelectedCityId] =
    useState(null);
  const [newLocation, setNewLocation] = useState("");
  //edit location form states
  const [editLocationId, setEditLocationId] = useState(null);
  const [editLocationSelectedCity, setEditLocationSelectedCity] =
    useState(null);
  const [editLocationSelectedCityId, setEditLocationSelectedCityId] =
    useState(null);
  const [editLocation, setEditLocation] = useState("");

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

      //retrieve cities again
      const citiesRes = await axios.post(
        "/api/consultant/meeting-settings/get-cities",
        { countryId: value.id }
      );
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
      const addressesRes = await axios.get(
        "/api/consultant/meeting-settings/get-addresses"
      );
      setAddresses(addressesRes.data);

      //retrieve locations again
      const locationsRes = await axios.get(
        "/api/consultant/meeting-settings/get-locations"
      );
      setLocations(locationsRes.data);

      //currently useless
    } else if (reason === "removeOption") {
      //update as null in db
      await axios.put(
        "/api/consultant/meeting-settings/meeting-country-remove"
      );
    }
  };

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

  //remove address by id
  const handleAddressRemove = async (addressId) => {
    //api call
    await axios.post("/api/consultant/meeting-settings/address-remove", {
      addressId: addressId,
    });

    //retrieve addresses again
    const addressesRes = await axios.get(
      "/api/consultant/meeting-settings/get-addresses"
    );
    setAddresses(addressesRes.data);
  };

  //populate new selected city state
  const handleNewAddressCityChange = (e, value, reason) => {
    if (reason === "selectOption") setNewSelectedCityId(value.id);
    else if (reason === "removeOption") setNewSelectedCityId(null);
  };

  const handleEditAddressSubmit = async (e) => {
    e.preventDefault();

    //insert into consultant_addresses
    await axios.put("/api/consultant/meeting-settings/address-update", {
      cityId: editSelectedCityId,
      address: editAddress,
      isPrimary: isEditAddressPrimary,
      addressId: editAddressId,
    });

    //retrieve addresses again
    const addressesRes = await axios.get(
      "/api/consultant/meeting-settings/get-addresses"
    );
    setAddresses(addressesRes.data);

    //set states back to default values
    setEditSelectedCityId(null);
    setEditAddress("");
    setIsEditAddressPrimary(false);
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

    //insert into consultant_locations
    await axios.post("/api/consultant/meeting-settings/new-location", {
      cityId: newLocationSelectedCityId,
      location: newLocation,
    });

    //retrieve locations again
    const locationsRes = await axios.get(
      "/api/consultant/meeting-settings/get-locations"
    );
    setLocations(locationsRes.data);

    //set states back to default values
    setNewLocationSelectedCityId(null);
    setNewLocation("");
  };

  //remove address by id
  const handleLocationRemove = async (locationId) => {
    //api call
    await axios.post("/api/consultant/meeting-settings/location-remove", {
      locationId: locationId,
    });

    //retrieve locations again
    const locationsRes = await axios.get(
      "/api/consultant/meeting-settings/get-locations"
    );
    setLocations(locationsRes.data);
  };

  //populate new selected city
  const handleNewLocationCityChange = (e, value, reason) => {
    if (reason === "selectOption") setNewLocationSelectedCityId(value.id);
    else if (reason === "removeOption") setNewLocationSelectedCityId(null);
  };

  const handleEditLocationSubmit = async (e) => {
    e.preventDefault();

    //update consultant_locations
    await axios.put("/api/consultant/meeting-settings/location-update", {
      cityId: editLocationSelectedCityId,
      location: editLocation,
      locationId: editLocationId,
    });

    //retrieve locations again
    const locationsRes = await axios.get(
      "/api/consultant/meeting-settings/get-locations"
    );
    setLocations(locationsRes.data);

    //set states back to default values
    setEditLocationSelectedCityId(null);
    setEditLocation("");
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
      <Box display="flex" marginBottom="8px" marginTop="8px">
        <Button
          variant="outlined"
          type="submit"
          sx={{ mr: "1%" }}
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
        <Box display="flex" marginBottom="8px" marginTop="8px">
          <Button
            variant="outlined"
            type="submit"
            sx={{ mr: "1%" }}
            onClick={(e) => {
              handleEditAddressSubmit(e);
              setIsEditAddressOpen(false);
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
                {t(`countries.state-variant.${countryStateVariant}`)}:
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
        placeholder={t(
          "settings.meeting-settings.addresses.location-default-value"
        )}
        sx={{ marginBottom: "8px" }}
        onChange={(e) => setNewLocation(e.target.value)}
      />

      <Box display="flex" marginBottom="8px" marginTop="8px">
        <Button
          variant="outlined"
          type="submit"
          sx={{ mr: "1%" }}
          onClick={(e) => {
            handleNewLocationSubmit(e);
            setIsNewLocationOpen(false);
          }}
        >
          {t("settings.meeting-settings.addresses.add")}
        </Button>
        <Button
          variant="outlined"
          type="submit"
          color="warning"
          onClick={(e) => {
            setIsNewLocationOpen(false);
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
          sx={{ marginBottom: "8px" }}
          onChange={(e) => setEditLocation(e.target.value)}
        />

        <Box display="flex" marginBottom="8px" marginTop="8px">
          <Button
            variant="outlined"
            type="submit"
            sx={{ mr: "1%" }}
            onClick={(e) => {
              handleEditLocationSubmit(e);
              setIsEditLocationOpen(false);
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
                {t(`countries.state-variant.${countryStateVariant}`)}:
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
    </Box>
  ) : (
    <Box border="2px solid #f0f0f4" borderRadius="5px">
      <Box margin="16px 2% 16px 2%" display="flex">
        <Typography alignSelf="center">
          {t("settings.meeting-settings.addresses.country")}:{" "}
          {t(`countries.${countrySelected}`)}
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
            <Typography sx={{ marginRight: "2%" }}>
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
            <Typography sx={{ marginRight: "2%" }}>
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
