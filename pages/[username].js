import { useRouter } from "next/router";

export default function Profile(props) {
  const router = useRouter();
  const { username } = router.query;
  return <p>hello {username}</p>;
}
