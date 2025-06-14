
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Circle } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini-api-key') || '');
  const [seed, setSeed] = useState('');
  const [omen, setOmen] = useState('');
  const [icon, setIcon] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiInput, setShowApiInput] = useState(false);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini-api-key', apiKey.trim());
      setShowApiInput(false);
      toast.success('API key saved securely');
    }
  };

  const generateMicroOmen = async (userSeed: string, apiKey: string) => {
    const prompt = `You are a whimsical 'Pocket Diviner,' an AI that finds tiny, unexpected sparks of meaning or playful omens in everyday things. A user has provided the following mundane 'seed': '${userSeed}'.

    Craft a very short (1-2 sentences, max 30 words), cryptic, poetic, or surprisingly insightful 'micro-omen' or 'serendipity note' loosely inspired by this seed. The connection should be imaginative and not literal. The tone should be light, slightly mysterious, and perhaps a little playful. Avoid direct advice; instead, offer a fleeting thought or observation.

    Example output for 'a blue coffee cup': 'Still waters reflect deep skies. What reflections do you seek today?'
    Example output for 'the sound of rain': 'Each drop a tiny messenger. Listen closely to the rhythm of change.'`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'The cosmic patterns remain silent today...';
  };

  const generateSymbolicIcon = async (omenText: string, apiKey: string) => {
    const imagePrompt = `Create a tiny, minimalist, abstract, symbolic icon or glyph representing the essence of: '${omenText}'. The icon should be very simple, almost like an enigmatic rune or a tiny, abstract sigil. Use primarily deep blues, purples, and gold. Output on a transparent or simple background. Max icon size 64x64 pixels.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: imagePrompt
            }]
          }],
          responseModalities: ["IMAGE", "TEXT"]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const imageData = data.candidates[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;
        if (imageData) {
          return `data:image/png;base64,${imageData}`;
        }
      }
    } catch (error) {
      console.log('Icon generation failed, continuing with text omen only:', error);
    }
    return '';
  };

  const divineASpark = async () => {
    if (!apiKey.trim()) {
      setShowApiInput(true);
      toast.error('Please provide your Google API key first');
      return;
    }

    if (!seed.trim()) {
      toast.error('Please provide a seed of serendipity');
      return;
    }

    setIsLoading(true);
    setOmen('');
    setIcon('');

    try {
      console.log('Generating micro-omen for seed:', seed);
      
      // Step 1: Generate the micro-omen text
      const omenText = await generateMicroOmen(seed.trim(), apiKey);
      console.log('Generated omen:', omenText);
      setOmen(omenText);

      // Step 2: Generate symbolic icon (optional)
      const iconData = await generateSymbolicIcon(omenText, apiKey);
      if (iconData) {
        console.log('Generated symbolic icon');
        setIcon(iconData);
      }

      toast.success('The patterns have spoken...');
    } catch (error) {
      console.error('Divination error:', error);
      toast.error('The cosmic energies are disrupted. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      divineASpark();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-300 to-blue-300">
              The AI Pocket Diviner
            </h1>
            <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-lg text-purple-200 font-light">
            Whisper a fragment of your day, receive a spark of serendipity
          </p>
        </div>

        {/* API Key Section */}
        {showApiInput && (
          <Card className="p-6 bg-black/30 border-purple-500/30 backdrop-blur-sm">
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-purple-200">Cosmic Connection Required</h3>
              <p className="text-sm text-purple-300">
                To divine the patterns, please provide your Google AI API key. It will be stored securely in your browser.
              </p>
              <div className="flex space-x-2">
                <Input
                  type="password"
                  placeholder="Your Google AI API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-black/50 border-purple-500/50 text-purple-100 placeholder-purple-400"
                />
                <Button onClick={saveApiKey} className="bg-purple-600 hover:bg-purple-700">
                  Save
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Main Divination Interface */}
        <Card className="p-8 bg-black/30 border-purple-500/30 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-center text-purple-200">
                Seed of Serendipity
              </h2>
              <Input
                type="text"
                placeholder="A color I see... A word I just heard... An object nearby..."
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-lg p-4 bg-black/50 border-purple-500/50 text-purple-100 placeholder-purple-400 text-center"
                disabled={isLoading}
              />
            </div>

            {/* Divination Button */}
            <div className="text-center">
              <Button
                onClick={divineASpark}
                disabled={isLoading}
                className="px-8 py-3 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Circle className="w-4 h-4 animate-spin" />
                    <span>Consulting the Patterns...</span>
                  </div>
                ) : (
                  'Divine a Spark'
                )}
              </Button>
            </div>

            {/* Results */}
            {(omen || isLoading) && (
              <>
                <Separator className="bg-purple-500/30" />
                <div className="space-y-6">
                  <h3 className="text-xl font-serif text-center text-yellow-400">
                    Your Micro-Omen
                  </h3>
                  
                  {omen && (
                    <div className="text-center space-y-4">
                      {icon && (
                        <div className="flex justify-center">
                          <img 
                            src={icon} 
                            alt="Symbolic Icon" 
                            className="w-16 h-16 opacity-80"
                          />
                        </div>
                      )}
                      <blockquote className="text-xl md:text-2xl font-serif text-purple-100 leading-relaxed italic px-4">
                        "{omen}"
                      </blockquote>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* API Key Management */}
        {!showApiInput && (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setShowApiInput(true)}
              className="text-purple-400 hover:text-purple-300"
            >
              {apiKey ? 'Update API Key' : 'Set API Key'}
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-purple-400">
            ✨ For entertainment and inspiration only. The universe speaks in riddles. ✨
          </p>
          <p className="text-xs text-purple-500">
            Your API key is stored locally and never shared
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
