import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import Layout from "../components/Layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
//import withAuthUser from "../lib/HOC/withAuthUser";

const Wrapper = styled("div")(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.paper,
}));
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      // Will be passed to the page component as props
    },
  };
}
function TabPanel(props) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
    >
      {value === index && <Box p={1}>{children}</Box>}
    </div>
  );
}

const Account = (props) => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const { t } = useTranslation();
  const router = useRouter();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (user && user.token) router.push("/");
  }, [user]);
  return (
    <Layout props>
      <Container maxWidth="xs">
        <Wrapper>
          <Tabs value={currentTab} variant="fullWidth" onChange={handleChange}>
            <Tab label={t("account.login")} />
            <Tab label={t("account.signup")} />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            <LoginForm handleChange={handleChange} />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <SignupForm handleChange={handleChange} />
          </TabPanel>
        </Wrapper>
      </Container>
    </Layout>
  );
};
export default Account;
