import qrcode from 'qrcode-terminal';
import whatsapp from 'whatsapp-web.js';

const { Client, LocalAuth } = whatsapp;


const client = new Client({ session: undefined, authStrategy: new LocalAuth() });

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    
  console.log('Client is ready');
});

client.on('message', async (message) => {
  if (message.body.trim().toLowerCase().startsWith('hey ')) {
    try {
      const prompt = message.body.trim().slice('hey '.length);

      const response = await fetch("https://api.edenai.run/v2/text/generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTZhZjY3NzUtNDM0ZC00YzhiLWE5OTMtMzg0YjdhODgyOGYxIiwidHlwZSI6ImFwaV90b2tlbiJ9.-5jwvonLSSasi9EnAzxU-pezBuKFXqBX5Ikbz6Ybo3Q",
        },
        body: JSON.stringify({
          providers: "openai",
          text: `This is the prompt: ${prompt}. Just write the best answer in the sentence. Reply in same language which is given in prompt. Think of you as a helper of farmer so reply accordingly.`,
          temperature: 0.6,
          max_tokens: 1024,
          fallback_providers: "",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      await message.reply(data.openai.generated_text);
    } catch (error) {
      console.error('Error during text generation:', error);
      // Handle error response
      await message.reply('Error during text generation. Please try again later.');
    }
  }
});

client.on('auth_failure', () => {
  console.error('Authentication failed. Please check your credentials.');
});

client.on('disconnected', (reason) => {
  console.log('Client disconnected:', reason);
});

client.initialize();