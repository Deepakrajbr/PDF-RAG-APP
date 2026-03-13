import { useState } from "react";
import "./App.css";
import robot from "./assets/robot.png";
import axios from "axios";

function App() {

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatStarted, setChatStarted] = useState(false);

  const [fileName, setFileName] = useState("");

  const sendMessage = async () => {

    if (!question) return;

    if (!chatStarted) {
      setChatStarted(true);
    }

    // show user message
    setMessages((prev) => [...prev, { sender: "user", text: question }]);

    // ask backend
    const res = await axios.post(
      "http://127.0.0.1:8000/ask",
      null,
      { params: { question } }
    );

    // show AI response
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: res.data.answer }
    ]);

    setQuestion("");
  };

  // upload pdf
  const handleFileUpload = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    await axios.post("http://127.0.0.1:8000/upload", formData);
  };

  return (
    <div
      className="app"
      style={{ backgroundImage: `url(${robot})` }}
    >

      {!chatStarted ? (

        <div className="landing">

          <div className="inputBar">

            {/* FILE UPLOAD */}
            <label className="uploadBtn">
              📎
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleFileUpload}
              />
            </label>

            <input
              type="text"
              placeholder="Type your message here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button onClick={sendMessage}>➤</button>

          </div>

          {fileName && <p className="fileName">📄 {fileName}</p>}

        </div>

      ) : (

        <div className="chatWrapper">

          <div className="chatBox">

            {messages.map((msg, i) => (
              <div key={i} className="message">
                {msg.text}
              </div>
            ))}

          </div>

          <div className="inputBar bottom">

            <label className="uploadBtn">
              📎
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleFileUpload}
              />
            </label>

            <input
              type="text"
              placeholder="Ask about the PDF..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <button onClick={sendMessage}>➤</button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;