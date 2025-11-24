import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TechStackSelect } from "./TechStackSelect";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  techStack: z.array(z.string()).min(1, "Select at least one technology"),
  resumeFile: z.instanceof(File).optional(),
  resumeUrl: z.string().url("Invalid resume URL").optional().or(z.literal("")),
  zapierWebhook: z.string().url("Invalid webhook URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      linkedinUrl: "",
      techStack: [],
      zapierWebhook: "",
    },
  });

  const uploadResume = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `resumes/${fileName}`;

    setUploadProgress(30);
    
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    setUploadProgress(60);

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    setUploadProgress(100);
    return publicUrl;
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let resumeUrl = values.resumeUrl || "";

      if (values.resumeFile) {
        resumeUrl = await uploadResume(values.resumeFile);
      }

      if (!resumeUrl) {
        toast({
          title: "Error",
          description: "Please provide either a resume file or URL",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('process-application', {
        body: {
          name: values.name,
          email: values.email,
          linkedinUrl: values.linkedinUrl,
          techStack: values.techStack,
          resumeUrl,
          zapierWebhook: values.zapierWebhook,
        },
      });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your application has been processed and analyzed.",
      });

      form.reset();
      setUploadProgress(0);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-medium border-0">
      <CardHeader>
        <CardTitle>Submit Your Application</CardTitle>
        <CardDescription>
          Fill out the form below. Our AI will analyze your profile and provide instant feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="https://linkedin.com/in/username" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="techStack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stack</FormLabel>
                  <FormControl>
                    <TechStackSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>
                    Select the technologies you're proficient in
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="resumeFile"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Resume Upload</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          className="cursor-pointer"
                          {...field}
                        />
                        <Upload className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload your resume (PDF, DOC, or DOCX)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-center text-sm text-muted-foreground">or</div>

              <FormField
                control={form.control}
                name="resumeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://drive.google.com/..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a link to your resume
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="zapierWebhook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zapier Webhook URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://hooks.zapier.com/..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Add your Zapier webhook to receive notifications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Application...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
