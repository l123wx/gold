import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import DayDetail from '../pages/DayDetail'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/day/:date',
    element: <DayDetail />,
  },
], {
  basename: import.meta.env.BASE_URL,
})
