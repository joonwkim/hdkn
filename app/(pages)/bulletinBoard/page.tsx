import { getBlogs } from "@/app/services/blogService";
import BulletinBoard from "./BulletinBoard";

const Page = () => {
  const blogs = getBlogs();
  return (
    <div>
      <div>
        {JSON.stringify(blogs, null, 2)}
      </div>
      <BulletinBoard />
    </div>
  );
};
export default Page;
