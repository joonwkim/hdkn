export const revalidate = 0;
import { getBlogs } from "@/app/services/blogService";
import BulletinBoard from "./BulletinBoard";
import { getUserPreferences } from "@/app/services/userPreference";
import ThemeToggle from "./components/ThemeToggle";
import { getUserSelectedBlogId } from "@/app/services/userService";

const Page = async () => {
  const blogsData = await getBlogs();

  if (typeof blogsData === "string") {
    return <div>Error: {blogsData}</div>;
  }

  function isValidTheme(theme: any): theme is "light" | "dark" {
    return theme === "light" || theme === "dark";
  }

  const prefs = await getUserPreferences();
  const blogId = await getUserSelectedBlogId();
  const rawTheme = prefs?.theme;
  const theme: "light" | "dark" = isValidTheme(rawTheme) ? rawTheme : "light";


  return (
    <div>
      {/* <h1>Settings</h1>
      <ThemeToggle currentTheme={theme} />
      <div>prefs:{JSON.stringify(prefs, null, 2)}</div>
      <div>
        {prefs?.selectedBlogId}
      </div> */}
      <BulletinBoard key={Date.now()} blogs={blogsData.props} selectedBlogId={prefs?.selectedBlogId} />
    </div>

  );
};

export default Page;