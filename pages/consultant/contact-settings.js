import Layout from "../../components/Layout";
import ConsultantSettingsLayout from "../../components/Consultant/ConsultantSettingsLayout";
import { withConsultantAuth } from "../../lib/HOC/withAuthSSR";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import query from "../../db";
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

  //retrieve id and meeting country from db
  const dbUserRes = await query(
    `SELECT users.id, country_id FROM consultants INNER JOIN users ON users.id = consultants.user_id WHERE email = '${user.email}';`
  );
  const meetingCountryId = dbUserRes[0].country_id;
  const userId = dbUserRes[0].id;

  //retrieve contact types
  const contactTypesRes = await query("SELECT id, type FROM contact_types;");
  const contactTypes = JSON.parse(JSON.stringify(contactTypesRes));

  //retrieve phone numbers
  const phoneNumbersRes = await query(
    `SELECT phone_numbers.id, number, dial_code, type FROM phone_numbers INNER JOIN contact_types ON contact_types.id = phone_numbers.contact_type_id WHERE user_id = ${userId};`
  );
  const phoneNumbers = JSON.parse(JSON.stringify(phoneNumbersRes));

  //retrieve country code of the consultant's country
  const consultantCountryCodeRes = await query(
    `SELECT code FROM countries WHERE id = ${meetingCountryId};`
  );
  const consultantCountryCode = JSON.parse(
    JSON.stringify(consultantCountryCodeRes)
  );

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"])),
      user,
      contactTypes,
      phoneNumbers,
      consultantCountryCode,
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
          <PhoneNumbers
            contactTypes={props.contactTypes}
            phoneNumbers={props.phoneNumbers}
            consultantCountryCode={props.consultantCountryCode}
            {...props}
          />
        </Container>
      </ConsultantSettingsLayout>
    </Layout>
  );
}
