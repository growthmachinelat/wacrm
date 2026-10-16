"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  CheckCircle2,
  Crown,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdminUserRow {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  account_role: string | null;
  publisher: boolean;
  created_at: string;
}

export default function PublisherUsersPage() {
  const router = useRouter();
  const { isPublisher, profileLoading } = useAuth();
  const t = useTranslations("PublisherUsers");
  const tRoles = useTranslations("Settings.roles");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!profileLoading && !isPublisher) {
      router.replace("/dashboard");
    }
  }, [profileLoading, isPublisher, router]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) {
        setLoadingUsers(false);
        return;
      }
      const payload = (await res.json()) as { users?: AdminUserRow[] };
      setUsers(Array.isArray(payload.users) ? payload.users : []);
    } catch {
      // Handled gracefully with empty state
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (!profileLoading && isPublisher) {
      void fetchUsers();
    }
  }, [profileLoading, isPublisher, fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        user?: { email?: string };
      };

      if (!res.ok) {
        const message = payload.error || t("createError");
        setFormError(message);
        toast.error(message);
        setSubmitting(false);
        return;
      }

      const createdEmail = payload.user?.email || email.trim().toLowerCase();
      const successMsg = t("createSuccess", { email: createdEmail });
      setFormSuccess(successMsg);
      toast.success(successMsg);
      setFullName("");
      setEmail("");
      setPassword("");
      void fetchUsers();
    } catch {
      const message = t("createError");
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (profileLoading || !isPublisher) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
        {/* Create User Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <UserPlus className="size-4 text-primary" />
              {t("createTitle")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("createDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              {formError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-fullName" className="text-muted-foreground">
                  {t("fullNameLabel")}
                </Label>
                <Input
                  id="admin-fullName"
                  type="text"
                  placeholder={t("fullNamePlaceholder")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  maxLength={120}
                  className="border-border bg-muted text-foreground"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-email" className="text-muted-foreground">
                  {t("emailLabel")}
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={254}
                  className="border-border bg-muted text-foreground"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-password" className="text-muted-foreground">
                  {t("passwordLabel")}
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                  className="border-border bg-muted text-foreground"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="mt-1 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("creating")}
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4" />
                    {t("submit")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users List Card */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <Users className="size-4 text-primary" />
                {t("listTitle")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {t("listDescription", { count: users.length })}
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <RefreshCw
                className={`size-3.5 ${loadingUsers ? "animate-spin" : ""}`}
              />
              {t("refresh")}
            </Button>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-primary" />
                {t("loading")}
              </div>
            ) : users.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("empty")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">{t("colUser")}</th>
                      <th className="pb-3 pr-4 font-medium">{t("colEmail")}</th>
                      <th className="pb-3 pr-4 font-medium">{t("colRole")}</th>
                      <th className="pb-3 font-medium">{t("colCreated")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((u) => (
                      <tr key={u.id} className="align-middle">
                        <td className="py-3 pr-4 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <span>{u.full_name || "—"}</span>
                            {u.publisher && (
                              <Badge
                                variant="outline"
                                className="border-amber-500/40 bg-amber-500/10 text-amber-300"
                              >
                                <ShieldCheck className="mr-1 size-3" />
                                {t("publisherBadge")}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {u.email}
                        </td>
                        <td className="py-3 pr-4">
                          {u.account_role ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                              {u.account_role === "owner" && (
                                <Crown className="size-3 text-amber-400" />
                              )}
                              {tRoles(
                                u.account_role as
                                  | "owner"
                                  | "admin"
                                  | "agent"
                                  | "viewer",
                              )}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
