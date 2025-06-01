type Link = {
  providerName: string;
  url: string;
};

const links = [
  {
    providerName: 'Google',
    url: 'https://aistudio.google.com/apikey',
  },
  {
    providerName: 'Open AI',
    url: 'https://platform.openai.com/settings/organization/api-keys',
  },
  {
    providerName: 'OpenRouter',
    url: 'https://openrouter.ai/settings/keys',
  },
] satisfies Link[];
