import { motion } from "framer-motion";
import { Brain, ScanLine, MessageSquare, Shield, Zap, Activity } from "lucide-react";

interface HomeViewProps {
  onNavigate: (tab: string) => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const features = [
    {
      icon: ScanLine,
      title: "MRI Analysis",
      desc: "Upload brain MRI scans for instant AI-powered tumor classification with Grad-CAM visualization.",
      action: "analysis",
    },
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      desc: "Get instant answers about brain tumors, treatment options, and neurological conditions.",
      action: "chat",
    },
    {
      icon: Shield,
      title: "Reliable & Accurate",
      desc: "Built on deep learning models trained on thousands of annotated medical images.",
      action: null,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-2">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-[11px] font-medium text-primary">AI-Powered Diagnostics</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Brain Tumor Detection
          <br />
          <span className="glow-text">Powered by AI</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Upload MRI scans, receive instant AI classification, and explore tumor insights through an intelligent chat interface.
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { icon: Activity, label: "Model Accuracy", value: "96.5%" },
          { icon: Brain, label: "Tumor Types", value: "4 Classes" },
          { icon: ScanLine, label: "Processing Time", value: "<2s" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xl font-bold font-mono text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Feature Cards */}
      <div className="grid gap-4">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            onClick={() => feature.action && onNavigate(feature.action)}
            className={`glass-card-hover p-5 flex items-start gap-4 ${
              feature.action ? "cursor-pointer" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
