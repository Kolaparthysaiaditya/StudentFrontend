import './App.css';
import {Route, Routes, BrowserRouter} from "react-router-dom";
import ProtectRoute from './Components/ProtectRoute';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route 
          path='/Dashboard/:sid/' 
          element={
            <ProtectRoute>
              <Dashboard />
            </ProtectRoute>} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
