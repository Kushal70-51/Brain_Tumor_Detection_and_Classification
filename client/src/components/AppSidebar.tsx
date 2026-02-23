import { Brain, Home, ScanLine, MessageSquare, Activity, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  stats: {
    totalScans: number;
    lastPrediction: string;
    accuracy: number;
  };
}

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "analysis", label: "MRI Analysis", icon: ScanLine },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
];

export function AppSidebar({ activeTab, onTabChange, stats }: AppSidebarProps) {
  return (
    <aside className="w-72 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col p-5 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-2">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">NeuroAI</h1>
          <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Medical Assistant</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-primary bg-sidebar-accent"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-sidebar-accent glow-border"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="glass-card p-4 space-y-3.5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Stats</h3>
        <div className="space-y-3">
          <StatRow icon={Activity} label="Total Scans" value={String(stats.totalScans)} />
          <StatRow icon={Target} label="Last Prediction" value={stats.lastPrediction || "—"} />
          <StatRow icon={TrendingUp} label="Model Accuracy" value={`${stats.accuracy}%`} />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-auto glass-card p-4 border-warning/20">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold text-warning mb-1">Medical Disclaimer</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              This AI tool is for educational purposes only. Always consult a qualified medical professional for diagnosis and treatment.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-semibold font-mono text-foreground">{value}</span>
    </div>
  );
}
