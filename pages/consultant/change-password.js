import Layout from "../../components/Layout";
import ConsultantSettingsLayout from "../../components/Consultant/ConsultantSettingsLayout";
import { withConsultantAuth } from "../../lib/HOC/withAuthSSR";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { auth } from "../../firebase.config";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import { updatePassword } from "firebase/auth";
import { styled } from "@mui/material/styles";

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  [theme.breakpoints.down("xs")]: {
    flexDirection: "column",
    alignItems: "center",
  },
}));
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
}));
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginTop: "0",
}));

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

export default function ChangePassword(props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successful, setSuccessful] = useState(false);

  const { t } = useTranslation();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (validate()) {
      try {
        await updatePassword(user, password);
        setPassword("");
        setConfirmPassword("");
        setLoading(false);
        setSuccessful(true);
      } catch (error) {
        const errorCode = error.code;
        setLoading(false);

        if (errorCode === "auth/weak-password") {
          setErrors({ password: t("account.firebase.weakpw") });
        } else if (errorCode === "auth/requires-recent-login") {
          setErrors({
            confirmPassword: t("settings.changepw.loginagain"),
          });
        } else {
          setErrors({ confirmPassword: error.message });
          console.log(errorCode);
        }
      }
    }
  };

  const validate = () => {
    let currentErrors = {};
    let isValid = true;

    if (!password) {
      setLoading(false);
      isValid = false;
      currentErrors["password"] = t("account.validate.enterpw");
    }

    if (!confirmPassword) {
      setLoading(false);
      isValid = false;
      currentErrors["confirmPassword"] = t("account.validate.pwagain");
    }

    if (password !== "" && confirmPassword !== "") {
      if (password !== confirmPassword) {
        setLoading(false);
        isValid = false;
        currentErrors["password"] = t("account.validate.pwdonotmatch");
      }
    }
    setErrors(currentErrors);

    return isValid;
  };

  return (
    <Layout props>
      <ConsultantSettingsLayout heading={t("settings.changepw.changepwtitle")}>
        <Wrapper>
          <StyledPaper>
            <form noValidate>
              <StyledTextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label={t("settings.changepw.newpw")}
                type="password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <Typography color="error">{errors.password}</Typography>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label={t("settings.changepw.repeatnewpw")}
                type="password"
                autoComplete="current-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
              <Typography color="error">{errors.confirmPassword}</Typography>
              {loading && <LinearProgress />}
              {successful && (
                <Typography color="primary">
                  {t("settings.changepw.changepwsuccess")}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                {t("settings.changepw.changepw")}
              </Button>
            </form>
          </StyledPaper>
        </Wrapper>
      </ConsultantSettingsLayout>
    </Layout>
  );
}
