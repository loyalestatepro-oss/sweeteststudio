import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import VideoStudio from "./pages/dashboard/VideoStudio";
import ImageStudio from "./pages/dashboard/ImageStudio";
import MusicStudio from "./pages/dashboard/MusicStudio";
import VoiceStudio from "./pages/dashboard/VoiceStudio";
import AvatarStudio from "./pages/dashboard/AvatarStudio";
import Projects from "./pages/dashboard/Projects";
import Templates from "./pages/dashboard/Templates";
import Billing from "./pages/dashboard/Billing";
import Settings from "./pages/dashboard/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="video" element={<VideoStudio />} />
            <Route path="image" element={<ImageStudio />} />
            <Route path="music" element={<MusicStudio />} />
            <Route path="voice" element={<VoiceStudio />} />
            <Route path="avatar" element={<AvatarStudio />} />
            <Route path="projects" element={<Projects />} />
            <Route path="templates" element={<Templates />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
