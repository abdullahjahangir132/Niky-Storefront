import { useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAdminAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login(
      { data: { password } },
      {
        onSuccess: () => setLocation("/admin"),
        onError: () => setError("Invalid password. Try nano-admin-2024"),
      }
    );
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center">
          <h1 className="font-display font-black text-5xl text-white tracking-tighter uppercase">
            NANO<span className="text-accent">SHOES</span>
          </h1>
          <p className="text-white/40 text-sm font-medium uppercase tracking-[0.3em] mt-2">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter access key"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-14 text-center font-mono tracking-widest focus:border-accent"
            required
          />
          {error && <p className="text-accent text-sm text-center font-medium">{error}</p>}
          <Button
            type="submit"
            className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-display uppercase tracking-widest text-lg"
          >
            Enter Admin
          </Button>
          <p className="text-center text-white/20 text-xs font-mono pt-2">nano-admin-2024</p>
        </form>
      </div>
    </div>
  );
}
