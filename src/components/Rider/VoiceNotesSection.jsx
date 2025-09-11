import React, { useRef, useState } from "react";
import { Mic } from "lucide-react";

const VoiceNotesSection = ({ voiceNotes, setFormData }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setFormData((prev) => ({
          ...prev,
          voiceNotes: [...prev.voiceNotes, { blob, url }],
        }));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("🎤 Recording error:", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeVoiceNote = (index) => {
    setFormData((prev) => ({
      ...prev,
      voiceNotes: prev.voiceNotes.filter((_, i) => i !== index),
    }));
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Voice Notes (Optional)</h3>
      {voiceNotes.length > 0 && (
        <div className="space-y-2 mb-3">
          {voiceNotes.map((note, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg"
            >
              <audio controls src={note.url} className="w-full mr-2" />
              <button
                type="button"
                onClick={() => removeVoiceNote(i)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full flex items-center justify-center py-3 rounded-lg text-white font-medium ${
          isRecording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        <Mic className="h-5 w-5 mr-2" />
        {isRecording ? "Stop Recording" : "Record New Voice Note"}
      </button>
    </div>
  );
};

export default VoiceNotesSection;
