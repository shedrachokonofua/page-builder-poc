import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PageBuilder from "./PageBuilder";

const App = (): JSX.Element => (
  <DndProvider backend={HTML5Backend}>
    <PageBuilder />
  </DndProvider>
);

export default App;
