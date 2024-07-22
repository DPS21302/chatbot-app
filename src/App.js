import React from 'react';
import './index.css';
import ReactDOM from 'react-dom';
import AskBot from './components/AskBot'; // Adjust the path to your component

const initChatbot = (config) => {
  const chatbotContainer = document.createElement('div');
  chatbotContainer.id = 'chatbot-container';
  document.body.appendChild(chatbotContainer);

  ReactDOM.render(<AskBot {...config} />, chatbotContainer);
};

window.initChatbot = initChatbot;

export default initChatbot;