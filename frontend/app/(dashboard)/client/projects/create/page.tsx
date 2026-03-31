"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PlusCircle,
  CheckCircle2,
  Briefcase,
  DollarSign,
  Calendar,
  Tag,
} from "lucide-react";
import { CATEGORY_OPTIONS } from "@/lib/utils";
import {
  Button,
  Input,
  Textarea,
  Select,
  FormField,
  Card,
  CardContent,
  Alert,
  SkillTag,
} from "@/components/ui";
import type { ProjectCategory } from "@/types";

interface FormData {
  title: string;
  description: string;
  category: ProjectCategory | "";
  budgetMin: string;
  budgetMax: string;
  deadline: string;
  skillInput: string;
  skills: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  budgetMin?: string;
  budgetMax?: string;
  deadline?: string;
}

const INITIAL: FormData = {
  title: "",
  description: "",
  category: "",
  budgetMin: "",
  budgetMax: "",
  deadline: "",
  skillInput: "",
  skills: [],
};

export default function CreateProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const addSkill = () => {
    const skill = form.skillInput.trim();
    if (skill && !form.skills.includes(skill) && form.skills.length < 10) {
      update("skills", [...form.skills, skill]);
      update("skillInput", "");
    }
  };

  const removeSkill = (skill: string) => {
    update("skills", form.skills.filter((s) => s !== skill));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim() || form.title.length > 200)
      e.title = "Title is required (max 200 characters)";
    if (!form.description.trim())
      e.description = "Project description is required";
    if (!form.category) e.category = "Please select a category";
    if (!form.budgetMin || Number(form.budgetMin) <= 0)
      e.budgetMin = "Enter a valid minimum budget";
    if (!form.budgetMax || Number(form.budgetMax) <= 0)
      e.budgetMax = "Enter a valid maximum budget";
    if (form.budgetMin && form.budgetMax && Number(form.budgetMax) < Number(form.budgetMin))
      e.budgetMax = "Max budget must be ≥ min budget";
    if (!form.deadline)
      e.deadline = "Deadline is required";
    else if (new Date(form.deadline) <= new Date())
      e.deadline = "Deadline must be a future date";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => router.push("/my-projects"), 2000);
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Project Posted!</h2>
        <p className="text-muted-foreground">
          Your project is now live and accepting proposals. Redirecting to your projects…
        </p>
      </div>
    );
  }

  // Today's date string for deadline min
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/my-projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          My Projects
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Post a New Project</h1>
        <p className="text-muted-foreground mt-1">
          Fill in the details below. The more specific you are, the better proposals you&apos;ll receive.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section: Basics */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-foreground">Project Basics</h2>
            </div>

            <FormField
              label="Project Title"
              required
              error={errors.title}
              hint="Be specific and descriptive — e.g. 'Spring Boot REST API with JWT auth and PostgreSQL'"
            >
              <Input
                placeholder="Build a production-grade REST API…"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                error={errors.title}
                maxLength={200}
              />
              <div className="text-right text-[10px] text-muted-foreground mt-1">
                {form.title.length}/200
              </div>
            </FormField>

            <FormField
              label="Category"
              required
              error={errors.category}
            >
              <Select
                value={form.category}
                onChange={(e) => update("category", e.target.value as ProjectCategory)}
                placeholder="Select a category"
                options={CATEGORY_OPTIONS}
                error={errors.category}
              />
            </FormField>

            <FormField
              label="Description"
              required
              error={errors.description}
              hint="Describe the project goals, deliverables, tech stack, and anything else relevant. 200+ words recommended."
            >
              <Textarea
                placeholder="We need a production-grade REST API built with Spring Boot 3.x. The API must include JWT-based authentication, role-based access control, PostgreSQL integration via JPA/Hibernate…"
                rows={7}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                error={errors.description}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Section: Budget */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-foreground">Budget Range</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Minimum Budget (USD)" required error={errors.budgetMin}>
                <Input
                  type="number"
                  placeholder="500"
                  min="1"
                  value={form.budgetMin}
                  onChange={(e) => update("budgetMin", e.target.value)}
                  error={errors.budgetMin}
                  startIcon={<span className="text-xs font-bold">$</span>}
                />
              </FormField>
              <FormField label="Maximum Budget (USD)" required error={errors.budgetMax}>
                <Input
                  type="number"
                  placeholder="2000"
                  min="1"
                  value={form.budgetMax}
                  onChange={(e) => update("budgetMax", e.target.value)}
                  error={errors.budgetMax}
                  startIcon={<span className="text-xs font-bold">$</span>}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Section: Skills + Deadline */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                <Tag className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-foreground">Skills & Timeline</h2>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Required Skills
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Java, Spring Boot, PostgreSQL…"
                  value={form.skillInput}
                  onChange={(e) => update("skillInput", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={addSkill}
                  disabled={!form.skillInput.trim()}
                >
                  <PlusCircle className="w-4 h-4" />
                  Add
                </Button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.skills.map((skill) => (
                    <SkillTag
                      key={skill}
                      skill={skill}
                      onRemove={() => removeSkill(skill)}
                    />
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Press Enter or click Add. Max 10 skills. ({form.skills.length}/10)
              </p>
            </div>

            {/* Deadline */}
            <FormField
              label="Deadline"
              required
              error={errors.deadline}
              hint="The date by which you need the project completed"
            >
              <Input
                type="date"
                min={today}
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                error={errors.deadline}
                startIcon={<Calendar className="w-4 h-4" />}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Preview hint */}
        {form.title && form.category && form.budgetMin && form.budgetMax && (
          <Alert variant="default">
            <strong>{form.title}</strong> will be posted in{" "}
            <strong>{CATEGORY_OPTIONS.find((o) => o.value === form.category)?.label}</strong> with a budget of{" "}
            <strong>${form.budgetMin}–${form.budgetMax}</strong>.
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" size="lg" loading={loading}>
            <PlusCircle className="w-4 h-4" />
            Publish Project
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => setForm(INITIAL)}>
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  );
}