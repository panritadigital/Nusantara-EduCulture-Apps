import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateChatResponse } from '../services/geminiService';
import { PaperClipIcon, XCircleIcon, CameraIcon, Bars3Icon, PlusIcon, TrashIcon } from '../components/icons/SolidIcons';
import { logoBase64Url } from '../assets/logo';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  imageUrl?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error("Invalid data URL");
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
}

const linkify = (text: string): string => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  
  const withLinks = escapedText.replace(urlRegex, (url) => 
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`
  );

  return withLinks.replace(/\n/g, '<br />');
};

const CameraModal: React.FC<{
  onClose: () => void;
  onCapture: (file: File) => void;
}> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStream(stream);
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.");
        onClose();
      }
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [onClose]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
    }
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      const file = dataURLtoFile(capturedImage, `capture-${Date.now()}.jpg`);
      onCapture(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="relative flex-grow">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>
      <div className="bg-black bg-opacity-50 p-4 flex justify-around items-center">
        {capturedImage ? (
          <>
            <button onClick={() => setCapturedImage(null)} className="text-white font-semibold text-lg">Ambil Ulang</button>
            <button onClick={handleUsePhoto} className="px-6 py-3 bg-brand-primary text-white rounded-full font-bold text-lg">Gunakan Foto</button>
          </>
        ) : (
          <>
            <button onClick={onClose} className="text-white font-semibold text-lg">Batal</button>
            <button onClick={handleCapture} className="w-20 h-20 bg-white rounded-full border-4 border-gray-400"></button>
            <div className="w-12"></div> {/* Spacer */}
          </>
        )}
      </div>
    </div>
  );
};

export default function ChatScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleNewChat = useCallback(() => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
        id: newId,
        title: "Percakapan Baru",
        messages: [{ sender: 'ai', text: 'Halo! Tanyakan apapun tentang sejarah dan budaya Tana Toraja, Luwu, Luwu Utara, dan Palopo. Anda juga bisa mengirim gambar untuk dianalisis.' }],
    };
    setConversations(prev => [newConversation, ...prev.filter(c => c.messages.length > 1)]);
    setActiveConversationId(newId);
    if(window.innerWidth < 768) setIsHistoryOpen(false);
  }, []);

  useEffect(() => {
    try {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            const parsedHistory: Conversation[] = JSON.parse(savedHistory);
            if (parsedHistory.length > 0) {
                setConversations(parsedHistory);
                setActiveConversationId(parsedHistory[0].id);
            } else {
                handleNewChat();
            }
        } else {
            handleNewChat();
        }
    } catch (error) {
        console.error("Failed to parse chat history from localStorage", error);
        handleNewChat();
    }
  }, [handleNewChat]);

  useEffect(() => {
    // Save non-empty conversations to localStorage
    const conversationsToSave = conversations.filter(c => c.messages.length > 1 || c.id === activeConversationId);
    if (conversationsToSave.length > 0) {
        localStorage.setItem('chatHistory', JSON.stringify(conversationsToSave));
    } else {
        localStorage.removeItem('chatHistory');
    }
  }, [conversations, activeConversationId]);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation ? activeConversation.messages : [];

  useEffect(scrollToBottom, [messages]);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Harap pilih file gambar.");
        return;
      }
      setImageFile(file);
      const dataUrl = await fileToDataUrl(file);
      setImagePreviewUrl(dataUrl);
    }
    event.target.value = ''; 
  };
  
  const handleCameraCapture = async (file: File) => {
      setImageFile(file);
      const dataUrl = await fileToDataUrl(file);
      setImagePreviewUrl(dataUrl);
  }

  const removeImage = () => {
      setImageFile(null);
      setImagePreviewUrl(null);
  }
  
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    if(window.innerWidth < 768) setIsHistoryOpen(false);
  };

  const handleDeleteConversation = (idToDelete: string) => {
      const updatedConversations = conversations.filter(c => c.id !== idToDelete);
      setConversations(updatedConversations);
      
      if (activeConversationId === idToDelete) {
          if (updatedConversations.length > 0) {
              setActiveConversationId(updatedConversations[0].id);
          } else {
              handleNewChat();
          }
      }
  };


  const handleSend = async () => {
    if ((input.trim() === '' && !imageFile) || isLoading) return;

    const userMessage: Message = { text: input, sender: 'user', imageUrl: imagePreviewUrl };
    
    setConversations(prev => {
        return prev.map(conv => {
            if (conv.id === activeConversationId) {
                const updatedConv = { ...conv, messages: [...conv.messages, userMessage] };
                if (updatedConv.messages.length === 2) { // First user message
                    updatedConv.title = input.trim().substring(0, 35) || "Analisis Gambar";
                }
                return updatedConv;
            }
            return conv;
        });
    });
    
    setInput('');
    removeImage();
    setIsLoading(true);

    try {
      let imagePayload: { mimeType: string, data: string } | undefined = undefined;
      if (imageFile) {
        const base64Data = await fileToBase64(imageFile);
        imagePayload = { mimeType: imageFile.type, data: base64Data };
      }
      
      const aiResponse = await generateChatResponse(input, imagePayload);
      const aiMessage: Message = { text: aiResponse, sender: 'ai' };
      
       setConversations(prev => {
          return prev.map(conv => {
              if (conv.id === activeConversationId) {
                  return { ...conv, messages: [...conv.messages, aiMessage] };
              }
              return conv;
          });
      });
    } catch (error) {
      const errorMessage: Message = { text: 'Maaf, terjadi kesalahan.', sender: 'ai' };
       setConversations(prev => {
          return prev.map(conv => {
              if (conv.id === activeConversationId) {
                  return { ...conv, messages: [...conv.messages, errorMessage] };
              }
              return conv;
          });
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      {isCameraOpen && <CameraModal onClose={() => setIsCameraOpen(false)} onCapture={handleCameraCapture} />}
      
      {/* History Sidebar */}
      <div className={`absolute md:relative top-0 left-0 h-full w-64 bg-white border-r flex flex-col transform transition-transform duration-300 z-30 ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-2 border-b">
          <button onClick={handleNewChat} className="w-full flex items-center space-x-2 p-2 rounded-md text-sm font-semibold text-brand-primary bg-brand-background hover:bg-gray-200 transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span>Percakapan Baru</span>
          </button>
        </div>
        <nav className="flex-grow overflow-y-auto p-2 space-y-1">
          {conversations.filter(c => c.messages.length > 1).map(conv => (
            <div key={conv.id} className={`group relative pr-8 rounded-md ${activeConversationId === conv.id ? 'bg-brand-accent' : ''}`}>
                <button 
                    onClick={() => handleSelectConversation(conv.id)} 
                    className={`w-full text-left p-2 text-sm truncate rounded-md ${activeConversationId === conv.id ? 'font-semibold text-brand-primary' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    {conv.title}
                </button>
                 <button 
                    onClick={() => handleDeleteConversation(conv.id)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Hapus percakapan"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
          <header className="p-3 border-b bg-white flex items-center justify-between z-10 shadow-sm flex-shrink-0">
            <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="p-2 text-gray-500 hover:text-brand-primary md:hidden" aria-label="Toggle history">
                <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3 flex-grow justify-center md:justify-start md:pl-10">
                <img src={logoBase64Url} alt="Logo" className="h-16 w-16 object-contain" />
                <div>
                    <h1 className="text-md font-bold text-brand-primary">Nusantara EduCulture</h1>
                    <p className="text-gray-600 text-xs mt-0.5">Chat Generatif AI</p>
                </div>
            </div>
            <div className="w-10 md:hidden"></div> {/* Spacer to keep title centered on mobile */}
          </header>
          
          <div className="flex-grow p-4 overflow-y-auto bg-brand-background">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-white text-brand-text shadow-sm rounded-bl-none'}`}>
                    {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="User upload" className="w-full h-auto rounded-lg mb-2" />
                    )}
                    {msg.sender === 'ai' ? (
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: linkify(msg.text) }}></div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md p-3 rounded-2xl bg-white text-brand-text shadow-sm rounded-bl-none flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="p-4 bg-white border-t flex-shrink-0">
            {imagePreviewUrl && (
                <div className="relative w-24 h-24 mb-2 p-1 border rounded-md">
                    <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover rounded"/>
                    <button onClick={removeImage} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full">
                        <XCircleIcon className="w-6 h-6"/>
                    </button>
                </div>
            )}
            <div className="flex items-center space-x-2">
              <input type="file" ref={imageInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
              <button onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-500 hover:text-brand-primary" disabled={isLoading} aria-label="Attach file">
                  <PaperClipIcon className="w-6 h-6" />
              </button>
              <button onClick={() => setIsCameraOpen(true)} className="p-2 text-gray-500 hover:text-brand-primary" disabled={isLoading} aria-label="Open camera">
                  <CameraIcon className="w-6 h-6" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ketik pesan Anda..."
                className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || (input.trim() === '' && !imageFile)}
                className="bg-brand-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 disabled:bg-gray-400 transition-colors"
              >
                Kirim
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}