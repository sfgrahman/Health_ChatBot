import ReactMarkdown from 'react-markdown';


function ChatMessage({ message }) {
  // Only parse markdown for bot messages
  const content = message.isBot ? (
    <div>
      <ReactMarkdown children={message.text} />
    <audio src={message.blob_url} controls='controls'  autoPlay="True" />
    </div>
    
  ) : (
      message.text
  );
    if (message.isBot) return(
        <li className="message left appeared">
        <div className="avatar"></div>
        <div className="text_wrapper">
            <div className="text">{content}</div>
        </div>
    </li>
    )
  return (
    
    <li className="message right appeared">
    <div className="avatar"></div>
    <div className="text_wrapper">
        <div className="text">{content}</div>
    </div>
</li>
     
  );
}

export default ChatMessage;