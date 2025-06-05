import React, { useCallback, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/frontend/components/ui/card';
import { Key } from 'lucide-react';
import { toast } from 'sonner';
import { useAPIKeyStore } from '@/frontend/stores/APIKeyStore';

const formSchema = z.object({
  google: z.string().trim().min(1, {
    message: 'Google API key is required for Title Generation',
  }),
  openrouter: z.string().trim().optional(),
  openai: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function APIKeyForm() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          <CardTitle>Add Your API Keys To Start Chatting</CardTitle>
        </div>
        <CardDescription>
          Keys are stored locally in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form />
      </CardContent>
    </Card>
  );
}

const Form = () => {
  const { keys, setKeys } = useAPIKeyStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: keys,
  });

  useEffect(() => {
    reset(keys);
  }, [keys, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setKeys(values);
      toast.success('API keys saved successfully');
    },
    [setKeys]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="google"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex gap-1"
        >
          <span>Google API Key</span>
          <span className="text-muted-foreground">
            (Required for Thread Title Generation)
          </span>
        </label>
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          className="text-sm text-blue-500 inline w-fit"
        >
          Create Google API Key
        </a>
        <Input
          id="google"
          placeholder="AIza..."
          {...register('google')}
          className={errors.google ? 'border-red-500' : ''}
        />

        {errors.google && (
          <p className="text-[0.8rem] font-medium text-red-500">
            {errors.google.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="openrouter"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          OpenRouter API Key
        </label>
        <a
          href="https://openrouter.ai/settings/keys"
          target="_blank"
          className="text-sm text-blue-500 inline w-fit"
        >
          Create OpenRouter API Key
        </a>
        <Input
          id="openrouter"
          placeholder="sk-or-..."
          {...register('openrouter')}
          className={errors.openrouter ? 'border-red-500' : ''}
        />
        {errors.openrouter && (
          <p className="text-[0.8rem] font-medium text-red-500">
            {errors.openrouter.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="openai"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          OpenAI API Key
        </label>
        <a
          href="https://platform.openai.com/settings/organization/api-keys"
          target="_blank"
          className="text-sm text-blue-500 inline w-fit"
        >
          Create OpenAI API Key
        </a>
        <Input
          id="openai"
          placeholder="sk-..."
          {...register('openai')}
          className={errors.openai ? 'border-red-500' : ''}
        />
        {errors.openai && (
          <p className="text-[0.8rem] font-medium text-red-500">
            {errors.openai.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={!isDirty}>
        Save API Keys
      </Button>
    </form>
  );
};
