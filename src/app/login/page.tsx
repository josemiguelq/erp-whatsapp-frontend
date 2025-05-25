"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { login, saveToken } from "@/api/api";
import { useRouter } from "next/navigation";  // import do router

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();  // inicializa o router

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    const data = await login(email, password);

    if (data.error) {
      setErrorMsg(data.error);
      setLoading(false);
      return;
    }

    if (data.token) {
      saveToken(data.token);
      router.push("/products");  // redireciona aqui
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errorMsg && (
              <p className="text-red-600 text-sm text-center">{errorMsg}</p>
            )}
            <Button
              onClick={handleLogin}
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </div>
          <div className="text-center text-sm text-gray-500 mt-4">
            Não tem uma conta?{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Cadastre-se
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
