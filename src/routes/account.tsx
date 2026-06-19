import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  CreditCard,
  Globe,
  KeyRound,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({
    meta: [
      { title: "Account — Modern Trust" },
      { name: "description", content: "Manage your profile, settings, and payment methods." },
    ],
  }),
});

const LIFESTYLE_TAGS = [
  "Student",
  "Professional",
  "Quiet Lifestyle",
  "Pet Friendly",
  "Non-Smoker",
  "Remote Worker",
  "Family",
];

const LANGUAGES = [
  { code: "th", label: "ไทย" },
  { code: "en", label: "English" },
  { code: "jp", label: "日本語" },
  { code: "kr", label: "한국어" },
  { code: "cn", label: "中文" },
];

function AccountPage() {
  const { user, updateProfile, verifyIdentity, authLoading } = useApp();
  const nav = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      void nav({ to: "/login" });
    }
  }, [user, authLoading, nav]);

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Account</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, settings, and payment methods.
          </p>
        </div>
        <Link to="/profile/$id" params={{ id: "me" }}>
          <Button variant="outline" size="sm">View public profile</Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-6"
      >
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:max-w-md">
            <TabsTrigger value="profile" className="gap-1.5">
              <UserIcon className="h-3.5 w-3.5" /> Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Settings
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-1.5">
              <CreditCard className="h-3.5 w-3.5" /> Payment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileTab user={user} onSave={updateProfile} onVerify={verifyIdentity} />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <SettingsTab user={user} onSave={updateProfile} />
          </TabsContent>
          <TabsContent value="payment" className="mt-6">
            <PaymentTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function ProfileTab({
  user,
  onSave,
  onVerify,
}: {
  user: ReturnType<typeof useApp>["user"];
  onSave: ReturnType<typeof useApp>["updateProfile"];
  onVerify: (idCardNumber?: string, idCardImageUrl?: string) => Promise<void>;
}) {
  const u = user!;
  const [name, setName] = useState(u.name);
  const [bio, setBio] = useState(u.bio ?? "");
  const [avatar, setAvatar] = useState(u.avatar ?? "");
  const [preferredArea, setPreferredArea] = useState(u.preferredArea ?? "");
  const [moveInTimeline, setMoveInTimeline] = useState(u.moveInTimeline ?? "");
  const [tags, setTags] = useState<string[]>(u.lifestyleTags ?? []);
  const [idCardNumber, setIdCardNumber] = useState(u.idCardNumber ?? "");
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(u.name);
    setBio(u.bio ?? "");
    setAvatar(u.avatar ?? "");
    setPreferredArea(u.preferredArea ?? "");
    setMoveInTimeline(u.moveInTimeline ?? "");
    setTags(u.lifestyleTags ?? []);
    setIdCardNumber(u.idCardNumber ?? "");
    setIdCardFile(null);
    setAvatarFile(null);
  }, [user]);
  const fileRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);

  const handleVerifySubmit = async () => {
    if (idCardNumber.length !== 13) {
      toast.error("Please enter a valid 13-digit ID card number.");
      return;
    }
    if (!idCardFile) {
      toast.error("Please select your ID card image to upload.");
      return;
    }

    setIsVerifying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        toast.error("Session not found. Please log in again.");
        return;
      }

      // 1. Upload file to Supabase Storage
      const fileExt = idCardFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      console.log("Uploading ID file to user-documents storage path:", filePath);
      const { error: uploadError } = await supabase.storage
        .from("user-documents")
        .upload(filePath, idCardFile);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from("user-documents")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;
      console.log("Uploaded file public URL:", imageUrl);

      // 3. Call context verifyIdentity to update users table and auth metadata
      await onVerify(idCardNumber, imageUrl);
      toast.success("Identity verified successfully!");
    } catch (err: any) {
      console.error("Verification error:", err);
      toast.error(err.message || "Failed to submit identity verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  const onFile = (files: FileList | null) => {
    if (!files?.[0]) return;
    const file = files[0];
    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      let finalAvatar = avatar;

      if (avatarFile) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) {
          toast.error("Session not found. Please log in again.");
          return;
        }

        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        console.log("Uploading profile photo to profile storage path:", filePath);
        const { error: uploadError } = await supabase.storage
          .from("profile")
          .upload(filePath, avatarFile);

        if (uploadError) {
          console.error("Profile upload error:", uploadError);
          throw new Error(`Profile photo upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("profile")
          .getPublicUrl(filePath);

        finalAvatar = publicUrlData.publicUrl;
        console.log("Uploaded profile photo public URL:", finalAvatar);
      }

      await onSave({ name, bio, avatar: finalAvatar, preferredArea, moveInTimeline, lifestyleTags: tags });
      setAvatarFile(null);
      toast.success("Profile updated");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTag = (tag: string) =>
    setTags((arr) => (arr.includes(tag) ? arr.filter((t) => t !== tag) : [...arr, tag]));

  const previewAvatar =
    avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || u.name)}`;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Profile photo</h2>
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <img
            src={previewAvatar}
            alt=""
            className="h-24 w-24 rounded-2xl border border-border object-cover"
          />
          <div className="space-y-2">
            <Button onClick={() => fileRef.current?.click()} className="gap-2" disabled={isSaving}>
              <Upload className="h-4 w-4" /> Upload new photo
            </Button>
            {avatar && (
              <Button variant="outline" size="sm" onClick={() => { setAvatar(""); setAvatarFile(null); }} disabled={isSaving}>
                Remove
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Square images at least 256×256 recommended.
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onFile(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Basic info</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Display name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={u.email} disabled />
          </Field>
          <Field label="About" className="sm:col-span-2">
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other users about yourself…"
              className="min-h-[110px]"
            />
          </Field>
        </div>
      </section>

      {u.role === "renter" && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Renter preferences</h2>
          <p className="text-xs text-muted-foreground">
            Optional. Helps landlords understand whether their place is a good fit.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Preferred area">
              <Input
                value={preferredArea}
                onChange={(e) => setPreferredArea(e.target.value)}
                placeholder="e.g. Ari, Asoke"
              />
            </Field>
            <Field label="Move-in timeline">
              <Input
                value={moveInTimeline}
                onChange={(e) => setMoveInTimeline(e.target.value)}
                placeholder="e.g. Within 30 days"
              />
            </Field>
          </div>
          <div className="mt-5">
            <Label className="text-xs font-medium text-muted-foreground">Lifestyle tags</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {LIFESTYLE_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <BadgeCheck className={`h-5 w-5 ${u.verified ? "text-success" : "text-primary"}`} />
          <h2 className="font-semibold">Identity verification</h2>
          {u.verified && (
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              Verified
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {u.verified
            ? "Your identity is verified. The badge is visible on your public profile."
            : "Upload a government-issued ID to earn a verified badge."}
        </p>

        {!u.verified && (
          <div className="mt-4 space-y-4 max-w-sm">
            <Field label="ID Card Number (13 digits)">
              <Input
                value={idCardNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 13);
                  setIdCardNumber(val);
                }}
                placeholder="e.g. 1100100123456"
                maxLength={13}
                disabled={isVerifying}
              />
            </Field>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">ID Card Image</Label>
              <div className="mt-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    className="gap-2"
                    variant="outline"
                    type="button"
                    disabled={isVerifying}
                    onClick={() => idRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" /> Select ID Image
                  </Button>
                  <span className="text-xs text-muted-foreground truncate">
                    {idCardFile ? idCardFile.name : "No file selected"}
                  </span>
                </div>
                <input
                  ref={idRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  disabled={isVerifying}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIdCardFile(file);
                    }
                  }}
                />
              </div>
            </div>

            <Button
              className="w-full gap-2 mt-4"
              onClick={handleVerifySubmit}
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Submit Verification"}
            </Button>
          </div>
        )}
      </section>

      <div className="flex justify-end gap-2">
        <Button onClick={save} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function SettingsTab({
  user,
  onSave,
}: {
  user: ReturnType<typeof useApp>["user"];
  onSave: ReturnType<typeof useApp>["updateProfile"];
}) {
  const u = user!;
  const { toggleLang } = useApp();
  const [phone, setPhone] = useState(u.phone ?? "");
  const [lineId, setLineId] = useState(u.lineId ?? "");
  const [currentLang, setCurrentLang] = useState(u.language || "en");
  const [lineQrUrl, setLineQrUrl] = useState(u.lineQrUrl ?? "");
  const [lineQrFile, setLineQrFile] = useState<File | null>(null);
  const [notifyEmail, setNotifyEmail] = useState(u.notifyEmail ?? true);
  const [notifyPush, setNotifyPush] = useState(u.notifyPush ?? true);
  const [notifySms, setNotifySms] = useState(u.notifySms ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneContactEnabled, setPhoneContactEnabled] = useState(u.phoneContactEnabled ?? false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const qrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPhone(u.phone ?? "");
    setLineId(u.lineId ?? "");
    setLineQrUrl(u.lineQrUrl ?? "");
    setLineQrFile(null);
    setPhoneContactEnabled(u.phoneContactEnabled ?? false);
    setNotifyEmail(u.notifyEmail ?? true);
    setNotifyPush(u.notifyPush ?? true);
    setNotifySms(u.notifySms ?? false);
    setCurrentLang(u.language || "en");
  }, [user]);

  const save = async () => {
    setIsSaving(true);
    try {
      let finalQrUrl = lineQrUrl;

      if (lineQrFile) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) {
          toast.error("Session not found. Please log in again.");
          return;
        }

        const fileExt = lineQrFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        console.log("Uploading QR code to bucket 'qr-codes' path:", filePath);
        const { error: uploadError } = await supabase.storage
          .from("qr-codes")
          .upload(filePath, lineQrFile);

        if (uploadError) {
          console.error("QR Code upload error:", uploadError);
          throw new Error(`QR Code upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("qr-codes")
          .getPublicUrl(filePath);

        finalQrUrl = publicUrlData.publicUrl;
        setLineQrUrl(finalQrUrl);
        console.log("Uploaded QR Code public URL:", finalQrUrl);
      }

      const cleanLineId = lineId.trim();
      const derivedLineUrl = cleanLineId
        ? `https://line.me/R/ti/p/~${cleanLineId.replace("@", "")}`
        : "";

      await onSave({
        phone,
        lineId: cleanLineId,
        lineUrl: derivedLineUrl,
        lineQrUrl: finalQrUrl,
        phoneContactEnabled,
        notifyEmail,
        notifyPush,
        notifySms,
        language: currentLang,
      });
      setLineQrFile(null);
      toast.success("Settings saved");
    } catch (err: any) {
      console.error("Save settings error:", err);
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Personal</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Phone number">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+66 ..."
                className="pl-9"
                disabled={isSaving}
              />
            </div>
          </Field>
          {u.role === "landlord" && (
            <Field label="Line ID">
              <Input
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                placeholder="e.g. @username"
                disabled={isSaving}
              />
            </Field>
          )}
          <Field label="Language">
  <div className="relative">
    <select
      value={currentLang}
      disabled={isSaving}
      onChange={(e) => setCurrentLang(e.target.value)}
      className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
    >
      <option value="th">ไทย</option>
      <option value="en">English</option>
      <option value="jp">日本語</option>
      <option value="kr">한국어</option>
      <option value="cn">中文</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    </div>
  </div>
</Field>

          {u.role === "landlord" && (
            <div className="sm:col-span-2 space-y-2 pt-2 border-t border-border/50">
              <Label className="text-xs font-medium text-muted-foreground">Line QR Code Image</Label>
              <div className="flex flex-wrap items-center gap-4">
                {(lineQrUrl || lineQrFile) ? (
                  <img
                    src={lineQrFile ? URL.createObjectURL(lineQrFile) : lineQrUrl}
                    alt="Line QR Code Preview"
                    className="h-24 w-24 rounded-lg border border-border object-cover bg-white"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-lg border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center text-[10px] text-muted-foreground p-2 text-center">
                    No QR Code uploaded
                  </div>
                )}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => qrInputRef.current?.click()}
                      disabled={isSaving}
                      className="gap-2"
                      size="sm"
                    >
                      <Upload className="h-4 w-4" /> Select QR Code Image
                    </Button>
                    {(lineQrUrl || lineQrFile) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLineQrUrl("");
                          setLineQrFile(null);
                        }}
                        disabled={isSaving}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {lineQrFile ? lineQrFile.name : "Select PNG or JPG image of your Line QR Code"}
                  </p>
                </div>
                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isSaving}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLineQrFile(file);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {u.role === "landlord" && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Direct Call Feature (เบอร์โทรติดต่อตรง)</h2>
            {phoneContactEnabled ? (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                Active
              </span>
            ) : (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Premium
              </span>
            )}
          </div>
          
          <p className="mt-2 text-sm text-muted-foreground">
            {phoneContactEnabled 
              ? "เปิดใช้งานปุ่ม 'Call Landlord' บนหน้าประกาศของคุณแล้ว ผู้เช่าสามารถกดโทรติดต่อคุณได้โดยตรง"
              : "เปิดโอกาสให้ผู้เช่าติดต่อคุณได้รวดเร็วยิ่งขึ้นโดยแสดงปุ่มโทรศัพท์มือถือบนหน้าประกาศห้องเช่า (ค่าบริการ ฿199/เดือน)"}
          </p>

          <div className="mt-6 border-t border-border/50 pt-6">
            {phoneContactEnabled ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">แสดงปุ่มโทรติดต่อตรงบนประกาศ</Label>
                    <p className="text-xs text-muted-foreground">
                      เปิดเพื่อแสดงปุ่ม Call Landlord บนหน้าประกาศห้องพัก
                    </p>
                  </div>
                  <Switch 
                    checked={phoneContactEnabled} 
                    onCheckedChange={async (checked) => {
                      setPhoneContactEnabled(checked);
                      try {
                        await onSave({ phoneContactEnabled: checked });
                        toast.success(checked ? "เปิดแสดงปุ่มโทรติดต่อตรงแล้ว" : "ปิดแสดงปุ่มโทรติดต่อตรงแล้ว");
                      } catch (err) {
                        toast.error("บันทึกการตั้งค่าไม่สำเร็จ");
                      }
                    }} 
                  />
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={async () => {
                      if (confirm("คุณต้องการยกเลิกการสมัครฟีเจอร์นี้ใช่หรือไม่?")) {
                        setIsSaving(true);
                        try {
                          await onSave({ phoneContactEnabled: false });
                          setPhoneContactEnabled(false);
                          toast.success("ยกเลิกการสมัครฟีเจอร์เบอร์โทรติดต่อตรงแล้ว");
                        } catch (err) {
                          toast.error("ไม่สามารถยกเลิกการสมัครได้");
                        } finally {
                          setIsSaving(false);
                        }
                      }
                    }}
                  >
                    Cancel Subscription (ยกเลิกการสมัครบริการ)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">อัปเกรดเพื่อรับปุ่ม Direct Call</p>
                  <p className="text-xs text-muted-foreground">
                    ผู้เช่าจะเห็นปุ่มโทรหาคุณทันที ช่วยเพิ่มโอกาสในการปล่อยเช่าได้เร็วขึ้นสูงสุด 35%
                  </p>
                </div>
                <Button
                  className="gap-2 shrink-0 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
                  disabled={isSubscribing}
                  onClick={async () => {
                    setIsSubscribing(true);
                    toast.info("กำลังประมวลผลการชำระเงินจำลอง...");
                    
                    setTimeout(async () => {
                      try {
                        await onSave({ phoneContactEnabled: true });
                        setPhoneContactEnabled(true);
                        toast.success("สมัครบริการ Direct Call เรียบร้อยแล้ว! (จำลองการตัดเงิน ฿199)");
                      } catch (err) {
                        toast.error("การสมัครบริการล้มเหลว");
                      } finally {
                        setIsSubscribing(false);
                      }
                    }, 1500);
                  }}
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Subscribing...
                    </>
                  ) : (
                    <>Subscribe now for ฿199/mo</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Notifications</h2>
        </div>
        <div className="mt-4 space-y-3">
          <ToggleRow
            label="Email updates"
            description="Booking, listing and account updates."
            checked={notifyEmail}
            onChange={setNotifyEmail}
          />
          <ToggleRow
            label="Push notifications"
            description="In-browser activity alerts."
            checked={notifyPush}
            onChange={setNotifyPush}
          />
          <ToggleRow
            label="SMS"
            description="Critical booking reminders via SMS."
            checked={notifySms}
            onChange={setNotifySms}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Security</h2>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <Row
            icon={Mail}
            label="Linked email"
            value={u.email}
            cta={<Button variant="ghost" size="sm">Change</Button>}
          />
          <Row
            icon={KeyRound}
            label="Password"
            value="Last changed —"
            cta={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.info("Password reset email sent (demo).")}
              >
                Reset password
              </Button>
            }
          />
          <Row
            icon={Globe}
            label="Google account"
            value={u.googleConnected ? "Connected" : "Not connected"}
            cta={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSave({ googleConnected: !u.googleConnected });
                  toast.success(u.googleConnected ? "Google disconnected" : "Google connected");
                }}
              >
                {u.googleConnected ? "Disconnect" : "Connect"}
              </Button>
            }
          />
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Button onClick={save} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function PaymentTab() {
  const { user, addPaymentMethod, removePaymentMethod } = useApp();
  const methods = user?.paymentMethods ?? [];
  const [adding, setAdding] = useState(false);
  const [brand, setBrand] = useState("Visa");
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [expiry, setExpiry] = useState("");

  const submit = () => {
    const digits = number.replace(/\D/g, "");
    if (digits.length < 4) {
      toast.error("Enter a valid card number.");
      return;
    }
    addPaymentMethod({ brand, last4: digits.slice(-4), holder, expiry });
    toast.success("Payment method added");
    setAdding(false);
    setNumber("");
    setHolder("");
    setExpiry("");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Saved payment methods</h2>
            <p className="text-xs text-muted-foreground">
              Used for future booking deposits and rent. Demo only — no real charges.
            </p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setAdding((v) => !v)}>
            <Plus className="h-4 w-4" /> Add method
          </Button>
        </div>

        {adding && (
          <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4 sm:grid-cols-2">
            <Field label="Brand">
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {["Visa", "Mastercard", "Amex", "PromptPay"].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Card / account number">
              <Input
                inputMode="numeric"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="•••• •••• •••• 4242"
              />
            </Field>
            <Field label="Holder name">
              <Input value={holder} onChange={(e) => setHolder(e.target.value)} />
            </Field>
            <Field label="Expiry (MM/YY)">
              <Input
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="04/29"
              />
            </Field>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={submit}>
                Save method
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2">
          {methods.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No payment methods yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add a card or PromptPay account to speed up future bookings.
              </p>
            </div>
          ) : (
            methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-12 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                    {m.brand.slice(0, 4).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {m.brand} •••• {m.last4}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.holder || "—"}
                      {m.expiry ? ` · exp ${m.expiry}` : ""}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => removePaymentMethod(m.id)}
                  aria-label="Remove method"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Billing history</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Past payments and invoices will appear here.
        </p>
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          No billing history yet.
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{value}</p>
        </div>
      </div>
      {cta}
    </div>
  );
}
