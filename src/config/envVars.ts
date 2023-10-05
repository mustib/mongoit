import path from 'path';
import { readFileSync } from 'fs';
import dotEnv from 'dotenv';

const __dirname = (await import('../utils/getDirname.js')).default(
  import.meta.url
);

type DotEnvVars =
  | 'PORT_DEV'
  | 'PORT_PROD'
  | 'MONGO_CONNECTION_URI_DEV'
  | 'MONGO_CONNECTION_URI_PROD'
  | 'EMAIL_HOST_DEV'
  | 'EMAIL_PORT_DEV'
  | 'EMAIL_USER_DEV'
  | 'EMAIL_PASS_DEV'
  | 'EMAIL_SECURE_DEV'
  | 'EMAIL_VERIFICATION_SECRET'
  | 'HOST_URL'
  | 'EMAIL_VERIFICATION_EXPIRE'
  | 'EMAIL_VERIFICATION_PATH';

type EnvVars = {
  PORT: number;
  NODE_ENV: 'production' | 'development';
  MONGO_CONNECTION_URI: string;
  SSL_KEY: Buffer | Buffer[];
  SSL_CERT: Buffer;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  EMAIL_SECURE: boolean;
  EMAIL_VERIFICATION_SECRET: string;
  HOST_URL: string;
  EMAIL_VERIFICATION_EXPIRE: string;
  EMAIL_VERIFICATION_PATH: string;
};

type EnvVarMapValue<T> = DotEnvVars | (() => T);

type EnvVarsMap = {
  [Var in keyof EnvVars]: {
    whenNodeEnvIs: {
      [Env in EnvVars['NODE_ENV'] | 'anyEnv']?: EnvVarMapValue<EnvVars[Var]>;
    };
    type?: EnvVars[Var] extends string
      ? 'string'
      : EnvVars[Var] extends number
      ? 'number'
      : EnvVars[Var] extends boolean
      ? 'bool'
      : never;
  };
};

const dotEnvVars = <Record<DotEnvVars, string>>(() => {
  const dotEnvPath = path.join(__dirname, '..', '..', '.env');
  const _dotEnvVars = dotEnv.parse(readFileSync(dotEnvPath));

  return new Proxy(_dotEnvVars, {
    get(target, prop) {
      if (!Object.hasOwn(target, prop)) {
        throw new Error(`${prop as string} property is not in .env file`);
      }

      return target[prop as string];
    },
  });
})();

const NODE_ENV = <EnvVars['NODE_ENV']>(() => {
  const currentlyRunningScript = <'start:dev' | 'start:prod'>(
    process.env.npm_lifecycle_event
  );

  switch (currentlyRunningScript) {
    case 'start:dev':
      return 'development';
    case 'start:prod':
      return 'production';
    default:
      // eslint-disable-next-line no-console
      console.warn('NODE_ENV defaults to development, No env founded');
      return 'development';
  }
})();

const envVarsMap: EnvVarsMap = {
  MONGO_CONNECTION_URI: {
    whenNodeEnvIs: {
      development: 'MONGO_CONNECTION_URI_DEV',
    },
  },
  NODE_ENV: { whenNodeEnvIs: { anyEnv: () => NODE_ENV } },
  PORT: {
    type: 'number',
    whenNodeEnvIs: { development: 'PORT_DEV', production: 'PORT_PROD' },
  },
  SSL_KEY: {
    whenNodeEnvIs: {
      development: () =>
        readFileSync(path.join(__dirname, '..', '..', 'cert', 'key.pem')),
    },
  },
  SSL_CERT: {
    whenNodeEnvIs: {
      development: () =>
        readFileSync(path.join(__dirname, '..', '..', 'cert', 'cert.pem')),
    },
  },
  EMAIL_HOST: {
    whenNodeEnvIs: {
      development: 'EMAIL_HOST_DEV',
    },
  },
  EMAIL_PORT: {
    whenNodeEnvIs: {
      development: 'EMAIL_PORT_DEV',
    },
    type: 'number',
  },
  EMAIL_PASS: {
    whenNodeEnvIs: {
      development: 'EMAIL_PASS_DEV',
    },
  },
  EMAIL_USER: {
    whenNodeEnvIs: {
      development: 'EMAIL_USER_DEV',
    },
  },
  EMAIL_SECURE: {
    whenNodeEnvIs: {
      development: 'EMAIL_SECURE_DEV',
      anyEnv: () => true,
    },
    type: 'bool',
  },
  EMAIL_VERIFICATION_SECRET: {
    whenNodeEnvIs: { anyEnv: 'EMAIL_VERIFICATION_SECRET' },
  },
  HOST_URL: {
    whenNodeEnvIs: { anyEnv: 'HOST_URL' },
  },
  EMAIL_VERIFICATION_EXPIRE: {
    whenNodeEnvIs: { anyEnv: 'EMAIL_VERIFICATION_EXPIRE' },
  },
  EMAIL_VERIFICATION_PATH: {
    whenNodeEnvIs: { anyEnv: 'EMAIL_VERIFICATION_PATH' },
  },
};

function getEnvVars() {
  const envVarsMapEntries = Object.entries(envVarsMap);
  const envVars: UntypedObject = {};
  const errors: any[] = [];

  envVarsMapEntries.forEach(([envVarName, envVarsMapValue]) => {
    try {
      const { whenNodeEnvIs, type } = envVarsMapValue;
      let currentEnvVarValue: any;

      // Get currentEnvVarValue
      if (Object.hasOwn(whenNodeEnvIs, NODE_ENV))
        currentEnvVarValue = whenNodeEnvIs[NODE_ENV];
      else if (Object.hasOwn(whenNodeEnvIs, 'anyEnv'))
        currentEnvVarValue = whenNodeEnvIs.anyEnv;
      else throw new Error(`${envVarName} in envVars has not assigned value`);

      // get currentEnvVarValue if it is a function otherwise get it from dotEnvVars
      if (typeof currentEnvVarValue === 'function')
        currentEnvVarValue = currentEnvVarValue();
      else {
        currentEnvVarValue = dotEnvVars[currentEnvVarValue as never];

        // make sure to convert type only if currentEnvVarValue not a function
        // Convert currentEnvVarValue type if specified
        if (type !== undefined) {
          switch (type) {
            case 'string':
              currentEnvVarValue = currentEnvVarValue?.toString();
              if (currentEnvVarValue === '')
                throw new Error(
                  `${envVarName} in envVars assigned empty string value`
                );
              break;
            case 'number':
              currentEnvVarValue = +currentEnvVarValue;
              if (Number.isNaN(currentEnvVarValue))
                throw new Error(`${envVarName} in envVars assigned NAN value`);
              break;
            case 'bool':
              switch (currentEnvVarValue) {
                case 'true':
                  currentEnvVarValue = true;
                  break;
                case 'false':
                  currentEnvVarValue = false;
                  break;
                default:
                  throw new Error(
                    `${currentEnvVarValue} is not a valid boolean value for ${envVarName} in envVars`
                  );
              }
              break;
            default:
              throw new Error(`${type} type in envVars is not supported`);
          }
        }
      }

      envVars[envVarName] = currentEnvVarValue;
    } catch (error) {
      errors.push(error);
    }
  });

  if (errors.length > 0) {
    const errorsMessages = errors
      .map((err, i) => `${i + 1}: ${err.message}`)
      .join('\n');
    throw Error(`Errors while creating env vars\n${errorsMessages}`);
  }

  return envVars as EnvVars;
}

const envVars = getEnvVars();

export default envVars;
