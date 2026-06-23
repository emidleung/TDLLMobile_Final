import React, { useState, useEffect } from 'react';
import { ChatWindow } from './ChatWindow'; 
import { ChatMessage, Language, Role, Invitation, Connection } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";

interface ChatPageProps {
  chats: ChatMessage[];
  role: Role;
  lang: Language;
  onSendMessage: (msg: string, overrideTaskID?: string) => void;
  currentUserId?: string | null;
  connectedPartnerId?: string | null;
  invitations?: Invitation[];
  connections?: Connection[];
  onConnect?: (id: string) => void;
  onRefreshData?: () => void;
  initialTab?: 'chat' | 'settings';
  onMarkChatAsRead?: (taskId: string) => void;
  onDeleteChatMessage?: (chatId: string) => void;
}

export function ChatPage({ role, lang, currentUserId, connectedPartnerId, invitations = [], connections = [], chats = [], onSendMessage, onConnect, onRefreshData, initialTab = 'chat', onMarkChatAsRead, onDeleteChatMessage }: ChatPageProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>(initialTab);
  const [partnerInput, setPartnerInput] = useState('');
  const [selectedChat, setSelectedChat] = useState<{ id: string, name: string } | null>(null);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  
  // Mark as read when new messages arrive while chat is open
  useEffect(() => {
    if (selectedChat && onMarkChatAsRead) {
      const hasUnread = chats.some(c => c.taskID === selectedChat.id && !c.isRead && c.senderRole !== role);
      if (hasUnread) {
        onMarkChatAsRead(selectedChat.id);
      }
    }
  }, [chats, selectedChat, onMarkChatAsRead, role]);

  const pendingInvCount = invitations.filter(inv => inv.receiverID === currentUserId && inv.status === 'pending').length;

  const rawDynamicChats = connections.map(c => {
    const partnerID = c.employerID === currentUserId ? c.helperID : c.employerID;
    const chatId = `chat_${c.employerID}_${c.helperID}`;
    const partnerChats = chats.filter(chat => chat.taskID === chatId);
    const lastMsg = partnerChats.length > 0 ? partnerChats[partnerChats.length - 1].message : 'Tap to start chatting...';
    const unreadInChat = partnerChats.filter(chat => !chat.isRead && chat.senderRole !== role).length;
    
    return {
      id: chatId,
      name: `User ${partnerID}`,
      lastMessage: lastMsg,
      time: partnerChats.length > 0 ? new Date(partnerChats[partnerChats.length - 1].createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(c.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: unreadInChat,
      initial: partnerID ? partnerID[0].toUpperCase() : 'U',
      color: '#fed7aa',
      connectionID: c.connectionID
    };
  });

  // Deduplicate chats by ID to prevent multiple connections from showing duplicates
  const dynamicChats = Array.from(new Map(rawDynamicChats.map(item => [item.id, item])).values());

  const chatList = [
    ...dynamicChats
  ];

  const handleSelectChat = (chat: { id: string, name: string }) => {
    setSelectedChat(chat);
    if (onMarkChatAsRead) {
      onMarkChatAsRead(chat.id);
    }
  };

  const handleDeleteConnection = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this connection? Once done, it cannot be reversed.");
    if (isConfirmed) {
      // 1. Delete from Firestore
      try {
        await deleteDoc(doc(db, "connections", id));
      } catch (err) {
        console.warn("Firestore delete connection failed:", err);
      }
    }
  };

  const handleSendInvitation = async () => {
    const trimmedInput = partnerInput.trim();
    if (!currentUserId) {
      alert("Error: Your identity is not loaded. Please try logging in again.");
      return;
    }
    if (trimmedInput === currentUserId) {
      alert("You cannot connect with yourself.");
      return;
    }
    if (trimmedInput) {
      if (connections.some(c => (c.employerID === trimmedInput || c.helperID === trimmedInput))) {
        alert("You are already connected with this user.");
        return;
      }
      if (invitations.some(i => (i.senderID === currentUserId && i.receiverID === trimmedInput) || (i.senderID === trimmedInput && i.receiverID === currentUserId))) {
        alert("There is already a pending invitation between you and this user. Please wait for them to respond.");
        return;
      }
      const newInv = {
        senderID: currentUserId,
        receiverID: trimmedInput,
        status: 'pending',
        createTime: serverTimestamp()
      };

      try {
        await addDoc(collection(db, "invitations"), newInv);
        alert(`Invitation sent to ${trimmedInput}!`);
        setPartnerInput('');
      } catch (err: any) {
        console.error("Firestore send invitation failed:", err);
        alert("Failed to send invitation: " + (err.message || "Permission denied"));
      }
    }
  };

  const handleAcceptInvitation = async (inv: Invitation, roleOfSender: 'employer' | 'helper') => {
    try {
      // 1. Create connection FIRST (Source of truth)
      await addDoc(collection(db, "connections"), {
        employerID: roleOfSender === 'employer' ? inv.senderID : inv.receiverID,
        helperID: roleOfSender === 'helper' ? inv.senderID : inv.receiverID,
        createTime: serverTimestamp()
      });

      // 2. Then update invitation status
      const invRef = doc(db, "invitations", inv.invitationID);
      await updateDoc(invRef, { status: 'accepted' });
      
      alert("Connection established!");
    } catch (err: any) {
      console.error("Firestore accept invitation failed:", err);
      alert("Failed to accept invitation: " + (err.message || "Unknown error"));
    }
  };


  const handleRejectInvitation = async (invId: string) => {
    try {
      await updateDoc(doc(db, "invitations", invId), { status: 'rejected' });
      alert("Invitation rejected.");
    } catch (err: any) {
      console.error("Firestore reject invitation failed:", err);
      alert("Failed to reject: " + (err.message || "Permission denied"));
    }
  };

  return (
    // Apply this to the outermost container
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'transparent', // Removed the grey background
      overflow: 'hidden' // Prevents double scrollbars
    }}>
      
      {/* This is your app card container */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        margin: '0 auto', 
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        // Removed border and radius to hit the edges of the 480px container
        overflow: 'hidden'
      }}>
        
        {/* Header / Tabs - Use 'flexShrink: 0' to keep them from getting squished */}
        <div style={{ flexShrink: 0 }}>
          {/* HEADER */}
          <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", color: "#1f2937", fontSize: "17px" }}>
              <div style={{ width: "10px", height: "10px", backgroundColor: "#10b981", borderRadius: "50%" }}></div>
              Live Chat
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f3f4f6", padding: "6px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: "500", color: "#4b5563" }}>
              🌐 Translation Assistant
              <div onClick={() => setTranslationEnabled(!translationEnabled)} style={{ width: "36px", height: "20px", backgroundColor: translationEnabled ? "#ff9f43" : "#d1d5db", borderRadius: "20px", position: "relative", cursor: "pointer", transition: "0.2s" }}>
                <div style={{ width: "16px", height: "16px", backgroundColor: "#fff", borderRadius: "50%", position: "absolute", top: "2px", left: translationEnabled ? "18px" : "2px", transition: "0.2s" }}></div>
              </div>
            </div>
          </div>

          {/* TABS - Added margin-top to move it a bit below as requested */}
          <div style={{ display: "flex", padding: "12px", gap: "10px", marginTop: "8px" }}>
            <button 
              onClick={() => { setActiveTab('chat'); setSelectedChat(null); }} 
              style={{ 
                flex: 1, 
                padding: "12px", 
                borderRadius: "12px", 
                border: "none", 
                fontWeight: "bold", 
                cursor: "pointer", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                gap: "8px", 
                backgroundColor: activeTab === 'chat' ? "#ff9f43" : "#f3f4f6", 
                color: activeTab === 'chat' ? "#fff" : "#4b5563",
                position: 'relative',
                transition: 'all 0.2s'
              }}
            >
              💬 Chat {chatList.reduce((sum, c) => sum + c.unread, 0) > 0 ? `(${chatList.reduce((sum, c) => sum + c.unread, 0)})` : ''}
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              style={{ 
                flex: 1, 
                padding: "12px", 
                borderRadius: "12px", 
                border: "none", 
                fontWeight: "bold", 
                cursor: "pointer", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                gap: "8px", 
                backgroundColor: activeTab === 'settings' ? "#ff9f43" : "#f3f4f6", 
                color: activeTab === 'settings' ? "#fff" : "#4b5563", 
                position: 'relative',
                transition: 'all 0.2s'
              }}
            >
              ⚙️ Settings {pendingInvCount > 0 ? `(${pendingInvCount})` : ''}
            </button>
          </div>
        </div>

        {/* Content Area - Use 'flex: 1' to fill the rest of the height */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", backgroundColor: "#fff" }}>
          
          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Pairing ID */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", backgroundColor: "#fff" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>YOUR PAIRING ID</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "24px", fontWeight: "bold", color: "#374151" }}>{currentUserId || '-----'}</span>
                  <button style={{ backgroundColor: "#ffedd5", color: "#ea580c", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>Share this to connect</button>
                </div>
              </div>

              {/* Pair with a Partner */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", backgroundColor: "#fff" }}>
                <div style={{ fontWeight: "bold", color: "#374151", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  🔗 Pair with a Partner
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="text" placeholder="Enter partner's 8-Digit ID" value={partnerInput} onChange={(e) => setPartnerInput(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", color: "#000000" }} />
                  <button onClick={handleSendInvitation} style={{ backgroundColor: "#ff9f43", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Connect</button>
                </div>
              </div>

              {/* Pending Invitations */}
              <div>
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>PENDING INVITATIONS ({invitations.length})</p>
                {invitations.length === 0 ? (
                  <p style={{ fontSize: "14px", color: "#9ca3af", fontStyle: "italic", margin: 0 }}>No pending invitations.</p>
                ) : (
                  invitations.map(inv => {
                    const isSender = inv.senderID === currentUserId;
                    return (
                      <div key={inv.invitationID} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", backgroundColor: "#fff", marginBottom: "8px" }}>
                        {isSender ? (
                          <>
                            <div style={{ fontWeight: "bold", color: "#374151", marginBottom: "8px" }}>Invitation sent to User {inv.receiverID}</div>
                            <div style={{ fontSize: "14px", color: "#6b7280" }}>Waiting for them to accept and choose your role.</div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontWeight: "bold", color: "#374151", marginBottom: "8px" }}>User {inv.senderID} wants to connect!</div>
                            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "12px" }}>Please select their role before accepting:</div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <button onClick={() => handleAcceptInvitation(inv, 'employer')} style={{ backgroundColor: "#10b981", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>They are my Employer</button>
                              <button onClick={() => handleAcceptInvitation(inv, 'helper')} style={{ backgroundColor: "#3b82f6", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>They are my Helper</button>
                              <button onClick={() => handleRejectInvitation(inv.invitationID)} style={{ backgroundColor: "#f3f4f6", color: "#4b5563", border: "none", padding: "8px 12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>Reject</button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Active Connections */}
              <div style={{ marginTop: "8px" }}>
                <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>ACTIVE CONNECTIONS ({connections.length})</p>
                {connections.map(conn => {
                  const isCurrentEmployer = conn.employerID === currentUserId;
                  const partnerID = isCurrentEmployer ? conn.helperID : conn.employerID;
                  const partnerRole = isCurrentEmployer ? 'Helper' : 'Employer';
                  
                  return (
                    <div key={conn.connectionID} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "40px", height: "40px", backgroundColor: "#ffedd5", color: "#ea580c", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>
                          {partnerID[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: "bold", color: "#1f2937", fontSize: "15px" }}>User {partnerID} <span style={{fontSize: "12px", color:"#6b7280", fontWeight:"normal"}}>({partnerRole})</span></div>
                          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>Connected on {new Date(conn.createTime).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteConnection(conn.connectionID)} style={{ color: "#ef4444", background: "none", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CHAT LIST */}
          {activeTab === 'chat' && !selectedChat && (
            <div style={{ padding: "16px" }}>
              {chatList.map(chat => (
                <div key={chat.id} onClick={() => handleSelectChat({ id: chat.id, name: chat.name })} style={{ display: "flex", alignItems: "center", padding: "16px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "12px", cursor: "pointer", transition: "0.2s" }}>
                  <div style={{ width: "48px", height: "48px", backgroundColor: chat.color, color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "20px", marginRight: "12px", flexShrink: 0 }}>
                    {chat.initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontWeight: "bold", color: "#1f2937", fontSize: "16px" }}>{chat.name}</span>
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>{chat.time}</span>
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.lastMessage}</span>
                      {chat.unread > 0 && (
                        <span style={{ marginLeft: '8px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', minWidth: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', shrink: 0 }}>
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ACTIVE CHAT WINDOW */}
          {activeTab === 'chat' && selectedChat && (
            <ChatWindow 
              chatId={selectedChat.id} 
              partnerName={selectedChat.name} 
              onBack={() => setSelectedChat(null)} 
              translationEnabled={translationEnabled}
              currentUserId={currentUserId}
              role={role}
              chats={chats}
              onSendMessage={onSendMessage}
              onMarkAsRead={() => onMarkChatAsRead && onMarkChatAsRead(selectedChat.id)}
              onDeleteMessage={onDeleteChatMessage}
              lang={lang}
            />
          )}

        </div>
      </div>
    </div>
  );
}
