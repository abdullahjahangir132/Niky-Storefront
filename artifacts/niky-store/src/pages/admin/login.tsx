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
        onSuccess: () => {
          setLocation("/admin");
        },
        onError: () => {
          setError("Invalid password");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-display font-black text-white tracking-tighter uppercase">NIKY</h1>
          <div className="text-accent font-display tracking-widest uppercase font-bold text-xl">Admin</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input 
              type="password" 
              placeholder="Enter Access Key" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-white/20 text-white placeholder:text-white/40 h-14 text-center font-mono tracking-widest"
              required
            />
            {error && <p className="text-accent text-sm text-center font-medium">{error}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-display uppercase tracking-widest text-lg"
          >
            Enter Admin
          </Button>

          <p className="text-center text-white/20 text-xs font-mono">Dev: niky-admin-2024</p>
        </form>
      </div>
    </div>
  );
}
