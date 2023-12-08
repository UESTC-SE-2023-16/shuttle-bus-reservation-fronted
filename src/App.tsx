import { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";

import { Content } from "./components/Content";
import { Navbar, Footer } from "./components/Navbar";
import { userState } from "./store";

import "./App.css";

function App() {
  const navigate = useNavigate();
  const curUser = useSnapshot(userState);

  useEffect(() => {
    if (curUser.user.id === 0) {
      navigate("/login");
    }
  }, [curUser, navigate]);

  return (
    <div className="flex flex-col h-screen justify-between">
      <Navbar />
      <Content />
      <Footer />
    </div>
  );
}

export default App;
