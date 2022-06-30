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
  const handleNewCityChange = (e, value, reason) => {
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
  const handleEditCityChange = (e, value, reason) => {
    if (reason === "selectOption") {
      setEditSelectedCityId(value.id);
      setEditSelectedCity(value);
    } else if (reason === "removeOption") setEditSelectedCityId(null);
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
        sx={{ marginBottom: "8px" }}
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
          Cancel
        </Button>
      </Box>
    </Box>
  );

  //render when clicked edit
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
            onChange={handleEditCityChange}
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
            onChange={handleEditCityChange}
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
          label="Primary address: appears on profile."
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
            Update
          </Button>
          <Button
            variant="outlined"
            type="submit"
            color="warning"
            onClick={(e) => {
              setIsEditAddressOpen(false);
            }}
          >
            Cancel
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
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleAddressRemove(props.addressId)}
          >
            Remove
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
        sx={{ marginBottom: "8px" }}
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
          Cancel
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
            onChange={handleEditCityChange}
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
            onChange={handleEditCityChange}
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
          label="Primary address: appears on profile."
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
            Update
          </Button>
          <Button
            variant="outlined"
            type="submit"
            color="warning"
            onClick={(e) => {
              setIsEditAddressOpen(false);
            }}
          >
            Cancel
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
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleAddressRemove(props.addressId)}
          >
            Remove
          </Button>
        </Box>
        <Divider />
      </Box>
    );
  };

  return countrySelected === "" ? (
    <Box component="form" border="2px solid #f0f0f4" borderRadius="5px">
      <Typography sx={{ margin: "15px 2% 15px 2%" }}>
        {t("settings.meeting-settings.addresses.country-first")}
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
          {t("settings.meeting-settings.addresses.country")}{" "}
          {t(`countries.${countrySelected}`)}
        </Typography>
        <Button
          sx={{ marginLeft: "1%" }}
          onClick={() => {
            alert("WARNING: If country is changed the addresses are removed.");
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
      {isEditAddressOpen ? (
        renderEditAddress()
      ) : (
        <Box>
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
    </Box>
  );
}
