import React, { useState, useEffect, useRef }  from "react";
import App from "./App";
import api from "./api";
import ChatMessage from "./ChatMessage";
import toplogo from "./images/top.png";



function Chat(){
    const tokenString = localStorage.getItem('site');
    const [token, setToken] = useState(tokenString);
  
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);
    const [start, setStart] = useState(true);
    const [recordedUrl, setRecordedUrl] = useState('');
    const mediaStream = useRef(null);
    const mediaRecorder = useRef(null);
    const chunks = useRef([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
         };
         const startRecording = async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia(
                { audio: true }
              );
              setStart(false);
              mediaStream.current = stream;
              mediaRecorder.current = new MediaRecorder(stream);
              mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                  chunks.current.push(e.data);
                }
              };
              mediaRecorder.current.onstop = () => {
                const recordedBlob = new Blob(
                  chunks.current, { type: 'audio/webm' }
                );
                const url = URL.createObjectURL(recordedBlob);
                setRecordedUrl(url);
                chunks.current = [];
              };
              //setStart(true);
              mediaRecorder.current.start();
            } catch (error) {
              console.error('Error accessing microphone:', error);
            }
          };
          const stopRecording = () => {
            if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
              mediaRecorder.current.stop();
              setStart(true);
              
            }
            if (mediaStream.current) {
              mediaStream.current.getTracks().forEach((track) => {
                track.stop();
              });
            }

          };

    const handleInputChange=(event)=>{
            const value= event.target.value
            //console.log(value)
            setInputText(value)
            
          };
    useEffect(scrollToBottom, [messages]);    
    const handleSendMessage = async (event) => {
        event.preventDefault();
        if (!inputText.trim()) return; // Prevent sending empty messages
        const userMessage = { 'text': inputText, 'isBot': false };
        const body = {
          'question': inputText,
        };    
        setMessages([...messages, userMessage]);
        setInputText('');
        const config = {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Access-Control-Allow-Origin': "*",
                'Authorization': `Bearer ${token}`
            }
        };
        //console.log(config);
        const response = await api.post(`conversation`, body, config);
        console.log(response);
        const byteCharacters  = atob(response.data.audio_buffer);
        const byteArrays = [];
        for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
        }
    
        const byteArray = new Uint8Array(byteArrays);
        const blob = new Blob([byteArray], { type: "audio/mp3" });
        const newBlobUrl = URL.createObjectURL(blob);
        
        const botMessage = { text: response.data.txt_response, blob_url:newBlobUrl, isBot: true };
        setMessages(currentMessages => [...currentMessages, botMessage]);
      };


       
    const logOut = () => {
        setToken("");
        localStorage.removeItem("site");
      };
    //console.log(token)
    if(!token) return(<App/>)

    return(
        <div className="container">
            <div className="chat_window">
                    <div className="top_menu">
                    <div className="buttons">
                    
                    <button onClick={logOut}>Logout</button>
                    </div>
                            <div className="title">
                                <img src={toplogo} alt="top-icon" className="user_img rounded-circle"/>  
                                <div className="sub-head">MeChat</div></div>
                        </div>
    <ul className="messages">
        <li className="message left appeared">
            <div className="avatar"></div>
            <div className="text_wrapper">
                <div className="text">Hi there! I'm a bot trained to answer questions about the Mental health. Try asking me a question below!</div>
               
                </div>
                
        </li>
        {messages.map((message, index) => (
                                                <ChatMessage key={index} message={message} />
                                                     ))}
                                    <div ref={messagesEndRef} />
                
        </ul>
        <form className="position-relative" onSubmit={handleSendMessage}>
    <div className="bottom_wrapper clearfix fixed-bottom">
        <div className="message_input_wrapper ">
            <input className="message_input" placeholder="Type your message here..." value={inputText} onChange={handleInputChange}/>
            <button className="msg_send_btn" type="submit"><i className="fa fa-paper-plane-o" aria-hidden="true"></i></button>
            {start &&  <button className="mic_btn" onClick={startRecording}><i className="fa fa-microphone" aria-hidden="true"></i></button>}
            {!start && <button className="mic_btn" onClick={stopRecording}><i className="fa fa-stop" aria-hidden="true"></i></button>}
        </div>
        
    </div>
    </form>
</div>

        </div>
                
    );
}

export default Chat;