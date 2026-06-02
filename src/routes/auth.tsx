import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/AppHeader";
import { BookOpen, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Teacher Sign in — ExamHub" },
      { name: "description", content: "Teachers sign in or create an account to manage exams." },
    ],
  }),
  component: AuthPage,
});

const rules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

async function ensureTeacherProfile(user: User) {
  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return;

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? null,
    full_name: typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : null,
    school_name: typeof user.user_metadata.school_name === "string" ? user.user_metadata.school_name : null,
  });

  if (error) throw error;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordValid = mode === "signin" ? password.length > 0 : rules.every((r) => r.test(password));
  const matches = password === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      if (!passwordValid) return toast.error("Password does not meet all requirements");
      if (!matches) return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName, school_name: schoolName },
          },
        });
        if (error) throw error;
        if (data.session && data.user) {
          await ensureTeacherProfile(data.user);
          toast.success("Account created. You're signed in.");
          navigate({ to: "/dashboard" });
          return;
        }
        toast.success("Verification email sent. Check your inbox before signing in.");
        setMode("signin");
        setPassword("");
        setConfirm("");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) await ensureTeacherProfile(data.user);
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "signin" ? "Teacher Sign In" : "Create Teacher Account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage exams, rosters, and results.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            {mode === "signup" && (
              <>
                <div>
                  <Label>Full Name</Label>
                  <Input className="mt-1" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <Label>School Name</Label>
                  <Input className="mt-1" required value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={mode === "signup" ? 8 : 1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <>
                <ul className="space-y-1 rounded-lg bg-muted/40 p-3 text-xs">
                  {rules.map((r) => {
                    const ok = r.test(password);
                    return (
                      <li key={r.label} className={`flex items-center gap-2 ${ok ? "text-success" : "text-muted-foreground"}`}>
                        {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                        {r.label}
                      </li>
                    );
                  })}
                </ul>
                <div>
                  <Label>Confirm Password</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirm.length > 0 && !matches && (
                    <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || (mode === "signup" && (!passwordValid || !matches))}
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "Don't have an account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Are you a student?{" "}
            <Link to="/student-login" className="text-primary hover:underline">
              Take an exam →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
