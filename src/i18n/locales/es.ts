import type en from './en';

const es: typeof en = {
  chat: {
    composerPlaceholder: 'Preguntale a mostro…',
    send: 'Enviar',
    emptyState: 'Preguntale a mostro…',
    sessionExpired: 'Tu sesión expiró. Iniciá sesión de nuevo.',
    genericError: 'Algo salió mal.',
    renderFailed: 'No se pudo mostrar esta respuesta.',
    openSettings: 'Abrir ajustes',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
  },
  settings: {
    title: 'Ajustes',
    language: 'Idioma',
    account: 'Cuenta',
    about: 'Acerca de',
    email: 'Email',
    signOut: 'Cerrar sesión',
    signOutConfirmTitle: '¿Cerrar sesión?',
    signOutConfirmMessage: 'Tendrás que iniciar sesión de nuevo para continuar.',
    cancel: 'Cancelar',
    version: 'Versión',
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
