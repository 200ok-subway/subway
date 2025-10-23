import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Main from "../components/Main.jsx";
import App from "../App.jsx";
import SubwayStationList from "../components/station/SubwayStationList.jsx";
import SubwayStationDetail from "../components/station/SubwayStationDetail.jsx";
import NotFound from "../components/errors/NotFound.jsx";
import SubwayLineList from "../components/lineInfo/SubwayLineList.jsx";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        index: true,
        element: <Main />
      },
      {
        path: 'line-diagrams',
        element: <SubwayLineList />
      },
      {
        path: 'stations',
        element: <SubwayStationList />
      },
      {
        path: 'stations/:stationId/:stationLine/:stationNm',
        element: <SubwayStationDetail />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);

function Router() {
  return <RouterProvider router={router} />
}

export default Router;