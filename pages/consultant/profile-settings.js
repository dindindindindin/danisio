import Layout from "../../components/Layout";
import ConsultantSettingsLayout from "../../components/MemberSettingsLayout";
import { withConsultantAuth } from "../../lib/HOC/withAuthSSR";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { styled } from "@mui/material/styles";

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

export default function ProfileSettings(props) {
  const { t } = useTranslation();
  return (
    <Layout props>
      <ConsultantSettingsLayout
        heading={t("settings.changepw.changepwtitle")}
      ></ConsultantSettingsLayout>
    </Layout>
  );
}
