import Layout from "../../components/Layout";
import ConsultantSettingsLayout from "../../components/Consultant/ConsultantSettingsLayout";
import { withConsultantAuth } from "../../lib/HOC/withAuthSSR";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Container from "@mui/material/Container";

import PhoneNumbers from "../../components/Consultant/ContactSettings/PhoneNumbers";
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

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"])),
      user,

      // Will be passed to the page component as props
    },
  };
});

// const ContainerWrapper = styled(Container)(({ theme }) => ({
//   [theme.breakpoints.down("md")]: { disableGutters: true },
// }));

export default function ContactSettings(props) {
  const { t } = useTranslation();
  return (
    <Layout props>
      <ConsultantSettingsLayout
        heading={t("settings.contact-settings.contact-settings-title")}
        {...props}
      >
        <Container disableGutters={true}>
          <PhoneNumbers {...props} />
        </Container>
      </ConsultantSettingsLayout>
    </Layout>
  );
}
