import fs from 'fs';

type Config = {
  discord: {
    appId: string;
    guildId: string;
    token: string;
  };
  mongodb: {
    url: string;
  };
};

const readConfig = (file: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) return reject(err);
      return resolve(data.toString('utf-8'));
    });
  });
};

export const loadConfig = async (file: string): Promise<Config> => {
  const raw = await readConfig(file);
  const data = JSON.parse(raw);
  return data as Config;
};
