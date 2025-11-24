import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const technologies = [
  "React", "Vue", "Angular", "Node.js", "Python", "Java", "C#", "Go",
  "TypeScript", "JavaScript", "PHP", "Ruby", "Swift", "Kotlin", "Rust",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "Docker", "Kubernetes",
  "AWS", "Azure", "GCP", "Git", "CI/CD", "REST API", "GraphQL"
];

interface TechStackSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function TechStackSelect({ value, onChange }: TechStackSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleTech = (tech: string) => {
    if (value.includes(tech)) {
      onChange(value.filter(t => t !== tech));
    } else {
      onChange([...value, tech]);
    }
  };

  const removeTech = (tech: string) => {
    onChange(value.filter(t => t !== tech));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value.length > 0 ? `${value.length} selected` : "Select technologies..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search technologies..." />
            <CommandEmpty>No technology found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {technologies.map((tech) => (
                <CommandItem
                  key={tech}
                  value={tech}
                  onSelect={() => toggleTech(tech)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(tech) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tech}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tech) => (
            <Badge key={tech} variant="secondary" className="gap-1">
              {tech}
              <button
                type="button"
                onClick={() => removeTech(tech)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
