import { JitsiMeeting } from '@jitsi/react-sdk';
import { motion } from 'framer-motion';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef, useState } from 'react';
import {
  FaCheck,
  FaCopy,
  FaEdit,
  FaPaintBrush,
  FaUsers,
  FaVideo,
} from 'react-icons/fa';
import io from 'socket.io-client';
import Whiteboard from './Whiteboard';

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ size: ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
];

const CollabEditor = ({ roomId, username }) => {
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const quillRef = useRef(null);
  const [userCount, setUserCount] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editorType, setEditorType] = useState('text'); // 'text' or 'whiteboard'
  const [showVideo, setShowVideo] = useState(false); // Toggle for JitsiMeeting

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room ID:', err);
    }
  };

  useEffect(() => {
    // Only initialize Quill once
    if (!editorRef.current || quillRef.current) return;

    editorRef.current.classList.add('custom-quill-editor');

    const editor = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        history: {
          userOnly: true,
        },
      },
      placeholder: 'Start collaborating...',
    });

    quillRef.current = editor;

    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.emit('join-room', { roomId, username });

    socket.on('user-count', count => {
      setUserCount(count);
    });

    socket.on('receive-changes', delta => {
      if (quillRef.current) {
        quillRef.current.updateContents(delta);
      }
    });

    socket.on('load-document', document => {
      if (quillRef.current) {
        quillRef.current.setContents(document);
        quillRef.current.enable();
      }
    });

    const handleTextChange = (delta, oldDelta, source) => {
      if (source !== 'user' || !socketRef.current) return;
      setSaving(true);
      socketRef.current.emit('send-changes', { delta, roomId });
      setTimeout(() => setSaving(false), 1000);
    };

    quillRef.current.on('text-change', handleTextChange);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (quillRef.current) {
        quillRef.current.off('text-change', handleTextChange);
        quillRef.current = null;
      }
    };
  }, [roomId, username]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-yellow-50 py-8 px-6 sm:px-8 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[95%] mx-auto"
      >
        <div className="flex gap-6">
          {/* Video Conference Section */}
          {showVideo && (
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="w-1/3 bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] overflow-hidden border border-yellow-100"
            >
              <div className="h-[calc(100vh-6rem)]">
                <JitsiMeeting
                  domain="meet.jit.si"
                  roomName={`unisphere-${roomId}`}
                  userInfo={{
                    displayName: username,
                  }}
                  configOverwrite={{
                    startWithAudioMuted: true,
                    startWithVideoMuted: false,
                    toolbarButtons: [
                      'camera',
                      'chat',
                      'closedcaptions',
                      'desktop',
                      'fullscreen',
                      'hangup',
                      'microphone',
                      'participants-pane',
                      'select-background',
                      'settings',
                      'toggle-camera',
                    ],
                  }}
                  interfaceConfigOverwrite={{
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    MOBILE_APP_PROMO: false,
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                  }}
                  getIFrameRef={iframeRef => {
                    iframeRef.style.height = '100%';
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Editor Section */}
          <motion.div
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            className={`bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] overflow-hidden border border-yellow-100 ${
              showVideo ? 'w-2/3' : 'w-full'
            }`}
          >
            {/* Header Section */}
            <div className="px-8 py-6 border-b border-yellow-200 bg-gradient-to-r from-white via-yellow-50 to-white">
              <div className="flex justify-between items-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-4"
                >
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaUsers className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                      Collaborative Workspace
                    </h2>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      {userCount} active collaborators
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-white px-4 py-2.5 rounded-xl border border-yellow-200">
                    <span className="text-sm font-medium text-gray-700">
                      Room:
                    </span>
                    <code className="px-3 py-1.5 bg-white rounded-lg text-sm font-mono border border-yellow-200 shadow-sm">
                      {roomId}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyRoomId}
                      className="p-2 hover:bg-yellow-100 rounded-full transition-all duration-200"
                      title="Copy room ID"
                    >
                      {isCopied ? (
                        <FaCheck className="text-green-500 h-4 w-4" />
                      ) : (
                        <FaCopy className="text-yellow-600 h-4 w-4" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditorType('text')}
                    className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                      editorType === 'text'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <FaEdit className="h-4 w-4" />
                    Text Editor
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditorType('whiteboard')}
                    className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                      editorType === 'whiteboard'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <FaPaintBrush className="h-4 w-4" />
                    Whiteboard
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowVideo(prev => !prev)}
                    className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                      showVideo
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <FaVideo className="h-4 w-4" />
                    {showVideo ? 'Hide Video' : 'Show Video'}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Editor Container */}
            <div className="relative bg-white p-4">
              {editorType === 'text' ? (
                <div
                  ref={editorRef}
                  className="min-h-[calc(100vh-300px)] bg-white rounded-xl"
                />
              ) : (
                <div className="min-h-[calc(100vh-300px)] bg-white rounded-xl">
                  <Whiteboard socket={socketRef.current} roomId={roomId} />
                </div>
              )}
            </div>

            {/* Status Footer */}
            <div className="px-8 py-4 bg-gradient-to-r from-yellow-50 via-white to-yellow-50 border-t border-yellow-100">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-600 text-right flex items-center justify-end gap-2"
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    saving ? 'bg-yellow-400' : 'bg-green-500'
                  }`}
                ></span>
                {saving ? 'Saving changes...' : 'All changes saved'}
              </motion.p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CollabEditor;
