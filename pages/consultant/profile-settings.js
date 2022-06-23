import Layout from "../../components/Layout";
import ConsultantSettingsLayout from "../../components/MemberSettingsLayout";
import { withConsultantAuth } from "../../lib/HOC/withAuthSSR";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState, useCallback } from "react";
import { styled } from "@mui/material/styles";
import Head from "next/head";
import Image from "next/image";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import axios from "axios";
import query from "../../db";
import IconButton from "@mui/material/IconButton";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const StyledImage = styled(Image)(({ theme }) => ({
  borderRadius: "50%",
}));
const FileInputForm = styled("form")`
  all: unset !important;
`;
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

  //retrieve id and profilePicUrl from db
  const dbRes = await query(
    `SELECT users.id, profile_picture_url FROM consultants INNER JOIN users ON users.id = consultants.user_id WHERE email = '${user.email}'`
  );
  console.log("userId profilePic dbRes: ", dbRes);
  const profilePic = dbRes[0].profile_picture_url;
  const userId = dbRes[0].id;

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"])),
      user,
      profilePic,
      userId,
      // Will be passed to the page component as props
    },
  };
});

export default function ProfileSettings(props) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(props.profilePic);

  const { t } = useTranslation();

  const handleImageInput = async (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);

    //populate formData
    var formData = new FormData();
    formData.append("imagefile", file);

    //api call
    const dbRes = await axios.post(
      "/api/consultant/profile-settings/profile-picture-upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    //force rerender
    if (profileImageUrl === `/images/${props.userId}/profile-picture.jpg`) {
      setProfileImageUrl(
        `http://localhost:3000/images/${props.userId}/profile-picture.jpg`
      );
    } else setProfileImageUrl(`/images/${props.userId}/profile-picture.jpg`);

    e.target.value = "";

    console.log("image client dbRes: ", dbRes);
  };

  const handleImageRemoval = async () => {
    await axios.put("/api/consultant/profile-settings/profile-picture-remove");
    setProfileImageUrl("/images/default-profile-picture.png");
  };

  return (
    <>
      <Head>
        <meta http-equiv="cache-control" content="no-cache" />
      </Head>
      <Layout props>
        <ConsultantSettingsLayout
          heading={t("settings.changepw.changepwtitle")}
        >
          <Container>
            <Box display="flex" justifyContent="center">
              <StyledImage
                src={profileImageUrl}
                alt="Consultant profile picture"
                key={Date.now()}
                width="150"
                height="150"
              />
              <Box alignSelf="flex-end">
                <label htmlFor="file-input">
                  <IconButton component="span">
                    <AddPhotoAlternateIcon sx={{ color: "gray" }} />
                  </IconButton>
                </label>
                <FileInputForm>
                  <FileInput
                    id="file-input"
                    type="file"
                    name="imagefile"
                    accept="image/*"
                    onChange={(e) => {
                      handleImageInput(e);
                    }}
                  />
                </FileInputForm>
              </Box>
              <Box alignSelf="flex-end">
                <IconButton onClick={handleImageRemoval}>
                  <DeleteForeverIcon />
                </IconButton>
              </Box>
            </Box>
          </Container>
        </ConsultantSettingsLayout>
      </Layout>
    </>
  );
}
