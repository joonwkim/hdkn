import { getBlogs } from "@/app/services/blogService";
import BulletinBoard from "./BulletinBoard";

const Page = async () => {
  const blogsData = await getBlogs();

  if (typeof blogsData === "string") {
    return <div>Error: {blogsData}</div>;
  }

  return (
    <BulletinBoard blogs={blogsData.props} />
  );
};

export default Page;