/**
 * @license The MIT License (MIT) - https://github.com/subversivo58/subversivo58.github.io/blob/main/LICENSE
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - https://github.com/subversivo58
 * @version 0.1.0 [development stage]
 */
"use strict";

// Módulos compartilhados do repositório principal.
import { IlibJS } from "/assets/js/modules/lib/Exporter.mjs";
import { PathName } from "/assets/js/modules/functions/Functions.mjs";
import PolicyHandler from "/assets/js/modules/models/PolicyHandler.mjs";
import Templates from "/assets/js/modules/models/Templates.mjs";
import "/assets/js/modules/vendor/bootstrap-native.mjs";

import {
    DrawerEvents,
    SlideMenus
} from "/assets/js/modules/models/UIHandler.mjs";
// Carrega as configurações do repositório principal.
const settingsResponse = await fetch(
    new URL("../../../config/settings.json", import.meta.url),
    {
        cache: "no-store"
    }
);

if (!settingsResponse.ok) {
    throw new Error(
        `[LAB SETUP]: Failed to load settings.json (${settingsResponse.status})`
    );
}

const settings = await settingsResponse.json();

// Instância do sistema de tradução.
const i18n = new IlibJS("i18n");

// Inicialização do Lab.
const SetupDOMReady = async () => {
    // Resolve a rota relativa ao Lab, preservando os subdiretórios.
    const fullRoute = PathName(true);

    const route =
        fullRoute === "lab"
            ? "index"
            : fullRoute.startsWith("lab/")
              ? fullRoute.slice(4)
              : fullRoute;

    // Configura os idiomas disponíveis.
    PolicyHandler.supported = settings.source.language;

    // Define o idioma atual.
    document.documentElement.lang = PolicyHandler.language;

    // Carrega o dicionário de tradução.
    await i18n.get(`/assets/lang/${PolicyHandler.language}.json`, {
        credentials: "include",
        cache: "reload"
    });

    // Instancia os templates do Lab.
    const TemplatesReady = new Templates(
        settings.templates,
        {
            rule: [],
            replacement: []
        },
        i18n
    );

    // Importa os templates correspondentes à rota atual.
    await TemplatesReady.import;

    // Rotas do Lab.
    switch (route) {
        case "index":
            // Inicialização específica da página inicial do Lab.
            break;

        default:
            // Outras páginas do Lab.
            break;
    }

    // Aplica as traduções iniciais e observa alterações futuras no DOM.
    i18n.transcript();
    i18n.observe(document);

    // Libera a página somente após a inicialização dos templates e traduções.
    document.documentElement.classList.remove("i18n-loading");
};

// Aguarda o DOM antes de inicializar a aplicação.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", SetupDOMReady, {
        once: true
    });
} else {
    SetupDOMReady();
}
