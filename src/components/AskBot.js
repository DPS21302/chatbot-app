import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import {
  RiSendPlaneFill,
  RiUserSmileLine,
  RiMessage2Line,
  RiCloseLine,
  RiRobotLine,
  RiPauseFill,
  RiMagicLine,
  RiMoonLine,
  RiSunLine,
  RiAttachmentLine,
  RiMicFill,
  RiDownloadLine,
  RiPlayFill,
  RiMicOffFill,
} from "react-icons/ri";



const AskBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  const [audioURL, setAudioURL] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingState, setRecordingState] = useState('Initial'); // 'Initial', 'Record', 'Download'
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [audioCounter, setAudioCounter] = useState(1);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);

          recorder.ondataavailable = (e) => {
            const chunks = [];
            chunks.push(e.data);
            const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
            const url = window.URL.createObjectURL(blob);
            setAudioURL(url);
          };
        })
        .catch(error => {
          console.log('Following error has occurred: ', error);
        });
    }
  }, []);

  useEffect(() => {
    let interval;
    if (recordingState === 'Record') {
      interval = setInterval(() => {
        setRecordingDuration(prevDuration => prevDuration + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecordingState('Record');
      setRecordingStartTime(Date.now());
      setRecordingDuration(0);
      const newMessage = {
        type: "user",
        content: "Started voice recording...",
        isRecording: true,
      };
      setMessages([...messages, newMessage]);
    }
  };


  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecordingState('Download');
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.isRecording ? {
            ...msg,
            content: "Stopped voice recording.",
            isRecording: false,
            recordingDuration
          } : msg
        )
      );
    }
  };

  const sendAudioMessage = () => {
    const fileName = `audio_message_${audioCounter}.ogg`;
    const newMessage = {
      type: "user",
      content: fileName,
      isAudio: true,
      audioUrl: audioURL,
      audioDuration: recordingDuration,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
    setAudioCounter(prevCounter => prevCounter + 1);

    setTimeout(() => {
      const botResponse = {
        type: "bot",
        content: "I received your audio message!",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 1500);

    setRecordingState('Initial');
    setRecordingDuration(0);
  };

  const formattedTime = format(new Date(), 'hh:mm a');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    // Format the current time


    const newMessage = { type: "user", content: input, timestamp: formattedTime };
    setMessages([...messages, newMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = { type: "bot", content: `Bolofy: ${input}`, timestamp: formattedTime };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
      setIsTyping(false);
    }, 1500);
  };




  const toggleRecording = () => {
    if (recordingState === 'Initial' || recordingState === 'Download') {
      startRecording();
    } else if (recordingState === 'Record') {
      stopRecording();
    }
  };

  const downloadAudio = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = audioURL;
    downloadLink.download = `audio_message_${audioCounter}.ogg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);



  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const askMagic8Ball = () => {
    const responses = [
      "It is certain.",
      "It is decidedly so.",
      "Without a doubt.",
      "Yes - definitely.",
      "You may rely on it.",
      "As I see it, yes.",
      "Most likely.",
      "Outlook good.",
      "Yes.",
      "Signs point to yes.",
      "Reply hazy, try again.",
      "Ask again later.",
      "Better not tell you now.",
      "Cannot predict now.",
      "Concentrate and ask again.",
      "Don't count on it.",
      "My reply is no.",
      "My sources say no.",
      "Outlook not so good.",
      "Very doubtful.",
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    const magicMessage = { type: "bot", content: `${response}` };
    setMessages([...messages, magicMessage]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newMessage = {
        type: "user",
        content: `Attached file: ${file.name}`,
        isFile: true,
      };
      setMessages([...messages, newMessage]);
    }
  };


  const onStop = (recordedBlob) => {
    console.log('recordedBlob is: ', recordedBlob);
    sendAudioMessage(recordedBlob.blobURL);
  };


  const toggleAudioPlayback = (audioUrl) => {
    if (audioPlaying === audioUrl) {
      setAudioPlaying(null);
      const audio = document.getElementById(audioUrl);
      audio.pause();
    } else {
      if (audioPlaying) {
        const prevAudio = document.getElementById(audioPlaying);
        prevAudio.pause();
      }
      setAudioPlaying(audioUrl);
      const audio = document.getElementById(audioUrl);
      audio.play();
    }
  };

  useEffect(() => {
    const handleAudioEnded = (event) => {
      if (event.target.src === audioPlaying) {
        setAudioPlaying(null);
      }
    };

    document.addEventListener("ended", handleAudioEnded, true);

    return () => {
      document.removeEventListener("ended", handleAudioEnded, true);
    };
  }, [audioPlaying]);


  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };


  return (
    <div className={`fixed bottom-4 right-4 z-50 ${theme === "dark" ? "text-black" : "text-gray-800"}`}>
      {!isChatOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleChat}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg"
        >
          <RiMessage2Line size={24} />
        </motion.button>
      )}

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`w-full sm:w-96 h-[80vh] sm:h-[32rem] flex flex-col rounded-lg shadow-xl ${theme === "dark" ? "bg-gray-900" : "bg-white"} absolute bottom-0 right-0 sm:bottom-16 sm:right-0`}
          >
            {/* Chat header */}
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <h2 className="text-lg font-bold">AskBot</h2>
              <div className="flex space-x-2">
                <button onClick={toggleTheme} className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-300">
                  {theme === "light" ? <RiMoonLine size={18} /> : <RiSunLine size={18} />}
                </button>
                <button onClick={toggleChat} className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-300">
                  <RiCloseLine size={18} />
                </button>
              </div>
            </div>

            {/* Chat messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={chatBoxRef}>
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-start ${message.type === "user" ? "flex-row-reverse" : "flex-row"} max-w-[80%] sm:max-w-[70%]`}>
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${message.type === "user" ? "bg-blue-200 ml-2" : "bg-indigo-200 mr-2"}`}>
                        {message.type === "user" ? (
                          <RiUserSmileLine size={16} className="text-blue-600" />
                        ) : (
                          <RiRobotLine size={16} className="text-indigo-600" />
                        )}
                      </div>


                      <div className={`p-3 rounded-2xl ${message.type === "user" ? "bg-blue-100 text-blue-900" : "bg-indigo-100 text-indigo-900"} ${theme === "dark" ? "text-gray-800" : ""} shadow-md break-words text-sm sm:text-base`}>
                        {message.isAudio ? (
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <button
                                onClick={() => toggleAudioPlayback(message.audioUrl)}
                                className="mr-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              >
                                {audioPlaying === message.audioUrl ? <RiPauseFill size={20} /> : <RiPlayFill size={20} />}
                              </button>
                              <audio id={message.audioUrl} src={message.audioUrl} className="hidden" />
                              <span>{message.content}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <div>
                                ({Math.floor(message.audioDuration / 60)}:{(message.audioDuration % 60).toString().padStart(2, '0')})
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(message.timestamp), 'hh:mm a')}
                              </div>
                            </div>
                          </div>
                        ) : message.isRecording ? (
                          <div className="flex items-center">
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [1, 0.5, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="w-4 h-4 bg-red-500 rounded-full mr-2"
                            />
                            {message.content}
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center text-gray-500 dark:text-gray-300"
                >
                  <RiRobotLine className="mr-2" />
                  <div className="flex space-x-1">
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} className="w-2 h-2 bg-blue-600 rounded-full" />
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }} className="w-2 h-2 bg-blue-600 rounded-full" />
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.4 }} className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmit} className="p-2 bg-white dark:bg-gray-800 rounded-b-lg">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-grow p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    placeholder="Ask me anything..."
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                  >
                    <RiSendPlaneFill size={18} />
                  </motion.button>
                </div>
                <div className="flex justify-start space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={askMagic8Ball}
                    className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
                  >
                    <RiMagicLine size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300"
                  >
                    <RiAttachmentLine size={18} />
                  </motion.button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  {recordingState === 'Record' && (
                    <div className="text-sm text-gray-500">
                      Recording: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                  {/* Modify the recording button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={toggleRecording}
                    className={`${recordingState === 'Record' ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300`}
                  >
                    {recordingState === 'Record' ? <RiMicOffFill size={18} /> : <RiMicFill size={18} />}
                  </motion.button>
                  {/* Add send and download buttons for audio when in Download state */}
                  {recordingState === 'Download' && (
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={sendAudioMessage}
                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300"
                      >
                        <RiSendPlaneFill size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={downloadAudio}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                      >
                        <RiDownloadLine size={18} />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AskBot;