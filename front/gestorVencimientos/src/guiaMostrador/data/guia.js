export const guiaData = {
  version: "1.0.0",
  ultimaActualizacion: "2026-02-21",
  sistemas: [
    {
      id: "dolor_fiebre",
      nombre: "Dolor y Fiebre",
      icono: "thermometer",
      orden: 1,
      sintomas: [
        {
          id: "fiebre_adulto",
          nombre: "Fiebre en Adultos",
          descripcionBreve: "Elevación de temperatura corporal mayor a 37.5°C.",
          triage: [
            { pregunta: "¿Desde cuándo tiene fiebre?" },
            { pregunta: "¿Es mayor a 39°C?", alertaSi: true },
            { pregunta: "¿Dolor intenso o rigidez de cuello?", alertaSi: true },
          ],
          clavesAtencion: [
            "Priorizar Paracetamol en pacientes con problemas gástricos, anticoagulados o con dengue sospechado.",
            "Mantener hidratación abundante; la fiebre consume líquidos rápidamente.",
            "No intercalar antitérmicos (Ibu/Para) sistemáticamente sin indicación médica previa.",
          ],
          gruposRecomendados: [
            {
              id: "analgesico_simple",
              nota: "Primera elección por seguridad.",
              farmacosPrincipales: ["paracetamol", "dipirona"],
            },
            {
              id: "aine",
              nota: "Usar si hay inflamación asociada o si el paracetamol no es suficiente.",
              farmacosPrincipales: ["ibuprofeno", "naproxeno", "aspirina"],
            },
          ],
          criteriosDerivacion: [
            "Fiebre persistente por más de 3 días.",
            "Aparición de manchas en la piel (petequias).",
            "Dificultad para respirar.",
          ],
        },
      ],
    },
    {
      id: "dolor",
      nombre: "Dolor",
      icono: "pain",
      sintomas: [
        {
          id: "cefalea",
          nombre: "Cefalea (dolor de cabeza común)",
          descripcionBreve:
            "Dolor opresivo, como una venda que aprieta. Suele ser por estrés o contractura.",
          triage: [
            { pregunta: "¿Es un dolor opresivo (presión)?" },
            { pregunta: "¿Es muy intenso o de inicio súbito?", alertaSi: true },
            {
              pregunta: "¿Tiene rigidez de cuello o fiebre alta?",
              alertaSi: true,
            },
          ],
          clavesAtencion: [
            "Preguntar por la vista: el cansancio visual es causa frecuente de cefalea frontal.",
            "Advertir sobre el 'efecto rebote': el uso excesivo de analgésicos puede causar dolor de cabeza crónico.",
            "Sugerir descanso en ambiente oscuro si el dolor es por estrés.",
          ],
          gruposRecomendados: [
            {
              id: "analgesico_simple",
              nota: "Ideal para cefaleas tensionales. Es la opción más segura.",
              farmacosPrincipales: ["paracetamol"],
            },
            {
              id: "aine",
              nota: "Usar si el paracetamol no funciona o si hay dolor de cuello asociado.",
              farmacosPrincipales: ["ibuprofeno", "aspirina"],
            },
          ],
        },
        {
          id: "migraña",
          nombre: "Migraña",
          descripcionBreve:
            "Dolor pulsátil de un solo lado, suele incluir náuseas o molestia a la luz.",
          triage: [
            { pregunta: "¿El dolor late?" },
            { pregunta: "¿Le molesta la luz o los ruidos?" },
            { pregunta: "¿Dura más de 72 horas?", alertaSi: true },
          ],
          clavesAtencion: [
            "Eficacia terapéutica: recomendar la toma del medicamento apenas aparecen los primeros síntomas.",
            "Evitar desencadenantes: cafeína, chocolate o quesos fuertes suelen empeorar el cuadro.",
            "Los antimigrañosos combinados (con cafeína/ergotamina) deben usarse con precaución en hipertensos.",
          ],
          gruposRecomendados: [
            {
              id: "antimigrañoso_combinado",
              nota: "Específicos para cortar el ataque. No usar para dolor común.",
              farmacosPrincipales: ["migral", "tetralgin"],
            },
            {
              id: "aine",
              nota: "El Naproxeno es muy efectivo por su larga duración en migrañas.",
              farmacosPrincipales: ["naproxeno", "ibuprofeno"],
            },
          ],
        },
        {
          id: "dolor_dental",
          nombre: "Dolor dental / Muela",
          descripcionBreve:
            "Dolor pulsátil que empeora al masticar o con el frío/calor.",
          triage: [
            {
              pregunta: "¿Hay inflamación en la cara o encía?",
              alertaSi: true,
            },
            { pregunta: "¿Tiene fiebre?", alertaSi: true },
            { pregunta: "¿Dificultad para abrir la boca?", alertaSi: true },
          ],
          clavesAtencion: [
            "Importante: no aplicar aspirinas o geles directamente sobre la encía (pueden causar quemaduras químicas).",
            "El frío local por fuera de la cara puede ayudar a reducir la inflamación inicial.",
            "Recordar que el analgésico solo enmascara el problema; el dentista es quien debe tratar la causa (posible infección).",
          ],
          gruposRecomendados: [
            {
              id: "aine",
              nota: "El Ibuprofeno penetra bien en tejido óseo dental.",
              farmacosPrincipales: ["ibuprofeno", "ketorolac", "diclofenac"],
            },
            {
              id: "opioides_debiles",
              nota: "Para dolores insoportables. Su uso debe ser breve.",
              farmacosPrincipales: ["tramadol_paracetamol"],
            },
          ],
        },
        {
          id: "dolor_muscular",
          nombre: "Dolor muscular / Lumbalgia",
          descripcionBreve:
            "Dolor tras esfuerzo o mala postura. Incluye ciática y contracturas.",
          triage: [
            {
              pregunta: "¿El dolor baja por la pierna o siente hormigueo?",
              alertaSi: true,
            },
            {
              pregunta: "¿Perdió fuerza en los pies o piernas?",
              alertaSi: true,
            },
          ],
          clavesAtencion: [
            "En contracturas, el calor local es mejor que el frío (ayuda a relajar las fibras musculares).",
            "Evitar el reposo absoluto en cama por más de 48 horas; el movimiento suave mejora la recuperación.",
            "Combinar diclofenac en gel (local) con comprimidos mejora el alivio sin aumentar tanto la carga gástrica.",
          ],
          gruposRecomendados: [
            {
              id: "aine",
              nota: "Para aliviar la inflamación local rápida.",
              farmacosPrincipales: [
                "diclofenac_gel",
                "ibuprofeno",
                "diclofenac",
                "aspirina",
              ],
            },
            {
              id: "cox2",
              nota: "Ideal si el dolor es crónico (más de 3 días) para proteger el estómago.",
              farmacosPrincipales: ["etoricoxib", "celecoxib"],
            },
            {
              id: "opioides_debiles",
              nota: "En lumbalgias agudas donde el paciente no puede moverse.",
              farmacosPrincipales: ["tramadol"],
            },
          ],
        },
        {
          id: "dolor_menstrual",
          nombre: "Dolor Menstrual (Dismenorrea)",
          descripcionBreve:
            "Cólicos en el bajo vientre antes o durante el periodo.",
          triage: [
            { pregunta: "¿Es un dolor habitual de su ciclo?" },
            {
              pregunta: "¿El dolor es repentino y extremadamente fuerte?",
              alertaSi: true,
            },
            { pregunta: "¿Tiene fiebre o flujo inusual?", alertaSi: true },
          ],
          clavesAtencion: [
            "Efecto preventivo: se puede iniciar la toma de AINEs 24-48 horas antes del inicio del sangrado.",
            "El calor local (bolsa de agua) es un coadyuvante físico muy efectivo para relajar el útero.",
            "El ácido mefenámico (Ponstan) es específicamente eficaz para reducir el sangrado excesivo asociado al dolor.",
          ],
          gruposRecomendados: [
            {
              id: "aine",
              nota: "Bloquean las prostaglandinas que causan el cólico.",
              farmacosPrincipales: ["naproxeno", "diclofenac", "ibuprofeno"],
            },
            {
              id: "antiespasmodico",
              nota: "Ideal si el dolor es tipo 'retortijón' o espasmo.",
              farmacosPrincipales: ["antiespasmodico_puro"],
            },

            {
              id: "antiespasmodico_analgesico",
              nota: "Ideal si el dolor es tipo 'retortijón' o espasmo.",
              farmacosPrincipales: ["buscapina_fem"],
            },
          ],
        },
        {
          id: "dolor_abdominal",
          nombre: "Dolor de Panza / Cólicos",
          descripcionBreve:
            "Dolor tipo espasmo en la zona abdominal, gases o pesadez.",
          triage: [
            {
              pregunta: "¿El dolor se localiza abajo a la derecha?",
              alertaSi: true,
            },
            { pregunta: "¿Tiene la panza dura ('en tabla')?", alertaSi: true },
            { pregunta: "¿Vómitos constantes o sangre?", alertaSi: true },
          ],
          clavesAtencion: [
            "Precaución: No administrar analgésicos fuertes si el diagnóstico no está claro, pueden tapar una apendicitis.",
            "Si el dolor se acompaña de acidez, evitar los AINEs (Ibu/Diclo) ya que empeorarán la mucosa gástrica.",
            "Mantener dieta blanda e hidratación si hay diarrea asociada.",
          ],
          gruposRecomendados: [
            {
              id: "antiespasmodico",
              nota: "Relajan el músculo del intestino.",
              farmacosPrincipales: ["antiespasmodico_puro"],
            },
            
            {
              id: "antiespasmodico_analgesico",
              nota: "Para dolor fuerte, retortijones intensos o cólicos biliares/renales.",
              farmacosPrincipales: ["antiespasmodico_combinado"
              ],
            },
            {
              id: "alternativa_inyectable",
              nota: "Vía de rescate cuando el dolor impide la ingesta oral o hay vómitos.",
              farmacosPrincipales: ["buscapina_ampolla", "sertal_ampolla"],
            },
          ],
        },
        {
          id: "dolor_garganta",
          nombre: "Dolor de Garganta / Odinofagia",
          descripcionBreve:
            "Irritación, ardor o dolor al tragar. Generalmente viral.",
          triage: [
            {
              pregunta: "¿Tiene puntos blancos (pus) en las amígdalas?",
              alertaSi: true,
            },
            {
              pregunta: "¿Tiene fiebre muy alta (>38.5°C) persistente?",
              alertaSi: true,
            },
            {
              pregunta: "¿Tiene dificultad para respirar o hablar?",
              alertaSi: true,
            },
          ],
          clavesAtencion: [
            "Recordar: el dolor de garganta sin fiebre alta ni placas suele ser viral y no necesita antibiótico.",
            "Los caramelos con anestesia alivian el dolor para poder tragar alimentos, pero no deben masticarse.",
            "Beber líquidos a temperatura ambiente o tibios; evitar irritantes como el alcohol o el picante.",
          ],
          gruposRecomendados: [
            {
              id: "analgesico_simple",
              nota: "El Paracetamol es ideal si solo hay dolor y no hay gran inflamación.",
              farmacosPrincipales: ["paracetamol"],
            },
            {
              id: "aine",
              nota: "El Ibuprofeno o Diclofenac son superiores si la garganta está muy inflamada.",
              farmacosPrincipales: ["ibuprofeno", "flurbiprofeno_comprimidos"],
            },
            {
              id: "accion_local",
              nota: "Caramelos y sprays. Alivio inmediato localizado.",
              farmacosPrincipales: [
                "bencidamina_spray",
                "caramelos_antibioticos",
              ],
            },
          ],
        },
      ],
    },
  ],
};
