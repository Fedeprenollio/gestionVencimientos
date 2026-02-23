export const farmacosData = [
  // =============================
  // PARACETAMOL
  // =============================
  {
    id: "paracetamol",
    nombre: "Paracetamol",
    claseTerapeutica: "analgesico_simple",
    grupo: "Analgésico / Antitérmico",
    principiosActivos: ["paracetamol"],
    esCombinacion: false,
    requiereReceta: false,
    nivelRiesgo: "bajo",
    perfilDestacado:
      "Es el fármaco más seguro de la farmacia. A diferencia de los AINEs, no irrita el estómago ni afecta la presión arterial. Es la base de cualquier tratamiento para la fiebre y el dolor leve, ideal para personas mayores o con estómagos sensibles.",
    limitacionClave:
      "No desinflama absolutamente nada. Si el cliente tiene un dolor muscular agudo, un esguince o la garganta muy roja y afónica, el paracetamol se va a quedar 'corto' porque no ataca la hinchazón.",
    sintomasRelacionados: ["fiebre", "dolor", "cefalea"],
    paraQueSirve: ["Fiebre", "Dolor leve a moderado"],

    preguntasClaveAntesDeVender: [
      "¿Tiene enfermedad hepática?",
      "¿Está tomando otro medicamento con paracetamol?",
    ],

    dosisHabitual: {
      adulto: "500–1000 mg cada 6-8 horas",
      maximaDiaria: "4000 mg",
    },
    dosisPediatrica: {
      mgPorKg: 15,
      intervaloHoras: "cada 6 horas",
      maximaMgKgDia: 60,
    },

    reglaMostrador: {
      presentaciones: [
        {
          nombre: "Suspensión 250mg/5ml (50 mg/ml)",
          regla: "Peso ÷ 3 = ml por dosis",
          detalle: "Equivale a 15 mg/kg",
        },
      ],
    },
    reglasGotas: [
      {
        concentracion: "Gotas 100 mg/ml",
        regla: "3 gotas por kg",
        intervalo: "cada 6 horas",
        detalle: "Aproximado (20 gotas = 1 ml)",
      },
    ],

    noDarSi: ["Insuficiencia hepática severa"],
    precauciones: ["Consumo elevado de alcohol"],
    efectosFrecuentes: ["Raramente molestias digestivas"],

    embarazo: { estado: "verde", texto: "Seguro en dosis habituales" },
    lactancia: { estado: "verde", texto: "Compatible" },

    derivarSi: ["Fiebre mayor a 3 días", "Dolor persistente"],
    tipsMostrador: [
      "No combinar con otros productos que contengan paracetamol",
    ],

    formasFarmaceuticas: [
      {
        tipo: "Comprimido 500 mg",
        descripcionSimple: "Uso oral en adultos",
        cuandoConviene: "Fiebre y dolor leve a moderado",
        velocidadInicio: "Media (30–60 min)",
        impactoSistemico: "medio",
        observaciones: "No combinar con otros productos con paracetamol",
      },
      {
        tipo: "Comprimido 1 g",
        descripcionSimple: "Dosis alta en adultos",
        cuandoConviene: "Dolor moderado",
        velocidadInicio: "Media",
        impactoSistemico: "medio",
        observaciones: "Respetar máximo diario",
      },
      {
        tipo: "Suspensión 250mg/5ml",
        descripcionSimple: "Líquido pediátrico",
        cuandoConviene: "Niños",
        velocidadInicio: "Media",
        impactoSistemico: "medio",
        observaciones: "Calcular según peso",
      },
      {
        tipo: "Gotas 100 mg/ml",
        descripcionSimple: "Uso pediátrico preciso",
        cuandoConviene: "Niños pequeños",
        velocidadInicio: "Rápida",
        impactoSistemico: "medio",
        observaciones: "Medir gotas correctamente",
      },
    ],
  },

  // =============================
  // DIPIRONA (METAMIZOL)
  // =============================
  {
    id: "dipirona",
    nombre: "Dipirona (Metamizol)",
    claseTerapeutica: "analgesico_simple",
    grupo: "Analgésico / Antitérmico",
    principiosActivos: ["dipirona"],
    esCombinacion: false,
    requiereReceta: true,
    nivelRiesgo: "medio",
    perfilDestacado:
      "Es el antitérmico más potente del mercado. Se elige cuando la fiebre es muy alta y no baja con otros medios, o para dolores tipo cólico gracias a su ligero efecto relajante muscular.",
    limitacionClave:
      "Su duración de acción es corta (4 a 6 horas). Si la fiebre es muy rebelde, la táctica habitual es sugerir alternar con Paracetamol cada 4 horas para mantener la temperatura a raya sin sobredosificar.",
    sintomasRelacionados: ["fiebre alta", "dolor intenso"],
    paraQueSirve: ["Fiebre alta", "Dolor moderado a intenso"],

    preguntasClaveAntesDeVender: [
      "¿Antecedentes de alergia a dipirona?",
      "¿Problemas hematológicos?",
    ],

    dosisHabitual: {
      adulto: "500–1000 mg cada 8 horas",
      maximaDiaria: "4000 mg",
    },
    dosisPediatrica: {
      mgPorKg: 10,
      intervaloHoras: "cada 6-8 horas",
      maximaMgKgDia: 40,
    },

    reglaMostrador: {
      presentaciones: [
        {
          nombre: "Suspensión 250mg/5ml (50 mg/ml)",
          regla: "Peso ÷ 5 = ml por dosis",
          detalle: "Equivale a 10 mg/kg",
        },
      ],
    },
    reglasGotas: [
      {
        concentracion: "Gotas 500 mg/ml",
        regla: "1 gota por kg",
        intervalo: "cada 6-8 horas",
        detalle: "Cada gota ≈ 25 mg (20 gotas = 1 ml)",
      },
    ],

    noDarSi: ["Alergia a pirazolonas", "Antecedente de agranulocitosis"],
    precauciones: ["Uso prolongado sin control médico"],
    efectosFrecuentes: ["Reacciones alérgicas", "Raro: agranulocitosis"],

    embarazo: { estado: "rojo", texto: "Evitar salvo indicación médica" },
    lactancia: { estado: "amarillo", texto: "Precaución" },

    derivarSi: ["Fiebre persistente", "Signos de infección grave"],
    tipsMostrador: ["No usar prolongadamente sin indicación médica"],

    formasFarmaceuticas: [
      {
        tipo: "Comprimido 500 mg",
        descripcionSimple: "Uso oral",
        cuandoConviene: "Dolor moderado a intenso",
        velocidadInicio: "Media",
        impactoSistemico: "alto",
        observaciones: "Uso con precaución",
      },
      {
        tipo: "Suspensión 250mg/5ml",
        descripcionSimple: "Uso pediátrico",
        cuandoConviene: "Fiebre alta en niños",
        velocidadInicio: "Media",
        impactoSistemico: "alto",
        observaciones: "Regla peso ÷ 5",
      },
      {
        tipo: "Gotas 500 mg/ml",
        descripcionSimple: "Alta concentración",
        cuandoConviene: "Fiebre alta",
        velocidadInicio: "Rápida",
        impactoSistemico: "alto",
        observaciones: "1 gota por kg",
      },
      {
        tipo: "Inyectable",
        descripcionSimple: "Uso intramuscular o EV",
        cuandoConviene: "Dolor agudo intenso",
        velocidadInicio: "Rápida",
        impactoSistemico: "alto",
        observaciones: "Uso médico",
      },
    ],
  },

  // =============================
  // ASPIRINA
  // =============================

  {
    id: "aspirina",
    nombre: "Aspirina (Ácido Acetilsalicílico)",
    claseTerapeutica: "aine",
    grupo: "AINE / Salicilato",
    principiosActivos: ["ácido acetilsalicílico"],
    esCombinacion: false,
    requiereReceta: false,
    nivelRiesgo: "alto",

    perfilDestacado:
      "Es el AINE más antiguo y estudiado. Además de calmar el dolor y bajar la fiebre, tiene un efecto único: es un potente antiagregante plaquetario (evita que la sangre coagule). Como analgésico puro (dosis de 500mg), es sumamente efectivo para dolores de cabeza tensionales y dolores musculares generales.",
    limitacionClave:
      "Es el medicamento más gastrolesivo del mostrador; puede causar úlceras o sangrado estomacal con facilidad. Está ESTRICTAMENTE CONTRAINDICADO en niños y adolescentes con fiebre o infecciones virales (riesgo de Síndrome de Reye, una enfermedad mortal). Además, por su efecto en la sangre, no debe darse a pacientes con sospecha de Dengue o previo a cirugías/extracciones dentales.",

    sintomasRelacionados: ["dolor", "fiebre", "cefalea"],
    paraQueSirve: [
      "Dolor de cabeza",
      "Fiebre (solo en adultos)",
      "Dolor muscular",
      "Prevención cardiovascular (en dosis bajas de 81-100mg)",
    ],

    preguntasClaveAntesDeVender: [
      "¿Es para un niño o adolescente?",
      "¿Sufre de acidez, gastritis o úlceras?",
      "¿Toma anticoagulantes o tiene programada alguna cirugía/extracción dental?",
    ],

    dosisHabitual: {
      adulto: "500 mg cada 6-8 horas para dolor/fiebre",
      maximaDiaria: "4000 mg",
    },

    noDarSi: [
      "Niños menores de 16 años con fiebre",
      "Úlcera gástrica activa",
      "Sospecha de Dengue",
      "Asma inducido por aspirina",
      "Hemofilia o sangrados",
    ],
    precauciones: [
      "Tomar siempre con las comidas",
      "Pacientes mayores de 65 años",
    ],
    efectosFrecuentes: [
      "Malestar estomacal",
      "Acidez",
      "Microsangrados gástricos",
    ],

    embarazo: {
      estado: "rojo",
      texto:
        "Evitar, especialmente en el 3° trimestre (riesgo de cierre prematuro del ductus y sangrado).",
    },
    lactancia: {
      estado: "amarillo",
      texto:
        "Precaución. Pasa a la leche materna, preferir Paracetamol o Ibuprofeno.",
    },

    tipsMostrador: [
      "Jamás recomendar para bajar la fiebre en pediatría.",
      "Aclarar al cliente la diferencia entre la Aspirina común (500mg para dolor) y la 'Aspirineta' o Prevent (100mg para el corazón).",
    ],

    formasFarmaceuticas: [
      {
        tipo: "Comprimido 500 mg",
        descripcionSimple: "Analgésico adultos",
        cuandoConviene: "Cefaleas o dolor muscular",
        velocidadInicio: "Media",
        impactoSistemico: "alto",
        observaciones: "Tomar con abundante agua y comida",
      },
      {
        tipo: "Comprimido 100 mg (Baja dosis)",
        descripcionSimple: "Cardioprotector",
        cuandoConviene: "Prevención de infartos bajo receta",
        velocidadInicio: "Lenta",
        impactoSistemico: "alto",
        observaciones: "No sirve para calmar dolores comunes",
      },
    ],
  },

  // =============================
  // DICLO
  // =============================

  {
    id: "diclofenac",
    nombre: "Diclofenac (Sódico / Potásico)",
    claseTerapeutica: "aine",
    grupo: "AINE de alta penetración tisular",
    principiosActivos: ["diclofenac"],
    esCombinacion: false,
    requiereReceta: true, // Aunque en la práctica de mostrador se venda mucho OTC
    nivelRiesgo: "alto",

    perfilDestacado:
      "Es el antiinflamatorio de referencia para problemas articulares, de espalda o musculares por su excelente penetración en estos tejidos. La clave de mostrador es elegir la sal correcta: el Diclofenac POTÁSICO se absorbe rapidísimo (ideal para dolores agudos como muela o un golpe reciente), mientras que el SÓDICO es de liberación más lenta (ideal para inflamaciones crónicas como artrosis que necesitan alivio sostenido).",
    limitacionClave:
      "Es uno de los AINEs con mayor riesgo cardiovascular asociado si se usa crónicamente en dosis altas. A nivel gástrico es bastante agresivo. Nunca debe recomendarse como primera línea para una simple fiebre o dolor de cabeza leve, reservándolo para dolores con fuerte componente inflamatorio.",

    sintomasRelacionados: [
      "dolor_muscular",
      "dolor_dental",
      "lumbalgia",
      "inflamacion",
    ],
    paraQueSirve: [
      "Dolor de muela",
      "Lumbalgia / Ciática",
      "Artrosis",
      "Esguinces",
    ],

    preguntasClaveAntesDeVender: [
      "¿Tiene problemas de corazón o presión muy alta?",
      "¿Sufre de acidez recurrente o úlceras?",
    ],

    dosisHabitual: {
      adulto: "50 mg cada 8 horas o 75 mg cada 12 horas",
      maximaDiaria: "150 mg",
    },

    noDarSi: [
      "Insuficiencia cardíaca severa",
      "Úlcera activa",
      "Hipertensión descontrolada",
      "Alergia a AINEs",
    ],
    precauciones: [
      "No prolongar su uso sin indicación médica",
      "Cuidado en adultos mayores",
    ],
    efectosFrecuentes: [
      "Dolor epigástrico",
      "Aumento leve de la presión arterial",
      "Retención de líquidos",
    ],

    embarazo: {
      estado: "rojo",
      texto: "Evitar, contraindicado en el 3° trimestre.",
    },
    lactancia: {
      estado: "verde",
      texto:
        "Compatible, se excreta en cantidades clínicamente no significativas.",
    },

    tipsMostrador: [
      "Regla mnemotécnica: Potásico = 'P' de Pronto (rápido, muela). Sódico = 'S' de Sostenido (lento, huesos).",
      "Siempre recomendar tomarlo después de las comidas.",
    ],

    formasFarmaceuticas: [
      {
        tipo: "Comprimido Potásico 50 mg",
        descripcionSimple: "Acción rápida",
        cuandoConviene: "Dolor de muela, golpes agudos",
        velocidadInicio: "Muy rápida",
        impactoSistemico: "alto",
        observaciones: "Ideal para el dolor de inicio súbito",
      },
      {
        tipo: "Comprimido Sódico 75 mg",
        descripcionSimple: "Acción prolongada",
        cuandoConviene: "Dolor de espalda, reuma",
        velocidadInicio: "Lenta",
        impactoSistemico: "alto",
        observaciones: "Alivio más duradero",
      },
      {
        tipo: "Gel 1%",
        descripcionSimple: "Uso tópico",
        cuandoConviene: "Dolores musculares localizados",
        velocidadInicio: "Media local",
        impactoSistemico: "bajo",
        observaciones: "Opción muy segura para no afectar estómago",
      },
    ],
  },
  // =============================
  // IBUPROFENO
  // =============================
  {
    id: "ibuprofeno",
    nombre: "Ibuprofeno",
    claseTerapeutica: "aine",
    grupo: "AINE",
    principiosActivos: ["ibuprofeno"],
    esCombinacion: false,
    requiereReceta: false,
    nivelRiesgo: "medio",
    perfilDestacado:
      "Es el todoterreno: efectivo, versátil y con un excelente equilibrio entre potencia analgésica y acción antiinflamatoria. Es la opción de primera línea para niños y adultos por su rapidez de acción.",
    limitacionClave:
      "Es agresivo para la mucosa gástrica y puede retener líquidos. Hay que tener precaución (o buscar alternativas) si el cliente sufre de acidez recurrente o es hipertenso severo.",
    sintomasRelacionados: ["fiebre", "dolor", "inflamacion"],
    paraQueSirve: ["Fiebre", "Dolor", "Inflamación"],

    preguntasClaveAntesDeVender: [
      "¿Tiene gastritis o úlcera?",
      "¿Problemas renales?",
      "¿Está embarazada?",
    ],

    dosisHabitual: {
      adulto: "400 mg cada 8 horas",
      maximaDiaria: "1200 mg (OTC)",
    },
    dosisPediatrica: {
      mgPorKg: 10,
      intervaloHoras: "cada 8 horas",
      maximaMgKgDia: 40,
    },

    reglaMostrador: {
      presentaciones: [
        {
          nombre: "Suspensión 100mg/5ml (2%)",
          regla: "Peso ÷ 2 = ml por dosis",
          detalle: "Equivale a 10 mg/kg",
        },
        {
          nombre: "Suspensión 200mg/5ml (4%)",
          regla: "Peso ÷ 4 = ml por dosis",
          detalle: "Equivale a 10 mg/kg",
        },
      ],
    },
    reglasGotas: [
      {
        concentracion: "Gotas 100 mg/ml",
        regla: "2 gotas por kg",
        intervalo: "cada 8 horas",
        detalle: "Aproximado (20 gotas = 1 ml)",
      },
    ],

    noDarSi: ["Úlcera activa", "Insuficiencia renal severa", "Alergia a AINEs"],
    precauciones: ["Hipertensión", "Adultos mayores"],
    efectosFrecuentes: ["Dolor gástrico", "Náuseas"],

    embarazo: { estado: "rojo", texto: "Evitar especialmente 3° trimestre" },
    lactancia: { estado: "verde", texto: "Compatible" },

    derivarSi: ["Dolor persistente", "Sangrado digestivo"],
    tipsMostrador: ["Administrar con comida", "No combinar con otro AINE"],

    formasFarmaceuticas: [
      {
        tipo: "Comprimido 400 mg",
        descripcionSimple: "Uso oral estándar",
        cuandoConviene: "Dolor e inflamación leve a moderada",
        velocidadInicio: "Media",
        impactoSistemico: "alto",
        observaciones: "Tomar con comida",
      },
      {
        tipo: "Suspensión 100mg/5ml (2%)",
        descripcionSimple: "Uso pediátrico",
        cuandoConviene: "Niños",
        velocidadInicio: "Media",
        impactoSistemico: "alto",
        observaciones: "Regla peso ÷ 2",
      },
      {
        tipo: "Suspensión 200mg/5ml (4%)",
        descripcionSimple: "Uso pediátrico concentrado",
        cuandoConviene: "Niños mayores",
        velocidadInicio: "Media",
        impactoSistemico: "alto",
        observaciones: "Regla peso ÷ 4",
      },
    ],
  },

  // =============================
  // NAPROXENO
  // =============================
  {
    id: "naproxeno",
    nombre: "Naproxeno",
    claseTerapeutica: "aine",
    grupo: "AINE",
    principiosActivos: ["naproxeno"],
    esCombinacion: false,
    requiereReceta: true,
    nivelRiesgo: "medio",
    perfilDestacado:
      "Se diferencia por su larga duración: una sola toma dura hasta 12 horas. Es excelente para dolores que persisten en el tiempo, como la migraña o el dolor menstrual, evitando que el paciente tenga que tomar pastillas cada 4 o 6 horas.",
    limitacionClave:
      "Tarda un poco más en hacer efecto inicial en comparación con el Ibuprofeno. Además, al durar tanto en el cuerpo, sus efectos adversos gastrointestinales pueden ser más sostenidos si se toma con el estómago vacío.",
    sintomasRelacionados: ["dolor", "inflamacion"],
    paraQueSirve: ["Dolor muscular", "Dolor articular", "Inflamación"],

    preguntasClaveAntesDeVender: [
      "¿Úlcera o gastritis?",
      "¿Problemas renales o cardíacos?",
    ],

    dosisHabitual: {
      adulto: "250–500 mg cada 12 horas",
      maximaDiaria: "1000 mg",
    },

    noDarSi: [
      "Úlcera activa",
      "Insuficiencia renal",
      "Hipertensión no controlada",
    ],
    precauciones: ["Adultos mayores", "Tomar con comida"],
    efectosFrecuentes: ["Dolor gástrico", "Náuseas"],

    embarazo: { estado: "rojo", texto: "Evitar especialmente 3° trimestre" },
    lactancia: { estado: "amarillo", texto: "Precaución" },

    tipsMostrador: ["No combinar con otros AINEs"],

    formasFarmaceuticas: [
      {
        tipo: "Comprimido 250 mg",
        descripcionSimple: "Uso oral estándar",
        cuandoConviene: "Dolor leve a moderado",
        velocidadInicio: "Media",
        impactoSistemico: "alto",
        observaciones: "Tomar con comida",
      },
      {
        tipo: "Comprimido 500 mg",
        descripcionSimple: "Uso oral",
        cuandoConviene: "Dolor inflamatorio",
        velocidadInicio: "Media",
        impactoSistemico: "alto",
        observaciones: "Controlar dosis diaria",
      },
    ],
  },

  // =============================
  // COXIBS
  // =============================
  {
    id: "celecoxib",
    nombre: "Celecoxib",
    claseTerapeutica: "coxib",
    grupo: "AINE selectivo COX-2",
    principiosActivos: ["celecoxib"],
    esCombinacion: false,
    requiereReceta: true,
    nivelRiesgo: "medio",
    perfilDestacado:
      "Representa la evolución de los antiinflamatorios. Está diseñado para bloquear el dolor y la inflamación con la misma potencia que el Diclofenac, pero con un nivel de seguridad gástrica mucho mayor. Es la opción ideal para pacientes que necesitan tratamiento por varios días y tienen estómagos delicados.",

    sintomasRelacionados: ["dolor", "inflamacion"],
    paraQueSirve: ["Dolor articular", "Artrosis", "Artritis"],

    preguntasClaveAntesDeVender: [
      "¿Enfermedad cardiovascular?",
      "¿Hipertensión no controlada?",
      "¿Problemas renales?",
    ],

    dosisHabitual: {
      adulto: "200 mg por día (1 o 2 tomas)",
      maximaDiaria: "400 mg",
    },

    noDarSi: [
      "Cardiopatía isquémica",
      "Insuficiencia cardíaca",
      "Alergia a sulfas",
    ],
    precauciones: ["Hipertensión", "Riesgo cardiovascular alto"],
    efectosFrecuentes: ["Edema", "Dolor abdominal leve"],

    embarazo: { estado: "rojo", texto: "Contraindicado en 3° trimestre" },
    lactancia: { estado: "amarillo", texto: "Precaución" },

    tipsMostrador: [
      "Menor riesgo gástrico que AINE tradicionales",
      "Mayor riesgo cardiovascular que ibuprofeno",
    ],

    formasFarmaceuticas: [
      {
        tipo: "Cápsula 200 mg",
        descripcionSimple: "Uso oral selectivo COX-2",
        cuandoConviene: "Pacientes con riesgo gástrico",
        velocidadInicio: "Media",
        impactoSistemico: "alto",
        observaciones: "Menor irritación gástrica",
      },
    ],
  },
  {
    id: "etoricoxib",
    nombre: "Etoricoxib",
    claseTerapeutica: "coxib",
    grupo: "AINE selectivo COX-2",
    principiosActivos: ["etoricoxib"],
    esCombinacion: false,
    requiereReceta: true,
    nivelRiesgo: "alto",
    perfilDestacado:
      "Representa la evolución de los antiinflamatorios. Está diseñado para bloquear el dolor y la inflamación con la misma potencia que el Diclofenac, pero con un nivel de seguridad gástrica mucho mayor. Es la opción ideal para pacientes que necesitan tratamiento por varios días y tienen estómagos delicados.",

    sintomasRelacionados: ["dolor", "inflamacion"],
    paraQueSirve: ["Dolor agudo", "Gota", "Dolor lumbar", "Artrosis"],

    preguntasClaveAntesDeVender: [
      "Enfermedad cardiovascular",
      "HTA no controlada",
    ],

    dosisHabitual: { adulto: "60–120 mg por día", maximaDiaria: "120 mg" },

    noDarSi: ["Enfermedad cardiovascular", "HTA no controlada"],
    precauciones: ["Adultos mayores"],
    efectosFrecuentes: ["Edema", "Elevación de presión"],

    embarazo: { estado: "rojo", texto: "Contraindicado" },
    lactancia: { estado: "rojo", texto: "Evitar" },

    tipsMostrador: [
      "Muy potente antiinflamatorio",
      "Evaluar riesgo cardiovascular antes de vender",
    ],

    formasFarmaceuticas: [
      {
        tipo: "Comprimido 90 mg",
        descripcionSimple: "Alta potencia antiinflamatoria",
        cuandoConviene: "Dolor inflamatorio intenso",
        velocidadInicio: "Media",
        impactoSistemico: "alto",
        observaciones: "Controlar presión arterial",
      },
    ],
  },

  // =============================
  // KETOROLAC
  // =============================
  {
    id: "ketorolac",
    nombre: "Ketorolac",
    claseTerapeutica: "aine",
    grupo: "AINE potente",
    principiosActivos: ["ketorolac"],
    esCombinacion: false,
    requiereReceta: true,
    nivelRiesgo: "alto",
    perfilDestacado:
      "Es el analgésico no opioide más potente disponible en el mostrador. Se destaca por una eficacia comparable a la morfina en dolores agudos pero sin sus efectos sedantes. Es la elección de oro para dolor de muela severo o post-cirugía debido a que bloquea las vías del dolor de forma mucho más agresiva que el ibuprofeno común.",
    limitacionClave:
      "Es altamente gastrolesivo y tiene riesgo renal si se abusa. La regla de oro internacional es: máximo 5 días de uso continuo. Bajo ningún punto de vista se ofrece para dolores crónicos o leves.",
    sintomasRelacionados: ["dolor intenso"],
    paraQueSirve: [
      "Dolor agudo intenso",
      "Dolor postoperatorio",
      "Dolor dental fuerte",
    ],

    preguntasClaveAntesDeVender: [
      "¿Problemas gástricos?",
      "¿Problemas renales?",
      "¿Está usando otro AINE?",
    ],

    dosisHabitual: { adulto: "10 mg cada 6-8 horas", maximaDiaria: "40 mg" },

    noDarSi: ["Úlcera activa", "Insuficiencia renal", "Uso prolongado"],
    precauciones: ["No usar más de 5 días"],
    efectosFrecuentes: ["Dolor gástrico", "Náuseas"],

    embarazo: { estado: "rojo", texto: "Contraindicado" },
    lactancia: { estado: "rojo", texto: "Evitar" },

    tipsMostrador: [
      "Muy potente, no es para dolor leve",
      "No combinar con otros AINEs",
      "Uso máximo 5 días",
    ],

    formasFarmaceuticas: [
      {
        tipo: "Comprimido 10 mg",
        descripcionSimple: "Analgésico potente oral",
        cuandoConviene: "Dolor agudo fuerte",
        velocidadInicio: "Rápida",
        impactoSistemico: "alto",
        observaciones: "Máximo 5 días",
      },
      {
        tipo: "Inyectable",
        descripcionSimple: "Uso intramuscular",
        cuandoConviene: "Dolor intenso",
        velocidadInicio: "Muy rápida",
        impactoSistemico: "alto",
        observaciones: "Uso médico",
      },
    ],
  },

  // =============================
  // MIGRAÑOSOS (MIGRAL)
  // =============================
  {
    id: "migral",
    nombre: "Migral",
    lineaComercial: "Migral",
    claseTerapeutica: "antimigrañoso_combinado",
    grupo: "Antimigrañoso",
    perfilDestacado: `A diferencia de un analgésico común, este medicamento combina agentes que actúan directamente sobre la dilatación de las arterias cerebrales. Es específico para 'cortar' el ataque de migraña cuando el dolor late y molesta la luz, logrando un alivio que el ibuprofeno solo no alcanza. 
    
    Si el cuadro presenta nauseas o vómitos se recomienda la combinación con algun antihemetico como Metoclopramida`,

    limitacionClave:
      "Genera 'efecto rebote'. Si el paciente lo toma más de 2 o 3 veces por semana, el mismo medicamento le causará dolor de cabeza crónico. Además, la ergotamina sube la presión, por lo que está contraindicado en hipertensos.",
    esCombinacion: true,
    requiereReceta: true,
    nivelRiesgo: "alto",
    sintomasRelacionados: ["migraña"],
    paraQueSirve: ["Crisis de migraña"],
    grupoEquivalencia: "ergotamina_compuesta",
    principiosActivos: [
      {
        nombre: "Ergotamina",
        funcionSimple: "Vasoconstrictor específico para migraña",
      },
      { nombre: "Cafeína", funcionSimple: "Potencia el efecto analgésico" },
      { nombre: "Dipirona", funcionSimple: "Alivia el dolor" },
    ],
    dosisHabitual: {
      adulto: "1 comprimido al inicio, repetir según indicación",
      maximaDiaria: "Seguir prospecto",
    },
    noDarSi: ["Hipertensión", "Enfermedad vascular", "Embarazo"],
    precauciones: ["No usar en cefalea común"],
    efectosFrecuentes: ["Náuseas", "Vasoconstricción"],
    tipsMostrador: [
      "No es para dolor común",
      "Evitar uso frecuente (cefalea por rebote)",
    ],
    versionesComerciales: [
      {
        nombre: "Migral Compositum",
        diferenciaClave: "Agrega antiemético (reduce náuseas)",
        principiosActivos: [
          { nombre: "Ergotamina", funcionSimple: "Vasoconstrictor" },
          { nombre: "Cafeína", funcionSimple: "Potencia analgésico" },
          { nombre: "Dipirona", funcionSimple: "Alivia dolor" },
          {
            nombre: "Metoclopramida",
            funcionSimple: "Antiemético (reduce náuseas)",
          },
        ],
        formasFarmaceuticas: [
          {
            tipo: "Comprimido",
            descripcionSimple: "Crisis de migraña con náuseas",
            cuandoConviene: "Crisis intensa",
            velocidadInicio: "Media",
            impactoSistemico: "alto",
          },
        ],
      },
      {
        nombre: "Migral II",
        diferenciaClave: "Mayor dosis analgésica que Migral clásico",
        principiosActivos: [
          { nombre: "Ergotamina", funcionSimple: "Vasoconstrictor" },
          { nombre: "Cafeína", funcionSimple: "Potencia analgésico" },
          { nombre: "Ibuprofeno", funcionSimple: "Alivia dolor intenso" },
        ],
        formasFarmaceuticas: [
          {
            tipo: "Comprimido",
            descripcionSimple: "Crisis de migraña intensa",
            cuandoConviene: "Dolor fuerte",
            velocidadInicio: "Rápida",
            impactoSistemico: "alto",
          },
        ],
      },
    ],
    formasFarmaceuticas: [
      {
        tipo: "Comprimido",
        descripcionSimple: "Antimigrañoso combinado",
        cuandoConviene: "Crisis de migraña",
        velocidadInicio: "Media",
        impactoSistemico: "alto",
        observaciones: "No usar como analgésico común",
      },
    ],
  },
  {
    id: "tetralgin",
    nombre: "Tetralgin",
    claseTerapeutica: "antimigrañoso_combinado",
    // ... al ser un equivalente, podrías tener su propia ficha o una simplificada
    grupoEquivalencia: "ergotamina_compuesta",
  },

  // =============================
  // CREMAS ANALGÉSICAS
  // =============================
  {
    id: "diclofenac_gel",
    nombre: "Diclofenac Gel",
    claseTerapeutica: "topico_antiinflamatorio",
    grupo: "AINE tópico",
    principiosActivos: ["diclofenac"],
    esCombinacion: false,
    requiereReceta: false,
    nivelRiesgo: "bajo",
    equivalentes: ["tetralgin", "migra_dioxadol"],

    sintomasRelacionados: ["dolor muscular", "dolor articular"],
    paraQueSirve: ["Dolor localizado", "Inflamación leve"],

    preguntasClaveAntesDeVender: [
      "¿Heridas abiertas en la zona?",
      "¿Alergia a AINEs?",
    ],
    dosisHabitual: {
      adulto: "Aplicar fina capa 2–3 veces/día",
      maximaDiaria: "No superar 8 g",
    },

    noDarSi: ["Heridas abiertas", "Insuficiencia hepática grave"],
    precauciones: ["Evitar contacto con ojos"],
    efectosFrecuentes: ["Enrojecimiento local", "Picazón"],
    tipsMostrador: ["Uso local", "Menor riesgo sistémico"],

    formasFarmaceuticas: [
      {
        tipo: "Gel 1%",
        descripcionSimple: "Aplicación local",
        cuandoConviene: "Dolor muscular o articular",
        velocidadInicio: "Rápida local",
        impactoSistemico: "bajo",
        observaciones: "Masajear suavemente",
      },
    ],
  },
  // =============================
  // SERTAL Y BUSCAPINA SIMPLES
  // =============================

  {
    id: "antiespasmodico_puro",
    nombre: "Hioscina / Propinoxato (Puros)",
    claseTerapeutica: "antiespasmodico",
    grupo: "Antiespasmódico (Relajante de músculo liso)",
    principiosActivos: ["hioscina butilbromuro", "propinoxato"],
    esCombinacion: false,
    requiereReceta: false,
    nivelRiesgo: "bajo",

    perfilDestacado:
      "Su función no es tapar el dolor en el cerebro, sino relajar directamente el músculo liso del intestino, vía biliar o útero. Es la elección ideal cuando el paciente describe el dolor como un 'retortijón', un 'nudo' o un cólico, ya que ataca el espasmo físico que lo provoca sin agredir el estómago.",
    limitacionClave:
      "No tiene ningún efecto analgésico sobre dolores inflamatorios (no sirve para cabeza, muela o golpes). Por su mecanismo de acción (anticolinérgico), seca las secreciones: puede causar sequedad de boca, visión borrosa leve o empeorar el estreñimiento. Cuidado en hombres mayores porque puede dificultar la orina (hipertrofia prostática).",

    sintomasRelacionados: ["dolor_abdominal", "dolor_menstrual", "colicos"],
    paraQueSirve: [
      "Retortijones",
      "Cólicos intestinales",
      "Gases atrapados",
      "Dolor menstrual leve",
    ],

    preguntasClaveAntesDeVender: [
      "¿El dolor es tipo puntada constante o como un retortijón que va y viene?",
      "¿Tiene problemas de próstata o glaucoma?",
    ],

    dosisHabitual: {
      adulto: "1 a 2 comprimidos (10mg) de 3 a 5 veces por día",
      maximaDiaria: "100 mg (Hioscina)",
    },

    noDarSi: [
      "Glaucoma de ángulo estrecho",
      "Retención urinaria",
      "Obstrucción intestinal (íleo)",
    ],
    precauciones: [
      "Evitar si hay fiebre alta asociada al dolor abdominal (derivar)",
      "Estreñimiento crónico",
    ],
    efectosFrecuentes: ["Boca seca", "Taquicardia leve", "Constipación"],

    embarazo: {
      estado: "amarillo",
      texto:
        "Precaución. Se prefiere la Hioscina antes que el Propinoxato, pero siempre bajo evaluación médica.",
    },
    lactancia: {
      estado: "amarillo",
      texto: "Precaución. Puede disminuir la producción de leche materna.",
    },

    tipsMostrador: [
      "Si el cliente pide para 'dolor de ovarios' muy fuerte, ofrecer la versión COMPUESTA (con Ibu/Cloni) porque el puro suele quedarse corto.",
      "Aclarar que puede dar la sensación de tener la boca seca, es normal.",
    ],

    formasFarmaceuticas: [
      {
        tipo: "Comprimido (10mg)",
        descripcionSimple: "Antiespasmódico puro",
        cuandoConviene: "Retortijones leves sin otro malestar",
        velocidadInicio: "Rápida (15-30 min)",
        impactoSistemico: "bajo",
        observaciones: "Se puede tomar en ayunas",
      },
      {
        tipo: "Gotas",
        descripcionSimple: "Uso pediátrico",
        cuandoConviene: "Cólicos en niños (bajo indicación)",
        velocidadInicio: "Rápida",
        impactoSistemico: "bajo",
        observaciones: "Dosis estricta por peso",
      },
    ],

    // Aquí podés vincular sus variantes "Compositum" o "Sertal Compuesto" para la venta cruzada:
    versionesComerciales: [
      {
        nombre: "Versión Compuesta (con Clonixinato o Ibuprofeno)",
        diferenciaClave: "Agrega Analgésico y Antiinflamatorio",
        formasFarmaceuticas: [
          {
            tipo: "Comprimido",
            descripcionSimple: "Cólicos muy dolorosos",
            cuandoConviene: "Dolor menstrual fuerte o cólico biliar",
            observaciones:
              "Cuidado con estómagos sensibles por el AINE añadido",
          },
        ],
      },
    ],
  },
  // =============================
  // SERTAL Y BUSCAPINA Ctos
  //

  {
    id: "antiespasmodico_combinado",
    nombre: "Antiespasmódico + Analgésico",
    claseTerapeutica: "antiespasmodico_analgesico",
    grupo: "Antiespasmódico Combinado",
    principiosActivos: [
      {
        nombre: "Propinoxato / Hioscina",
        funcionSimple: "Relaja el espasmo (el nudo)",
      },
      {
        nombre: "Clonixinato de Lisina / Dipirona / Ibuprofeno",
        funcionSimple: "Elimina el dolor",
      },
    ],
    esCombinacion: true,
    requiereReceta: true,
    nivelRiesgo: "medio",

    perfilDestacado:
      "Es la solución integral para el cólico moderado a fuerte. Mientras el antiespasmódico relaja el músculo liso (intestino, útero o vías biliares), el analgésico potente bloquea la señal de dolor. Es superior al fármaco solo porque ataca tanto la causa física del retortijón como la percepción del dolor.",
    limitacionClave:
      "Debido al componente analgésico (AINE), puede ser agresivo para la mucosa gástrica. Su uso en dolores de panza muy fuertes debe ser cuidadoso: si el dolor no cede, puede estar 'tapando' una apendicitis o una obstrucción que requiere cirugía urgente.",

    sintomasRelacionados: [
      "dolor_abdominal",
      "dolor_menstrual",
      "colicos_renales",
    ],
    paraQueSirve: [
      "Cólico biliar (hígado)",
      "Cólico renal",
      "Dolor menstrual fuerte",
      "Retortijones con dolor intenso",
    ],

    preguntasClaveAntesDeVender: [
      "¿El dolor es muy localizado o generalizado?",
      "¿Tiene náuseas o vómitos? (Para decidir si conviene gotas o comprimidos)",
      "¿Sufre de presión alta o problemas gástricos?",
    ],

    dosisHabitual: {
      adulto: "1 comprimido cada 6-8 horas",
      maximaDiaria: "3 a 4 comprimidos según el prospecto de la marca",
    },

    noDarSi: [
      "Glaucoma",
      "Sospecha de apendicitis",
      "Úlcera gástrica activa",
      "Alergia a los AINEs o Dipirona",
    ],
    precauciones: [
      "No automedicarse por más de 3 días si el dolor persiste",
      "Evitar alcohol durante el tratamiento",
    ],
    efectosFrecuentes: ["Boca seca", "Somnolencia leve", "Acidez"],

    embarazo: {
      estado: "rojo",
      texto:
        "Contraindicado (especialmente por el componente analgésico en el último trimestre).",
    },
    lactancia: {
      estado: "amarillo",
      texto:
        "Precaución. Consultar médico, suele preferirse el antiespasmódico puro.",
    },

    tipsMostrador: [
      "Si hay vómitos, las gotas se absorben mejor que el comprimido, pero el inyectable es lo único 100% efectivo.",
      "Para dolor de ovarios, es la opción recomendada sobre la Buscapina simple.",
      "Explicar que el inyectable puede tomarse por boca, pero el sabor es extremadamente amargo.",
    ],

    formasFarmaceuticas: [
      {
        tipo: "Comprimido",
        descripcionSimple: "Tratamiento estándar",
        cuandoConviene: "Dolor abdominal fuerte",
        velocidadInicio: "Media (30-45 min)",
        impactoSistemico: "medio",
      },
      {
        tipo: "Gotas",
        descripcionSimple: "Absorción rápida / Dosis regulable",
        cuandoConviene: "Inicio rápido del alivio o náuseas",
        velocidadInicio: "Rápida (15-20 min)",
        impactoSistemico: "medio",
      },
      {
        tipo: "Ampollas (Inyectable)",
        descripcionSimple: "Uso de rescate",
        cuandoConviene: "Dolor insoportable o vómitos activos",
        velocidadInicio: "Inmediata (IM/EV)",
        impactoSistemico: "alto",
        observaciones:
          "Venta bajo receta. Se puede administrar vía oral en urgencias.",
      },
    ],

    versionesComerciales: [
      {
        nombre: "Sertal Compuesto",
        diferenciaClave:
          "Contiene Clonixinato de Lisina (Analgésico muy potente)",
      },
      {
        nombre: "Buscapina Compositum",
        diferenciaClave:
          "Contiene Dipirona (Excelente antitérmico y analgésico)",
      },
      {
        nombre: "Buscapina Duo",
        diferenciaClave:
          "Contiene Paracetamol. Es la versión 'amigable con el estómago'. Ideal si el paciente tiene gastritis o no puede tomar AINEs fuertes.",
          principiosActivos:["Hioscina" ,"paracetamol"]
      },
      {
        nombre: "Buscapina Fem",
        diferenciaClave:
          "Contiene Ibuprofeno (Específico para inflamación uterina)",
      },
    ],
  },

  
  // Más cremas tópicas (mentol, terpineol, salicilato de amilo, CBD) se pueden agregar igual siguiendo este patrón
];
