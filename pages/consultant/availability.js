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

  ///////////////////////////////////////////////////////

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

const steps = [
  {
    label: "Select campaign settings",
    description: `For each ad campaign that you create, you can control how much
                you're willing to spend on clicks and conversions, which networks
                and geographical locations you want your ads to show on, and more.`,
  },
  {
    label: "Create an ad group",
    description:
      "An ad group contains one or more ads which target a shared set of keywords.",
  },
  {
    label: "Create an ad",
    description: `Try out different ad text to see what brings in the most customers,
                and learn how to enhance your ads using features like ad extensions.
                If you run into any problems with your ads, find out how to tell if
                they're running and how to resolve approval issues.`,
  },
];

export default function Availability(props) {
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
  return (
    <Layout>
      <ConsultantSettingsLayout
        heading={t("availability-title", { ns: "titles" })}
      >
        <Container disableGutters={true}>
          <Box>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    optional={
                      index === 2 ? (
                        <Typography variant="caption">Last step</Typography>
                      ) : null
                    }
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography>{step.description}</Typography>
                    <Box sx={{ mb: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          {index === steps.length - 1 ? "Finish" : "Continue"}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            {activeStep === steps.length && (
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
