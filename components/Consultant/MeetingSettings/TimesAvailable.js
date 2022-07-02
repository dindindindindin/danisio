import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import Divider from "@mui/material/Divider";
import { set } from "date-fns";

export default function TimesAvailable(props) {
  const [isAddIntervalOpen, setIsAddIntervalOpen] = useState(false);
  const [isAddIntervalExcludeOpen, setIsAddIntervalExcludeOpen] =
    useState(false);
  //states for adding interval
  const [addIntervalFrom, setAddIntervalFrom] = useState(null);
  const [addIntervalTo, setAddIntervalTo] = useState(null);
  const [addIntervalExcludeFrom, setAddIntervalExcludeFrom] = useState(null);
  const [addIntervalExcludeTo, setAddIntervalExcludeTo] = useState(null);

  const [addIntervalExclusions, setAddIntervalExclusions] = useState([]);

  const [isAddIntervalFromToDisabled, setIsAddIntervalFromToDisabled] =
    useState(false);

  const [errors, setErrors] = useState({ availableFrom: "", availableTo: "" });

  const isValueValid = (value) => {
    if (value instanceof Date)
      if (
        value.getHours() <= 24 &&
        value.getHours() >= 0 &&
        value.getMinutes() <= 59 &&
        value.getMinutes() >= 0
      )
        return true;
      else return false;
  };

  const isToLater = (from, to) => {
    if (from instanceof Date && to instanceof Date) {
      if (from.getHours() <= to.getHours()) {
        if (from.getMinutes() <= to.getMinutes()) {
          return true;
        } else return false;
      } else return false;
    } else return false;
  };

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
                disabled={isAddIntervalFromToDisabled}
                renderInput={(params) => (
                  <TextField
                    helperText={errors.availableFrom}
                    sx={{ width: "49%" }}
                    {...params}
                  />
                )}
              />
              <TimePicker
                label="Available Until"
                value={addIntervalTo}
                ampm={false}
                minTime={addIntervalFrom}
                onChange={(newValue) => {
                  setAddIntervalTo(newValue);
                  if (!isToLater(addIntervalFrom, newValue)) {
                    setErrors({
                      availableTo: "Must be later than 'Available From'",
                    });
                  } else {
                    setErrors({ availableTo: "" });
                  }
                }}
                disabled={
                  !isValueValid(addIntervalFrom) || isAddIntervalFromToDisabled
                }
                renderInput={(params) => (
                  <TextField
                    helperText={errors.availableTo}
                    sx={{ width: "49%" }}
                    {...params}
                  />
                )}
              />
            </Box>
            {addIntervalExclusions ? (
              addIntervalExclusions.map((exclusion, index) => {
                console.log(exclusion);
                return (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    marginBottom="8px"
                  >
                    <Typography marginRight="1%">
                      Except from {("0" + exclusion.from.getHours()).slice(-2)}:
                      {("0" + exclusion.from.getMinutes()).slice(-2)} to{" "}
                      {("0" + exclusion.to.getHours()).slice(-2)}:
                      {("0" + exclusion.to.getMinutes()).slice(-2)}
                    </Typography>
                    <Button
                      onClick={() => {
                        setAddIntervalExclusions((prevState) => {
                          if (prevState.length === 1) {
                            setIsAddIntervalFromToDisabled(false);
                          }
                          return prevState.filter(
                            (filterExclusion, filterIndex) =>
                              filterIndex !== index
                          );
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                );
              })
            ) : (
              <></>
            )}
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
                    label="Exclude Until"
                    value={addIntervalExcludeTo}
                    ampm={false}
                    minTime={addIntervalExcludeFrom}
                    maxTime={addIntervalTo}
                    disabled={!isValueValid(addIntervalExcludeFrom)}
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
                    onClick={() => {
                      setAddIntervalExclusions((state) => [
                        ...state,
                        {
                          from: addIntervalExcludeFrom,
                          to: addIntervalExcludeTo,
                        },
                      ]);
                      setAddIntervalExcludeFrom(null);
                      setAddIntervalExcludeTo(null);
                      setIsAddIntervalExcludeOpen(false);
                    }}
                  >
                    Complete Exclusion
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => {
                      if (addIntervalExclusions.length === 0) {
                        console.log("inside disabled false");
                        setIsAddIntervalFromToDisabled(false);
                      }
                      setAddIntervalExcludeFrom(null);
                      setAddIntervalExcludeTo(null);
                      setIsAddIntervalExcludeOpen(false);
                    }}
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
                  onClick={() => {
                    if (
                      isValueValid(addIntervalFrom) &&
                      isValueValid(addIntervalTo)
                    ) {
                      if (isToLater(addIntervalFrom, addIntervalTo)) {
                        setErrors({ availableFrom: "" });
                        setIsAddIntervalExcludeOpen(true);
                        setIsAddIntervalFromToDisabled(true);
                      } else
                        setErrors({
                          availableFrom: "Times available are not valid.",
                        });
                    } else
                      setErrors({
                        availableFrom: "Please enter times available first.",
                      });
                  }}
                >
                  Exclude Interval
                </Button>
                <Typography variant="body2" color="GrayText">
                  (ie. your lunchtime)
                </Typography>
              </Box>
            )}
          </LocalizationProvider>
          <Box marginBottom="8px">
            <FormControl>
              <RadioGroup defaultValue="preferred" name="radio-buttons-group">
                <FormControlLabel
                  value="preferred"
                  control={<Radio />}
                  label="Meeting preferred at this time."
                />
                <FormControlLabel
                  value="possible"
                  control={<Radio />}
                  label="Meeting possible at this time."
                />
              </RadioGroup>
            </FormControl>
          </Box>
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
