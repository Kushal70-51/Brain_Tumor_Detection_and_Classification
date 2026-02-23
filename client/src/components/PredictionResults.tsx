import { motion } from "framer-motion";
import { Brain, Zap, Eye } from "lucide-react";

interface PredictionResultsProps {
  prediction: {
    tumor: string;
    confidence: number;
    gradcamImage: string | null;
    originalImage: string;
  };
}

export function PredictionResults({ prediction }: PredictionResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* Prediction Header */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Diagnosis Result
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{prediction.tumor}</h2>
            <p className="text-xs text-muted-foreground mt-1">Tumor Classification</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Confidence</span>
            </div>
            <span className="text-3xl font-bold font-mono glow-text">
              {prediction.confidence.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${prediction.confidence}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full gradient-primary progress-glow"
          />
        </div>
      </div>

      {/* GradCAM Comparison */}
      {prediction.gradcamImage && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Grad-CAM Visualization
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 text-center">Original</p>
              <img
                src={prediction.originalImage}
                alt="Original MRI"
                className="w-full rounded-xl object-contain bg-background/50 max-h-48"
              />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 text-center">Grad-CAM</p>
              <img
                src={prediction.gradcamImage}
                alt="Grad-CAM"
                className="w-full rounded-xl object-contain bg-background/50 max-h-48"
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
