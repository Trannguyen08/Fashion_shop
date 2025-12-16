import RouteConfig from './routes/RouteConfig'; 
import ScrollToTop from './components/ScrollToTop';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ScrollToTop />
      <RouteConfig />
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        theme="colored"
      />
    </>
  );
}

export default App;