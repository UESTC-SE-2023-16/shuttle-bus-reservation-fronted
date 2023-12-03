import { Content } from "./components/Content";
import { Navbar, Footer } from "./components/Navbar";

import "./App.css";

function App() {
  return (
    <div className="flex flex-col h-screen justify-between">
      <Navbar />
      <Content />
      <Footer />
    </div>
  );
}

export default App;
