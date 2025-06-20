// locales/es.js
export default {
  // Navegación y menú
  nav: {
    home: "Inicio",
    fortresses: "Fortalezas Bárbaras",
    mobilization: "Movilización",
    kvk: "KvK",
    mge: "MGE",
    aoo: "AOO",
    admin: "Administración",
    adminAoo: "Gestión AOO",
    adminMge: "Gestión MGE",
    adminKvk: "Gestión KvK",
    adminMovilizacion: "Gestión de Movilizacion",
  },

  // Común
  common: {
    you: "Tú",
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    update: "Actualizar",
    register: "Registrar",
    loading: "Cargando...",
    noData: "No hay datos disponibles",
    error: "Error",
    success: "Éxito",
    warning: "Advertencia",
    info: "Información",
    confirm: "Confirmar",
    close: "Cerrar",
    back: "Volver",
    next: "Siguiente",
    previous: "Anterior",
    search: "Buscar",
    filter: "Filtrar",
    clear: "Limpiar",
    all: "Todos",
    none: "Ninguno",
    yes: "Sí",
    no: "No",
    required: "Requerido",
    optional: "Opcional",
    date: "Fecha",
    time: "Hora",
    amount: "Cantidad",
    photo: "Foto",
    currentImage: "Imagen actual",
    example: "Ejemplo",
    position: "Posición",
    user: "Usuario",
    points: "Puntos",
    status: "Estado",
    actions: "Acciones",
  },

  // Autenticación
  auth: {
    login: "Iniciar Sesión",
    register: "Registrarse",
    logout: "Cerrar Sesión",
    username: "Nombre de Usuario",
    userId: "ID de Usuario",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    repeatPassword: "Repetir Contraseña",
    rememberDevice: "Recordar en este dispositivo",
    noAccount: "¿No tienes cuenta?",
    hasAccount: "¿Ya tienes cuenta?",
    loginTitle: "Iniciar Sesión",
    registerTitle: "Registrarse",
    enterUserId: "Ingresa tu ID único",
    enterUsername: "Ingresa tu nombre de usuario",
    enterUserIdOrUsername: "Ingresa tu ID o nombre de usuario",
    enterPassword: "Ingresa tu contraseña",
    repeatYourPassword: "Repite tu contraseña",
    sessionClosed: "Sesión cerrada correctamente",
    registrationSuccess: "Registro exitoso. Ahora puedes iniciar sesión.",
    loginError: "Error al iniciar sesión",
    registerError: "Error al registrarse",
    connectionError: "Error de conexión",
    rokProfileId: "ID de Perfil de ROK",
    rokProfileIdPlaceholder: "Ej: 123456789",
    rokProfileIdDesc: "Ingresa tu ID numérico de perfil de Rise of Kingdoms",
  },

  // Dashboard
  dashboard: {
    welcome: "¡Bienvenido, {{username}}!",
    subtitle:
      "Selecciona un módulo del menú para comenzar a registrar tus actividades",
    availableModules: "Módulos Disponibles",
    rankings: "Rankings",
    rankingsDesc: "Compite con otros jugadores",
    progress: "Progreso",
    progressDesc: "Seguimiento de tu evolución",
    alliance: "Alianza",
    allianceDesc: "Colabora con tu alianza",
    withRanking: "Con Ranking",
    noModules: "No hay módulos disponibles",
    noModulesDesc: "Contacta al administrador para habilitar módulos",
    adminPanel: "Panel de Administración",
    adminPanelDesc: "Gestiona usuarios, módulos y configuraciones",
    goToAdmin: "Ir a Admin",
    administrator: "Administrador",
  },

  // Fortalezas
  fortresses: {
    title: "Ranking Fortalezas Bárbaras",
    subtitle: "Registra tus cofres semanales y compite con otros jugadores",
    currentWeek: "Semana Actual",
    registerChests: "Registrar Cofres de la Semana",
    updateChests: "Actualizar Cofres de la Semana",
    chestAmount: "Cantidad de Cofres",
    chestAmountPlaceholder: "Ej: 15000",
    chestAmountDesc: "Ingresa la cantidad total de cofres obtenidos",
    chestPhoto: "Foto de Cofres",
    chestPhotoDesc: "Sube una captura de pantalla como evidencia",
    ranking: "Ranking de Fortalezas",
    lastWeek: "Sem. Pasada",
    lastPhoto: "Foto Anterior",
    currentWeekShort: "Sem. Actual",
    currentPhoto: "Foto Actual",
    difference: "Diferencia",
    noPhoto: "Sin foto",
    you: "Tú",
    noRankingData: "No hay datos de ranking",
    noRankingDesc: "Sé el primero en registrar tus cofres de fortaleza",
    dataSaved: "Datos guardados exitosamente",
    saveError: "Error al guardar datos",
    validChestAmount: "La cantidad de cofres debe ser un número válido",
    photoRequired: "La foto es requerida para el registro inicial",
  },

  // Movilización
  mobilization: {
    title: "Movilización de Alianza",
    subtitle:
      "Registra tus puntos de movilización - Mínimo requerido: 1,000 puntos",
    minGoal: "Meta Mínima",
    progressToGoal: "Tu progreso hacia la meta",
    registerPoints: "Registrar Puntos de Movilización",
    updatePoints: "Actualizar Puntos de Movilización",
    mobilizationPoints: "Puntos de Movilización",
    pointsPlaceholder: "Ej: 1500",
    minGoalDesc: "Meta mínima: 1,000 puntos",
    pointsPhoto: "Foto de Puntos",
    pointsPhotoDesc: "Sube una captura de pantalla como evidencia",
    goalAchieved: "Meta cumplida",
    inProgress: "En progreso",
    ranking: "Ranking de Movilización",
    points: "Puntos",
    completed: "Cumplido",
    pending: "Pendiente",
    dataSaved: "Datos guardados exitosamente",
    validPoints: "Los puntos deben ser un número válido mayor o igual a 0",
    photoRequired: "La foto es requerida para el registro inicial",
    noRankingData: "No hay datos de ranking",
    noRankingDesc: "Sé el primero en registrar tus puntos de movilización",
    eventInactive: "Evento Inactivo",
    eventInactiveTitle: "Evento Temporalmente Deshabilitado",
    eventInactiveMessage:
      "El administrador ha desactivado temporalmente el registro de puntos de movilización. Puedes ver el ranking actual, pero no registrar nuevos puntos.",
  },

  // KvK
  kvk: {
    title: "Kingdom vs Kingdom (KvK)",
    subtitle: "Registra tus datos de KvK y obtén tu puntuación",
    totalScore: "Tu Puntuación Total",
    initialData: "Datos Iniciales",
    honor: "Honor",
    battles: "Batallas",
    summaryAndScore: "Resumen y Puntuación",
    killsAndDeathsBeforeKvk: "Kills y Muertes Antes del KvK",
    initialKillsPhoto: "Foto de Kills Iniciales",
    initialKillsDesc: "Captura de tus kills iniciales (Salón de Héroes)",
    ownDeathsPhoto: "Foto de Muertes Propias",
    ownDeathsDesc: "Captura de tus muertes propias iniciales (Salón de Héroes)",
    currentPower: "Poder Actual",
    currentPowerDesc: "Tu poder actual antes del inicio del KvK",
    validCurrentPower: "El poder actual debe ser un número válido mayor a 0",
    initialT4Kills: "Kill T4 Iniciales",
    initialT4KillsDesc: "Cantidad de kills T4 antes de iniciar el KvK",
    initialOwnDeaths: "Muertes Propias Iniciales",
    initialOwnDeathsDesc: "Muertes propias antes de iniciar el KvK",
    initialT5Kills: "Kill T5 Iniciales",
    initialT5KillsDesc: "Cantidad de kills T5 antes de iniciar el KvK",
    registerInitialData: "Registrar Datos Iniciales",
    updateInitialData: "Actualizar Datos Iniciales",
    honorObtained: "Honor Obtenido",
    honorScoring:
      "Sistema de Puntuación: Cada punto de Honor vale 5 puntos en tu puntuación total.",
    honorAmount: "Cantidad de Honor",
    honorAmountDesc: "Total de honor obtenido durante el KvK",
    honorPhoto: "Foto de Honor",
    honorPhotoDesc: "Captura de tu honor total",
    pointsYouGet: "Puntos que obtienes: {{points}}",
    registerHonor: "Registrar Honor",
    updateHonor: "Actualizar Honor",
    registerBattle: "Registrar Batalla - {{stage}}",
    battleScoring:
      "Sistema de Puntuación: Kill T4 = 10 pts, Kill T5 = 20 pts | Muerte T4 = 5 pts, Muerte T5 = 10 pts",
    noActiveStage: "No hay etapa activa configurada",
    noActiveStageDesc:
      "Contacta al administrador para activar una etapa de KvK",
    t4KillsThisStage: "Kills T4 (Esta Etapa)",
    ownT4DeathsThisStage: "Muertes Propias T4 (Ganadas en esta etapa)",
    t5KillsThisStage: "Kills T5 (Ganadas en esta etapa)",
    ownT5DeathsThisStage: "Muertes Propias T5 (Ganadas en esta etapa)",
    battlePhoto: "Foto de Kills",
    battlePhotoDesc: "Captura de tu progreso en la batalla",
    deathsPhoto: "Foto de Muertes (Salón de Héroes)",
    deathsPhotoDesc: "Captura de tus muertes en el Salón de Héroes",
    battlePoints: "Puntos de Esta Batalla:",
    saveBattle: "Guardar Batalla",
    summaryTitle: "Resumen y Puntuación de KvK",
    detailedScore: "Tu Puntuación Detallada",
    t4Deaths: "Muertes T4",
    t5Deaths: "Muertes T5",
    total: "TOTAL",
    registeredBattles: "Batallas Registradas",
    battlePointsShort: "Puntos de esta batalla",
    noBattles: "No hay batallas registradas",
    noBattlesDesc: 'Registra tus batallas en la pestaña "Batallas"',
    dataSaved: "Datos guardados exitosamente",
    validT4Kills: "Los Kill T4 iniciales deben ser un número válido",
    validT5Kills: "Los Kill T5 iniciales deben ser un número válido",
    validOwnDeaths: "Las muertes propias iniciales deben ser un número válido",
    photosRequired:
      "Las fotos de kills y muertes son requeridas para el registro inicial",
    validHonor: "El Honor debe ser un número válido mayor o igual a 0",
    honorPhotoRequired:
      "La foto de honor es requerida para el registro inicial",
    battlePhotosRequired: "Las fotos de batalla y muertes son requeridas",
    preKvk: "Pre-KvK",
    preKvkTitle: "Puntos Pre-KvK",
    preKvkDescription:
      "Registra tus puntos iniciales antes del inicio oficial del KvK",
    preKvkPoints: "Puntos de KvK",
    preKvkPointsDesc: "Puntos totales que tienes antes del KvK",
    preKvkPhoto: "Foto de Puntos KvK",
    preKvkPhotoDesc: "Captura de pantalla mostrando tus puntos de KvK",
    preKvkPhotoRequired: "La foto de puntos KvK es requerida",
    validPreKvkPoints: "Los puntos de KvK deben ser válidos",
    preKvkRanking: "Ranking de Pre-Kvk",
  },

  // MGE
  mge: {
    title: "Postulación MGE",
    subtitle: "Postúlate para el evento Mightiest Governor",
    eventType: "Tipo de Evento",
    registerApplication: "Registrar Postulación",
    updateApplication: "Actualizar Postulación",
    commanders: "Comandantes",
    mainCommander: "Comandante ¿qué desea?",
    mainCommanderPlaceholder: "Ej: Alejandro Magno",
    pairCommander: "Comandante Pareja",
    pairCommanderPlaceholder: "Ej: Ricardo Corazón de León",
    requiredEvidence: "Evidencias Requeridas",
    equipmentPhoto: "Foto de Equipamiento",
    inscriptionsPhoto: "Foto de Inscripciones",
    commandersPhoto: "Foto de Comandantes",
    legendaryHeadsPhoto: "Foto de Cabezas Legendarias",
    noActiveEvents: "No hay eventos MGE activos",
    noActiveEventsDesc:
      "El administrador debe configurar un evento MGE antes de que puedas postularte.",
    applicationRegistered: "Postulación Registrada",
    applicationRegisteredDesc:
      "Tu postulación para {{type}} ha sido registrada exitosamente. Puedes actualizarla en cualquier momento antes del evento.",
    mainCommanderRequired: "El comandante principal es requerido",
    photoRequired: "La {{photo}} es requerida",
    dataSaved: "Postulación guardada exitosamente",
  },

  // AOO
  aoo: {
    title: "Inscripción AOO",
    subtitle: "Regístrate para eventos Ark of Osiris (AOO)",
    eventSchedule: "Horario del Evento",
    noScheduledEvents: "No hay eventos AOO programados",
    noScheduledEventsDesc:
      "El administrador debe configurar un evento AOO para poder inscribirse",
    registerInscription: "Registrar Inscripción AOO",
    updateInscription: "Actualizar Inscripción AOO",
    troopsAmount: "Cantidad de Tropas",
    troopsAmountPlaceholder: "Ej: 500000",
    troopsAmountDesc: "Número total de tropas disponibles",
    commandersPhoto: "Foto de Comandantes",
    commandersPhotoDesc: "Captura de pantalla de tus comandantes",
    availableCommanders: "Comandantes Disponibles",
    availableCommandersPlaceholder: "Ej: Richard I, Edward, Constantine...",
    availableCommandersDesc:
      "Lista los comandantes que tienes disponibles para AOO",
    leadershipCapabilities: "Capacidades de Liderazgo",
    canLeadRally: "Puedo liderar Rally",
    canLeadGarrison: "Puedo liderar Guarnición",
    enrolledList: "Lista de Inscritos",
    troops: "Tropas",
    rally: "Rally",
    garrison: "Guarnición",
    commanders: "Comandantes",
    enrollmentDate: "Fecha",
    noEnrollments: "No hay inscripciones todavía",
    noEnrollmentsDesc:
      "Los usuarios podrán inscribirse cuando haya un evento AOO configurado",
    validTroopsAmount: "La cantidad de tropas debe ser un número válido",
    commandersRequired: "Debes especificar los comandantes disponibles",
    commandersPhotoRequired:
      "La foto de comandantes es requerida para el registro inicial",
    dataSaved: "Inscripción guardada exitosamente",
  },

  // Validaciones
  validation: {
    required: "Este campo es requerido",
    minLength: "Debe tener al menos {{min}} caracteres",
    maxLength: "No puede tener más de {{max}} caracteres",
    invalidUserId:
      "El ID solo puede contener letras, números, guiones y guiones bajos",
    passwordMismatch: "Las contraseñas no coinciden",
    invalidNumber: "Debe ser un número válido",
    invalidEmail: "Email inválido",
    invalidFile: "Archivo inválido",
    rokProfileIdInvalid: "El ID de perfil solo puede contener números",
  },

  // Mensajes de error
  errors: {
    loadingData: "Error al cargar los datos",
    savingData: "Error al guardar los datos",
    connection: "Error de conexión",
    unauthorized: "No autorizado",
    forbidden: "Acceso denegado",
    notFound: "No encontrado",
    serverError: "Error del servidor",
    unknown: "Error desconocido",
  },

  // Tipos de tropas
  troopTypes: {
    archery: "Arquería",
    infantry: "Infantería",
    cavalry: "Caballería",
    leadership: "Liderazgo",
    engineers: "Ingenieros",
  },
};
