import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import axios from "axios";

export default function FirstLastAbout(props) {
  const [username, setUsername] = useState(props.username);
  const [firstName, setFirstName] = useState(props.firstName);
  const [lastName, setLastName] = useState(props.lastName);
  const [aboutMe, setAboutMe] = useState(props.aboutMe);
  const [error, setError] = useState("");

  const { t } = useTranslation();
  console.log(firstName);
  const handleSubmit = async (e) => {
    e.preventDefault();

    //character validation
    if (!/^[a-zA-Z1-9]+$/.test(username))
      setError(t("settings.profile-settings.username-error"));
    else if (username.length > 100)
      setError(t("settings.profile-settings.username-length-error"));
    else if (firstName.length > 60)
      setError(t("settings.profile-settings.first-name-error"));
    else if (lastName.length > 40)
      setError(t("settings.profile-settings.last-name-error"));
    else if (aboutMe.length > 200)
      setError(t("settings.profile-settings.about-me-error"));
    else {
      setError("");

      //api call
      try {
        await axios.put(
          "/api/consultant/profile-settings/first-last-about-update",
          {
            username: username,
            firstName: firstName,
            lastName: lastName,
            aboutMe: aboutMe,
          }
        );
      } catch (err) {
        if (err.response.data.errorCode === "username-exists")
          setError(t("settings.profile-settings.username-exists"));
      }
    }
  };

  return (
    <Box border="2px solid #f0f0f4" borderRadius="5px" marginTop="30px">
      <form onSubmit={handleSubmit}>
        <TextField
          label={t("settings.profile-settings.username")}
          name="username"
          variant="outlined"
          helperText={t("settings.profile-settings.username-helper")}
          sx={{ width: "96%", margin: "15px 2% 15px 2%" }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label={t("settings.profile-settings.first-name")}
          name="firstname"
          variant="outlined"
          sx={{ width: "47%", margin: "0 1% 15px 2%" }}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          label={t("settings.profile-settings.last-name")}
          name="lastname"
          variant="outlined"
          sx={{ width: "47%", margin: "0 2% 15px 1%" }}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          label={t("settings.profile-settings.about-me")}
          name="aboutme"
          variant="outlined"
          multiline
          sx={{ width: "96%", margin: "0 2% 15px 2%" }}
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
        />
        {error ? (
          <Typography color="error" sx={{ margin: "0 2% 15px 2%" }}>
            {error}
          </Typography>
        ) : (
          ""
        )}
        <Box display="flex" justifyContent="flex-end" margin="0 2% 15px 2%">
          <Button type="submit" variant="contained">
            {t("settings.profile-settings.update")}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
