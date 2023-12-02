import { Content } from "./Content";
import { Navbar, Footer } from "./Navbar";

import "./App.css";

function App() {
  return (
    <body className="flex flex-col h-screen justify-between">
      <Navbar />
      <Content />
      <Footer />
    </body>
  );
}

export default App;
