import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, IdCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, authStore, cnicDigits, formatCnic, setUnauthorizedHandler } from "@/lib/api";

type Mode = "citizen" | "admin";

type AuthDialogContextValue = {
  open: (mode?: Mode) => void;
};

const AuthDialogContext = createContext<AuthDialogContextValue>({ open: () => {} });

export function useAuthDialog() {
  return useContext(AuthDialogContext);
}

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const open = useCallback((mode: Mode = "citizen") => {
    if (mode === "admin") {
      navigate({ to: "/admin" });
    } else {
      setIsOpen(true);
    }
  }, [navigate]);

  useEffect(() => {
    setUnauthorizedHandler((kind) => {
      if (kind === "admin") {
        navigate({ to: "/admin" });
      } else {
        setIsOpen(true);
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <CitizenAuth onDone={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </AuthDialogContext.Provider>
  );
}

export function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-10" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function CitizenAuth({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("signin");
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const digits = cnicDigits(cnic);
  const cnicValid = digits.length === 13;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnicValid) {
      toast.error("CNIC must be 13 digits (e.g. 12345-1234567-1).");
      return;
    }
    setLoading(true);
    try {
      if (tab === "signup") {
        const res = await api.signup({
          cnic: digits,
          password,
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
        });
        authStore.setCitizen({
          token: res.token,
          citizenId: res.citizen_id,
          cnic: digits,
          name,
          phone,
        });
        toast.success(`Welcome${name ? `, ${name}` : ""}! Your citizen account is ready.`);
        onDone();
        navigate({ to: "/" });
      } else {
        const res = await api.login({ cnic: digits, password });
        authStore.setCitizen({ token: res.token, citizenId: res.citizen_id, cnic: digits });
        toast.success("Signed in successfully.");
        onDone();
        navigate({ to: "/my-complaints" });
      }
    } catch {
      /* toast already shown */
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
          <IdCard className="h-5 w-5 text-primary" /> Citizen Portal Access
        </DialogTitle>
        <DialogDescription>
          Sign in or create an account with your 13-digit Pakistani CNIC to submit and track civic complaints.
        </DialogDescription>
      </DialogHeader>
      <Tabs value={tab} onValueChange={setTab} className="mt-2">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Citizen Sign In</TabsTrigger>
          <TabsTrigger value="signup">Register New Citizen</TabsTrigger>
        </TabsList>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cnic">Pakistani CNIC Number</Label>
            <Input
              id="cnic"
              inputMode="numeric"
              placeholder="12345-1234567-1"
              value={cnic}
              onChange={(e) => setCnic(formatCnic(e.target.value))}
              aria-invalid={cnic.length > 0 && !cnicValid}
              required
            />
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>Format: 13 digits (with or without dashes)</span>
              <span>{digits.length}/13 digits</span>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={4}
              required
            />
          </div>
          <TabsContent value="signup" className="mt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name (optional)</Label>
              <Input
                id="name"
                placeholder="Ali Raza Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Phone (optional)</Label>
              <Input
                id="phone"
                placeholder="0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </TabsContent>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tab === "signup" ? "Create Citizen Account" : "Sign In to Citizen Portal"}
          </Button>
        </form>
      </Tabs>
    </>
  );
}
