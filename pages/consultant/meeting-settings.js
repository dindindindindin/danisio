import Layout from "../../components/Layout";
import ConsultantSettingsLayout from "../../components/Consultant/ConsultantSettingsLayout";
import { withConsultantAuth } from "../../lib/HOC/withAuthSSR";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Container from "@mui/material/Container";
import Addresses from "../../components/Consultant/MeetingSettings/Addresses";
import query from "../../db";

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
  const countriesRes = await query("SELECT id, name, region FROM countries");
  const countries = JSON.parse(JSON.stringify(countriesRes));

  //retrieve id and meeting country from db
  const dbUserRes = await query(
    `SELECT users.id, country_id FROM consultants INNER JOIN users ON users.id = consultants.user_id WHERE email = '${user.email}'`
  );
  const meetingCountryId = dbUserRes[0].country_id;
  const userId = dbUserRes[0].id; //is it needed?

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"])),
      user,
      countries,
      meetingCountryId,
      // Will be passed to the page component as props
    },
  };
});

export default function MeetingSettings(props) {
  const { t } = useTranslation();
  return (
    <Layout props>
      <ConsultantSettingsLayout
        heading={t("settings.meeting-settings.meeting-settings-title")}
        {...props}
      >
        <Container>
          <Addresses
            countries={props.countries}
            meetingCountryId={props.meetingCountryId}
            {...props}
          />
        </Container>
      </ConsultantSettingsLayout>
    </Layout>
  );
}
