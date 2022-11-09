import Layout from "../../components/Layout";
import ConsultantSettingsLayout from "../../components/Consultant/ConsultantSettingsLayout";
import { withConsultantAuth } from "../../lib/HOC/withAuthSSR";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import query from "../../db";
import { useState } from "react";
//import { styled } from "@mui/material/styles";

export const getServerSideProps = withConsultantAuth(async (context, error) => {
  const user = context.req.user;

  if (error) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const stringToTimeString = (hour, min) => {
    let date = new Date();
    date.setHours(parseInt(hour), parseInt(min));
    return date.toTimeString();
  };

  //retrieve id and meeting country from db
  const dbUserRes = await query(
    `SELECT users.id, country_id FROM consultants INNER JOIN users ON users.id = consultants.user_id WHERE email = '${user.email}';`
  );
  const meetingCountryId = dbUserRes[0].country_id;
  const userId = dbUserRes[0].id;

  //retrieve intervals
  var intervalsRes = await query(
    `SELECT id, hour_begins, min_begins, hour_ends, min_ends, priority_id FROM time_intervals WHERE user_id = ${userId};`
  );
  const intervals = JSON.parse(JSON.stringify(intervalsRes));

  let intervalsArr = [];

  //for each interval
  for (let i = 0; i < intervals.length; i++) {
    //retrieve dayIds
    var dayIdsRes = await query(
      `SELECT day_id FROM time_interval_days WHERE time_interval_id = ${intervals[i].id};`
    );

    let dayIds = dayIdsRes.map((dayId) => dayId.day_id);

    //retrieve exclusions
    var exclusionsRes = await query(
      `SELECT hour_begins, min_begins, hour_ends, min_ends FROM time_exclusions WHERE time_interval_id = ${intervals[i].id};`
    );

    //parse exclusionsRes to time
    const exclusions = exclusionsRes.map((exclusion) => ({
      begins: stringToTimeString(exclusion.hour_begins, exclusion.min_begins),
      ends: stringToTimeString(exclusion.hour_ends, exclusion.min_ends),
    }));

    //create an array for response
    intervalsArr.push({
      id: intervals[i].id,
      begins: stringToTimeString(
        intervals[i].hour_begins,
        intervals[i].min_begins
      ),
      ends: stringToTimeString(intervals[i].hour_ends, intervals[i].min_ends),
      priority: intervals[i].priority_id,
      days: dayIds,
      exclusions: exclusions,
    });
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, [
        "availability",
        "titles",
        "nav",
      ])),
      user,
      intervalsArr,
      // Will be passed to the page component as props
    },
  };
});

export default function Availability(props) {
  const [preferredBegins, setPreferredBegins] = useState(null);
  const [preferredEnds, setPreferredEnds] = useState(null);

  const { t } = useTranslation(["availability", "titles"]);
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
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

  return (
    <Layout>
      <ConsultantSettingsLayout
        heading={t("availability-title", { ns: "titles" })}
      >
        <Container disableGutters={true}>
          <Box>
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step>
                <StepLabel>Let's begin</StepLabel>
                <StepContent>
                  <Typography sx={{ mb: 1 }}>
                    There are 2 kinds of time range. The time you prefer to meet
                    and the time it is still possible to meet. After you choose
                    them, you can choose the days it applies to.
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(1)}
                    >
                      Continue
                    </Button>
                  </Box>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Time preferred</StepLabel>
                <StepContent>
                  <Typography sx={{ mb: 1 }}>
                    Please choose the time range you prefer to meet at. Click on
                    the icon to choose visually.
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box
                      display="flex"
                      flexWrap="wrap"
                      gap={1}
                      marginBottom={1}
                    >
                      <TimePicker
                        label="Begins"
                        value={preferredBegins}
                        ampm={false}
                        maxTime={preferredEnds}
                        onChange={(newValue) => {
                          setPreferredBegins(newValue);
                        }}
                        // disabled={isAddIntervalFromToDisabled}
                        renderInput={(params) => (
                          <TextField
                            // helperText={errors.availableFrom}
                            {...params}
                          />
                        )}
                      />
                      <TimePicker
                        label="Ends"
                        value={preferredEnds}
                        ampm={false}
                        minTime={preferredBegins}
                        onChange={(newValue) => {
                          setPreferredEnds(newValue);
                        }}
                        disabled={!isValueValid(preferredBegins)}
                        renderInput={(params) => (
                          <TextField
                            // helperText={errors.availableFrom}
                            {...params}
                          />
                        )}
                      />
                    </Box>
                  </LocalizationProvider>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    You can skip this step if it's only possible to meet on
                    these days.
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} marginBottom={1}>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(2)}
                    >
                      Continue
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => setActiveStep(2)}
                    >
                      Skip
                    </Button>
                    <Button onClick={() => setActiveStep(0)}>Back</Button>
                  </Box>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Time possible</StepLabel>
                <StepContent>
                  <Typography>Some text.</Typography>
                  <Box sx={{ mb: 1 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Continue
                      </Button>
                      <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Choose days</StepLabel>
                <StepContent>
                  <Typography>Some text.</Typography>
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Finish
                      </Button>
                      <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
            {activeStep === 4 && (
              <Paper square elevation={0} sx={{ p: 3 }}>
                <Typography>
                  All steps completed - you&apos;re finished
                </Typography>
                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                  Reset
                </Button>
              </Paper>
            )}
          </Box>
        </Container>
      </ConsultantSettingsLayout>
    </Layout>
  );
}
