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

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"])),
      user,
      countries,
      meetingCountryId,
      cities,
      addresses,
      locations,
      // Will be passed to the page component as props
    },
  };
});

// const ContainerWrapper = styled(Container)(({ theme }) => ({
//   [theme.breakpoints.down("md")]: { disableGutters: true },
// }));

export default function MeetingSettings(props) {
  const { t } = useTranslation();
  return (
    <Layout props>
      <ConsultantSettingsLayout
        heading={t("settings.meeting-settings.meeting-settings-title")}
        {...props}
      >
        <Container disableGutters="true">
          <Addresses
            countries={props.countries}
            meetingCountryId={props.meetingCountryId}
            cities={props.cities}
            addresses={props.addresses}
            locations={props.locations}
            {...props}
          />
          <TimesAvailable />
        </Container>
      </ConsultantSettingsLayout>
    </Layout>
  );
}
