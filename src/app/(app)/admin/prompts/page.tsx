"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchPrompts, createPrompt, updatePrompt, deletePrompt, type Prompt, type CreatePromptData, type UpdatePromptData } from "@/api/prompts";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form states
  const [newPrompt, setNewPrompt] = useState<CreatePromptData>({
    type: "",
    content: "",
    description: ""
  });

  const [editForm, setEditForm] = useState<UpdatePromptData>({
    content: "",
    description: ""
  });

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const data = await fetchPrompts();
      setPrompts(data);
    } catch (error) {
      console.error("Erro ao carregar prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const handleCreatePrompt = async () => {
    try {
      if (!newPrompt.type.trim() || !newPrompt.content.trim()) {
        alert("Tipo e conteúdo são obrigatórios");
        return;
      }

      await createPrompt(newPrompt);
      setNewPrompt({ type: "", content: "", description: "" });
      setIsCreateDialogOpen(false);
      loadPrompts();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEditPrompt = async () => {
    if (!editingPrompt) return;

    try {
      if (!editForm.content.trim()) {
        alert("Conteúdo é obrigatório");
        return;
      }

      await updatePrompt(editingPrompt.type, editForm);
      setEditingPrompt(null);
      setIsEditDialogOpen(false);
      loadPrompts();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeletePrompt = async (type: string) => {
    if (!confirm("Tem certeza que deseja deletar este prompt?")) return;

    try {
      await deletePrompt(type);
      loadPrompts();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const openEditDialog = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setEditForm({
      content: prompt.content,
      description: prompt.description || ""
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Prompts</h1>
        <p>Carregando prompts...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Prompts</h1>
          <p className="text-gray-600">Configurar prompts do sistema de IA</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Novo Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Prompt</DialogTitle>
              <DialogDescription>
                Adicione um novo prompt para o sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Tipo do Prompt</Label>
                <Input
                  id="type"
                  value={newPrompt.type}
                  onChange={(e) => setNewPrompt({...newPrompt, type: e.target.value})}
                  placeholder="Ex: system, agent, greeting"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  value={newPrompt.description}
                  onChange={(e) => setNewPrompt({...newPrompt, description: e.target.value})}
                  placeholder="Descrição do prompt"
                />
              </div>
              <div>
                <Label htmlFor="content">Conteúdo do Prompt</Label>
                <Textarea
                  id="content"
                  value={newPrompt.content}
                  onChange={(e) => setNewPrompt({...newPrompt, content: e.target.value})}
                  placeholder="Digite o conteúdo do prompt aqui..."
                  rows={8}
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePrompt}>
                <Save size={16} className="mr-2" />
                Criar Prompt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de prompts */}
      <div className="grid gap-4">
        {prompts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Nenhum prompt configurado</p>
            </CardContent>
          </Card>
        ) : (
          prompts.map((prompt) => (
            <Card key={prompt.type}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{prompt.type}</CardTitle>
                    {prompt.description && (
                      <CardDescription>{prompt.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(prompt)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePrompt(prompt.type)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-mono break-words">
                    {prompt.content.length > 300 
                      ? `${prompt.content.substring(0, 300)}...` 
                      : prompt.content
                    }
                  </div>
                </div>
                {prompt.updatedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Última atualização: {new Date(prompt.updatedAt).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Prompt: {editingPrompt?.type}</DialogTitle>
            <DialogDescription>
              Edite o conteúdo do prompt
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                placeholder="Descrição do prompt"
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Conteúdo do Prompt</Label>
              <Textarea
                id="edit-content"
                value={editForm.content}
                onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                placeholder="Digite o conteúdo do prompt aqui..."
                rows={12}
                className="min-h-[300px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditPrompt}>
              <Save size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 