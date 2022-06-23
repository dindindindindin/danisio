import { useState } from "react";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import Box from "@mui/material/Box";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import axios from "axios";
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

export default function ProfilePicture(props) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(props.profilePicUrl);

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

    //force rerender (currently doesn't work)
    if (profileImageUrl === `/images/${props.userId}/profile-picture.jpg`) {
      setProfileImageUrl(
        `http://localhost:3000/images/${props.userId}/profile-picture.jpg`
      );
    } else setProfileImageUrl(`/images/${props.userId}/profile-picture.jpg`);

    //for consecutive onChange
    e.target.value = "";

    console.log("image client dbRes: ", dbRes);
  };

  const handleImageRemoval = async () => {
    //api call
    await axios.put("/api/consultant/profile-settings/profile-picture-remove");

    //set state to default pic
    setProfileImageUrl("/images/default-profile-picture.png");
  };

  return (
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
          <IconButton component="span" color="primary">
            <AddPhotoAlternateIcon />
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
        <IconButton color="error" onClick={handleImageRemoval}>
          <DeleteForeverIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
