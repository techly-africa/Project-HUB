"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{ margin: 0, background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          <p style={{ color: "#00c9b1", fontWeight: 900, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>PROJECT HUB</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 32 }}>
            {error.digest ? `Error ID: ${error.digest}` : "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            style={{ background: "#00c9b1", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 10, fontWeight: 900, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
