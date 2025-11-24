import { ApplicationForm } from "@/components/ApplicationForm";
import { ApplicationsList } from "@/components/ApplicationsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Screening
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Smart Recruitment Platform
            </h1>
            <p className="text-xl text-muted-foreground">
              Streamline your hiring process with AI-powered candidate analysis and automated screening
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <Tabs defaultValue="apply" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="apply">Apply Now</TabsTrigger>
            <TabsTrigger value="applications">View Applications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="apply" className="mt-0">
            <ApplicationForm />
          </TabsContent>
          
          <TabsContent value="applications" className="mt-0">
            <ApplicationsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
