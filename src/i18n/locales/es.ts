import type en from './en';

const es: typeof en = {
  chat: {
    composerPlaceholder: 'Preguntale a mostro…',
    send: 'Enviar',
    emptyState: 'Preguntale a mostro…',
    sessionExpired: 'Tu sesión expiró. Iniciá sesión de nuevo.',
    genericError: 'Algo salió mal.',
  },
  auth: {
    signInToContinue: 'Iniciá sesión para continuar',
    continueWithGoogle: 'Continuar con Google',
    devApiKeyLabel: 'Dev: ingresá una API key',
    verifying: 'Verificando…',
    useApiKey: 'Usar API key',
    enterApiKey: 'Ingresá una API key.',
    notInvited: 'Tu email no está invitado a mostro.',
    noIdToken: 'No se recibió id_token de Google.',
    signInFailed: 'Error al iniciar sesión.',
    connectionFailed: 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.',
  },
};

export default es;
