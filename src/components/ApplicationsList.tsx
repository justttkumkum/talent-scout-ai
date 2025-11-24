import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  User, Mail, Linkedin, Code, FileText, 
  TrendingUp, Award, MessageSquare, GraduationCap,
  CheckCircle2, XCircle, Clock
} from "lucide-react";

interface Application {
  id: string;
  name: string;
  email: string;
  linkedin_url: string | null;
  tech_stack: string[];
  resume_url: string;
  candidate_type: string | null;
  technical_skill_score: number | null;
  experience_relevance_score: number | null;
  communication_score: number | null;
  education_quality_score: number | null;
  education_category: string | null;
  strengths: string | null;
  weaknesses: string | null;
  recommendation: string;
  created_at: string;
}

export function ApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'Recommended':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Not Recommended':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getRecommendationVariant = (recommendation: string): "default" | "destructive" | "secondary" => {
    switch (recommendation) {
      case 'Recommended':
        return 'default';
      case 'Not Recommended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-medium border-0">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="shadow-medium border-0">
        <CardContent className="py-16 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
          <p className="text-muted-foreground">
            Applications will appear here once candidates start submitting
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[800px] pr-4">
      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="shadow-medium border-0">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    {app.name}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {app.email}
                    </span>
                    {app.linkedin_url && (
                      <a 
                        href={app.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
                <Badge 
                  variant={getRecommendationVariant(app.recommendation)}
                  className="gap-1"
                >
                  {getRecommendationIcon(app.recommendation)}
                  {app.recommendation}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tech Stack */}
              <div>
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Code className="w-4 h-4" />
                  Tech Stack
                </div>
                <div className="flex flex-wrap gap-2">
                  {app.tech_stack.map((tech) => (
                    <Badge key={tech} variant="outline">{tech}</Badge>
                  ))}
                </div>
              </div>

              {/* Candidate Type */}
              {app.candidate_type && (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Type:</span>
                  <Badge variant="secondary" className="capitalize">
                    {app.candidate_type}
                  </Badge>
                </div>
              )}

              <Separator />

              {/* Scores */}
              {app.technical_skill_score !== null && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      Technical
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {app.technical_skill_score}/10
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Award className="w-3 h-3" />
                      Experience
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {app.experience_relevance_score}/10
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="w-3 h-3" />
                      Communication
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {app.communication_score}/10
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <GraduationCap className="w-3 h-3" />
                      Education
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {app.education_quality_score}/10
                    </div>
                  </div>
                </div>
              )}

              {/* Education Category */}
              {app.education_category && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Education: {app.education_category}</span>
                </div>
              )}

              {/* Analysis */}
              {(app.strengths || app.weaknesses) && (
                <>
                  <Separator />
                  <div className="grid md:grid-cols-2 gap-4">
                    {app.strengths && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-green-600 dark:text-green-400">
                          Strengths
                        </h4>
                        <p className="text-sm text-muted-foreground">{app.strengths}</p>
                      </div>
                    )}
                    {app.weaknesses && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-orange-600 dark:text-orange-400">
                          Areas for Growth
                        </h4>
                        <p className="text-sm text-muted-foreground">{app.weaknesses}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Resume Link */}
              <a
                href={app.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="w-4 h-4" />
                View Resume
              </a>

              <div className="text-xs text-muted-foreground">
                Submitted {new Date(app.created_at).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
