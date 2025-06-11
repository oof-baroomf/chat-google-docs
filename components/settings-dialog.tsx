'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Model {
  id: string
  name: string
  provider: 'openai' | 'google' | 'anthropic'
  available?: boolean
  nickname?: string
}

interface CustomModel {
  id: string
  name: string
  nickname: string
  provider: 'openai' | 'google' | 'anthropic'
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [defaultModels, setDefaultModels] = useState<Model[]>([])
  const [customModels, setCustomModels] = useState<CustomModel[]>([])
  const [enabledModels, setEnabledModels] = useState<string[]>([])
  const [newModel, setNewModel] = useState<{
    id: string;
    name: string;
    nickname: string;
    provider: 'openai' | 'google' | 'anthropic';
  }>({
    id: '',
    name: '',
    nickname: '',
    provider: 'openai'
  })

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('/api/models')
        if (!response.ok) {
          throw new Error('Failed to fetch models')
        }
        const data = await response.json()
        setDefaultModels(data.models)
      } catch (error) {
        console.error(error)
        toast.error("Could not load default models.")
      }
    }
    fetchModels()

    const saved = localStorage.getItem('customModels')
    if (saved) {
      setCustomModels(JSON.parse(saved))
    }

    const savedEnabled = localStorage.getItem('enabledModels')
    if (savedEnabled) {
      setEnabledModels(JSON.parse(savedEnabled))
    }
  }, [])

  // Save custom models to localStorage
  useEffect(() => {
    localStorage.setItem('customModels', JSON.stringify(customModels))
  }, [customModels])

  // Save enabled models to localStorage
  useEffect(() => {
    localStorage.setItem('enabledModels', JSON.stringify(enabledModels))
  }, [enabledModels])

  const addCustomModel = () => {
    if (!newModel.id || !newModel.name || !newModel.nickname) {
      toast.error("Please fill in all fields")
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
    
    toast.success(`${model.nickname} has been added to your custom models`)
  }


  const clearAllData = () => {
    localStorage.clear()
    setCustomModels([])
    setEnabledModels([])
    toast.success("All app data has been cleared")
  }

  const handleModelToggle = (modelId: string) => {
    setEnabledModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId)
      } else {
        return [...prev, modelId]
      }
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
          {/* Models Section */}
          <Card>
            <CardHeader>
              <CardTitle>Models</CardTitle>
              <CardDescription>
                Select which models to show in the chat interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enabled Chat Models</label>
                <div className="space-y-2">
                  {[...defaultModels, ...customModels]
                    .filter(model => ('available' in model ? model.available !== false : true))
                    .map((model) => (
                      <div key={model.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={model.id}
                          checked={enabledModels.includes(model.id)}
                          onCheckedChange={() => handleModelToggle(model.id)}
                        />
                        <label
                          htmlFor={model.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {model.nickname || model.name} ({model.provider})
                        </label>
                      </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Custom Models Section */}
          <Card>
            <CardHeader>
              <CardTitle>Add Custom Model</CardTitle>
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