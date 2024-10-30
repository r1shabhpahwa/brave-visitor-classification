import { Provider } from 'react-redux';
import store from './store';
import SearchSection from "./components/SearchSection";
import NavBar from "./components/NavBar";
import ErrorPopup from "./components/ErrorPopup";

import "./index.css";

function App() {
  return (
    <div>
        <>
          <NavBar/>
          <SearchSection/>
          <ErrorPopup />
        </>
    </div>
  );
}

function RootApp() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

export default RootApp;
