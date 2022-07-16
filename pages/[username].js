import { useRouter } from "next/router";
import query from "../db";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "../components/Layout";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

import { styled } from "@mui/material/styles";
import Image from "next/image";
import { Typography } from "@mui/material";

export async function getServerSideProps({ locale, params }) {
  //retrieve id, first, last
  const idFirstLast = await query(
    `SELECT user_id, first_name, last_name FROM consultants WHERE username = '${params.username}';`
  );
  console.log(idFirstLast[0].first_name);
  const firstName = idFirstLast[0].first_name;
  const lastName = idFirstLast[0].last_name;

  //if no first last, redirect
  if (
    firstName === null ||
    firstName === "" ||
    lastName === null ||
    lastName === ""
  ) {
    return { redirect: { destination: "/" } };
  }

  //retrieve about pp meetingCountry
  const profileInfoRes = await query(
    `SELECT about, profile_picture_url, country, has_states, state_variant FROM consultants LEFT JOIN countries ON countries.id = consultants.country_id WHERE user_id = ${idFirstLast[0].user_id};`
  );
  const profileInfo = JSON.parse(JSON.stringify(profileInfoRes));

  if (profileInfo[0].country === null) profileInfo[0].country = "";
  if (profileInfo[0].about === null) profileInfo[0].about = "";

  //retieve city state address
  const addressRes = await query(
    `SELECT address, city, state FROM consultant_addresses INNER JOIN cities ON cities.id = consultant_addresses.city_id LEFT JOIN states ON states.id = cities.state_id WHERE user_id = ${idFirstLast[0].user_id} AND is_primary = 1;`
  );
  let address = JSON.parse(JSON.stringify(addressRes));

  //if no address assign empty string
  if (address.length === 0) address[0] = { address: "", city: "", state: "" };
  else if (address[0].state === null) address[0].state = "";

  //retrieve consultant countries
  const consultantCountriesRes = await query(
    `SELECT country FROM consultant_countries INNER JOIN countries ON countries.id = consultant_countries.country_id WHERE user_id = ${idFirstLast[0].user_id};`
  );
  const consultantCountries = JSON.parse(
    JSON.stringify(consultantCountriesRes)
  );

  //retrieve consultant services
  const consultantServicesRes = await query(
    `SELECT service FROM consultant_services INNER JOIN services ON services.id = consuntant_services.service_id WHERE user_id = ${idFirstLast[0].user_id};`
  );
  const consultantServices = JSON.parse(JSON.stringify(consultantServicesRes));

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      firstName,
      lastName,
      profileInfo,
      address,
      consultantCountries,
      consultantServices,
      // Will be passed to the page component as props
    },
  };
}

const StyledImage = styled(Image)(({ theme }) => ({
  borderRadius: "50%",
}));

export default function Profile(props) {
  const router = useRouter();
  const { username } = router.query;
  console.log(props.profileInfo);
  return (
    <Layout props>
      <Container disableGutters={true} maxWidth="sm">
        <Box
          padding="8px 2%"
          marginTop="16px"
          border="2px solid #f0f0f4"
          borderRadius="5px"
        >
          <Box display="flex" justifyContent="center">
            <StyledImage
              src={props.profileInfo[0].profile_picture_url}
              alt="Consultant profile picture"
              width="150"
              height="150"
            />
          </Box>
          <Box display="flex" justifyContent="center" marginTop="16px">
            <Typography variant="h5">
              {props.firstName} {props.lastName}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" marginTop="16px">
            <Typography color="#616161">
              {props.address[0].city +
                (props.address[0].city === "" ? "" : ", ") +
                props.address[0].state +
                (props.address[0].state === "" ? "" : ", ") +
                props.profileInfo[0].country}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" marginTop="16px">
            <Typography variant="body2" color="#616161">
              {props.address[0].address}
            </Typography>
          </Box>
        </Box>
        <Box
          padding="8px 2%"
          marginTop="16px"
          border="2px solid #f0f0f4"
          borderRadius="5px"
        >
          <Typography>{props.profileInfo[0].about}</Typography>
        </Box>
      </Container>
    </Layout>
  );
}
