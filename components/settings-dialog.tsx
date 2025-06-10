'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Settings } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CustomModel {
  id: string
  name: string
  nickname: string
  provider: 'openai' | 'google' | 'anthropic'
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [customModels, setCustomModels] = useState<CustomModel[]>([])
  const [newModel, setNewModel] = useState({
    id: '',
    name: '',
    nickname: '',
    provider: 'openai' as const
  })
  const { toast } = useToast()

  // Load custom models from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customModels')
    if (saved) {
      setCustomModels(JSON.parse(saved))
    }
  }, [])

  // Save custom models to localStorage
  useEffect(() => {
    localStorage.setItem('customModels', JSON.stringify(customModels))
  }, [customModels])

  const addCustomModel = () => {
    if (!newModel.id || !newModel.name || !newModel.nickname) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const model: CustomModel = {
      id: newModel.id,
      name: newModel.name,
      nickname: newModel.nickname,
      provider: newModel.provider
    }

    setCustomModels(prev => [...prev, model])
    setNewModel({ id: '', name: '', nickname: '', provider: 'openai' })
    
    toast({
      title: "Model Added",
      description: `${model.nickname} has been added to your custom models`,
    })
  }

  const removeCustomModel = (id: string) => {
    setCustomModels(prev => prev.filter(model => model.id !== id))
    toast({
      title: "Model Removed",
      description: "Custom model has been removed",
    })
  }

  const clearAllData = () => {
    localStorage.clear()
    setCustomModels([])
    toast({
      title: "Data Cleared",
      description: "All app data has been cleared",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your custom models and application settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Custom Models Section */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Models</CardTitle>
              <CardDescription>
                Add custom model configurations for providers with API keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Model Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Model ID</label>
                  <Input
                    placeholder="e.g., gpt-4-turbo-preview"
                    value={newModel.id}
                    onChange={(e) => setNewModel(prev => ({ ...prev, id: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Display Name</label>
                  <Input
                    placeholder="e.g., GPT-4 Turbo Preview"
                    value={newModel.name}
                    onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nickname</label>
                  <Input
                    placeholder="e.g., My GPT-4"
                    value={newModel.nickname}
                    onChange={(e) => setNewModel(prev => ({ ...prev, nickname: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <Select 
                    value={newModel.provider} 
                    onValueChange={(value: 'openai' | 'google' | 'anthropic') => 
                      setNewModel(prev => ({ ...prev, provider: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={addCustomModel} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Model
              </Button>

              {/* Custom Models List */}
              {customModels.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Your Custom Models</h4>
                  {customModels.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{model.nickname}</div>
                          <div className="text-sm text-muted-foreground">{model.name}</div>
                          <div className="text-xs text-muted-foreground">{model.id}</div>
                        </div>
                        <Badge variant="secondary">{model.provider}</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomModel(model.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Management Section */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your application data and storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={clearAllData}>
                Clear All Data
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                This will clear all chat history, indexed documents, and custom models.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}