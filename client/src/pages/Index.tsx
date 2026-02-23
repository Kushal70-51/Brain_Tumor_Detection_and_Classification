import { useState, useCallback } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { MriUpload } from "@/components/MriUpload";
import { PredictionResults } from "@/components/PredictionResults";
import { ChatInterface } from "@/components/ChatInterface";
import { HomeView } from "@/components/HomeView";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<{
    tumor: string;
    confidence: number;
    gradcamImage: string | null;
    originalImage: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalScans: 0,
    lastPrediction: "",
    accuracy: 96.5,
  });

  const handleImageUpload = useCallback((file: File, previewUrl: string) => {
    setPreview(previewUrl);
    setUploadedFile(file);
    setPrediction(null);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setPreview(null);
    setUploadedFile(null);
    setPrediction(null);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!uploadedFile) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("image", uploadedFile);

      // Send request to Flask backend
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const data = await response.json();

      if (data.success) {
        const result = {
          tumor: data.prediction,
          confidence: data.confidence,
          gradcamImage: data.gradcam || null,
          originalImage: preview || "",
        };

        setPrediction(result);
        setStats((prev) => ({
          ...prev,
          totalScans: prev.totalScans + 1,
          lastPrediction: data.prediction,
        }));
      } else {
        throw new Error("Analysis failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during analysis";
      setError(errorMessage);
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedFile, preview]);

  return (
    <div className="flex min-h-screen w-full bg-background gradient-bg-subtle">
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} stats={stats} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <HomeView onNavigate={setActiveTab} />
              </motion.div>
            )}

            {activeTab === "analysis" && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">MRI Analysis</h2>
                  <p className="text-sm text-muted-foreground">Upload a brain MRI scan for AI-powered tumor detection</p>
                </div>

                <MriUpload onImageUpload={handleImageUpload} preview={preview} onClear={handleClear} />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {preview && !prediction && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity hover:opacity-90"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <ScanLine className="w-4 h-4" />
                        Analyze MRI Scan
                      </>
                    )}
                  </motion.button>
                )}

                {prediction && <PredictionResults prediction={prediction} />}
              </motion.div>
            )}

            {activeTab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">AI Chat Assistant</h2>
                  <p className="text-sm text-muted-foreground">Ask questions about brain tumors and neurological conditions</p>
                </div>
                <ChatInterface />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Index;
