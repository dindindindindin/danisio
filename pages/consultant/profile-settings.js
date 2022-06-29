import Layout from "../../components/Layout";
import ConsultantSettingsLayout from "../../components/Consultant/ConsultantSettingsLayout";
import { withConsultantAuth } from "../../lib/HOC/withAuthSSR";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import Container from "@mui/material/Container";
import query from "../../db";
import ProfilePicture from "../../components/Consultant/ProfileSettings/ProfilePicture";
import FirstLastAbout from "../../components/Consultant/ProfileSettings/FirstLastAbout";
import Countries from "../../components/Consultant/ProfileSettings/Countries";
import Services from "../../components/Consultant/ProfileSettings/Services";

export const getServerSideProps = withConsultantAuth(async (context, error) => {
  const user = context.req.user;

  if (error) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  //retrieve id and profilePicUrl from db
  const dbUserRes = await query(
    `SELECT users.id, profile_picture_url, first_name, last_name, about FROM consultants INNER JOIN users ON users.id = consultants.user_id WHERE email = '${user.email}';`
  );
  const profilePicUrl = dbUserRes[0].profile_picture_url;
  const userId = dbUserRes[0].id;

  //if null change to empty string
  if (dbUserRes[0].first_name === null) var firstName = "";
  else var firstName = dbUserRes[0].first_name;
  if (dbUserRes[0].last_name === null) var lastName = "";
  else var lastName = dbUserRes[0].last_name;
  if (dbUserRes[0].about === null) var aboutMe = "";
  else var aboutMe = dbUserRes[0].about;

  //retrieve countries
  const countriesRes = await query(
    "SELECT countries.id, country, region FROM countries INNER JOIN regions ON regions.id = countries.region_id WHERE is_consultant_country = true;"
  );
  const countries = JSON.stringify(countriesRes);

  //retrieve consultant countries
  const consultantCountriesRes = await query(
    `SELECT country_id FROM consultant_countries WHERE user_id = ${userId};`
  );
  const consultantCountriesObj = JSON.parse(
    JSON.stringify(consultantCountriesRes)
  );

  //push the ids into array
  let consultantCountries = [];
  consultantCountriesObj.map((country) => {
    consultantCountries.push(country.country_id);
  });

  //retrieve services
  const servicesRes = await query("SELECT id, service FROM services;");
  const services = JSON.parse(JSON.stringify(servicesRes));

  //retrieve consultant services
  const consultantServicesRes = await query(
    `SELECT service_id FROM consultant_services WHERE user_id = ${userId};`
  );
  const consultantServicesObj = JSON.parse(
    JSON.stringify(consultantServicesRes)
  );

  //push the ids into array
  let consultantServices = [];
  consultantServicesObj.map((service) => {
    consultantServices.push(service.service_id);
  });

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"])),
      user,
      profilePicUrl,
      userId,
      firstName,
      lastName,
      aboutMe,
      countries,
      consultantCountries,
      services,
      consultantServices,
      // Will be passed to the page component as props
    },
  };
});

export default function ProfileSettings(props) {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <meta http-equiv="cache-control" content="no-cache, must-revalidate" />
      </Head>
      <Layout props>
        <ConsultantSettingsLayout
          heading={t("settings.profile-settings.profile-settings-title")}
          {...props}
        >
          <Container>
            <ProfilePicture
              profilePicUrl={props.profilePicUrl}
              userId={props.userId}
            />
            <FirstLastAbout
              firstName={props.firstName}
              lastName={props.lastName}
              aboutMe={props.aboutMe}
              {...props}
            />
            <Countries
              countries={props.countries}
              consultantCountries={props.consultantCountries}
              {...props}
            />
            <Services
              services={props.services}
              consultantServices={props.consultantServices}
              {...props}
            />
          </Container>
        </ConsultantSettingsLayout>
      </Layout>
    </>
  );
}
