import Layout from "../../components/Layout";
import ConsultantSettingsLayout from "../../components/Consultant/ConsultantSettingsLayout";
import { withConsultantAuth } from "../../lib/HOC/withAuthSSR";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Container from "@mui/material/Container";
import Addresses from "../../components/Consultant/MeetingSettings/Addresses";

export const getServerSideProps = withConsultantAuth(async (context, error) => {
  const user = context.req.user;

  if (error) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"])),
      user,
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
          <Addresses />
        </Container>
      </ConsultantSettingsLayout>
    </Layout>
  );
}
