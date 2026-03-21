import { createHashRouter } from "react-router-dom";
import Camera from "../pages/Camera";
import SubmitForm from "../pages/SubmitForm";
import CardSwipe from "../pages/CardSwipe";
import TVDisplay from "../pages/TvDisplay";

export const router = createHashRouter([
  {
    path: "/",
    element: <Camera />,
  },
  {
    path: "/form",
    element: <SubmitForm />,
  },
  {
    path: "/cards",
    element: <CardSwipe />,
  },
  { path: "/tv", element: <TVDisplay /> },
]);
