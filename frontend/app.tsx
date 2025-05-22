import { BrowserRouter, Route, Routes } from 'react-router';
import Home from './Home';
import ChatLayout from './ChatLayout';
import Root from './Root';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="chat" element={<ChatLayout />}>
          <Route index element={<Home />} />
          <Route path=":id" element={<p> Chat </p>} />
        </Route>
        <Route path="*" element={<p> Not found </p>} />
      </Routes>
    </BrowserRouter>
  );
}
