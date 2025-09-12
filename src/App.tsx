import Apper from './App.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <>
       <ToastContainer position="top-right" autoClose={5000} />
    <div className="App">
      <Apper />
    </div>
    </>
  );
}

export default App;
