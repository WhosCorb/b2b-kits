export type Locale = 'es' | 'en'

// Define the structure type for translations
interface TranslationStructure {
  landing: {
    heroTagline: {
      startup: string
      legal: string
      corporate: string
    }
    typeName: {
      startup: string
      legal: string
      corporate: string
    }
    contact: string
    phone: string
    email: string
    followUs: string
    visitSite: string
    unlockPdf: string
    downloadPdf: string
    enterCode: string
    codePlaceholder: string
    validating: string
    invalidCode: string
    codeExpired: string
    maxUsesReached: string
    tryAgain: string
    tooManyAttempts: string
    pdfLocked: string
    enterCodeToView: string
    pdfViewer: string
  }
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    save: string
    delete: string
    edit: string
    create: string
    search: string
    filter: string
    export: string
    back: string
    next: string
    previous: string
    yes: string
    no: string
    active: string
    inactive: string
    all: string
    language: string
    spanish: string
    english: string
  }
  footer: {
    copyright: string
    privacy: string
    terms: string
  }
}

export const translations: Record<Locale, TranslationStructure> = {
  es: {
    // Landing page
    landing: {
      heroTagline: {
        startup: 'Todo lo que necesitas para lanzar tu startup',
        legal: 'Recursos legales esenciales para tu negocio',
        corporate: 'Soluciones corporativas profesionales',
      },
      typeName: {
        startup: 'Kit Startup',
        legal: 'Kit Legal',
        corporate: 'Kit Corporativo',
      },
      contact: 'Contacto',
      phone: 'Telefono',
      email: 'Email',
      followUs: 'Siguenos',
      visitSite: 'Visitar empresas.benotac.es',
      unlockPdf: 'Desbloquear PDF',
      downloadPdf: 'Descargar PDF',
      enterCode: 'Introduce tu codigo',
      codePlaceholder: 'Codigo de 6 caracteres',
      validating: 'Validando...',
      invalidCode: 'Codigo invalido',
      codeExpired: 'Codigo expirado',
      maxUsesReached: 'Codigo sin usos disponibles',
      tryAgain: 'Intentar de nuevo',
      tooManyAttempts: 'Demasiados intentos. Espera un momento.',
      pdfLocked: 'Este PDF esta protegido',
      enterCodeToView: 'Introduce tu codigo de acceso para ver el documento',
      pdfViewer: 'Visor de PDF',
    },
    // Common
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Exito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      filter: 'Filtrar',
      export: 'Exportar',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      yes: 'Si',
      no: 'No',
      active: 'Activo',
      inactive: 'Inactivo',
      all: 'Todos',
      language: 'Idioma',
      spanish: 'Espanol',
      english: 'Ingles',
    },
    // Footer
    footer: {
      copyright: 'Benotac. Todos los derechos reservados.',
      privacy: 'Privacidad',
      terms: 'Terminos',
    },
  },
  en: {
    // Landing page
    landing: {
      heroTagline: {
        startup: 'Everything you need to launch your startup',
        legal: 'Essential legal resources for your business',
        corporate: 'Professional corporate solutions',
      },
      typeName: {
        startup: 'Startup Kit',
        legal: 'Legal Kit',
        corporate: 'Corporate Kit',
      },
      contact: 'Contact',
      phone: 'Phone',
      email: 'Email',
      followUs: 'Follow us',
      visitSite: 'Visit empresas.benotac.es',
      unlockPdf: 'Unlock PDF',
      downloadPdf: 'Download PDF',
      enterCode: 'Enter your code',
      codePlaceholder: '6 character code',
      validating: 'Validating...',
      invalidCode: 'Invalid code',
      codeExpired: 'Code expired',
      maxUsesReached: 'Code has no remaining uses',
      tryAgain: 'Try again',
      tooManyAttempts: 'Too many attempts. Please wait.',
      pdfLocked: 'This PDF is protected',
      enterCodeToView: 'Enter your access code to view the document',
      pdfViewer: 'PDF Viewer',
    },
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      active: 'Active',
      inactive: 'Inactive',
      all: 'All',
      language: 'Language',
      spanish: 'Spanish',
      english: 'English',
    },
    // Footer
    footer: {
      copyright: 'Benotac. All rights reserved.',
      privacy: 'Privacy',
      terms: 'Terms',
    },
  },
}

export type TranslationKeys = TranslationStructure
