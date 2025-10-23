import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Main from "../components/Main.jsx";
import App from "../App.jsx";
import SubwayStationList from "../components/station/SubwayStationList.jsx";
import SubwayStationDetail from "../components/station/SubwayStationDetail.jsx";
import NotFound from "../components/errors/NotFound.jsx";
import SubwayLineList from "../components/lineInfo/SubwayLineList.jsx";
import SubwayLineDetail from "../components/lineInfo/SubwayLineDetail.jsx";

const router = createBrowserRouter([
    {
      element: <App />,
      children: [
        {
          index: true,
          element: <Main />
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
          path: 'line-diagrams',
          element: <SubwayLineList />
        },
        {
          path: 'line-diagrams/:stnKrNm/:lineNm',
          element: <SubwayLineDetail />
        },
        {
          path: '*',
          element: <NotFound/>
        }
    ]
  }
]);

function Router() {
  return <RouterProvider router={router} />
}

export default Router;