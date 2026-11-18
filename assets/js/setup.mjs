/**
 * @license The MIT License (MIT) - https://github.com/subversivo58/subversivo58.github.io/blob/main/LICENSE
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - https://github.com/subversivo58
 * @version 0.1.0 [development stage]
 */
"use strict";

// ---------------------------------------------------------
// MÓDULOS COMPARTILHADOS
// ---------------------------------------------------------

import {
    IlibJS,
    AWCookies,
    AWIndexedDB
} from "/assets/js/modules/lib/Exporter.mjs";

import {
    PathName,
    Redirect,
    AnchorScrool,
    ColorPallet,
    PressHoldCollorCharger,
    SoundPlay
} from "/assets/js/modules/functions/Functions.mjs";

import PolicyHandler from "/assets/js/modules/models/PolicyHandler.mjs";
import LazyLoad from "/assets/js/modules/lib/LazyLoad.mjs";
import Templates from "/assets/js/modules/models/Templates.mjs";
import "/assets/js/modules/vendor/bootstrap-native.mjs";

import {
    DrawerEvents,
    SlideMenus
} from "/assets/js/modules/models/UIHandler.mjs";

import { renderFooterNews } from "/assets/js/modules/models/RecentPosts.mjs";

import indexedDBLogs from "/assets/js/modules/lib/IndexedLogs.mjs";
import LifeCycle from "/assets/js/modules/core/LifeCycle.mjs";
import NotifyJS from "/assets/js/modules/lib/Notifications.mjs";
import Permissions from "/assets/js/modules/lib/Permissions.mjs";

// ---------------------------------------------------------
// CONFIGURAÇÕES
// ---------------------------------------------------------

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

// Sistema de tradução.
const i18n = new IlibJS("i18n");

// ---------------------------------------------------------
// LOG E BANCO DE DADOS
// ---------------------------------------------------------

const SetupLog = new indexedDBLogs("[LAB SETUP]: ");

const ConnectionDB = new AWIndexedDB(
    settings.database.name,
    settings.database.version,
    () => {}
);

let DBMethods = null;

try {
    DBMethods = await ConnectionDB.open(settings.database.indexed);

    SetupLog.setConnection(DBMethods);

    SetupLog.success("IndexedDB connection established", {
        database: settings.database.name,
        version: settings.database.version,
        stores: settings.database.indexed.map(item => item.tbn)
    });
} catch (error) {
    console.error("[LAB SETUP]: IndexedDB initialization failed", error);
}

// Gerenciador da política de armazenamento.
const Activity = new LifeCycle();

const Policy = Activity.create(
    new PolicyHandler("Subversivo58_Policy", SetupLog)
);

Policy.resume();

// ---------------------------------------------------------
// PERMISSÕES E NOTIFICAÇÕES
// ---------------------------------------------------------

const BrowserPermissions = new Permissions();

const Notify = new NotifyJS({
    permissions: BrowserPermissions,
    watchPermissions: true,
    player: SoundPlay,
    translate: key => i18n.getWord(key),

    gui: {
        axis: "rb",
        order: "fl",

        choices: {
            mute: true,
            axis: true,
            order: true,
            dir: true,

            collapse: {
                text: true,
                image: true
            }
        }
    }
});

// ---------------------------------------------------------
// FORMULÁRIOS: FEEDBACK, BUGS E NOTAS
// ---------------------------------------------------------

const FORM_STATUS = {
    "bugs-report-form": {
        ok: "drawer.bug_report.sent",
        fail: "drawer.bug_report.failed"
    },

    "feedback-form": {
        ok: "drawer.feedback.notific.success.message",
        fail: "drawer.feedback.notific.error.message"
    },

    "fats-notes-form": {
        ok: "drawer.notes_form.sent",
        fail: "drawer.notes_form.failed"
    }
};

// ---------------------------------------------------------
// AVALIAÇÃO POR ESTRELAS
// ---------------------------------------------------------

const paintRating = value => {
    document
        .querySelectorAll("#drawer-feedback-block .star-rating")
        .forEach(star => {
            star.textContent =
                Number(star.dataset.starValue) <= value ? "★" : "☆";
        });
};

const setRating = value => {
    const input = document.getElementById("feedback-rating");

    if (!input) return;

    if (value) {
        input.value = String(value);
        input.disabled = false;
    } else {
        input.value = "";
        input.disabled = true;
    }

    paintRating(value || 0);
};

document.addEventListener("click", event => {
    const star = event.target.closest("#drawer-feedback-block .star-rating");

    if (!star) return;

    const value = Number(star.dataset.starValue);
    const input = document.getElementById("feedback-rating");

    const current = input && !input.disabled ? Number(input.value) : 0;

    setRating(current === value ? 0 : value);
});

document.addEventListener("reset", event => {
    if (event.target?.id === "feedback-form") {
        setRating(0);
    }
});

// ---------------------------------------------------------
// ENVIO DOS FORMULÁRIOS
// ---------------------------------------------------------

document.addEventListener("submit", async event => {
    const form = event.target;
    const keys = FORM_STATUS[form.id];

    if (!keys) return;

    event.preventDefault();

    const status = document.getElementById(`${form.id}-status`);

    const showStatus = (key, cls) => {
        if (!status) return;

        status.className = `small mt-2 mb-0 i18n ${cls}`;
        status.setAttribute("data-i18n-html", key);
        status.removeAttribute("translated");
        status.hidden = false;

        i18n.transcript();
    };

    try {
        const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        form.reset();

        if (form.id === "feedback-form") {
            setRating(0);
        }

        showStatus(keys.ok, "text-success");
    } catch (error) {
        console.error("[LAB FORM]:", error);
        showStatus(keys.fail, "text-danger");
    }
});

// ---------------------------------------------------------
// SERVICE WORKER
// ---------------------------------------------------------

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/ServiceWorker.mjs", {
            type: "module"
        })
        .catch(error => {
            console.error(
                "[LAB SETUP]: Service Worker registration failed",
                error
            );
        });
}

// ---------------------------------------------------------
// INICIALIZAÇÃO DO LAB
// ---------------------------------------------------------

const SetupDOMReady = async () => {
    // Lazy-load.
    const lazyLoad = new LazyLoad("undefined");

    // Resolve a rota relativa ao Lab.
    const fullRoute = PathName(true);

    const route =
        fullRoute === "lab"
            ? "index"
            : fullRoute.startsWith("lab/")
              ? fullRoute.slice(4)
              : fullRoute;

    // -----------------------------------------------------
    // IDIOMAS
    // -----------------------------------------------------

    PolicyHandler.supported = settings.source.language;

    document.documentElement.lang = PolicyHandler.language;

    await i18n.get(`/assets/lang/${PolicyHandler.language}.json`, {
        credentials: "include",
        cache: "reload"
    });

    // -----------------------------------------------------
    // TEMPLATES E DIRETIVAS
    // -----------------------------------------------------

    const TemplatesReady = new Templates(
        settings.templates,
        {
            rule: [
                "full_year",
                "source_version_canonical",
                "disable_on_policy"
            ],

            replacement: [
                new Date().getFullYear(),
                settings.source.version.canonical,

                function () {
                    return route === "policy" ? 'disabled="disabled"' : "";
                }
            ]
        },
        i18n
    );

    await TemplatesReady.import;

    // -----------------------------------------------------
    // SELETOR DE IDIOMAS
    // -----------------------------------------------------

    document.addEventListener("click", async event => {
        // Destaca o idioma atual ao abrir o seletor.
        if (event.target.closest("#drawer-language-selector")) {
            const current = PolicyHandler.language;

            document.querySelectorAll(".change-language").forEach(item => {
                item.classList.toggle("border", item.id === current);
                item.classList.toggle("border-info", item.id === current);
            });

            return;
        }

        const option = event.target.closest(".change-language");

        if (!option || !settings.source.language.includes(option.id)) {
            return;
        }

        try {
            await AWCookies.set("i18n", option.id, {
                expire: 365,
                secure: window.location.protocol === "https:"
            });

            window.location.reload();
        } catch (error) {
            console.error(
                "[LAB SETUP]: could not save the language cookie",
                error
            );
        }
    });

    // -----------------------------------------------------
    // PREFERÊNCIAS INDIVIDUAIS
    // -----------------------------------------------------

    const preferenceSwitches = {
        "sets-media-audio": "mediaAudio",
        "sets-media-video": "mediaVideo",
        "sets-geo-stats": "geoStats",
        "sets-effect-audio": "effectAudio",
        "sets-effect-notific": "effectNotific",
        "sets-conn-notific": "connNotific",
        "sets-conn-notific2": "connNotific2"
    };

    const userPreferences = {
        mediaAudio: false,
        mediaVideo: false,
        geoStats: false,
        effectAudio: false,
        effectNotific: false,
        connNotific: false,
        connNotific2: false
    };

    // Recupera as preferências salvas.
    if (DBMethods) {
        try {
            const savedPreferences = await DBMethods.read({
                tbn: "config",
                tbk: "preferences"
            });

            if (
                savedPreferences &&
                typeof savedPreferences === "object" &&
                !Array.isArray(savedPreferences)
            ) {
                Object.keys(userPreferences).forEach(key => {
                    if (typeof savedPreferences[key] === "boolean") {
                        userPreferences[key] = savedPreferences[key];
                    }
                });
            }
        } catch (error) {
            console.error(
                "[LAB SETUP]: Could not load user preferences",
                error
            );
        }
    }

    // Atualiza os indicadores visuais.
    const renderPreferenceSwitch = (id, enabled) => {
        const element = document.getElementById(id);

        if (!element) return;

        const indicator = element.querySelector(".preference-indicator");

        if (!indicator) return;

        indicator.textContent = enabled ? "🟢" : "🔴";
    };

    // Aplica os estados recuperados.
    Object.entries(preferenceSwitches).forEach(([id, key]) => {
        renderPreferenceSwitch(id, userPreferences[key]);
    });

    // Mantém a ordem das gravações no IndexedDB.
    let preferenceSaveQueue = Promise.resolve();

    document.addEventListener("click", event => {
        const element = event.target.closest(
            "#settings-slide .preference-switch"
        );

        if (
            !element ||
            !Object.prototype.hasOwnProperty.call(
                preferenceSwitches,
                element.id
            )
        ) {
            return;
        }

        const key = preferenceSwitches[element.id];

        userPreferences[key] = !userPreferences[key];

        renderPreferenceSwitch(element.id, userPreferences[key]);

        if (!DBMethods) {
            console.error(
                "[LAB SETUP]: IndexedDB connection unavailable; preference not saved."
            );

            return;
        }

        const preferencesToSave = {
            ...userPreferences
        };

        preferenceSaveQueue = preferenceSaveQueue
            .then(() =>
                DBMethods.update([
                    {
                        tbn: "config",
                        tbk: "preferences",
                        tbv: preferencesToSave
                    }
                ])
            )
            .catch(error => {
                console.error(
                    "[LAB SETUP]: Could not save user preferences",
                    error
                );
            });
    });

    // -----------------------------------------------------
    // LIMPEZA DOS DADOS DO NAVEGADOR
    // -----------------------------------------------------

    const bindClearAllButton = button => {
        if (button.dataset.clearBound === "true") return;

        button.dataset.clearBound = "true";

        let completed = false;

        PressHoldCollorCharger(
            button,

            // Início da pressão.
            () => {
                button.classList.add("background-charge-danger");
            },

            // Fim da pressão.
            () => {
                button.classList.remove("background-charge-danger");

                if (!completed) return;

                completed = false;

                Policy.refuseStoragement(true)
                    .then(() => {
                        window.location.reload();
                    })
                    .catch(error => {
                        console.error(
                            "[LAB SETUP]: clear all data failed",
                            error
                        );
                    });
            },

            // Pressão concluída.
            () => {
                completed = true;
            },

            100
        );
    };

    const clearAllButton = document.getElementById("clear-all-data-storage");

    if (clearAllButton) {
        bindClearAllButton(clearAllButton);
    }

    // Observa os templates e modais adicionados dinamicamente.
    const clearButtonObserver = new MutationObserver(() => {
        const button = document.getElementById("clear-all-data-storage");

        if (button) {
            bindClearAllButton(button);
        }
    });

    clearButtonObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // -----------------------------------------------------
    // COMPARTILHAMENTO DA PÁGINA
    // -----------------------------------------------------

    document.addEventListener("click", async event => {
        if (!event.target.closest("#drawer-share")) return;

        const data = {
            title: document.title,
            url: location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(data);
            } else {
                await navigator.clipboard?.writeText(location.href);
            }
        } catch (error) {
            // O usuário pode cancelar o compartilhamento.
        }
    });

    // -----------------------------------------------------
    // LAZY-LOAD E INTERFACE
    // -----------------------------------------------------

    lazyLoad.observe([...document.querySelectorAll("[data-lazy-target]")]);

    // Permissões do navegador e notificações.
    DrawerEvents(BrowserPermissions, Notify);

    // Menus laterais.
    SlideMenus();

    // Paleta de cores.
    ColorPallet("#color-palette-container");

    // -----------------------------------------------------
    // ROTAS DO LAB
    // -----------------------------------------------------

    switch (route) {
        case "index":
            // Inicialização específica da página inicial do Lab.
            break;

        default:
            // Outras páginas do Lab.
            break;
    }

    // -----------------------------------------------------
    // RODAPÉ: POSTAGENS RECENTES
    // -----------------------------------------------------

    renderFooterNews(
        settings,
        document.getElementById("dinamic-footer-news"),
        PolicyHandler.language
    );

    // -----------------------------------------------------
    // AVISO DA POLÍTICA DE ARMAZENAMENTO
    // Mantém o comportamento original do Blog.
    // -----------------------------------------------------

    const DataStoragePolicy = () => {
        AWCookies.get("__DSPolicy__").catch(() => {
            const DSNotify = new NotifyJS({
                permissions: BrowserPermissions,
                watchPermissions: false
            });

            DSNotify.on("click", data => {
                if ("action" in data) {
                    switch (data.action) {
                        case "cookie-agree":
                            Redirect("/policy.html#cookie-agree");
                            break;
                        case "cookie-policy":
                            Redirect("/policy.html#policy-general");
                            break;
                        case "terms-policy":
                            Redirect("/policy.html#policy-terms");
                            break;
                    }
                }
            });

            const NotifyI18nStorage = i18n.dictionary().notify.storage;
            const DSNoticeTag = "ds-policy-notice";

            DSNotify.create({
                title: NotifyI18nStorage.title,
                body: NotifyI18nStorage.body,
                badage: "/assets/media/image/icons/badage-monochrome.webp",
                actions: NotifyI18nStorage.actions,
                tag: DSNoticeTag,
                bootstrap: {
                    pinned: false
                }
            }).show();

            setTimeout(() => {
                const closeButton = document.querySelector(
                    `small[data-target="${DSNoticeTag}"]`
                );

                if (closeButton) closeButton.click();
            }, 15000);
        });
    };

    if (route !== "policy" && route !== "nocookie") {
        DataStoragePolicy();
    }

    // -----------------------------------------------------
    // ROLAGEM SUAVE PARA ÂNCORAS E BOTÃO DE RETORNO AO TOPO
    // Mantém integralmente o comportamento original do Blog.
    // -----------------------------------------------------

    AnchorScrool();

    // -----------------------------------------------------
    // TRADUÇÕES
    // -----------------------------------------------------

    i18n.transcript();
    i18n.observe(document);

    // Libera a página após a inicialização.
    document.documentElement.classList.remove("i18n-loading");
};

// ---------------------------------------------------------
// DOM READY
// ---------------------------------------------------------

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", SetupDOMReady, {
        once: true
    });
} else {
    SetupDOMReady();
}
