import { useParams, useNavigate } from "react-router-dom";

export default function VideoCall() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.roomLabel}>Video consultation</span>
        <button onClick={() => navigate(-1)} style={styles.leaveButton}>Leave call</button>
      </div>
      <iframe
        src={`https://meet.jit.si/${roomId}#config.prejoinPageEnabled=false`}
        style={styles.iframe}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        title="Video consultation"
      />
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", flexDirection: "column", height: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid #E5E7EB" },
  roomLabel: { fontSize: 14, fontWeight: 600 },
  leaveButton: { border: "1px solid #DC2626", background: "#FFFFFF", color: "#DC2626", fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 6, cursor: "pointer" },
  iframe: { flex: 1, border: "none", width: "100%" },
};