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
import Chip from "@mui/material/Chip";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";

export default function TimesAvailable(props) {
  const { t } = useTranslation("settings");
  const [isAddIntervalOpen, setIsAddIntervalOpen] = useState(false);
  const [isAddIntervalExcludeOpen, setIsAddIntervalExcludeOpen] =
    useState(false);
  //states for adding interval
  const [isCompleteButtonDisabled, setIsCompleteButtonDisabled] =
    useState(false);
  const [isAddIntervalLoading, setIsAddIntervalLoading] = useState(false);
  const [addIntervalFrom, setAddIntervalFrom] = useState(null);
  const [addIntervalTo, setAddIntervalTo] = useState(null);
  const [addIntervalExcludeFrom, setAddIntervalExcludeFrom] = useState(null);
  const [addIntervalExcludeTo, setAddIntervalExcludeTo] = useState(null);
  const [addIntervalExclusions, setAddIntervalExclusions] = useState([]);
  const [isAddIntervalFromToDisabled, setIsAddIntervalFromToDisabled] =
    useState(false);

  const [checkedDays, setCheckedDays] = useState([]);

  const [errors, setErrors] = useState({});

  const [intervals, setIntervals] = useState(props.intervals);

  const handleAddInterval = async (e) => {
    e.preventDefault();

    setIsCompleteButtonDisabled(true);
    setIsAddIntervalLoading(true);

    try {
      await axios.post("/api/consultant/meeting-settings/new-interval", {
        days: checkedDays,
        from: addIntervalFrom,
        to: addIntervalTo,
        exclusions: addIntervalExclusions,
        priority: e.target.priority.value,
      });
    } catch (err) {
      setErrors({
        availableFrom: t(
          "settings.meeting-settings.intervals.intervals-collided"
        ),
      });
      return;
    }

    setIsCompleteButtonDisabled(false);
    setIsAddIntervalLoading(false);
    setIsAddIntervalOpen(false);
    setAddIntervalFrom(null);
    setAddIntervalTo(null);
    setAddIntervalExcludeFrom(null);
    setAddIntervalExcludeTo(null);
    setAddIntervalExclusions([]);
    setCheckedDays([]);
    setIsAddIntervalFromToDisabled(false);
    setIsAddIntervalExcludeOpen(false);
    setErrors({});

    try {
      var intervalsRes = await axios.get(
        "/api/consultant/meeting-settings/get-intervals"
      );
    } catch (err) {
      console.log(err.response.data);
    }
    setIntervals(intervalsRes.data);
  };

  const handleRemoveInterval = async (e, id) => {
    e.preventDefault();

    try {
      await axios.post("/api/consultant/meeting-settings/interval-remove", {
        id: id,
      });
    } catch (err) {
      console.log(err.response.data);
    }

    try {
      var intervalsRes = await axios.get(
        "/api/consultant/meeting-settings/get-intervals"
      );
    } catch (err) {
      console.log(err.response.data);
    }

    setIntervals(intervalsRes.data);
  };

  const isValueValid = (value) => {
    if (value instanceof Date)
      if (
        value.getHours() < 24 &&
        value.getHours() >= 0 &&
        value.getMinutes() < 60 &&
        value.getMinutes() >= 0
      )
        return true;
      else return false;
    else return false;
  };

  //is 'to' later than 'from'?
  const isLater = (from, to) => {
    if (from instanceof Date && to instanceof Date) {
      if (from.getHours() < to.getHours()) {
        return true;
      } else if (from.getHours() == to.getHours()) {
        if (from.getMinutes() < to.getMinutes()) {
          return true;
        } else return false;
      } else return false;
    } else return false;
  };

  //is 'to' later than or equal to 'from'?
  const isLaterOrEqual = (from, to) => {
    if (from instanceof Date && to instanceof Date) {
      if (from.getHours() < to.getHours()) {
        return true;
      } else if (from.getHours() == to.getHours()) {
        if (from.getMinutes() <= to.getMinutes()) {
          return true;
        } else return false;
      } else return false;
    } else return false;
  };

  const stringToTime = (time) => {
    let date = new Date();
    date.setHours(time.slice(0, 2));
    date.setMinutes(time.slice(3, 5));
    return date;
  };

  const appendZero = (time) => {
    return ("0" + time).slice(-2);
  };

  const daysOfWeek = [
    t("settings.meeting-settings.intervals.monday"),
    t("settings.meeting-settings.intervals.tuesday"),
    t("settings.meeting-settings.intervals.wednesday"),
    t("settings.meeting-settings.intervals.thursday"),
    t("settings.meeting-settings.intervals.friday"),
    t("settings.meeting-settings.intervals.saturday"),
    t("settings.meeting-settings.intervals.sunday"),
  ];

  const renderAddInterval = () => {
    return (
      <Box>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              isValueValid(addIntervalFrom) &&
              isValueValid(addIntervalTo) &&
              isLater(addIntervalFrom, addIntervalTo)
            ) {
              if (checkedDays.length !== 0) {
                setErrors({});
                handleAddInterval(e);
              } else
                setErrors({
                  availableFrom: t(
                    "settings.meeting-settings.intervals.select-days"
                  ),
                });
            } else
              setErrors({
                availableFrom: t(
                  "settings.meeting-settings.intervals.valid-interval"
                ),
              });
          }}
        >
          <FormGroup
            sx={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: "8px",
            }}
          >
            {daysOfWeek.map((day, index) => (
              <FormControlLabel
                key={index}
                control={<Checkbox />}
                label={day}
                value={index}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCheckedDays((prevState) => [
                      ...prevState,
                      e.target.value,
                    ]);
                  } else {
                    setCheckedDays((prevState) =>
                      prevState.filter(
                        (filterIndex) => filterIndex !== e.target.value
                      )
                    );
                  }
                }}
              />
            ))}
          </FormGroup>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
              display="flex"
              justifyContent="space-between"
              marginBottom="8px"
            >
              <TimePicker
                label={t("settings.meeting-settings.intervals.available-from")}
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
                label={t("settings.meeting-settings.intervals.available-to")}
                value={addIntervalTo}
                ampm={false}
                minTime={addIntervalFrom}
                onChange={(newValue) => {
                  setAddIntervalTo(newValue);
                  if (isLater(newValue, addIntervalFrom)) {
                    setErrors({
                      availableTo: t(
                        "settings.meeting-settings.intervals.later-than-available-from"
                      ),
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
                return (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    marginBottom="8px"
                  >
                    <Typography marginRight="1%">
                      {t("settings.meeting-settings.intervals.except-from")}{" "}
                      {appendZero(exclusion.from.getHours())}:
                      {appendZero(exclusion.from.getMinutes())}{" "}
                      {t("settings.meeting-settings.intervals.to")}{" "}
                      {appendZero(exclusion.to.getHours())}:
                      {appendZero(exclusion.to.getMinutes())}
                      {t("settings.meeting-settings.intervals.harici")}
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
                      {t("settings.meeting-settings.intervals.remove")}
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
                    label={t(
                      "settings.meeting-settings.intervals.exclude-from"
                    )}
                    value={addIntervalExcludeFrom}
                    ampm={false}
                    minTime={addIntervalFrom}
                    maxTime={addIntervalTo}
                    onChange={(newValue) => {
                      setAddIntervalExcludeFrom(newValue);
                      if (isLaterOrEqual(newValue, addIntervalFrom))
                        setErrors({
                          addIntervalExcludeFrom: t(
                            "settings.meeting-settings.intervals.later-than-available-from"
                          ),
                        });
                      else if (isLaterOrEqual(addIntervalTo, newValue))
                        setErrors({
                          addIntervalExcludeFrom: t(
                            "settings.meeting-settings.intervals.earlier-than-available-to"
                          ),
                        });
                      else
                        setErrors({
                          addIntervalExcludeFrom: "",
                        });
                    }}
                    renderInput={(params) => (
                      <TextField
                        helperText={errors.addIntervalExcludeFrom}
                        sx={{ width: "49%" }}
                        {...params}
                      />
                    )}
                  />
                  <TimePicker
                    label={t("settings.meeting-settings.intervals.exclude-to")}
                    value={addIntervalExcludeTo}
                    ampm={false}
                    minTime={addIntervalExcludeFrom}
                    maxTime={addIntervalTo}
                    disabled={!isValueValid(addIntervalExcludeFrom)}
                    onChange={(newValue) => {
                      setAddIntervalExcludeTo(newValue);
                      if (isLater(newValue, addIntervalExcludeFrom))
                        setErrors({
                          addIntervalExcludeTo: t(
                            "settings.meeting-settings.intervals.later-than-exclude-from"
                          ),
                        });
                      else if (isLaterOrEqual(addIntervalTo, newValue))
                        setErrors({
                          addIntervalExcludeTo: t(
                            "settings.meeting-settings.intervals.earlier-than-available-to"
                          ),
                        });
                      else setErrors({ addIntervalExcludeTo: "" });
                    }}
                    renderInput={(params) => (
                      <TextField
                        helperText={errors.addIntervalExcludeTo}
                        sx={{ width: "49%" }}
                        {...params}
                      />
                    )}
                  />
                </Box>
                <Box display="flex">
                  <Button
                    variant="outlined"
                    sx={{ mr: "1%" }}
                    onClick={() => {
                      if (
                        //if values entered are valid
                        isValueValid(addIntervalExcludeFrom) &&
                        isValueValid(addIntervalExcludeTo)
                      ) {
                        if (addIntervalExclusions.length !== 0) {
                          //compare with previous exclusions
                          for (
                            let i = 0;
                            i < addIntervalExclusions.length;
                            i++
                          ) {
                            if (
                              //if exclude from is between previous exclusions
                              (isLaterOrEqual(
                                addIntervalExclusions[i].from,
                                addIntervalExcludeFrom
                              ) &&
                                isLaterOrEqual(
                                  addIntervalExcludeFrom,
                                  addIntervalExclusions[i].to
                                )) || //if exclude to is between previous exclusions
                              (isLaterOrEqual(
                                addIntervalExclusions[i].from,
                                addIntervalExcludeTo
                              ) &&
                                isLaterOrEqual(
                                  addIntervalExcludeTo,
                                  addIntervalExclusions[i].to
                                )) || //if exclude from and to encompasses previous exclusions
                              (isLaterOrEqual(
                                addIntervalExcludeFrom,
                                addIntervalExclusions[i].from
                              ) &&
                                isLaterOrEqual(
                                  addIntervalExclusions[i].to,
                                  addIntervalExcludeTo
                                ))
                            ) {
                              setErrors({
                                addIntervalExcludeFrom: t(
                                  "settings.meeting-settings.intervals.collided"
                                ),
                              });
                              return;
                            }
                          }
                          //if no collision found check if not between available times
                          if (
                            isLaterOrEqual(
                              addIntervalExcludeFrom,
                              addIntervalFrom
                            ) ||
                            isLaterOrEqual(
                              addIntervalTo,
                              addIntervalExcludeFrom
                            ) ||
                            isLaterOrEqual(
                              addIntervalExcludeTo,
                              addIntervalFrom
                            ) ||
                            isLaterOrEqual(addIntervalTo, addIntervalExcludeTo)
                          ) {
                            setErrors({
                              addIntervalExcludeFrom: t(
                                "settings.meeting-settings.intervals.between-available"
                              ),
                            });
                          } else {
                            //if between then proceed
                            setErrors({
                              addIntervalExcludeFrom: t(
                                "settings.meeting-settings.intervals.between-available"
                              ),
                            });
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
                          }
                        } else {
                          //if there's no previous exclusion check if between available times
                          if (
                            isLaterOrEqual(
                              addIntervalExcludeFrom,
                              addIntervalFrom
                            ) ||
                            isLaterOrEqual(
                              addIntervalTo,
                              addIntervalExcludeFrom
                            ) ||
                            isLaterOrEqual(
                              addIntervalExcludeTo,
                              addIntervalFrom
                            ) ||
                            isLaterOrEqual(addIntervalTo, addIntervalExcludeTo)
                          ) {
                            setErrors({
                              addIntervalExcludeFrom: t(
                                "settings.meeting-settings.intervals.between-available"
                              ),
                            });
                          } else {
                            //if between available times proceed
                            setErrors({
                              addIntervalExcludeFrom: "",
                            });
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
                          }
                        }
                      } else {
                        //if not valid
                        setErrors({
                          addIntervalExcludeFrom: t(
                            "settings.meeting-settings.intervals.valid-time"
                          ),
                        });
                      }
                    }}
                  >
                    {t(
                      "settings.meeting-settings.intervals.complete-exclusion"
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => {
                      if (addIntervalExclusions.length === 0) {
                        setIsAddIntervalFromToDisabled(false);
                      }
                      setAddIntervalExcludeFrom(null);
                      setAddIntervalExcludeTo(null);
                      setIsAddIntervalExcludeOpen(false);
                    }}
                  >
                    {t("settings.meeting-settings.intervals.cancel-exclusion")}
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
                      if (isLater(addIntervalFrom, addIntervalTo)) {
                        setErrors({ availableFrom: "" });
                        setIsAddIntervalExcludeOpen(true);
                        setIsAddIntervalFromToDisabled(true);
                      } else
                        setErrors({
                          availableFrom: t(
                            "settings.meeting-settings.intervals.available-not-valid"
                          ),
                        });
                    } else
                      setErrors({
                        availableFrom: t(
                          "settings.meeting-settings.intervals.enter-available"
                        ),
                      });
                  }}
                >
                  {t("settings.meeting-settings.intervals.exclude-interval")}
                </Button>
                <Typography variant="body2" color="GrayText">
                  {t("settings.meeting-settings.intervals.exclude-example")}
                </Typography>
              </Box>
            )}
          </LocalizationProvider>
          <Box marginBottom="8px">
            <FormControl>
              <RadioGroup defaultValue="preferred" name="priority">
                <FormControlLabel
                  value="preferred"
                  control={<Radio />}
                  label={t(
                    "settings.meeting-settings.intervals.meeting-preferred"
                  )}
                />
                <FormControlLabel
                  value="possible"
                  control={<Radio />}
                  label={t(
                    "settings.meeting-settings.intervals.meeting-possible"
                  )}
                />
              </RadioGroup>
            </FormControl>
          </Box>
          {isAddIntervalLoading ? <LinearProgress sx={{ mb: "8px" }} /> : <></>}
          <Box display="flex">
            <Button
              variant="contained"
              sx={{ mr: "1%" }}
              type="submit"
              disabled={isCompleteButtonDisabled}
            >
              {t("settings.meeting-settings.intervals.complete")}
            </Button>
            <Button
              variant="outlined"
              color="warning"
              onClick={(e) => {
                e.preventDefault();
                setIsAddIntervalOpen(false);
                setAddIntervalFrom(null);
                setAddIntervalTo(null);
                setAddIntervalExcludeFrom(null);
                setAddIntervalExcludeTo(null);
                setAddIntervalExclusions([]);
                setCheckedDays([]);
                setIsAddIntervalFromToDisabled(false);
                setIsAddIntervalExcludeOpen(false);
                setErrors({});
              }}
            >
              {t("settings.meeting-settings.intervals.cancel")}
            </Button>
          </Box>
        </form>
      </Box>
    );
  };

  function Interval(props) {
    const sortedExclusions = props.interval.exclusions.sort((a, b) =>
      a.begins.localeCompare(b.begins)
    );
    return (
      <Box>
        <Timeline sx={{ mb: "0px" }}>
          <Box display="flex" justifyContent="center" marginBottom="8px">
            {props.interval.priority === 0 ? (
              <Typography color="#2e7d32">
                {t(
                  "settings.meeting-settings.intervals.preferred-meeting-time"
                )}
              </Typography>
            ) : (
              <Typography color="#ef6c00">
                {t("settings.meeting-settings.intervals.possible-meeting-time")}
              </Typography>
            )}
          </Box>
          <Box display="flex" justifyContent="center" flexWrap="wrap">
            {props.interval.days.map((index) => (
              <Chip
                key={index}
                label={daysOfWeek[index]}
                sx={{ margin: "0 1% 8px 1%" }}
              />
            ))}
          </Box>
          <TimelineItem>
            <TimelineOppositeContent
              color="green"
              variant="body2"
              alignSelf="flex-end"
            >
              {t("settings.meeting-settings.intervals.available")}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="success" />
              <TimelineConnector sx={{ bgcolor: "success.light" }} />
            </TimelineSeparator>
            <TimelineContent>
              {appendZero(stringToTime(props.interval.begins).getHours())}:
              {appendZero(stringToTime(props.interval.begins).getMinutes())}
            </TimelineContent>
          </TimelineItem>
          {sortedExclusions.map((exclusion) => (
            <>
              <TimelineItem>
                <TimelineOppositeContent
                  color="grey.500"
                  variant="body2"
                  alignSelf="flex-end"
                >
                  {t("settings.meeting-settings.intervals.busy")}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="error" variant="outlined" />
                  <TimelineConnector sx={{ bgcolor: "error.light" }} />
                </TimelineSeparator>

                <TimelineContent>
                  {appendZero(stringToTime(exclusion.begins).getHours())}:
                  {appendZero(stringToTime(exclusion.begins).getMinutes())}
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineOppositeContent
                  color="green"
                  variant="body2"
                  alignSelf="flex-end"
                >
                  {t("settings.meeting-settings.intervals.available")}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="error" variant="outlined" />
                  <TimelineConnector
                    sx={{ height: "3px", bgcolor: "success.light" }}
                  />
                </TimelineSeparator>
                <TimelineContent>
                  {appendZero(stringToTime(exclusion.ends).getHours())}:
                  {appendZero(stringToTime(exclusion.ends).getMinutes())}
                </TimelineContent>
              </TimelineItem>
            </>
          ))}
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="success" />
            </TimelineSeparator>
            <TimelineContent>
              {appendZero(stringToTime(props.interval.ends).getHours())}:
              {appendZero(stringToTime(props.interval.ends).getMinutes())}
            </TimelineContent>
          </TimelineItem>
        </Timeline>
        <Box display="flex" justifyContent="center">
          <Button
            sx={{ mb: "16px" }}
            onClick={(e) => {
              handleRemoveInterval(e, props.interval.id);
            }}
          >
            {t("settings.meeting-settings.intervals.remove")}
          </Button>
        </Box>
        <Divider sx={{ mb: "16px" }} />
      </Box>
    );
  }

  return (
    <Box
      padding="8px 2%"
      marginTop="16px"
      border="2px solid #f0f0f4"
      borderRadius="5px"
    >
      <Typography marginBottom="16px">
        {t("settings.meeting-settings.intervals.times-available")}:
      </Typography>
      <Box>
        {intervals.map((interval) => {
          return <Interval key={interval.id} interval={interval} />;
        })}
      </Box>
      {isAddIntervalOpen ? (
        renderAddInterval()
      ) : (
        <Button variant="contained" onClick={() => setIsAddIntervalOpen(true)}>
          {t("settings.meeting-settings.intervals.add-interval")}
        </Button>
      )}
    </Box>
  );
}
