import Layout from "../../components/Layout";
import { userAuth } from "../../lib/HOC/withAuthSSR";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps = userAuth(async (context) => {
  console.log("context: ", context);
  const user = context.req.user;
  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"])),
      user,
      // Will be passed to the page component as props
    },
  };
});

export default function ChangePassword(props) {
  console.log("props: ", props.user);
  return <Layout props />;
}
