import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

const StoreLayout = () => {
  return (
    <>
      <Navigation />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default StoreLayout;
