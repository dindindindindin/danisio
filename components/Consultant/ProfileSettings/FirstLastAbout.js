import { Box, Button, TextField } from "@mui/material";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import styled from "@emotion/styled";

// const StyledButton = styled(Button)`
//   justify-self: end;
// `;

export default function FirstLastAbout(props) {
  const [firstName, setFirstName] = useState(props.firstName);
  const [lastName, setLastName] = useState(props.lastName);
  const [aboutMe, setAboutMe] = useState(props.aboutMe);

  const { t } = useTranslation();

  const handleSubmit = () => {};

  return (
    <Box border="2px solid #f0f0f4" borderRadius="5px" marginTop="30px">
      <form onSubmit={handleSubmit}>
        <TextField
          label={t("settings.profile-settings.first-name")}
          name="firstname"
          variant="outlined"
          sx={{ width: "47%", margin: "15px 1% 15px 2%" }}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          label={t("settings.profile-settings.last-name")}
          name="lastname"
          variant="outlined"
          sx={{ width: "47%", margin: "15px 2% 15px 1%" }}
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
        <Box display="flex" justifyContent="flex-end" margin="0 2% 15px 2%">
          <Button type="submit" variant="contained">
            {t("settings.profile-settings.update")}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
