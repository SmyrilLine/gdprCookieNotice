/*
    Notice This Script relies heavily on Smyriline's GDPR Cookie Notice Policy.
    Author: Theodor Solbjorg
    Date: 20/01/2023
*/

/*
    // Settings button on the page somewhere
    var globalSettingsButton = document.querySelectorAll('.' + pluginPrefix + '-settings-button');
    if (globalSettingsButton) {
        for (var i = 0; i < globalSettingsButton.length; i++) {
            globalSettingsButton[i].addEventListener('click', function (e) {
                e.preventDefault();
                showModal();
            });
        }
    }
*/

var gdprCookieNotice = {
    namespace: 'gdprcookienotice',
    pluginPrefix: 'gdpr-cookie-notice',
    templates: window['gdpr-cookie-notice-templates'],
    gdprCookies: Cookies.noConflict(),
    modalLoaded: false,
    noticeLoaded: false,
    cookiesAccepted: false,
    xd_cookie: null,
    currentCookieSelection: null,
    acceptedCookies: {},
    config: null,
    acceptCallback: null,
    categories: [],
    Locales: {
        default: {
            description: 'We use cookies to offer you a better browsing experience, personalise content and ads, to provide social media features and to analyse our traffic. Read about how we use cookies and how you can control them by clicking Cookie Settings. You consent to our cookies if you continue to use this website.',
            settings: 'Cookie settings',
            accept: 'Accept cookies',
            statement: 'Our cookie statement',
            save: 'Save settings',
            always_on: 'Always on',
            cookie_essential_title: 'Essential website cookies',
            cookie_essential_desc: 'Necessary cookies help make a website usable by enabling basic functions like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.',
            cookie_extra_title: 'Additional cookies',
            cookie_extra_desc: 'Additional cookies for performance, analytics and marketing.'
        },
        translations: {
            description: 'Vit nýta farspor (cookies). Heldur tú áfram at nýta okkara heimasíðu, skilja vit hetta sum at tú góðtekur brúk av farsporum.',
            settings: 'Stillingar',
            accept: 'Góðkenn',
            statement: 'Okkara farspor frágreiðing',
            save: 'Goym stillingar',
            always_on: 'Altíð á',
            cookie_essential_title: 'Týðandi heimsíðu farspor',
            cookie_essential_desc: 'Neyðugar cookies hjálpa til at gera heimasíðuna nýtiliga við at virkja grundleggjandi funkur, so sum at navigera millum síður og at lata upp fyri atgongd til trygg øki á heimasíðuni. Síðan kann ikki virka á rættan hátt uttan cookies.',
            cookie_extra_title: 'Eyka farspor',
            cookie_extra_desc: 'Eyka farspor til útinningarevni, greinan og marknaðarførðslu.'
        },
    },
    init: function (config, acceptCallback) {
        gdprCookieNotice.config = config;
        gdprCookieNotice.acceptCallback = acceptCallback;

        // Default config options
        if (!gdprCookieNotice.config.locale) gdprCookieNotice.config.locale = 'default';
        if (!gdprCookieNotice.config.timeout) gdprCookieNotice.config.timeout = 500;
        if (!gdprCookieNotice.config.domain) gdprCookieNotice.config.domain = defaultSubdomain(); // 'https://book.smyrilline.fo'
        if (!gdprCookieNotice.config.expiration) gdprCookieNotice.config.expiration = 30;
        if (!gdprCookieNotice.config.implicit) gdprCookieNotice.config.implicit = false;
        if (!gdprCookieNotice.config.categories) {
            gdprCookieNotice.categories = ['extra']; //['performance', 'analytics', 'marketing'],;
        } else {
            gdprCookieNotice.categories = gdprCookieNotice.config.categories;
        }

        // wait for the document to finish loading before we start settting things up..
        document.addEventListener("DOMContentLoaded", () => {
            gdprCookieNotice.xd_cookie = xDomainCookie(gdprCookieNotice.config.domain, 'gdprcookienotice', true, 5000, true, false, 'None');

            gdprCookieNotice.xd_cookie.get(gdprCookieNotice.namespace, function (val) {
                gdprCookieNotice.currentCookieSelection = JSON.parse(val);
                gdprCookieNotice.gdprInit();
            });
        });
    },
    dispatchSuccess: function (details) {
        var cookiesAcceptedEvent = new CustomEvent('gdprCookiesEnabled', { detail: details });
        document.dispatchEvent(cookiesAcceptedEvent);
        window.dataLayer = window.dataLayer || [];
        for(var i = 0; i < gdprCookieNotice.categories.length; i++) {
            if(details[gdprCookieNotice.categories[i]] === true) {
                window.dataLayer.push({
                    event: 'gdprcookienotice_cookieconsent_'  + gdprCookieNotice.categories[i]
                });
            }
        }
        window.dataLayer.push({
            event: 'smyrilline-cookies-accepted'
        });
    },
    gdprInit : function() {
        if (gdprCookieNotice.config.locale === 'fo') {
            gdprCookieNotice.acceptCookies();
            gdprCookieNotice.loadScripts();
        } else {
            // Show cookie bar if needed
            if (!gdprCookieNotice.currentCookieSelection) {
                if (gdprCookieNotice.Locales[gdprCookieNotice.config.locale] === undefined)
                gdprCookieNotice.config.locale = 'en';

                gdprCookieNotice.showNotice();

                // Accept cookies on page scroll
                if (gdprCookieNotice.config.implicit) {
                    gdprCookieNotice.acceptOnScroll();
                }
            } else {
                gdprCookieNotice.deleteCookies(gdprCookieNotice.currentCookieSelection);
                gdprCookieNotice.acceptCookies();
                gdprCookieNotice.loadScripts();
            }
        }
    },
    deleteCookies: function (savedCookies) {
        var notAllEnabled = false;
        for (var i = 0; i < gdprCookieNotice.categories.length; i++) {
            if (gdprCookieNotice.config[gdprCookieNotice.categories[i]] && !savedCookies[gdprCookieNotice.categories[i]]) {
                for (var ii = 0; ii < gdprCookieNotice.config[gdprCookieNotice.categories[i]].length; ii++) {
                    gdprCookieNotice.xd_cookie.set(gdprCookieNotice.config[gdprCookieNotice.categories[i]][ii], "", -1);
                    gdprCookieNotice.gdprCookies.remove(gdprCookieNotice.config[gdprCookieNotice.categories[i]][ii]);
                    notAllEnabled = true;
                }
            }
        }

        // Show the notice if not all categories are enabled
        if (notAllEnabled) {
            gdprCookieNotice.showNotice();
        } else {
            gdprCookieNotice.hideNotice();
        }
    },
    hideNotice: function () {
        //if (noticeLoaded) {
        //    document.getElementById(namespace + '-notice').style.display = 'none';
        //}
        document.documentElement.classList.remove(gdprCookieNotice.pluginPrefix + '-loaded');
    },
    acceptCookies: function (save) {
        var value = {
            date: new Date(),
            necessary: true,
            extra: true
            /*performance: true,
            analytics: true,
            marketing: true*/
        };

        // If request was coming from the modal, check for the settings
        if (save) {
            for (var i = 0; i < gdprCookieNotice.categories.length; i++) {
                value[gdprCookieNotice.categories[i]] = document.getElementById(gdprCookieNotice.pluginPrefix + '-cookie_' + gdprCookieNotice.categories[i]).checked;
            }
        }
        gdprCookieNotice.xd_cookie.set(gdprCookieNotice.namespace, JSON.stringify(value), gdprCookieNotice.config.expiration);
        gdprCookieNotice.deleteCookies(value);

        // Load marketing scripts that only works when cookies are accepted
        gdprCookieNotice.dispatchSuccess(value);
        gdprCookieNotice.acceptedCookies = value;
        gdprCookieNotice.loadScripts();

        gdprCookieNotice.hideModal();

        if (gdprCookieNotice.acceptCallback) {
            gdprCookieNotice.acceptCallback(value);
        }

        gdprCookieNotice.cookiesAccepted = true;
    },
    loadScripts: function(detail) {
        var cTypes = ['extra'];
        cTypes.forEach(function (cType) {
            document.querySelectorAll('script[type="gdpr/' + cType + '"]').forEach(function (item) {
                var scriptSrc = item.getAttribute('src');
                if (scriptSrc) {
                    var scriptTag = document.createElement('script'), // create a script tag
                        firstScriptTag = document.getElementsByTagName('script')[0]; // find the first script tag in the document
                    scriptTag.src = scriptSrc; // set the source of the script to your script
                    firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag); // append the script to the DOM
                }
            });
        });
    },
    buildNotice: function () {
        if (gdprCookieNotice.noticeLoaded) {
            return false;
        }

        var noticeHtml = gdprCookieNotice.localizeTemplate('bar.html');
        document.body.insertAdjacentHTML('beforeend', noticeHtml);

        // Load click functions
        gdprCookieNotice.setNoticeEventListeners();

        // Make sure its only loaded once
        gdprCookieNotice.noticeLoaded = true;
    },
    showNotice: function () {
        gdprCookieNotice.buildNotice();

        // Show the notice with a little timeout
        setTimeout(function () {
            document.documentElement.classList.add(gdprCookieNotice.pluginPrefix + '-loaded');
        }, gdprCookieNotice.config.timeout);
    },
    localizeTemplate: function(template, prefix) {
        var str = gdprCookieNotice.templates[template];
        var data = gdprCookieNotice.Locales[gdprCookieNotice.config.locale];

        if (prefix) {
            prefix = prefix + '_';
        } else {
            prefix = '';
        }

        if (typeof str === 'string' && (data instanceof Object)) {
            for (var key in data) {
                return str.replace(/({([^}]+)})/g, function (i) {
                    var key = i.replace(/{/, '').replace(/}/, '');

                    if (key === 'prefix') {
                        return prefix.slice(0, -1);
                    }

                    if (data[key]) {
                        return data[key];
                    } else if (data[prefix + key]) {
                        return data[prefix + key];
                    } else {
                        return i;
                    }
                });
            }
        } else {
            return false;
        }
    },
    buildModal: function () {
        if (gdprCookieNotice.modalLoaded) {
            return false;
        }

        // Load modal template
        var modalHtml = gdprCookieNotice.localizeTemplate('modal.html');

        // Append modal into body
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Get empty category list
        var categoryList = document.querySelector('.' + gdprCookieNotice.pluginPrefix + '-modal-cookies');

        //Load essential cookies
        categoryList.innerHTML += gdprCookieNotice.localizeTemplate('category.html', 'cookie_essential');
        var input = document.querySelector('.' + gdprCookieNotice.pluginPrefix + '-modal-cookie-input');
        var label = document.querySelector('.' + gdprCookieNotice.pluginPrefix + '-modal-cookie-input-switch');
        label.innerHTML = gdprCookieNotice.Locales[gdprCookieNotice.config.locale]['always_on'];
        label.classList.add(gdprCookieNotice.pluginPrefix + '-modal-cookie-state');
        label.classList.remove(gdprCookieNotice.pluginPrefix + '-modal-cookie-input-switch');
        input.remove();

        // Load other categories if needed
        for(var i = 0; i < gdprCookieNotice.categories.length; i++) {
            categoryList.innerHTML += gdprCookieNotice.localizeTemplate('category.html', 'cookie_' + gdprCookieNotice.categories[i]);
        }
        /*if (config.performance) categoryList.innerHTML += localizeTemplate('category.html', 'cookie_performance');
        if (config.analytics) categoryList.innerHTML += localizeTemplate('category.html', 'cookie_analytics');
        if (config.marketing) categoryList.innerHTML += localizeTemplate('category.html', 'cookie_marketing');*/

        // Load click functions
        gdprCookieNotice.setModalEventListeners();

        // Update checkboxes based on stored info(if any)
        if (gdprCookieNotice.currentCookieSelection) {
            for(var i = 0; i < gdprCookieNotice.categories.length; i++) {
                categoryList.innerHTML += gdprCookieNotice.localizeTemplate('category.html', 'cookie_' + gdprCookieNotice.categories[i]);
                document.getElementById(gdprCookieNotice.pluginPrefix + '-cookie_' + 
                    gdprCookieNotice.categories[i]).checked = gdprCookieNotice.currentCookieSelection[gdprCookieNotice.categories[i]];
            }
            /*document.getElementById(pluginPrefix + '-cookie_performance').checked = currentCookieSelection.performance;
            document.getElementById(pluginPrefix + '-cookie_analytics').checked = currentCookieSelection.analytics;
            document.getElementById(pluginPrefix + '-cookie_marketing').checked = currentCookieSelection.marketing;*/
        }

        // Make sure modal is only loaded once
        gdprCookieNotice.modalLoaded = true;
    },
    showModal: function () {
        gdprCookieNotice.buildModal();
        document.documentElement.classList.add(gdprCookieNotice.pluginPrefix + '-show-modal');
    },
    hideModal: function () {
        document.documentElement.classList.remove(gdprCookieNotice.pluginPrefix + '-show-modal');
    },
    setNoticeEventListeners: function () {
        var settingsButton = document.querySelectorAll('.' + gdprCookieNotice.pluginPrefix + '-nav-item-settings')[0];
        var acceptButton = document.querySelectorAll('.' + gdprCookieNotice.pluginPrefix + '-nav-item-accept')[0];

        settingsButton.addEventListener('click', function (e) {
            e.preventDefault();
            gdprCookieNotice.showModal();
        });

        acceptButton.addEventListener('click', function (e) {
            e.preventDefault();
            gdprCookieNotice.acceptCookies();
        });
    },
    setModalEventListeners: function () {
        var closeButton = document.querySelectorAll('.' + gdprCookieNotice.pluginPrefix + '-modal-close')[0];
        var statementButton = document.querySelectorAll('.' + gdprCookieNotice.pluginPrefix + '-modal-footer-item-statement')[0];
        var categoryTitles = document.querySelectorAll('.' + gdprCookieNotice.pluginPrefix + '-modal-cookie-title');
        var saveButton = document.querySelectorAll('.' + gdprCookieNotice.pluginPrefix + '-modal-footer-item-save')[0];

        closeButton.addEventListener('click', function () {
            gdprCookieNotice.hideModal();
            return false;
        });

        statementButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = gdprCookieNotice.config.statement;
        });

        for (var i = 0; i < categoryTitles.length; i++) {
            categoryTitles[i].addEventListener('click', function () {
                this.parentNode.parentNode.classList.toggle('open');
                return false;
            });
        }

        saveButton.addEventListener('click', function (e) {
            e.preventDefault();
            saveButton.classList.add('saved');
            setTimeout(function () {
                saveButton.classList.remove('saved');
            }, 1000);
            gdprCookieNotice.acceptCookies(true);
        });
    },
    getDocHeight: function() {
        var D = document;
        return Math.max(
            D.body.scrollHeight, D.documentElement.scrollHeight,
            D.body.offsetHeight, D.documentElement.offsetHeight,
            D.body.clientHeight, D.documentElement.clientHeight
        );
    },
    amountScrolled: function() {
        var winheight = window.innerHeight || (document.documentElement || document.body).clientHeight;
        var docheight = gdprCookieNotice.getDocHeight();
        var scrollTop = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
        var trackLength = docheight - winheight;
        var pctScrolled = Math.floor(scrollTop / trackLength * 100); // gets percentage scrolled (ie: 80 or NaN if tracklength == 0)
        if (pctScrolled > 25 && !gdprCookieNotice.cookiesAccepted) {
            gdprCookieNotice.cookiesAccepted = true;
            return true;
        } else {
            return false;
        }
    },
    acceptOnScroll: function () {
        window.addEventListener('scroll', function _listener() {
            if (amountScrolled()) {
                gdprCookieNotice.acceptCookies();
                window.removeEventListener('click', _listener);
            }
        });
    },
    defaultSubdomain: function () {
        var defaultSubSplit = window.location.host.split('.');
        var defaultSubSplitSummed = '.' + defaultSubSplit[defaultSubSplit.length - 2] + '.' + defaultSubSplit[defaultSubSplit.length - 1];
        return defaultSubSplitSummed;
    },
    getConsentGivenFor: function (cookieName) {
        var cookieName = gdprCookieNotice.pluginPrefix + '_' + cookieName;
        var cookieValue = gdprCookieNotice.getCookie(cookieName);
        if (cookieValue === 'true') {
            return true;
        } else {
            return false;
        }
    },
};