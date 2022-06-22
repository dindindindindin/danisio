import Layout from "../../components/Layout";
import ConsultantSettingsLayout from "../../components/MemberSettingsLayout";
import { withConsultantAuth } from "../../lib/HOC/withAuthSSR";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import axios from "axios";

const StyledImage = styled(Image)(({ theme }) => ({
  borderRadius: "50%",
}));
const FileInput = styled("input")`
  visibility: hidden;
  width: 0;
  height: 0;
`;

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
  const [selectedImage, setSelectedImage] = useState(null);
  const { t } = useTranslation();

  const handleImageInput = async (file) => {
    setSelectedImage(file);
    console.log("selected image: ", file);
    var formData = new FormData();
    formData.append("imagefile", file);
    console.log("formdata: ", formData.get("imagefile"));
    const dbRes = await axios.post(
      "/api/consultant/profile-settings/profile-picture-upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("image client dbRes: ", dbRes);
  };

  return (
    <Layout props>
      <ConsultantSettingsLayout heading={t("settings.changepw.changepwtitle")}>
        <Container>
          <Box display="flex" justifyContent="center">
            <StyledImage
              src="/images/default-profile-picture.png"
              alt="Default profile picture"
              width="150"
              height="150"
            />
            <Box alignSelf="flex-end">
              <label htmlFor="file-input">
                <AddPhotoAlternateIcon sx={{ color: "gray" }} />
              </label>
              <form>
                <FileInput
                  id="file-input"
                  type="file"
                  name="imagefile"
                  accept="image/*"
                  onChange={(e) => {
                    handleImageInput(e.target.files[0]);
                  }}
                />
              </form>
            </Box>
          </Box>
        </Container>
      </ConsultantSettingsLayout>
    </Layout>
  );
}
