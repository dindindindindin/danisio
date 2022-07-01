import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import Divider from "@mui/material/Divider";

export default function TimesAvailable(props) {
  const [isAddIntervalOpen, setIsAddIntervalOpen] = useState(false);
  const [isAddIntervalExcludeOpen, setIsAddIntervalExcludeOpen] =
    useState(false);
  const [addIntervalFrom, setAddIntervalFrom] = useState(null);
  const [addIntervalTo, setAddIntervalTo] = useState(null);
  const [addIntervalExcludeFrom, setAddIntervalExcludeFrom] = useState(null);
  const [addIntervalExcludeTo, setAddIntervalExcludeTo] = useState(null);

  const renderAddInterval = () => {
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return (
      <Box>
        <form>
          <FormGroup
            sx={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: "8px",
            }}
          >
            {daysOfWeek.map((day) => (
              <FormControlLabel key={day} control={<Checkbox />} label={day} />
            ))}
          </FormGroup>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
              display="flex"
              justifyContent="space-between"
              marginBottom="8px"
            >
              <TimePicker
                label="Available From"
                value={addIntervalFrom}
                ampm={false}
                maxTime={addIntervalTo}
                onChange={(newValue) => {
                  setAddIntervalFrom(newValue);
                }}
                renderInput={(params) => (
                  <TextField sx={{ width: "49%" }} {...params} />
                )}
              />
              <TimePicker
                label="Available To"
                value={addIntervalTo}
                ampm={false}
                minTime={addIntervalFrom}
                onChange={(newValue) => {
                  setAddIntervalTo(newValue);
                }}
                renderInput={(params) => (
                  <TextField sx={{ width: "49%" }} {...params} />
                )}
              />
            </Box>
            {isAddIntervalExcludeOpen ? (
              <Box marginBottom="8px">
                <Box
                  display="flex"
                  justifyContent="space-between"
                  marginBottom="8px"
                >
                  <TimePicker
                    label="Exclude From"
                    value={addIntervalExcludeFrom}
                    ampm={false}
                    minTime={addIntervalFrom}
                    maxTime={addIntervalTo}
                    onChange={(newValue) => {
                      setAddIntervalExcludeFrom(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField sx={{ width: "49%" }} {...params} />
                    )}
                  />
                  <TimePicker
                    label="Exclude To"
                    value={addIntervalExcludeTo}
                    ampm={false}
                    minTime={addIntervalExcludeFrom}
                    maxTime={addIntervalTo}
                    onChange={(newValue) => {
                      setAddIntervalExcludeTo(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField sx={{ width: "49%" }} {...params} />
                    )}
                  />
                </Box>
                <Box display="flex">
                  <Button
                    variant="outlined"
                    sx={{ mr: "1%" }}
                    onClick={() => setIsAddIntervalExcludeOpen(false)}
                  >
                    Complete Exclusion
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => setIsAddIntervalExcludeOpen(false)}
                  >
                    Cancel Exclusion
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" marginBottom="8px">
                <Button
                  variant="outlined"
                  sx={{ marginRight: "1%" }}
                  onClick={() => setIsAddIntervalExcludeOpen(true)}
                >
                  Exclude Interval
                </Button>
                <Typography variant="body2" color="GrayText">
                  (ie. your lunchtime)
                </Typography>
              </Box>
            )}
          </LocalizationProvider>
          <Box display="flex">
            <Button variant="contained" sx={{ mr: "1%" }}>
              Complete
            </Button>
            <Button variant="outlined" color="warning">
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    );
  };
  return (
    <Box
      padding="8px 2%"
      marginTop="16px"
      border="2px solid #f0f0f4"
      borderRadius="5px"
    >
      <Typography marginBottom="16px">Times Available:</Typography>
      {isAddIntervalOpen ? (
        renderAddInterval()
      ) : (
        <Button variant="contained" onClick={() => setIsAddIntervalOpen(true)}>
          Add Interval
        </Button>
      )}
    </Box>
  );
}
