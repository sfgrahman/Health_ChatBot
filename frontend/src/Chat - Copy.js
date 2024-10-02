import React, { useState, useEffect, useRef }  from "react";
import App from "./App";
import api from "./api";
import ChatMessage from "./ChatMessage";


function Chat(){
    const tokenString = localStorage.getItem('site');
    const [token, setToken] = useState(tokenString);
  
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
         };
    

    const handleInputChange=(event)=>{
            const value= event.target.value
            console.log(value)
            setInputText(value)
            
          };
    useEffect(scrollToBottom, [messages]);    
    const handleSendMessage = async (event) => {
        event.preventDefault();
        if (!inputText.trim()) return; // Prevent sending empty messages
        const userMessage = { text: inputText, isBot: false };
        const body = {
          query: inputText,
        }    
        setMessages([...messages, userMessage]);
        setInputText('');
        const config ={headers:{Authorization: `Bearer ${token}`}};
        console.log(config);
        const response = await api.post(`conversation`,null,{ params: body}, config);
        console.log(response);
        const botMessage = { text: response.data.response.content, isBot: true };
        setMessages(currentMessages => [...currentMessages, botMessage]);
      };


       
    const logOut = () => {
        setToken("");
        localStorage.removeItem("site");
      };
    console.log(token)
    if(!token) return(<App/>)

    return(
        <div className="container">
            <h3 className=" text-center">Messaging</h3>
                 <div className="messaging">
                    <div className="inbox_msg">
                        <div className="mesgs">
                            <div className="msg_history">
                             <div className="incoming_msg">
                             <div className="incoming_msg_img"></div>
                            <div className="received_msg">
                           
                                    <div class="received_withd_msg">
                            <p>Hi there! I'm a bot trained to answer questions about the URL you entered. Try asking me a question below!</p>
                            </div>
                            </div>
                            </div>
                            

                            {/*messages.length === 0 && 
                                    <div className="chat-message bot-message">
                                            <p className="initial-message">Hi there! I'm a bot trained to answer questions about the URL you entered. Try asking me a question below!</p>
                                    </div>
    */}
                           
     
                                        {messages.map((message, index) => (
                                                <ChatMessage key={index} message={message} />
                                                     ))}
                                    <div ref={messagesEndRef} />
                                
                            </div>
                            <div className="type_msg">
                                <div className="input_msg_write">
                                <form className="chat-input" onSubmit={handleSendMessage}>
                                    <input type="text" className="write_msg" placeholder="Type a message" value={inputText} onChange={handleInputChange}/>
                                    <button className="msg_send_btn" type="submit"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button>
                                </form>
                                </div>

                                <ul class="messages"><li class="message left appeared"><div class="avatar"></div><div class="text_wrapper"><div class="text">Hello Philip! :)</div></div></li><li class="message right appeared"><div class="avatar"></div><div class="text_wrapper"><div class="text">Hi Sandy! How are you?</div></div></li><li class="message left appeared"><div class="avatar"></div><div class="text_wrapper"><div class="text">I'm fine, thank you!</div></div></li></ul>                   

                            </div>
                        </div>
                    </div>
                </div>
        </div>
                
    );
}

export default Chat;