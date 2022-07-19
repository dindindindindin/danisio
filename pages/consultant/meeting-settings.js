import Layout from "../../components/Layout";
import ConsultantSettingsLayout from "../../components/Consultant/ConsultantSettingsLayout";
import { withConsultantAuth } from "../../lib/HOC/withAuthSSR";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Container from "@mui/material/Container";
import Addresses from "../../components/Consultant/MeetingSettings/Addresses";
import query from "../../db";
import TimesAvailable from "../../components/Consultant/MeetingSettings/TimesAvailable";
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

  //retrieve countries
  const countriesRes = await query(
    "SELECT countries.id, country, region, has_states, state_variant FROM countries INNER JOIN regions ON regions.id = countries.region_id;"
  );
  const countries = JSON.parse(JSON.stringify(countriesRes));

  //retrieve id and meeting country from db
  const dbUserRes = await query(
    `SELECT users.id, country_id FROM consultants INNER JOIN users ON users.id = consultants.user_id WHERE email = '${user.email}';`
  );
  const meetingCountryId = dbUserRes[0].country_id;
  const userId = dbUserRes[0].id;

  //retrieve cities
  const citiesRes = await query(
    `SELECT cities.id, city, state FROM cities LEFT JOIN states ON states.id = cities.state_id WHERE cities.country_id = ${meetingCountryId};`
  );
  const cities = JSON.parse(JSON.stringify(citiesRes));

  //retrieve consultant_addresses
  const addressesRes = await query(
    `SELECT consultant_addresses.id, city_id, address, is_primary, city, state FROM consultant_addresses INNER JOIN cities ON cities.id = consultant_addresses.city_id LEFT JOIN states ON states.id = cities.state_id WHERE user_id = ${userId};`
  );
  const addresses = JSON.parse(JSON.stringify(addressesRes));

  //retrieve consultant_locations
  const locationsRes = await query(
    `SELECT consultant_locations.id, city_id, location, city, state FROM consultant_locations INNER JOIN cities ON cities.id = consultant_locations.city_id LEFT JOIN states ON states.id = cities.state_id WHERE user_id = ${userId};`
  );
  const locations = JSON.parse(JSON.stringify(locationsRes));

  ///////////////////////////////////////////////////////

  const stringToTimeString = (hour, min) => {
    let date = new Date();
    date.setHours(parseInt(hour), parseInt(min));
    return date.toTimeString();
  };

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

  console.log(intervalsArr);

  ///////////////////////////////////////////////////////

  return {
    props: {
      ...(await serverSideTranslations(context.locale, [
        "settings",
        "countries",
        "nav",
      ])),
      user,
      countries,
      meetingCountryId,
      cities,
      addresses,
      locations,
      intervalsArr,
      // Will be passed to the page component as props
    },
  };
});

// const ContainerWrapper = styled(Container)(({ theme }) => ({
//   [theme.breakpoints.down("md")]: { disableGutters: true },
// }));

export default function MeetingSettings(props) {
  const { t } = useTranslation("settings");
  return (
    <Layout>
      <ConsultantSettingsLayout
        heading={t("settings.meeting-settings.meeting-settings-title")}
      >
        <Container disableGutters={true}>
          <Addresses
            countries={props.countries}
            meetingCountryId={props.meetingCountryId}
            cities={props.cities}
            addresses={props.addresses}
            locations={props.locations}
          />
          <TimesAvailable intervals={props.intervalsArr} />
        </Container>
      </ConsultantSettingsLayout>
    </Layout>
  );
}
