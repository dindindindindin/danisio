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
  const dbRes = await query(
    `SELECT users.id, profile_picture_url, first_name, last_name, about FROM consultants INNER JOIN users ON users.id = consultants.user_id WHERE email = '${user.email}'`
  );
  console.log("userId profilePic dbRes: ", dbRes);
  const profilePicUrl = dbRes[0].profile_picture_url;
  const userId = dbRes[0].id;

  //if null change to empty string
  if (dbRes[0].first_name === null) var firstName = "";
  else var firstName = dbRes[0].first_name;
  if (dbRes[0].last_name === null) var lastName = "";
  else var lastName = dbRes[0].last_name;
  if (dbRes[0].about === null) var aboutMe = "";
  else var aboutMe = dbRes[0].about;

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"])),
      user,
      profilePicUrl,
      userId,
      firstName,
      lastName,
      aboutMe,
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
          </Container>
        </ConsultantSettingsLayout>
      </Layout>
    </>
  );
}
