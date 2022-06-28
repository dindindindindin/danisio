import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import axios from "axios";
import { useTranslation } from "next-i18next";

export default function Addresses() {
  const { t } = useTranslation();

  return (
    <Box border="2px solid #f0f0f4" borderRadius="5px">
      <Typography sx={{ margin: "15px 2% 15px 2%" }}>
        {t("settings.meeting-settings.addresses.addresses")}
      </Typography>
      <Button variant="contained" sx={{ margin: "0 0 15px 2%" }}>
        {t("settings.meeting-settings.addresses.new-address")}
      </Button>
    </Box>
  );
}
