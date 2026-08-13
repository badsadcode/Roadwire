import {
  AudioLines,
  BadgeCheck,
  Boxes,
  Brain,
  ChevronDown,
  CircleGauge,
  Cpu,
  Globe2,
  Keyboard,
  Mic,
  Package,
  Radio,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  TowerControl,
  Trash2,
  UsersRound,
  Volume2,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: CircleGauge, active: true },
  { label: "CB Mode", icon: TowerControl },
  { label: "Broadcaster", icon: Mic },
  { label: "Worlds", icon: Globe2 },
  { label: "Packages", icon: Package },
  { label: "Audio", icon: Volume2 },
  { label: "Hotkeys", icon: Keyboard },
  { label: "Characters", icon: UsersRound },
  { label: "Studio", icon: SlidersHorizontal },
  { label: "Settings", icon: Settings },
];

const drivers = [
  { name: "Bear", detail: "Channel 19", status: "Online", avatar: "B" },
  { name: "Maggie", detail: "Driving North", status: "Driving", avatar: "M" },
  { name: "Rook", detail: "Channel 19", status: "On Break", avatar: "R", warn: true },
  { name: "Skip", detail: "Channel 19", status: "Driving", avatar: "S" },
];

const feed = [
  ["10:42:17", "Bear", "10-4, rolling northbound."],
  ["10:41:03", "Maggie", "Watch for debris near exit 32."],
  ["10:40:21", "Rook", "Fuel stop in 5, be right back."],
  ["10:39:48", "Skip", "Anyone got eyes on a scale?"],
  ["10:38:52", "Bear", "Clear road ahead."],
  ["10:38:11", "System", "Weather update: Clear skies."],
  ["10:37:02", "Maggie", "10-8, catch you later."],
];

const services: Array<[string, string]> = [
  ["Dialogue Provider", "Local LLM (Ollama)"],
  ["TTS Provider", "Kokoro"],
  ["STT Provider", "Whisper (Local)"],
];

const statuses: Array<[string, LucideIcon, string]> = [
  ["LLM", Brain, "Ready"],
  ["TTS", AudioLines, "Ready"],
  ["STT", AudioLines, "Ready"],
  ["Mic", Mic, "Active"],
  ["Radio", TowerControl, "Active"],
];

const deviceRows: Array<[string, string, LucideIcon, string]> = [
  ["Microphone", "Shure MV7 (USB)", Mic, "Test"],
  ["Output Device", "SteelSeries Arctis Nova Pro", Volume2, "Test"],
  ["Push-to-Talk", "Left Ctrl", Keyboard, "Set"],
];

function Waveform({ compact = false }: { compact?: boolean }) {
  const bars = Array.from({ length: compact ? 42 : 64 }, (_, index) => {
    const height = 18 + ((index * 13) % 34);
    return <span key={index} style={{ height }} />;
  });

  return <div className={compact ? "waveform compact" : "waveform"}>{bars}</div>;
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <TowerControl />
        <div>
          <strong>Roadwire</strong>
          <span>AI Radio Companion</span>
        </div>
      </div>

      <nav>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button className={item.active ? "nav-item active" : "nav-item"} key={item.label}>
              <Icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="version">
        <span className="pulse" />
        <div>
          <strong>Roadwire v1.2.0</strong>
          <span>Ready to roll.</span>
        </div>
      </div>
    </aside>
  );
}

function SelectCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="select-card">
      <span>{label}</span>
      <button>
        <Icon />
        {value}
        <ChevronDown className="chevron" />
      </button>
    </div>
  );
}

function ModePanel() {
  return (
    <section className="panel mode-panel">
      <h2>
        <TowerControl /> Mode
      </h2>
      <div className="mode-toggle">
        <button className="selected">
          <Radio />
          CB Mode
        </button>
        <button>
          <Mic />
          Broadcaster Mode
        </button>
      </div>

      <div className="channel-card">
        <span>Current Channel</span>
        <div>
          <AudioLines />
          <strong>19</strong>
          <AudioLines />
        </div>
        <p>Highway Trucker Net</p>
      </div>

      <button className="favorite">
        <Star /> Switch to Favorite (4)
      </button>
    </section>
  );
}

function InputOutputPanel() {
  return (
    <section className="panel io-panel">
      <h2>
        <AudioLines /> Input / Output
      </h2>
      {deviceRows.map(([label, value, Icon, action]) => (
        <label className="device-row" key={label}>
          <span>{label}</span>
          <div>
            <button className="device-select">
              <Icon />
              {value}
              <ChevronDown />
            </button>
            <button className="outline-button">{action}</button>
          </div>
        </label>
      ))}
      <p className="hint">Hold to transmit. Release to listen.</p>
    </section>
  );
}

function ServicesPanel() {
  return (
    <section className="panel services-panel">
      <h2>
        <Cpu /> AI Services
      </h2>
      {services.map(([label, value]) => (
        <label className="service-row" key={label}>
          <span>{label}</span>
          <div>
            <button>
              <Sparkles />
              {value}
              <ChevronDown />
            </button>
            <em>Ready</em>
          </div>
        </label>
      ))}
      <p className="success">All systems nominal.</p>
    </section>
  );
}

function ActivityPanel() {
  return (
    <section className="panel activity-panel">
      <h2>
        <Globe2 /> World / Radio Activity
      </h2>
      <div className="activity-grid">
        <div className="drivers">
          <h3>Drivers Online (4)</h3>
          {drivers.map((driver) => (
            <div className="driver" key={driver.name}>
              <div className="avatar">{driver.avatar}</div>
              <div>
                <strong>{driver.name}</strong>
                <span>{driver.detail}</span>
              </div>
              <em className={driver.warn ? "warning" : ""}>{driver.status}</em>
              <Wifi />
            </div>
          ))}
          <button className="muted-button">
            <UsersRound /> View All Drivers
          </button>
        </div>

        <div className="feed">
          <div className="feed-head">
            <h3>Activity Feed</h3>
            <span>Live</span>
          </div>
          {feed.map(([time, speaker, line]) => (
            <p key={`${time}-${speaker}`}>
              <time>{time}</time>
              <strong className={speaker.toLowerCase()}>{speaker}:</strong>
              {line}
            </p>
          ))}
          <button className="muted-button">
            <Trash2 /> Clear Feed
          </button>
        </div>
      </div>
    </section>
  );
}

function BroadcasterPanel() {
  return (
    <section className="panel broadcaster-panel">
      <h2>
        <TowerControl /> Broadcaster Preview
      </h2>
      <div className="broadcaster-content">
        <div className="poster">
          <TowerControl />
          <strong>Free Mile Radio</strong>
          <span>Roadwire</span>
        </div>
        <div>
          <h3>Free Mile Radio</h3>
          <span>Host</span>
          <p>Elias “Wiretap” Boone</p>
          <span>Format</span>
          <p>Road • Stories • Good Vibes</p>
          <Waveform compact />
        </div>
      </div>
      <button className="primary-wide">
        <Mic /> Switch to Broadcaster Mode
      </button>
    </section>
  );
}

function StatusPanel() {
  return (
    <section className="panel status-panel">
      <h2>System Status</h2>
      <div>
        {statuses.map(([label, Icon, status]) => (
          <article key={label}>
            <Icon />
            <strong>{label}</strong>
            <span>{status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function HotkeysPanel() {
  return (
    <section className="panel hotkeys-panel">
      <h2>Hotkeys</h2>
      <div className="hotkey-grid">
        {[
          ["PTT (Hold)", "Left Ctrl"],
          ["Channel Down", "Page Down"],
          ["Channel Up", "Page Up"],
          ["Mute / Unmute", "M"],
        ].map(([label, key]) => (
          <p key={label}>
            <span>{label}</span>
            <kbd>{key}</kbd>
          </p>
        ))}
      </div>
      <button>View / Edit All Hotkeys</button>
    </section>
  );
}

export function App() {
  return (
    <main className="app-shell">
      <Sidebar />
      <section className="workspace">
        <header className="topbar">
          <SelectCard label="Package" value="Motor Town Pack" icon={Boxes} />
          <SelectCard label="World / Save" value="Tom's Main World" icon={Globe2} />
          <button className="system-active">
            <TowerControl />
            <strong>System Active</strong>
            <span>Click to Stop</span>
          </button>
        </header>

        <div className="dashboard-grid">
          <ModePanel />
          <InputOutputPanel />
          <ServicesPanel />
          <ActivityPanel />
          <BroadcasterPanel />
          <StatusPanel />
          <section className="panel monitor-panel">
            <h2>Radio Monitor</h2>
            <Waveform />
            <p>
              Channel 19 <span /> Highway Trucker Net
            </p>
            <button>RX</button>
          </section>
          <HotkeysPanel />
        </div>
      </section>
    </main>
  );
}
