import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Role } from '../types';

interface ChatWindowProps {
  chatId: string;
  partnerName: string;
  onBack: () => void;
  translationEnabled?: boolean;
  currentUserId?: string | null;
  role: Role;
  chats?: ChatMessage[];
  onSendMessage?: (msg: string, overrideTaskID?: string) => void;
  onMarkAsRead?: () => void;
  onDeleteMessage?: (chatId: string) => void;
  lang?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, partnerName, onBack, translationEnabled, currentUserId, role, chats, onSendMessage, onMarkAsRead, onDeleteMessage, lang }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [sentAudio, setSentAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (onMarkAsRead) {
      onMarkAsRead();
    }
  }, [chatId, chats?.length, onMarkAsRead]);

  const getTranslatedMessage = (text: string) => {
    if (!translationEnabled || !lang) return text;
    
    // Remove auto-translated prefix if it exists to translate the core message
    let coreText = text;
    if (coreText.startsWith('[Auto-translated to')) {
      const parts = coreText.split(']: ');
      if (parts.length > 1) {
        coreText = parts.slice(1).join(']: ');
      }
    }
    
    const lowerMsg = coreText.toLowerCase().trim();
    const dictionary: Record<string, Record<string, string>> = {
      'id': { 
        'hello': 'Halo', 
        'how are you ?': 'Apa kabar ?',
        'how are you?': 'Apa kabar?',
        'please sanitize the cutting board first.': 'Tolong bersihkan talenan terlebih dahulu.', 
        'reduce the oil and salt...': 'Kurangi minyak dan garam...',
        'type a message here.....': 'Ketik pesan di sini.....',
        'recording audio...': 'Merekam audio...',
        'audio ready to send': 'Audio siap dikirim',
        'send': 'Kirim',
        'need to prepare lunch?': 'Perlu menyiapkan makan siang?',
        'let me know if you need anything.': 'Beri tahu saya jika Anda membutuhkan sesuatu.'
      },
      'tg': { 
        'hello': 'Kamusta', 
        'how are you ?': 'Kamusta ka ?',
        'how are you?': 'Kamusta ka?',
        'please sanitize the cutting board first.': 'Pakilinis muna ang sangkalan.', 
        'reduce the oil and salt...': 'Bawasan ang mantika at asin...',
        'type a message here.....': 'Mag-type ng mensahe dito.....',
        'recording audio...': 'Nagre-record ng audio...',
        'audio ready to send': 'Handa nang ipadala ang audio',
        'send': 'Ipadala',
        'need to prepare lunch?': 'Kailangan bang maghanda ng tanghalian?',
        'let me know if you need anything.': 'Ipaalam sa akin kung kailangan mo ng kahit ano.'
      },
      'en': {
        // From Indonesian
        'halo': 'Hello',
        'apa kabar ?': 'How are you ?',
        'apa kabar?': 'How are you?',
        'tolong bersihkan talenan terlebih dahulu.': 'Please sanitize the cutting board first.',
        'kurangi minyak dan garam...': 'Reduce the oil and salt...',
        'ketik pesan di sini.....': 'Type a message here.....',
        'merekam audio...': 'Recording audio...',
        'audio siap dikirim': 'Audio ready to send',
        'kirim': 'Send',
        'perlu menyiapkan makan siang?': 'Need to prepare lunch?',
        'beri tahu saya jika anda membutuhkan sesuatu.': 'Let me know if you need anything.',
        // From Tagalog
        'kamusta': 'Hello',
        'kamusta ka ?': 'How are you ?',
        'kamusta ka?': 'How are you?',
        'pakilinis muna ang sangkalan.': 'Please sanitize the cutting board first.',
        'bawasan ang mantika at asin...': 'Reduce the oil and salt...',
        'mag-type ng mensahe dito.....': 'Type a message here.....',
        'nagre-record ng audio...': 'Recording audio...',
        'handa nang ipadala ang audio': 'Audio ready to send',
        'ipadala': 'Send',
        'kailangan bang maghanda ng tanghalian?': 'Need to prepare lunch?',
        'ipaalam sa akin kung kailangan mo ng kahit ano.': 'Let me know if you need anything.'
      }
    };
    
    if (dictionary[lang] && dictionary[lang][lowerMsg]) {
      // If we translate TO english, we still don't need the [Auto-translated] prefix for the English employer
      // actually, the user might want to know it was auto translated. Let's return just the text for UI cleanliness,
      // or append it. Based on the mockup, we should probably just show the translated text.
      return dictionary[lang][lowerMsg];
    }
    
    if (lang === 'en') {
      return coreText;
    }
    
    const langName = lang === 'id' ? 'Bahasa Indonesia' : lang === 'tg' ? 'Tagalog' : 'English';
    return `[Auto-translated to ${langName}]: ${coreText}`;
  };

  const handleSendText = () => {
    if (inputText.trim() && onSendMessage) {
      onSendMessage(inputText.trim(), chatId);
      setInputText('');
    }
  };


  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio && audioRef.current) {
      interval = setInterval(() => {
        if (audioRef.current && audioRef.current.duration) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setAudioProgress(progress);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const toggleRecording = async () => {
    if (isRecording) {
      // Stopping recording
      setIsRecording(false);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setHasRecordedAudio(true); // Audio is ready to be sent
    } else {
      // Starting recording
      try {
        setRecordingTime(0); // Reset timer when starting a new recording
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current);
          const url = URL.createObjectURL(audioBlob);
          audioRef.current = new Audio(url);
          audioRef.current.onended = () => {
            setIsPlayingAudio(false);
            setAudioProgress(0);
          };
        };

        mediaRecorder.start();
        setIsRecording(true);
        setHasRecordedAudio(false);
        setSentAudio(false);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Microphone access is required to record audio.");
      }
    }
  };

  const handleSendAudio = () => {
    if (hasRecordedAudio) {
      setSentAudio(true);
      setHasRecordedAudio(false);
      setIsPlayingAudio(false);
      setAudioProgress(0);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleMessageClick = (msg: ChatMessage) => {
    if (!msg.id || !onDeleteMessage) return;
    onDeleteMessage(msg.id);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 1MB FILE WARNING HANDLER
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 1048576) {
      alert("Warning: The file/recording should not exceed 1MB.");
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (onSendMessage && reader.result) {
          onSendMessage(reader.result as string, chatId);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#fff" }}>
      
      {/* Sub-Header: "Conversation: name" and "Back to Chats" */}
      <div style={{ padding: "10px 16px", backgroundColor: "#f3f4f6", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb" }}>
        <span style={{ fontWeight: "bold", color: "#374151", fontSize: "14px" }}>Conversation: {partnerName}</span>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold", color: "#4b5563" }}>
          ⬅ Back to Chats
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div style={{ flex: 1, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        
        {/* DEFAULT VIEW */}
        <>
          {chats?.filter(c => c.taskID === chatId).map((msg, index) => {
            const isMine = msg.senderRole === role;
            return (
              <div 
                key={index} 
                onClick={() => handleMessageClick(msg)}
                style={{ display: 'flex', flexDirection: 'column', alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '80%', cursor: 'pointer' }}
              >
                <div style={{ backgroundColor: isMine ? "#fb923c" : "#e5e7eb", color: isMine ? "#fff" : "#1f2937", padding: "12px 16px", borderRadius: isMine ? "16px 16px 0 16px" : "16px 16px 16px 0", lineHeight: "1.4", overflowWrap: "break-word", wordBreak: "break-word" }}>
                  {msg.message.startsWith('data:image/') ? (
                    <img src={msg.message} alt="Shared photo" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                  ) : (
                    (!isMine && translationEnabled) ? getTranslatedMessage(msg.message) : msg.message
                  )}
                </div>
                <div style={{ alignSelf: isMine ? "flex-end" : "flex-start", fontSize: "10px", color: "#9ca3af", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                  {new Date(msg.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMine && (
                    <span style={{ color: msg.isRead ? "#3b82f6" : "#9ca3af", fontSize: "12px", fontWeight: "bold" }}>
                      {msg.isRead ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </>

        {/* MOCKED SENT AUDIO MESSAGE */}
        {sentAudio && (
          <>
            <div style={{ alignSelf: "flex-end", backgroundColor: "#fb923c", color: "#fff", padding: "12px 16px", borderRadius: "16px 16px 0 16px", maxWidth: "80%", display: "flex", alignItems: "center", gap: "8px" }}>
              <span onClick={togglePlayAudio} style={{ cursor: "pointer", fontSize: "16px" }}>
                {isPlayingAudio ? "⏸️" : "▶️"}
              </span>
              <div style={{ width: "100px", height: "4px", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "2px" }}>
                 <div style={{ width: `${audioProgress}%`, height: "100%", backgroundColor: "#fff", borderRadius: "2px", transition: "width 0.2s linear" }}></div>
              </div>
              <span style={{ fontSize: "12px" }}>0:04</span>
            </div>
            <div style={{ alignSelf: "flex-end", fontSize: "10px", color: "#9ca3af", marginTop: "-12px" }}>Just now</div>
          </>
        )}
      </div>

      {/* Quick Replies */}
      <div style={{ padding: "8px 16px", display: "flex", gap: "8px", overflowX: "auto", backgroundColor: "#fff" }}>
        <button 
          onClick={() => onSendMessage && onSendMessage(getTranslatedMessage("Please sanitize the cutting board first."), chatId)}
          style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "20px", backgroundColor: "#fff", fontSize: "12px", whiteSpace: "nowrap", cursor: "pointer", fontWeight: "600", color: "#374151" }}
        >
          {getTranslatedMessage("Please sanitize the cutting board first.")}
        </button>
        <button 
          onClick={() => onSendMessage && onSendMessage(getTranslatedMessage("Reduce the oil and salt..."), chatId)}
          style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "20px", backgroundColor: "#fff", fontSize: "12px", whiteSpace: "nowrap", cursor: "pointer", fontWeight: "600", color: "#374151" }}
        >
          {getTranslatedMessage("Reduce the oil and salt...")}
        </button>
      </div>

      {/* INPUT AREA */}
      <div style={{ padding: "16px", backgroundColor: "#fff", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "12px" }}>
        <label style={{ cursor: "pointer", fontSize: "20px" }}>
          📷
          <input type="file" accept="image/*,video/*,application/pdf,.doc,.docx" style={{ display: "none" }} onChange={handleFileChange} />
        </label>
        <span onClick={toggleRecording} style={{ cursor: "pointer", fontSize: "20px", color: isRecording ? "#ef4444" : "inherit" }}>
          {isRecording ? "⏹️" : "🎤"}
        </span>
        {isRecording || hasRecordedAudio ? (
          <div style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "1px solid #ef4444", color: "#ef4444", fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fee2e2" }}>
            <span>{isRecording ? getTranslatedMessage("Recording audio...") : getTranslatedMessage("Audio ready to send")}</span>
            <span>{formatTime(recordingTime)}</span>
          </div>
        ) : (
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendText(); }}
            placeholder={getTranslatedMessage("Type a message here.....")} 
            style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "1px solid #d1d5db", outline: "none", color: "#000000" }} 
          />
        )}
        <button onClick={hasRecordedAudio ? handleSendAudio : handleSendText} style={{ backgroundColor: "#fb923c", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "24px", fontWeight: "bold", cursor: "pointer", opacity: isRecording ? 0.5 : 1 }} disabled={isRecording}>
          {getTranslatedMessage("Send")}
        </button>
      </div>
      
    </div>
  );
}
