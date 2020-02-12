/*global jQuery*/
/**
 * QGCIO
 * Global JS

 *
 * version: 1.0
 * author:  Squiz Australia
 * change log:
 *     dcousins@squiz.net - First revision
 */

/*
 * Table of Contents
 *
 * - Global
 *
 * qgcio namespace
 * qgcio.vars
 * qgcio.core
 * qgcio.user
 * qgcio.data
 * qgcio.ajax
 * qgcio.utils
 * - Modules
 */
'use strict';
/*
--------------------
Global
--------------------
*/

var qgcio = function () {
    var vars = {
        'screensize': 1 // 1 = mobile | 2 = tablet | 3 = desktop
    };
    var fn = {};
    /**
     *
     * Core - Functions
     *
     * - core.init
     */
    var core = {
        'init': function init() {
            viewportCheck();
            $('body').on('click', '.active_toggler', qgcio.utils.toggleActiveClass);
            window.addEventListener('resize', viewportCheck);

            qgcio.core.asideInit();

            qgcio.utils.matrixForms();

            $('.main__content table').each(function () {
                $(this).wrap('<div class="table-responsive"></div>');
            });

            $(document).ready(function () {
                if ($('.qgcio-quicklinks__link-share').length > 0) {
                    yam.platform.yammerShare();
                }
            });
        },
        'asideInit': function asideInit() {
            // hide by default for mobile
            qgcio.core.hideAside();
            // set the aside height ()for display purposes...
            qgcio.core.asideHeightReset();
            // insert aside toggler buttons
            var asideToggler = '<a href="#" class="aside__toggler"><span class="sr-only">Show/Hide side navigation</span></a>';
            $(asideToggler).prependTo('.main__aside');
            $(asideToggler).insertAfter('.main__aside');
            $('body').on('click', '.aside__toggler', qgcio.core.toggleAside);
            $('body').on('click', '.aside__section__toggler', qgcio.core.toggleAsideAccordion);

            // hide aside if no aside__section is found
            var asideSection = $('.main__aside .aside__section').length;
            switch (asideSection) {
                case 0:
                    $('.main__aside').hide();
                    $('.aside__toggler').hide();
                    $('.main__content').removeClass('col-sm-9');
                    break;
                case 1:
                    // only 1 item, most likely the main menu. 
                    //At this stage, do nothing...
                    break;
                default:
                    // assuming there are multiple asideSection's
                    // initialise aside accordion
                    qgcio.core.asideMultipleAsidesAccordion();
            }
        },
        'asideMultipleAsidesAccordion': function asideMultipleAsidesAccordion() {
            var item = $('.aside__section');

            item.each(function (i) {
                var $this = $(this);
                var title = $this.find('.aside__section-title');
                var activeClass = '';
                var html = $this.html();
                var newHtml = '<div class="aside__section-accordion-wrapper">' + html + '</div>';
                $this.html(newHtml);
                $this.addClass('aside__section-accordion');
                title.addClass('aside__accordion-link');

                $('<a href="#" class="aside__section__toggler"><i class="fa fa-angle-down" aria-hidden="true"></i>' + '<span class="visuallyhidden">Expand navigation</span></a>').appendTo(title);
                title.insertBefore($this.find('.aside__section-accordion-wrapper'));
                $this.find('.aside__section-accordion-wrapper .aside__section-title').hide();
            });
        },
        'toggleAsideAccordion': function toggleAsideAccordion(e) {
            e.preventDefault();
            $(this).parents('.aside__section').toggleClass('active');
            $(this).find('i').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
        },
        'toggleAside': function toggleAside(e) {
            $('.main__aside').toggleClass('main__aside-hide');
            $('.main__aside').siblings('div').toggleClass('col-sm-9');
            if ($(this).parents('.main__aside').length == 0) {
                // anchor up to top of nav!
                $('html, body').animate({
                    scrollTop: $(".main__aside").offset().top
                }, 300);
            }
            return false;
        },
        'showAside': function showAside() {
            $('.main__aside').removeClass('main__aside-hide');
            $('.main__aside').siblings('div').addClass('col-sm-9');
        },
        'hideAside': function hideAside() {
            $('.main__aside').addClass('main__aside-hide');
            $('.main__aside').siblings('div').removeClass('col-sm-9');
        },
        'asideHeightReset': function asideHeightReset() {
            if ($('.main__aside').is(':visible')) {

                $('.main__content, .main__aside').css('min-height', 'initial');
                $('.main__aside').css('height', 'initial');
                var asideHeight = $('.main__aside').outerHeight();

                var contentHeight = $('.main__content').outerHeight();

                if (asideHeight <= contentHeight) {
                    $('.main__aside').css({
                        'min-height': contentHeight,
                        'height': "100%"
                    });
                } else {
                    $('.main__content').css('min-height', asideHeight);
                }
            }
        },
        'asideDisplayChecker': function asideDisplayChecker() {
            // if no aside elements exist - hide all realted aside items.
            if ($('.main__aside .aside__section').length == 0) {
                $('.main__aside').hide();
                $('.aside__toggler').hide();
                $('.main__content').removeClass('col-sm-9');
            }
        }
    }; /* end  const core */

    /**
     *
     * User functions
     *
     * - ...
     */
    var user = {
        'prefs': {
            'name': '',
            'email': ''
        }
    }; /* end  const user */
    /**
     *
     * Data storage area
     *
     */
    var data = {}; /* end  const user */
    /**
     *
     * Ajax call - returns a promise
     * params = {'url' : 'https://www.url.com.au/pathtoformaction', 'data' : 'serialized Data string' };
     *
     */
    var ajax = function ajax(params) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                switch (this.status) {
                    case 200:
                        params.callback(this.responseText);
                        break;
                    default:
                        break;
                }
            }
        };
        xhttp.open("GET", params.url, true);
        xhttp.send();
    };
    /**
     *
     * Core - Utility functions
     *
     * - utils.viewportChange()
     * - utils.setCookie(cname, cvalue, exdays)
     * - utils.getCookie(cname)
     * - utils.setLocalStorage()
     * - utils.getLocalStorage()
     */
    var utils = {
        // has the viewport changed?
        'viewportChange': function viewportChange() {
            qgcio.utils.mobileActions();
            qgcio.utils.desktopActions();
        },
        'mobileActions': function mobileActions() {
            if (qgcio.vars.screensize == 1 || qgcio.vars.screensize == 2) {
                // if aside is not hidden, hide it initially          
                qgcio.core.hideAside();
                qgcio.navigation.hideMobileNav();
                if ($('.qgcio-info-pane').length > 0) {
                    qgcio.fn.resetHomeHeights();
                }
            }
        },
        'desktopActions': function desktopActions() {
            if (qgcio.vars.screensize == 3) {
                qgcio.core.showAside();
                //qgcio.navigation.init();
                qgcio.utils.removeFullScreenMode();
                if ($('.qgcio-info-pane').length > 0) {
                    qgcio.fn.initHomeEqualHeights();
                }
            }
        },
        // 
        'toggleActiveClass': function toggleActiveClass(e) {
            e.preventDefault();
            var activeTarget = $(this).data('target');
            $(this).toggleClass('active');
            $(activeTarget).toggleClass('active');
        },
        'toggleFullScreenMode': function toggleFullScreenMode() {
            if (qgcio.vars.screensize < 3) {
                $('body').addClass('full-screen-mode');
            }
        },
        'removeFullScreenMode': function removeFullScreenMode() {
            $('body').removeClass('full-screen-mode');
        },
        /**
         * Find all generic MAtrix forms, and adds a sq-form classname for various styling/functions
         */
        'matrixForms': function matrixForms() {
            $('form[id*="main_form"]').addClass('sq-form');
            $('form[id*="page_account_manager_524"]').addClass('sq-form');
            $('form[id*="search_page"]').addClass('sq-form');
            $('form[id*="form_email"]').addClass('sq-form');
            $('form[id*="login_form_login_prompt"]').addClass('sq-form');
            // find all submit buttons and wrap them in a shell to allow styling to match design
            $('form[id*="login_form_login_prompt"],form[id*="search_page"], form[id*="form_email"], form[id*="main_form"]').find('[type="submit"], [type="button"]').each(function () {
                $(this).wrap('<div class="button button-yellow input-button"></div>');
            });

            $('.sq-form').find('[type="text"], [type="password"], textarea').each(function (ind, elem) {
                var id = $(this).attr('id');
                $(this).addClass('form__label-toggle-input');
                $('label[for="' + id + '"]').addClass('form__label-toggle');
                qgcio.utils.matrixFormsLabelToggle(this);
            });

            if ($('#login_form_login_prompt').length > 0) {
                // check if there are any fields that already have values when loaded
                $('#login_form_login_prompt').find('[type="text"], [type="password"]').each(function () {
                    var id = $(this).attr('id');

                    if ($(this).val().length > 0 && !$(this).hasClass('form__label-focused')) {
                        //console.log(id);
                        //$('label[for="' + id +'"]').toggleClass('form__label-focused');
                    }
                });
            }

            $('body').on('blur', '.form__label-toggle-input', qgcio.utils.matrixFormsLabelToggle);
            $('body').on('focus', '.form__label-toggle-input', qgcio.utils.matrixFormsLabelToggleFocus);

            if ($('form[id*="main_form"]').length > 0) {
                // check if there are any fields that already have values when loaded
                $('.sq-form').find('[type="text"], [type="password"], textarea').each(function () {
                    var id = $(this).attr('id');
                    if ($(this).val().length > 0) {
                        $('label[for="' + id + '"]').addClass('form__label-focused');
                    }
                });

                // insert another label for the password field
                $('.sq-form-question-password').find('input').each(function () {

                    var id = $(this).attr('id');

                    if (id.indexOf('two') !== -1) {
                        $('<label for="' + id + '" class="form__label-toggle">Confirm Password</label>').insertBefore($(this));
                    }
                });
            }
        },
        'matrixFormsLabelToggle': function matrixFormsLabelToggle(e) {
            var id = '';
            var fieldValue = '';
            if (typeof e.currentTarget != 'undefined') {
                id = e.currentTarget.id;
                fieldValue = e.currentTarget.value;
            } else {
                id = e.id;
                fieldValue = e.value;
            }
            if (fieldValue.length == 0) {
                $('label[for="' + id + '"]').removeClass('form__label-focused');
            } else {
                $('label[for="' + id + '"]').addClass('form__label-focused');
            }
        },
        'matrixFormsLabelToggleFocus': function matrixFormsLabelToggleFocus(e) {
            var id = e.currentTarget.id;
            var fieldValue = e.currentTarget.value;
            $('label[for="' + id + '"]').addClass('form__label-focused');
        },

        /**
         * Takes serialized form data and applies the values back to the form fields
         * @param - serializedFormData eg: jQuery('form').serialize();
         */
        'prePopulateForm': function prePopulateForm(serializedFormData) {
            var decodedFormData = decodeURIComponent(serializedFormData);
            $.each(decodedFormData.split('&'), function (index, elem) {
                var vals = elem.split('=');
                $("[name='" + vals[0] + "']").val(decodeURIComponent(vals[1].replace(/\+/g, ' ')));
            });
        },
        /**
         * Cookie functions - get|set|delete
         * as per https://www.w3schools.com/js/js_cookies.asp
         * @param - (str) 'cookie name', (str) 'cookie value', (int) expiry in days [optional]
         */
        'getCookie': function getCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        },
        'setCookie': function setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        },
        'deleteCookie': function deleteCookie(name) {
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        },
        /**
         * Local Storage object
         */
        'getLocalStorage': function getLocalStorage(name) {
            if (typeof Storage !== "undefined") {
                return localStorage.getItem(name);
            }
            return "";
        },
        'setLocalStorage': function setLocalStorage(name, val) {
            var storeValue = val;
            if (typeof storeValue != 'string') {
                storeValue = JSON.stringify(val);
            }
            if (typeof Storage !== "undefined") {
                localStorage.setItem(name, storeValue);
            }
        },
        'deleteLocalStorage': function deleteLocalStorage(name) {
            localStorage.removeItem(name);
        },
        /**
         * Session Storage objects - get|set|delete
         */
        'getSessionStorage': function getSessionStorage(name) {
            if (typeof Storage !== "undefined") {
                return sessionStorage.getItem(name);
            }
            return "";
        },
        'setSessionStorage': function setSessionStorage(name, val) {
            var storeValue = val;
            if (typeof storeValue != 'string') {
                storeValue = JSON.stringify(val);
            }
            if (typeof Storage !== "undefined") {
                sessionStorage.setItem(name, storeValue);
            }
        },
        'deleteSessionStorage': function deleteSessionStorage(name) {
            sessionStorage.removeItem(name);
        },
        /*
        * Debounce function
        * https://davidwalsh.name/javascript-debounce-function
        */
        'debounce': function debounce(func, wait, immediate) {
            var timeout;
            return function () {
                var context = this,
                    args = arguments;
                var later = function later() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        }
    }; /* end  const utils */
    var viewportCheck = debounce(function () {
        // the body tag index value reporesents the screen sizes
        var elementIndex = parseInt($('body').css('z-index'));
        if (elementIndex != qgcio.vars.screensize) {
            // viewport has changed
            qgcio.vars.screensize = elementIndex;
            qgcio.utils.viewportChange();
        }
        //setTimeout(function(){ 
        qgcio.core.asideHeightReset();
        //}, 100);
    }, 3);

    return {
        vars: vars,
        core: core,
        user: user,
        data: data,
        ajax: ajax,
        utils: utils,
        viewportCheck: viewportCheck,
        fn: fn
    };
}(); /* end qgcio obj */
qgcio.core.init();

qgcio.keyCodeMap = {
    48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9", 59: ";",
    65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g", 72: "h", 73: "i", 74: "j", 75: "k", 76: "l",
    77: "m", 78: "n", 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t", 85: "u", 86: "v", 87: "w", 88: "x", 89: "y", 90: "z",
    96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7", 104: "8", 105: "9"
};

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        var later = function later() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

/*
--------------------
Modules
--------------------
*/

(function ($) {
    // Data table with only sorting enabled
    $('table.table-sortable').dataTable({
        'bPaginate': false,
        'bLengthChange': false,
        'bFilter': false,
        'bSort': true,
        'bInfo': false,
        'bAutoWidth': false
    });
})(jQuery);

(function ($) {
    $('.popup__image').magnificPopup({
        delegate: 'a',
        type: 'image',

        image: {
            titleSrc: 'title'
        }
    });

    $('.popup__gallery').magnificPopup({
        delegate: 'a',
        type: 'image',

        gallery: {
            enabled: true
        },

        image: {
            titleSrc: 'title'
        }
    });
})(jQuery);

(function ($) {
    var $slideshow = $('.slick-slideshow');

    $slideshow.slick({
        dots: true,
        arrows: true,
        speed: 400,
        slide: '.slick-slideshow__slide',
        slidesToScroll: 3,
        slidesToShow: 3
    });
})(jQuery);

qgcio.accordionAside = {
    'init': function init() {
        var accordion = $('.aside__accordion');

        qgcio.accordionAside.initAsideNav();

        $('body').on('click', '.aside__accordion__toggler', qgcio.accordionAside.toggleMenuItem);
    },
    'toggleMenuItem': function toggleMenuItem(e) {
        e.preventDefault();
        $(this).closest('.aside__accordion').toggleClass('active');
        $(this).closest('.aside__accordion').find('> ul').toggleClass('active');
        $(this).find('i').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
    },
    'initAsideNav': function initAsideNav() {
        var item = $('.aside__accordion');

        item.each(function () {
            var $this = $(this);
            $this.find('h3').each(function () {
                var thisH3 = $(this);
                thisH3.addClass('aside__accordion-link');
                $('<a href="#" class="aside__accordion__toggler"><i class="fa fa-angle-down" aria-hidden="true"></i>' + '<span class="visuallyhidden">Expand navigation</span></a>').appendTo(thisH3);
            });
        });
    }
};

qgcio.accordionAside.init();
qgcio.navigationAside = {
    'init': function init() {
        // initialise the nav ccordion structure
        qgcio.navigationAside.initAsideNav();

        $('body').on('click', '.aside__navigation__toggler', qgcio.navigationAside.toggleMenuItem);
        $('body').on('click', '.aside__anchor-menu-link', qgcio.navigationAside.asideAnchorLinkActions);
    },
    'toggleMenuItem': function toggleMenuItem(e) {
        e.preventDefault();
        $(this).parent('li').toggleClass('active');
        $(this).parent('li').find('> ul').toggleClass('active');
        $(this).find('i').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
        $(this).parent('li').parent('li').find('> ul').toggleClass('active');
        $(this).parent('li').find('> ul').find('i').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
    },
    'initAsideNav': function initAsideNav() {
        var item = $('.aside__navigation__list');

        item.each(function () {
            var $this = $(this);
            $this.find('ul').each(function () {
                var thisUL = $(this);
                thisUL.parent().addClass('navigation_has-subs');
                $('<a href="#" class="aside__navigation__toggler"><i class="fa fa-angle-down" aria-hidden="true"></i>' + '<span class="visuallyhidden">Expand navigation</span></a>').appendTo(thisUL.parent());
            });
        });
    },
    'initAsideAnchorNav': function initAsideAnchorNav(item) {
        var nav = $(item);
        if (typeof nav != "undefined") {
            nav.find('a:not(".aside__navigation__toggler")').each(function () {
                $(this).addClass('aside__anchor-menu-link');
            });
        }
    },
    'asideAnchorLinkActions': function asideAnchorLinkActions(e) {
        if (qgcio.vars.screensize < 3) {
            qgcio.core.hideAside();
        }
    }
};

qgcio.navigationAside.init();

qgcio.infoPane = {
    'init': function init() {
        var infoPane = $('.qgcio-info-pane');
        if (infoPane.find('.qgcio-info-panel').length == 1) {
            infoPane.find('.qgcio-info-panel').css('min-height', 'initial');
            infoPane.find('.qgcio-info-panel').addClass('qgcio-info-panel-solo');
        }
    }
};

qgcio.infoPane.init();

qgcio.events = {};
qgcio.events['selectors'] = {
    'calendar': $('#calendar'),
    'calendarID': 'calendar'
};
qgcio.events['vars'] = {
    'data': null,
    'calendar': null,
    'event_source': qgcio.events['selectors']['calendar'].data('source'),
    'event_type': '',
    'search_interface_loaded': false,
    'start_date': '',
    'end_date': '',
    'defaultView': 'dayGridMonth',
    //'defaultView': 'listMonth',
    'pagination_num_ranks': 10,
    'pagination_num_ranks_base': 10,
    'previous_result_count': 0,
    'viewport_setting': qgcio.vars.screensize,
    'user_type': 'public'
};
qgcio.events['fn'] = {
    'toggle_list_view': function toggle_list_view(e) {
        e.preventDefault();
        qgcio.events['vars']['pagination_num_ranks'] = qgcio.events['vars']['pagination_num_ranks_base'];
        qgcio.events['vars']['calendar'].changeView('listMonth');
        $('.events_toggle-options .active').removeClass('active');
        $(this).addClass('active');
        $('.fc-header-toolbar .fc-left').show();
        $('.fc-header-toolbar .fc-right').show();
    },
    'toggle_calendar_view': function toggle_calendar_view(e) {
        e.preventDefault();
        qgcio.events['vars']['pagination_num_ranks'] = qgcio.events['vars']['pagination_num_ranks_base'];
        qgcio.events['vars']['calendar'].changeView('dayGridMonth');
        $('.events_toggle-options .active').removeClass('active');
        $(this).addClass('active');
        $('.fc-header-toolbar .fc-left').show();
        $('.fc-header-toolbar .fc-right').show();
    },
    'filter_event_type': function filter_event_type(e) {
        e.preventDefault();
        var type = $(this).data('type');
        if (typeof type != 'undefined') {
            qgcio.events['vars']['event_type'] = type;
        }
        $('.events_display-options a').removeClass('active');
        $(this).addClass('active');
        qgcio.events['vars']['calendar'].refetchEvents();
    },
    // when search form is submitted
    'search_events': function search_events(e) {
        e.preventDefault();
        // get the date values
        qgcio.events['vars']['pagination_num_ranks'] = qgcio.events['vars']['pagination_num_ranks_base'];
        var start_date = $('#events_search-start-date').val(),
            end_date = $('#events_search-end-date').val();
        var start_date_formatted = '',
            end_date_formatted = '';
        // value must be DD/MM/YYYY - which is 10 characters
        if (start_date.length == 10) {
            var start_date_arr = start_date.split('/');
            // rework date format to be in YYYY-MM-DD
            start_date_formatted = start_date_arr[2] + '-' + start_date_arr[1] + '-' + start_date_arr[0];
        }
        // value must be DD/MM/YYYY - which is 10 characters
        if (end_date.length == 10) {
            var end_date_arr = end_date.split('/');
            // rework date format to be in YYYY-MM-DD
            end_date_formatted = end_date_arr[2] + '-' + end_date_arr[1] + '-' + end_date_arr[0];
        }
        qgcio.events['vars']['event_type'] = $('#events_search-event-types').val();

        var today = new Date();
        var day = ('0' + today.getDate()).slice(-2);
        var month = ('0' + (today.getMonth() + 1)).slice(-2);
        var year = today.getFullYear().toString();
        // if start and end dates are empty, set default filtering to be from today, til end of the year
        if (start_date_formatted == '' && end_date_formatted == '') {
            start_date_formatted = year + '-' + month + '-' + day;
            end_date_formatted = year + '-' + '12' + '-' + '31';
        } else {
            //if start date is empty, but end date is not, reset the date so start date takes the 'end date' value
            // and the end date is changed to the day after
            if (start_date_formatted == '' && end_date_formatted != '') {
                start_date_formatted = end_date_formatted;
                var next_day = getNextDay(end_date_formatted);
                end_date_formatted = next_day;
            }
            //if end date is empty, but start date is not, set the end date to the day after start date
            if (end_date_formatted == '' && start_date_formatted != '') {
                var next_day = getNextDay(start_date_formatted);
                end_date_formatted = next_day;
            }
        }
        // if the dates dont change, we need to forcefully refetch the events.
        // this scenario is for when a 'Event types' option is chosen.
        if (start_date_formatted == qgcio.events['vars'].start_date && end_date_formatted == qgcio.events['vars'].end_date) {
            qgcio.events['vars']['calendar'].refetchEvents();
        } else {
            // dates have changed, so store the values
            qgcio.events['vars'].start_date = start_date_formatted;
            qgcio.events['vars'].end_date = end_date_formatted;
        }

        // initial load of search will be ok
        if (!qgcio.events['vars'].search_interface_loaded) {
            qgcio.events['vars']['calendar'].changeView('searchList', {
                start: start_date_formatted,
                end: end_date_formatted
            });
        } else {
            // but subsequent changes need to be handled differently
            qgcio.events['vars']['calendar'].option('visibleRange', {
                start: start_date_formatted,
                end: end_date_formatted
            });
        }

        $('.load-more-events').show();
        $('.fc-header-toolbar .fc-left').hide();
        $('.fc-header-toolbar .fc-right').hide();

        // return a 'next day' date string in YYYY-MM-DD format
        function getNextDay(date) {
            var next_day = new Date(date);
            next_day.setDate(next_day.getDate() + 1);
            var next_day_day = ('0' + next_day.getDate()).slice(-2);
            var next_day_month = ('0' + (next_day.getMonth() + 1)).slice(-2);
            var next_day_year = next_day.getFullYear().toString();

            return next_day_year + '-' + next_day_month + '-' + next_day_day;
        };
    },

    'clear_date_field': function clear_date_field(e) {
        $(this).val('');
    },
    /*
     *
     * Auto format date field to include '/' between date values entered.
     * 
     */
    'date_formatter': function date_formatter(id) {

        var date = document.getElementById(id);

        function checkValue(str, max) {
            if (str.charAt(0) !== '0' || str == '00') {
                var num = parseInt(str);
                if (isNaN(num) || num <= 0 || num > max) num = 1;
                str = num > parseInt(max.toString().charAt(0)) && num.toString().length == 1 ? '0' + num : num.toString();
            };
            return str;
        };

        date.addEventListener('input', function (e) {
            this.type = 'text';
            var input = this.value;
            if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3);
            var values = input.split('/').map(function (v) {
                return v.replace(/\D/g, '');
            });
            if (values[0]) values[0] = checkValue(values[0], 31);
            if (values[1]) values[1] = checkValue(values[1], 12);
            var output = values.map(function (v, i) {
                return v.length == 2 && i < 2 ? v + '/' : v;
            });
            this.value = output.join('').substr(0, 14);
        });

        date.addEventListener('blur', function (e) {
            this.type = 'text';
            var input = this.value;
            var values = input.split('/').map(function (v, i) {
                return v.replace(/\D/g, '');
            });
            var output = '';

            if (values.length == 3) {
                var year = values[2].length !== 4 ? parseInt(values[2]) + 2000 : parseInt(values[2]);
                var month = parseInt(values[1]) - 1;
                var day = parseInt(values[0]);
                var d = new Date(year, month, day);
                if (!isNaN(d)) {
                    var dates = [d.getDate(), d.getMonth() + 1, d.getFullYear()];
                    output = dates.map(function (v) {
                        v = v.toString();
                        return v.length == 1 ? '0' + v : v;
                    }).join('/');
                };
            };
            this.value = output;
        });
    },
    'generate_event_element': function generate_event_element(event) {
        var wrapper = document.createElement('div');
        var event_location = '<span class="event_asset-location">' + event.extendedProps.location + '</span>';
        if (typeof event.extendedProps.location == 'undefined') {
            event_location = '';
        }

        var event_description = '<p class="event_asset-description">' + event.extendedProps.description + '</p>';
        if (typeof event.extendedProps.description == 'undefined') {
            event_description = '';
        }
        var event_short_description = '<p class="event_asset-short-description">' + event.extendedProps.shortDescription + '</p>';
        if (typeof event.extendedProps.shortDescription == 'undefined') {
            event_short_description = '';
        }

        var event_dom = '<div class="event_asset event_asset-calendar-item ' + event.extendedProps.eventType + ' ' + event.extendedProps.eventAccess + '">' + '<a href="#" class="event_asset-summary">' + '<span class="event_asset-title">' + event.title + '</span>' + '<span class="event_asset-time">' + event.extendedProps.timeFriendly + '</span>' + '</a>' + '<div class="event_asset-popup" style="display:none;">' + '<a href="#" class="event_asset-popup-close">' + '<span class="visuallyhidden">Close popup</span>' + '</a>' + '<h2 class="event_asset-title">' + event.title + '</h2>' + '<span class="event_asset-time">' + event.extendedProps.timeFriendly + '</span>' + event_location + event_short_description + '<a href="' + event.extendedProps.url + '" class="event_asset-link" target="_blank">' + 'Details' + '</a>' + '</div>' + '</div>';

        wrapper.innerHTML = event_dom;

        return wrapper;
    },
    'generate_event_element_as_list': function generate_event_element_as_list(event) {
        var wrapper = document.createElement('tr');
        var event_location = '<span class="event_asset-location">' + event.extendedProps.location + '</span>';
        if (typeof event.extendedProps.location == 'undefined') {
            event_location = '';
        }
        var event_type = event.extendedProps.eventType;
        var event_type_friendly;
        if (event_type == 'event') {
            event_type_friendly = 'Public event';
        }
        if (event_type == 'key_date') {
            event_type_friendly = 'Reporting due date';
        }

        var event_description = '<p class="event_asset-description">' + event.extendedProps.description + '</p>';
        if (typeof event.extendedProps.description == 'undefined') {
            event_description = '';
        }
        var event_short_description = '<p class="event_asset-short-description">' + event.extendedProps.shortDescription + '</p>';
        if (typeof event.extendedProps.shortDescription == 'undefined') {
            event_short_description = '';
        }
        var date_friendly = '<strong>' + event.extendedProps.dateFriendly + '</strong> ';
        if (event.extendedProps.multiDateEvent == 'false') {
            date_friendly = '';
        }
        var event_dom = '<td colspan="3"><div class="event_asset event_asset-list-item ' + event.extendedProps.eventType + ' ' + event.extendedProps.eventAccess + '">' + '<div class="event_asset-summary">' + '<div class="event_asset-date">' + '<span class="event_asset-date-day">' + '</span> ' + '<span class="event_asset-date-month">' + '</span>' + '</div>' + '<h2 class="event_asset-title">' + event.title + '</h2>' + '<span class="event_asset-type">' + event_type_friendly + '</span>' + '</div>' + '<div class="event_asset-details">' + '<span class="event_asset-time">' + date_friendly + event.extendedProps.timeFriendly + '</span>' + event_location + event_short_description + '<a href="' + event.extendedProps.url + '" class="event_asset-link" target="_blank">' + 'Details' + '</a>' + '</div>' + '</div></td>';

        wrapper.innerHTML = event_dom;

        return wrapper;
    },
    'show_event_popup': function show_event_popup() {
        $('.event_asset-popup.active').parents('.fc-row').css('z-index', '1');
        $('.event_asset-popup.active').removeClass('active').hide();
        $(this).parents('.fc-row').css('z-index', '2');
        $(this).siblings('.event_asset-popup').addClass('active').show();

        return false;
    },
    'close_event_popup': function close_event_popup() {
        $('.event_asset-popup.active').parents('.fc-row').css('z-index', '1');
        $('.event_asset-popup.active').removeClass('active').hide();
        return false;
    },
    'show_more_events': function show_more_events(e) {
        e.preventDefault();
        var increment = qgcio.events['vars']['pagination_num_ranks_base'];
        qgcio.events['vars']['pagination_num_ranks'] = qgcio.events['vars']['pagination_num_ranks'] + increment;
        qgcio.events['vars']['calendar'].refetchEvents();
    },
    'compose_data': function compose_data(start, end) {
        // a function that returns an object
        var view_info = {};
        if (qgcio.events['vars']['calendar'] == null) {
            view_info.type = qgcio.events['vars']['event_type'];
        } else {
            view_info = qgcio.events['vars']['calendar'].view;
        }
        var return_data = {
            type: qgcio.events['vars']['event_type'],
            num_ranks: 1000,
            start: start.getTime(),
            end: end.getTime()
        };
        if (view_info.type == 'searchList') {
            return_data.num_ranks = qgcio.events['vars']['pagination_num_ranks'];
        }
        return return_data;
    },
    'toggle_subscribe_popup': function toggle_subscribe_popup() {
        var parent = $(this).parents('.subscribe-wrapper');
        if (parent.hasClass('active')) {
            parent.removeClass('active');
        } else {
            parent.addClass('active');
        }
        return false;
    }
};

qgcio.events['init'] = function () {

    //console.log(qgcio.vars.screensize);
    if (qgcio.vars.screensize < 3) {
        qgcio.events['vars']['defaultView'] = 'listMonth';
        $('.events_toggle-list').addClass('active');
        //$('.events_toggle-calendar').parent().hide();
    } else {
        $('.events_toggle-calendar').addClass('active');
    }
    var calendarID = document.getElementById(qgcio.events['selectors']['calendarID']);
    qgcio.events['vars']['calendar'] = new FullCalendar.Calendar(calendarID, {
        plugins: ['moment', 'list', 'dayGrid', 'rrule'],
        defaultView: qgcio.events['vars']['defaultView'],
        height: 'auto',
        contentHeight: 'auto',
        locale: 'au',
        timeFormat: 'hh:mm a',
        listDayAltFormat: false,
        listDayFormat: { // will produce something like "Tuesday, September 18, 2018"
            month: 'long',
            year: 'numeric',
            day: 'numeric',
            weekday: 'long'
        },
        //titleFormat: 
        views: {
            searchList: {
                type: 'list'
            }
        },
        header: {
            left: 'prev',
            center: 'title',
            right: 'next'
        },
        //eventRender: function(event, element) {
        eventRender: function eventRender(info) {
            var view_info = qgcio.events['vars']['calendar'].view;
            var event_element;
            if (view_info.type == 'dayGridMonth') {
                event_element = qgcio.events['fn']['generate_event_element'](info.event);
            } else {
                event_element = qgcio.events['fn']['generate_event_element_as_list'](info.event);
            }

            return event_element;
        },
        viewSkeletonRender: function viewSkeletonRender(info) {
            var view_info = qgcio.events['vars']['calendar'].view;
            if (view_info.type == 'searchList') {
                qgcio.events['vars'].search_interface_loaded = true;
            } else {
                qgcio.events['vars'].search_interface_loaded = false;
            }

            // modify the title to allow design to match
            var title = $('#calendar .fc-header-toolbar h2');
            var title_text = title.text();
            var title_split = title_text.split(' ');
            var new_title = title_text;
            if (title_split.length > 1) {
                if (title_split.length == 2) {
                    new_title = title_split[0] + ' <span class="fc-title-year">' + title_split[1] + '</span>';
                } else {
                    new_title = '';
                    for (var i = 0, ii = title_split.length - 1; i < ii; i++) {
                        new_title += title_split[i] + ' ';
                    }
                    new_title += '<span class="fc-title-year">' + title_split[title_split.length - 1] + '</span>';
                }
            }
            title.html(new_title);
        },
        //events: function(start, end, timezone, callback) {
        events: function events(info, successCallback, failureCallback) {
            $.ajax({
                url: qgcio.events['vars']['event_source'],
                type: 'GET',
                data: qgcio.events['fn'].compose_data(info.start, info.end),
                error: function error() {
                    // error handler
                },
                success: function success(data) {
                    // success handler
                    var data_all;
                    qgcio.events['vars']['listed_events'] = [];
                    if (typeof data == 'string') {
                        data_all = JSON.parse(data);
                    } else {
                        data_all = data;
                    }

                    var view_info = qgcio.events['vars']['calendar'].view;
                    if (view_info.type == 'searchList') {
                        if (data_all.events_data.length == qgcio.events['vars']['previous_result_count']) {
                            // hide 'more' button
                            $('.load-more-events').hide();
                        } else {
                            qgcio.events['vars']['previous_result_count'] = data_all.events_data.length;
                        }
                    } else {
                        qgcio.events['vars']['previous_result_count'] = 0;
                        $('.load-more-events').hide();
                    }
                    var user_type = data_all.user_type;
                    qgcio.events['vars']['user_type'] = user_type;
                    if (user_type == 'public') {
                        $('.events_display-options').hide();
                        $('#events_search-event-types').parents('.events_search-form-field').hide();
                    }
                    console.log(data_all.events_data);
                    successCallback(data_all.events_data);
                }
            });
        },
        windowResize: function windowResize(view) {

            if (qgcio.events['vars']['viewport_setting'] != qgcio.vars.screensize) {
                qgcio.events['vars']['viewport_setting'] = qgcio.vars.screensize;
                if (qgcio.vars.screensize < 3) {
                    // if not desktop, toggle list view
                    $('.events_toggle-list').trigger('click');
                } else {
                    $('.events_toggle-calendar').trigger('click');
                    //$('.events_toggle-calendar').parent().show();
                }
            }
        }
    });
    qgcio.events['vars']['calendar'].render();

    $('body').on('click', '.events_toggle-list', qgcio.events['fn'].toggle_list_view);
    $('body').on('click', '.events_toggle-calendar', qgcio.events['fn'].toggle_calendar_view);
    $('body').on('click', '.events_display-options a', qgcio.events['fn'].filter_event_type);
    $('body').on('submit', '#events_search-form', qgcio.events['fn'].search_events);
    $('body').on('focus', '#events_search-start-date, #events_search-end-date', qgcio.events['fn'].clear_date_field);
    $('body').on('click', '.event_asset-summary', qgcio.events['fn'].show_event_popup);
    $('body').on('click', '.event_asset-popup-close', qgcio.events['fn'].close_event_popup);
    $('body').on('click', '.load-more-events', qgcio.events['fn'].show_more_events);
    $('body').on('click', '.subscribe-toggler', qgcio.events['fn'].toggle_subscribe_popup);
    $('body').on('click', '.events_search-field-icon .close', function () {
        $(this).parents('.events_search-form-field').find('input[type="text"]').focus();
    });

    qgcio.events['fn']['date_formatter']('events_search-start-date');
    qgcio.events['fn']['date_formatter']('events_search-end-date');

    $(document).click(function (event) {
        var $target = $(event.target);
        // hide event popup
        if (!$target.closest('.event_asset-popup.active').length && $('.event_asset-popup.active').is(":visible")) {
            qgcio.events['fn'].close_event_popup();
        }
        // hide subscribe popup
        if (!$target.closest('.subscribe-wrapper.active').length && $('.subscribe-popup').is(":visible")) {
            $('.subscribe-toggler').trigger('click');
        }
    });
};

$(document).ready(function () {
    if (typeof window.FullCalendar != 'undefined' && $('#calendar').length > 0) {
        qgcio.events['init']();
    }
});
/*
    Funnelback search
*/

// Update the search results with the new response data
qgcio.fn.updateSearchResults = function (response_data, bBackButtonPressed, sURL, sTitle) {
    // Updated for JIRA SDQLD-1246
    var boole = bBackButtonPressed === undefined ? false : true;
    var results = response_data.match(/doctype/gi) !== null ? $(response_data).find('.search-results__container').html() : response_data;
    var ajaxUrl = sURL === undefined ? window.location.origin + window.location.pathname + $(response_data).find('.search-results__data').attr('data-url') : sURL;
    var ajaxTitle = sTitle === undefined ? $(response_data).filter('title').text() : sTitle;

    if (!boole) {
        if (response_data.match(/doctype/gi) === null) {
            history.replaceState({
                "html": results,
                "pageTitle": ajaxTitle
            }, "", ajaxUrl);
        } else {
            history.pushState({
                "html": response_data,
                "pageTitle": ajaxTitle
            }, "", ajaxUrl);
        }
    }

    $('.search-results__container').html(results);
    if (sURL !== undefined) {
        qgcio.fn.updateSearchSortDisplay();
    }
    qgcio.fn.updatePaginationURLs();
    qgcio.core.asideHeightReset();
};

// Update the search page with the new response data
qgcio.fn.updateSearchPage = function (response_data) {

    var results = $(response_data).find('.search-results__listing');

    //var no_results = $(response_data).find('.search-results__no-results');
    var content;
    /*
    if(no_results.length > 0){
        content = no_results.html();
    }
    */

    //if(results.length > 0){
    content = results.html();
    //}

    $('.search-results__listing').html(content);
    qgcio.fn.updateSearchSortDisplay();
    qgcio.fn.updateCollectionURLs();
    qgcio.fn.updatePaginationURLs();
    a;
    qgcio.core.asideHeightReset();
};

// When user clicks on pagination items (e.g. in pages /publications or /search), JS will ajax in funnelback content.
// Scroll to title
qgcio.fn.initPaginationClick = function ($search_results_title) {

    $('body').on('click', ".pagination__list-item a", function () {

        $('html, body').animate({
            scrollTop: $search_results_title.offset().top
        }, 0);
    });
};

// Update search results based on refinements
qgcio.fn.filterResultsByFacets = function (event) {
    var target = $(event.target);

    // Construct the new query
    var search_form = $('.search-results__form');
    var search_page = search_form.attr('action');
    var search_collection = search_form.find('input[name="collection"]').val();
    var search_query = search_form.find('input[name="query"]').val();

    if (search_query === '') {
        search_query = '!null';
    }

    var search_string = search_page + '?collection=' + search_collection + '&query=' + search_query;
    search_string += qgcio.fn.getSearchFilterParameters();
    search_string += qgcio.fn.getSearchSortParameters();

    // Request the refined results
    var ajax_params = {
        'url': search_string,
        'callback': qgcio.fn.updateSearchPage
    };

    $('.qgcio-current_search').attr('data-url', search_string);

    // Update content
    qgcio.fn.loadingContent('.search-results__listing');
    qgcio.ajax(ajax_params);
    qgcio.utils.mobileActions();

    return false;
};
/*
    Funnelback autocomplete
*/

// Funnelback query autocomplete
qgcio.fn.initAutocomplete = function (selector) {
    var search_form = $(selector).parents('form')[0];
    var form_selector = '#' + $(search_form).attr('id');
    //var collection_id = $(search_form).find('input[name="collection"]').val();
    var collection_id = $(search_form).data('space');
    var suggest_json = $(search_form).find('input[name="suggest"]').val();
    var dataset_group = qgcio.fn.getAutocompleteDatasets(collection_id);

    $(selector).qc({
        program: suggest_json,
        alpha: '.5',
        show: '10',
        sort: '0',
        length: '3',
        horizontal: true,
        typeahead: {
            hint: false
        },
        datasets: dataset_group['datasets']
    });

    // Add a suggestions container to the autocomplete menu
    var className = selector.replace('.', '');

    var wrapper = '<div class="' + className + '__autocomplete"><h2>Suggestions</h2><div class="' + className + '__suggestions row"></div></div>';
    $(form_selector + ' .twitter-typeahead .tt-menu').append(wrapper);

    // Figure out how many columns to construct
    var column_class = '';
    switch (dataset_group['columns']) {
        case 1:
            column_class = 'col-sm-12';
            break;
        case 2:
            column_class = 'col-6 col-md-6 col-sm-12';
            break;
        case 4:
        default:
            column_class = 'col-3 col-md-3 col-sm-12';
            break;
    }

    // Move the datasets into the suggestions container

    var datasets = $(form_selector + ' .tt-dataset');
    datasets.each(function () {
        $(this).addClass(column_class);
        $(this).appendTo(selector + '__suggestions');
    });
};

// Configure the datasets for autocomplete
qgcio.fn.getAutocompleteDatasets = function (collection_id) {
    var datasets = {};
    var dataset_required = [];
    var dataset_map = {
        'organic': {
            'collection': collection_id,
            'name': 'Keywords'
        },
        'policies': {
            'collection': 'qgcio-policies',
            'name': 'Docs'
        },
        'news': {
            'collection': 'qgcio-news',
            'name': 'News'
        },
        'events': {
            'collection': 'qgcio-events',
            'name': 'Events'
        },
        'notifications': {
            'collection': 'qgcio-notifications-push',
            'name': 'Notifications'
        }

        // Figure out which datasets you need based on collection

    };switch (collection_id) {
        case 'qgcio-public-meta':
            dataset_required = ['organic', 'policies', 'news', 'events'];
            break;
        case 'qgcio-portal-meta':
            dataset_required = ['organic', 'policies', 'news', 'events'];
            break;
        case 'qgcio-policies':
            dataset_required = ['policies'];
            break;
        case 'qgcio-policies-public':
            dataset_required = ['policies'];
            break;
        case 'qgcio-events':
            dataset_required = ['organic', 'events'];
            break;
        case 'qgcio-news':
            dataset_required = ['organic', 'news'];
            break;
    }

    // Construct the list of datasets required
    $(dataset_required).each(function (type_key, type_val) {

        datasets[type_val] = {
            'collection': dataset_map[type_val]['collection'],
            'format': 'extended',
            'template': {
                suggestion: function suggestion(data) {
                    var category = data.category;
                    var type = type_val;

                    //if(category !== '' && type != 'organic' ){
                    return qgcio.fn.renderResultSet(data);
                    //}else if(category === '' && type === 'organic' ){
                    //    return qgcio.fn.organicRenderResultSet(data);
                    //}
                    //else{
                    //    return;
                    //}
                },
                header: qgcio.fn.renderDatasetHeader(dataset_map[type_val]['name']),
                notFound: qgcio.fn.renderNoResults()
            }
        };
    });

    return {
        'datasets': datasets,
        'columns': dataset_required.length
    };
};

// Customise the response for no results
qgcio.fn.renderNoResults = function () {
    return $('<div>').html('<em>No results found</em>');
};

// Customise the header of datasets
qgcio.fn.renderDatasetHeader = function (header_name) {
    return $('<h3 class="tt-category">').html(header_name);
};

// Customise the output of the dataset
qgcio.fn.renderResultSet = function (data) {
    var category = data.extra.cat;
    var action_link = data.extra.action;
    var suggestion = data.extra.disp;
    var search_form = $('.tt-open').parents('form')[0];
    var search_url = $(search_form).attr('action');
    var search_collection = $(search_form).find('input[name=collection]').val();
    var site_name = '| Queensland Government Chief Information Office';

    // Search suggestion links should go to the search page as a typical search
    // Document links are modified to remove the "| Site Name"
    if (category != '') {
        suggestion = suggestion.replace(site_name, '');
    } else {
        action_link = search_url + '?query=' + suggestion + '&collection=' + search_collection;
    }

    // Render the result template
    var template = '<a href="' + action_link + '">' + suggestion + '</a>';
    var formattedResponse = $('<div class="tt-suggestion tt-selectable">').html(template);
    //console.log(formattedResponse);
    return formattedResponse;
};

// Customise the output of the dataset
qgcio.fn.organicRenderResultSet = function (data) {
    var category = data.extra.cat;
    var action_link = data.extra.action;
    var suggestion = data.extra.disp;
    var search_form = $('.tt-open').parents('form')[0];
    var search_url = $(search_form).attr('action');
    var search_collection = $(search_form).find('input[name=collection]').val();
    var site_name = '| Queensland Government Chief Information Office';

    // Search suggestion links should go to the search page as a typical search
    // Document links are modified to remove the "| Site Name"

    if (category === '') {
        action_link = search_url + '?query=' + suggestion + '&collection=' + search_collection;
    } else {
        suggestion = suggestion.replace(site_name, '');
    }

    // Render the result template
    var template = '<a href="' + action_link + '">' + suggestion + '</a>';

    var formattedResponse = $('<div class="tt-suggestion tt-selectable">').html(template);

    return formattedResponse;
};

// Sort search results by sort option
qgcio.fn.sortResults = function (event) {

    var target = $(event.target);
    var search_form = $('.search-results__form');
    var search_page = search_form.attr('action');
    var search_parameters = $('.search-results__data').attr('data-url');

    var search_query = search_page + search_parameters;
    search_query = search_query.replace(/&sort=[a-zA-Z]*/, '');

    var sort_by = qgcio.fn.getSearchNewSortParameters();
    search_query += sort_by;

    var ajax_params = {
        'url': search_query,
        'callback': qgcio.fn.updateSearchResults
    };

    // Update content
    qgcio.fn.loadingContent('.search-results__container');
    qgcio.ajax(ajax_params);

    return false;
};

// Get the new sorting parameters
qgcio.fn.getSearchNewSortParameters = function () {

    var sort_direction = $('.search-results__options_sort a').data("sort");
    var search_query = '&sort=' + sort_direction;

    return search_query;
};

// Get the current sorting parameters
qgcio.fn.getSearchSortParameters = function () {

    var sort_direction;

    if ($('.search-results__options_sort').length) {
        sort_direction = $('.search-results__options_sort').attr('data-current-sort');
    } else {
        // If user is refining again after an empty result has been returned
        sort_direction = $('#search-results__form').data("default-sort");
    }

    var search_query = '&sort=' + sort_direction;

    return search_query;
};

// Get the selected search filters
qgcio.fn.getSearchFilterParameters = function () {
    var filters = {};
    var search_query = '&fmo=true';

    // Get the selected refinements
    $('.refinement__list').each(function (list_key, list_val) {
        var metadata_filter = $(list_val).attr('data-meta');
        var checked_inputs = $(list_val).find('input:checked');
        var selected_options = [];

        $(checked_inputs).each(function (item_key, item_val) {
            var option = $(item_val).parents('.refinement__list-item').attr('data-meta');
            selected_options.push(option);
        });

        filters[metadata_filter] = selected_options;
    });

    if ($('.refinement__single').length > 0) {

        $('.refinement__single').each(function (list_key, list_val) {
            var sing_metadata_filter = $(list_val).attr('data-meta');
            var single_inputs = $(list_val).find('input');
            var selected_options = [];

            $(single_inputs).each(function (item_key, item_val) {
                var option = $(item_val).val();
                selected_options.push(option);
            });

            filters[sing_metadata_filter] = selected_options;
        });
    }

    for (var item in filters) {
        search_query += '&' + item + '=';
        var current = filters[item];
        if (current.length > 0) {
            if (item === "start_date" || item === "end_date") {
                $(current).each(function (option_key, option_val) {
                    search_query += option_val;
                });
            } else {
                search_query += '[';
                $(current).each(function (option_key, option_val) {
                    search_query += option_val + ' ';
                });
                search_query += ']';
            }
        }
    }

    return search_query;
};

// Update the sort toggle and collection URLs
qgcio.fn.updateSearchSortDisplay = function (current_sort) {

    var current_sort = $('.search-results__options_sort').attr('data-current-sort');

    var sort_filter = $('.search-results__sort-apply');
    var chevron_class = 'fa-angle-';
    var active_class = 'active';

    var old_direction;
    var new_direction;
    var new_sort;

    switch (current_sort) {
        case 'metaEventStartDateTimeUnix':
            new_sort = 'dmetaEventStartDateTimeUnix';
            old_direction = chevron_class + 'down';
            new_direction = chevron_class + 'up';
            break;
        case 'dmetaEventStartDateTimeUnix':
            new_sort = 'metaEventStartDateTimeUnix';
            old_direction = chevron_class + 'up';
            new_direction = chevron_class + 'down';
            break;
        case 'metapublishedDateTimeUnix':
            new_sort = 'dmetapublishedDateTimeUnix';
            old_direction = chevron_class + 'down';
            new_direction = chevron_class + 'up';
            break;
        case 'dmetapublishedDateTimeUnix':
            new_sort = 'metapublishedDateTimeUnix';
            old_direction = chevron_class + 'up';
            new_direction = chevron_class + 'down';
            break;
        case 'title':
            new_sort = 'dtitle';
            old_direction = chevron_class + 'down';
            new_direction = chevron_class + 'up';
            break;
        case 'dtitle':
        default:
            new_sort = 'title';
            old_direction = chevron_class + 'up';
            new_direction = chevron_class + 'down';
    }

    /*
    if (current_sort === '') {
        active_class = '';
    }
    */

    // Update sort toggle
    //sort_filter.parent().attr('data-current-sort', new_sort);
    sort_filter.addClass(active_class).attr('data-sort', new_sort);
    sort_filter.find('.' + old_direction).addClass(new_direction).removeClass(old_direction);

    // Update collection URLs
    $('.search-results__tabs li').each(function (tab_key, tab_val) {
        var current_url = $(tab_val).attr('data-url');
        var sort_url = current_url.replace(/&sort=[a-zA-Z]*/, '');
        sort_url += "&sort=" + current_sort;
        $(tab_val).attr('data-url', sort_url);
    });
};

// Update collection category URLs based on refinements
qgcio.fn.updateCollectionURLs = function () {
    var filter_parameters = qgcio.fn.getSearchFilterParameters();
    var sort_parameters = qgcio.fn.getSearchSortParameters();

    $('.search-results__tabs li').each(function (tab_key, tab_val) {
        var with_filter = $(tab_val).attr('data-url') + filter_parameters + sort_parameters;
        $(tab_val).attr('data-url', with_filter);
    });
};

// Update collection category URLs based on refinements
qgcio.fn.updatePaginationURLs = function () {
    var query_url = qgcio.fn.getFilteredURL();

    if (!query_url === undefined) {
        $('.pagination__list-item a').each(function (link_key, link_val) {
            var current_href = $(link_val).attr('href');
            var matches = current_href.match(/(start_rank=[0-9]*)/);
            $(link_val).attr('href', query_url + '&' + matches[1]);
        });
    }
};

// Get the collection refinement URLs
qgcio.fn.getFilteredURL = function () {
    var query_url;

    if ($('.search-results__tabs-title').length > 0) {
        var active_tab = $('.search-results__tabs-title.active').parent();
        query_url = active_tab.attr('data-url');
    } else {
        query_url = $('.search-results__data').data('url');
    }

    return query_url;
};

// Filter the search results by scoping to the specified Funnelback collection
qgcio.fn.filterResultsByCollection = function (event) {
    var target = $(event.target);
    var tab_target;

    if (target.is('li')) {
        tab_target = target;
    } else {
        // Handle the anchor or span click
        tab_target = target.parents('li');
    }

    var destination = tab_target.attr('data-url');
    var ajax_params = {
        'url': destination,
        'callback': qgcio.fn.updateSearchResults
    };

    $('.qgcio-current_search').attr('data-url', destination);

    // Update labels
    $('.search-results__tabs li a').each(function (key, value) {
        $(value).removeClass('active');
    });
    tab_target.find('> a').addClass('active');

    // Update content
    qgcio.fn.loadingContent('.search-results__container');
    qgcio.ajax(ajax_params);

    return false;
};

// Request a new page of search results
qgcio.fn.paginateResults = function (event) {
    var target = $(event.target);
    var destination = target.attr('href');
    var ajax_params = {
        'url': destination,
        'callback': qgcio.fn.updateSearchResults

        // Update content
    };qgcio.fn.loadingContent('.search-results__container');
    qgcio.core.asideHeightReset();
    qgcio.ajax(ajax_params);

    return false;
};

/*
    Global
*/

// Add an indication that content is being changed
qgcio.fn.loadingContent = function (selector) {
    $(selector).html('<span class="loader"></span> <em>Loading ...</em>');
};

// QLD Government Other Languages switcher
qgcio.fn.otherLanguagesSwitcher = function () {
    var b = ['<span lang="ar" xml:lang="ar">العربية</span>', '<span lang="el" xml:lang="el">Ελληνικά</span>', '<span lang="pl" xml:lang="pl">Polski</span>', '<span lang="bs" xml:lang="bs">Bosanksi</span>', '<span lang="id" xml:lang="id">Bahasa Indonesia</span>', '<span lang="ru" xml:lang="ru">Русский</span>', '<span lang="zh" xml:lang="zh">中文</span>', '<span lang="it" xml:lang="it">Italiano</span>', '<span lang="sr" xml:lang="sr">српски</span>', '<span lang="hr" xml:lang="hr">Hrvatski</span>', '<span lang="ja" xml:lang="ja">日本語</span>', '<span lang="es" xml:lang="es">Español</span>', '<span lang="fr" xml:lang="fr">Français</span>', '<span lang="ko" xml:lang="ko">한국어</span>', '<span lang="tl" xml:lang="tl">Tagalog</span>', '<span lang="de" xml:lang="de">Deutsch</span>', '<span lang="fa" xml:lang="fa">فارسی</span>', '<span lang="vi" xml:lang="vi">Tiếng Việt</span>'];
    $('#other-languages').empty().append(b[Math.floor(Math.random() * b.length)] + ' (Other languages)'), setTimeout(qgcio.fn.otherLanguagesSwitcher, 5e3);
};

//Login toggle

qgcio.fn.loginButtons = function () {
    $(this).toggleClass('active');
    $(this).closest('.qgcio_login-wrapper').find('.qgcio_local-login-form').toggleClass('visuallyhidden');
    $('html, body').animate({
        scrollTop: $(".qgcio_local-login-form").offset().top
    }, 2000);
};

// Order watching

qgcio.fn.orderWatching = function () {
    $('.my__watching-results').find('li.clearfix').each(function () {
        $(this).remove();
    });
    var resultsListLength = $('.my__watching-results li').length;

    if (resultsListLength > 0) {
        $("ul.my__watching-results li").sort(sort_li).appendTo('ul.my__watching-results');
    }

    function sort_li(a, b) {
        return $(a).data('order') < $(b).data('order') ? 1 : -1;
    }
};

qgcio.fn.resetHomeHeights = function () {
    $('.qgcio-info-pane .max-width__wrapper').each(function () {
        $('.qgcio-info-panel__equal-parent', this).height('auto');
        $('.qgcio-info-panel__equal', this).height('auto');
    });
};

qgcio.fn.initHomeEqualHeights = function () {
    // Select and loop the container element of the elements you want to equalise
    var highestBox = 0;

    $('.qgcio-info-pane .max-width__wrapper').each(function () {
        // Select and loop the elements you want to equalise
        $('.qgcio-info-panel__equal-parent', this).each(function () {
            // If this box is higher than the cached highest then store it
            if ($(this).height() > highestBox) {
                highestBox = $(this).height();
            }
        });

        // Set the height of all those children to whichever was highest
        $('.qgcio-info-panel__equal-parent', this).height(highestBox + 10);
        $('.qgcio-info-panel__equal', this).height(highestBox - 65);
    });
};

// Function: Related to clicking on "Clear filters" button on aside (e.g. QRate and Main search)
qgcio.fn.initClearAsideFilters = function () {

    var $clear_button = $("a.search-results__filer-reset"); // Get clear filters button

    if ($clear_button.length) {

        var $apply_filters_button = $(".search-results__filer-apply"); // Get apply filters button

        $clear_button.click(function (event) {

            event.preventDefault();
            $clear_button.parent().find("input:checked").prop("checked", false); // Clear all checked filters
            $clear_button.parent().find("input").val("");

            if ($clear_button.parent().hasClass('aside__section-events')) {
                var currentDate = $('input.start-date').parent().data('currentdate');
                $('input.start-date').val(currentDate);
            }

            $apply_filters_button.click(); // Simulate click on apply filters button
        });
    }
};

//Onload add aside nav active classes
qgcio.fn.asideNav = function () {
    var asideNav = $('.aside__navigation__lvl-1'),
        asideNavL2 = $('.aside__navigation__lvl-2'),
        asideNavL3 = $('.aside__navigation__lvl-3'),
        levelOneItem = $('.aside__navigation__list-item'),
        levelTwoItem = $('.navigation__sub-list-item'),
        levelThreeItem = $('.navigation__sub-sub-list-item');

    $(levelOneItem).each(function () {
        if ($(this).hasClass('current')) {
            $(this).find(asideNavL2).addClass('active');
            $(this).closest(asideNav).addClass('active');
        }
    });
    if ($('.navigation__sub-list-item').length > 0) {
        $(levelTwoItem).each(function () {
            if ($(this).hasClass('current')) {
                $(this).closest(asideNavL2).addClass('active');
                $(this).closest(levelOneItem).addClass('active');
            }
        });
    }
    if ($('.navigation__sub-sub-list-item').length > 0) {
        $(levelThreeItem).each(function () {
            if ($(this).hasClass('current')) {
                $(this).closest(asideNavL2).addClass('active');
                $(this).closest(asideNavL3).addClass('active');
                $(this).closest(levelOneItem).addClass('active');
            }
        });
    }
};

/*
    Oliver JS
*/

/*
    General
*/

// Initialise the JS API
qgcio.fn.setJSAPI = function () {
    var options = new Array();
    options['key'] = '7371904979';
    qgcio.js_api = new Squiz_Matrix_API(options);
};

/*
    Watched content
*/

// Get the user's watchlist
qgcio.fn.getUserWatchlist = function () {
    var user_watchlist = {};

    if (squiz.fn.canUseBrowserStorage()) {
        user_watchlist = squiz.fn.getLocalObject('watchlist');
    }

    if ($.isEmptyObject(user_watchlist)) {
        var destination = $('.qgcio-quicklinks__link-watch').attr('data-watchlist');
        var ajax_params = {
            'url': destination,
            'callback': qgcio.fn.setUserWatchlist
        };

        qgcio.ajax(ajax_params);
    } else {
        qgcio.fn.setWatchedActiveState(user_watchlist);
    }
};

// Set the user's watchlist to the browser
qgcio.fn.setUserWatchlist = function (data) {
    var user_watchlist = JSON.parse(data);

    if (squiz.fn.canUseBrowserStorage()) {
        squiz.fn.setLocalObject('watchlist', user_watchlist);
    }

    qgcio.fn.setWatchedActiveState(user_watchlist);
};

// Toggle whether to watch the current page or not
qgcio.fn.watchContentHandler = function (event) {
    var target = $(event.target);
    var watch_link;

    if (target.is('a')) {
        watch_link = target;
    } else {
        // Handle the svg and path clicks
        watch_link = target.parents('a.qgcio-quicklinks__link-watch');
    }

    var user_watchlist = {};
    user_watchlist['user_id'] = watch_link.attr('data-user');
    user_watchlist['watchlist'] = watch_link.attr('data-watchids');

    var is_watched = qgcio.fn.isPageBeingWatched(user_watchlist['watchlist']);
    var current_page = watch_link.attr('data-pageid');
    var watchlist = user_watchlist['watchlist'].split(';');
    var index = watchlist.indexOf(current_page);

    // If this page is already watched, remove it from your list
    // Otherwise, add this page to your watchlist
    if (is_watched) {
        watchlist.splice(index, 1);
    } else {
        watchlist.push(current_page);
    }

    // Turn the watchlist back into a string
    watchlist = watchlist.join(';');

    // Update user metadata
    var js_api_options = {
        'asset_id': user_watchlist['user_id'],
        'field_id': watch_link.attr('data-field'),
        'field_val': watchlist,
        'dataCallback': qgcio.fn.setWatchedContentCallback
    };

    qgcio.js_api.setMetadata(js_api_options);

    return false;
};

// Check if the current page is in the user's watchlist
qgcio.fn.isPageBeingWatched = function (user_watchlist) {
    var watch_link = $('a.qgcio-quicklinks__link-watch');
    var current_page = watch_link.attr('data-pageid');
    var watchlist = user_watchlist.split(';');
    var index = watchlist.indexOf(current_page);

    if (index === -1) {
        return false;
    } else {
        return true;
    }
};

// Advertise to the user that the page is or is not watched
qgcio.fn.setWatchedActiveState = function (user_watchlist) {
    var watch_link = $('a.qgcio-quicklinks__link-watch');
    var is_watched = qgcio.fn.isPageBeingWatched(user_watchlist['watchlist']);

    if (is_watched) {
        watch_link.addClass('active');
    } else {
        watch_link.removeClass('active');
    }

    watch_link.attr('data-user', user_watchlist['user_id']);
    watch_link.attr('data-watchids', user_watchlist['watchlist']);
};

// Update the watchlist attribute on the page
qgcio.fn.setWatchedContentCallback = function (data) {
    //console.log(data);
    var new_watchlist = data['changes'][0]['value'];

    if (squiz.fn.canUseBrowserStorage()) {
        var user_watchlist = squiz.fn.getLocalObject('watchlist');
        user_watchlist['watchlist'] = new_watchlist;
        squiz.fn.setLocalObject('watchlist', user_watchlist);
    }

    // Add the active class
    var user_watchlist = [];
    user_watchlist['watchlist'] = new_watchlist;
    qgcio.fn.setWatchedActiveState(user_watchlist);
};

/*
    Unread updates
*/

// Get subscribed content that the user has not read
qgcio.fn.getUnreadMessages = function () {

    var unread_messages = [];
    var current_timestamp = Date.now() / 1000 | 0;
    var unread_fetched_timestamp;

    // Remember that if session object does not exist, squiz.fn.getSessionObject returns an empty object, {}
    if (squiz.fn.canUseBrowserStorage()) {
        unread_messages = squiz.fn.getSessionObject('unread');
        unread_fetched_timestamp = squiz.fn.getSessionObject('unread-fetched-timestamp');
    }

    // If empty unread_fetched_timestamp session object (fresh user)
    // OR unread fetched timestamp session object is more than 10 minutes old
    if (!Number.isInteger(unread_fetched_timestamp) || unread_fetched_timestamp + 600 < current_timestamp) {

        // Fetch current unread messages from users inbox
        var destination = $('.qgcio__user-content').attr('data-unread-get');
        var ajax_params = {
            'url': destination,
            'callback': qgcio.fn.setUnreadMessages
        };

        qgcio.ajax(ajax_params);
    } else if (unread_messages.length) {
        qgcio.fn.handleUnreadMessages(unread_messages);
    }
};

// Set the user's unread messages to the browser
qgcio.fn.setUnreadMessages = function (data) {

    var unread_messages = JSON.parse(data);
    var current_timestamp = Date.now() / 1000 | 0;

    if (squiz.fn.canUseBrowserStorage()) {
        squiz.fn.setSessionObject('unread', unread_messages);
        squiz.fn.setSessionObject('unread-fetched-timestamp', current_timestamp);
    }

    if (unread_messages.length) {
        qgcio.fn.handleUnreadMessages(unread_messages);
    }
};

// Put unread messages into groups
qgcio.fn.handleUnreadMessages = function (unread_messages) {
    var update_list = {};

    // Iterate over the unread messages
    for (var message in unread_messages) {
        var current_message = unread_messages[message];
        var subject = current_message['subject'];
        var pattern = RegExp(/\[([a-zA-Z]*)\]/);
        var results = pattern.exec(subject);

        // If there's a match, sort the messages into groups
        if (results !== null) {
            var group = results[1];

            if (typeof update_list[group] === 'undefined') {
                update_list[group] = [];
            }

            // Convert body into JSON
            current_message['body'] = current_message['body'].replace(/<\/?div>/g, '');
            current_message['body'] = JSON.parse(current_message['body']);

            update_list[group].push(current_message);
        }
    }

    // For every type of update, sort the messages
    for (var group in update_list) {
        update_list[group] = qgcio.fn.sortUnreadMessages(update_list[group]);
    }

    // Render updates for the user menu
    qgcio.fn.renderUpdates(update_list);

    // Update the user update bubble
    qgcio.fn.populateUserUpdateCount();

    // Mark page as read
    qgcio.fn.markPageAsRead();
};

// Split unread messages and sort by their timestamp
qgcio.fn.sortUnreadMessages = function (update_group) {
    var user_updates = [];
    var message_groups = _.groupBy(update_group, function (message) {
        return message['subject'];
    });

    for (var group in message_groups) {
        var current_group = message_groups[group];

        // Check for duplicates and sort by the update timestamp
        if (current_group.length > 1) {
            var sorted_messages = _.sortBy(current_group, function (message) {
                return message['body']['updated_on'];
            });
            sorted_messages = sorted_messages.reverse();
        }
    }

    user_updates = qgcio.fn.filterDuplicateUpdates(message_groups);

    return user_updates;
};

// Filter out duplicate updates
qgcio.fn.filterDuplicateUpdates = function (message_groups) {
    var messages = [];
    var duplicates = [];

    // The first message of each group is the most relevant
    for (var group in message_groups) {
        var current_group = message_groups[group];
        var group_length = current_group.length;

        messages.push(current_group[0]);

        // Add duplicates to another array
        if (group_length > 1) {
            duplicates.push(current_group.splice(1, group_length - 1));
        }
    }

    if (duplicates.length > 0) {
        qgcio.fn.removeDuplicateUpdates(duplicates);
    }

    return messages;
};

// Remove duplicate updates from storage
qgcio.fn.removeDuplicateUpdates = function (duplicates) {
    var message_ids = [];

    for (var group in duplicates) {
        var current_group = duplicates[group];
        for (var message in current_group) {
            message_ids.push(current_group[message]['msgid']);
        }
    }

    message_ids = message_ids.join(',');

    qgcio.fn.deleteInternalMessages(message_ids);
};

// Remove unread messages from user
qgcio.fn.deleteInternalMessages = function (message_ids) {
    var destination = $('.qgcio__user-content').attr('data-unread-set');
    destination += '?message_ids=' + message_ids;

    // Update the browser copy
    if (squiz.fn.canUseBrowserStorage()) {
        var message_ids_array = message_ids.split(',');
        var unread_messages = squiz.fn.getSessionObject('unread');
        var updated_messages = _.filter(unread_messages, function (message) {
            if (message_ids_array.indexOf(message['msgid']) === -1) {
                return true;
            } else {
                return false;
            }
        });

        squiz.fn.setSessionObject('unread', updated_messages);
    }

    var ajax_params = {
        'url': destination,
        'callback': function callback() {}
    };

    qgcio.ajax(ajax_params);
};

// Clear update category
qgcio.fn.clearUpdateList = function (event) {
    var target = $(event.target);
    var clear_link;

    if (target.is('a')) {
        clear_link = target;
    } else {
        clear_link = target.parents('a.content__toggler');
    }

    // Clear the badge counter
    var target_update = clear_link.parent();
    target_update.find('.badge').text('');

    // Store a reference in the browser session
    if (squiz.fn.canUseBrowserStorage()) {
        var dismissed_updates = qgcio.fn.getDismissedUpdates();
        var update_type = target_update.attr('data-update');

        if (dismissed_updates.indexOf(update_type) === -1) {
            dismissed_updates.push(update_type);
        }

        squiz.fn.setSessionObject('dismissed-updates', dismissed_updates);
    }

    // Update the user update bubble
    qgcio.fn.populateUserUpdateCount();
};

// Populate the main update counter
qgcio.fn.populateUserUpdateCount = function () {
    var update_bubble = $('.qgcio__user-notifications');
    var counter = 0;

    // Check for temporarily dismissed updates
    var dismissed_updates = [];
    if (squiz.fn.canUseBrowserStorage()) {
        dismissed_updates = qgcio.fn.getDismissedUpdates();
    }

    $('.qgcio__user-section').each(function (section_key, section_val) {
        var section_type = $(section_val).attr('data-update');
        var section_count = $(section_val).find('.badge').text();

        if (dismissed_updates.indexOf(section_type) !== -1) {
            section_count = $(section_val).find('.badge').text('');
        }

        if (section_count === '') {
            section_count = 0;
        }

        counter += parseInt(section_count);
    });

    // Fresh counter
    if (counter > 0) {
        update_bubble.removeClass('visuallyhidden');
        update_bubble.find('span').text(counter);
    } else {
        update_bubble.addClass('visuallyhidden');
        update_bubble.find('span').text('');
    }
};

// Get user dismissed updates from the browser
qgcio.fn.getDismissedUpdates = function () {
    var dismissed_updates = squiz.fn.getSessionObject('dismissed-updates');

    if ($.isEmptyObject(dismissed_updates)) {
        dismissed_updates = [];
    }

    return dismissed_updates;
};

// Render updates
qgcio.fn.renderUpdates = function (update_list) {
    for (var update_type in update_list) {
        var update_content = update_list[update_type];

        qgcio.fn.renderUpdateCard(update_content, update_type);
    }
};

// Render updates based on type
qgcio.fn.renderUpdateCard = function (update_content, update_type) {
    var update_count = update_content.length;
    var update_section = $('.qgcio__user-section[data-update="' + update_type + '"]');

    update_section.find('.content__toggler').removeClass('visuallyhidden');
    update_section.find('.badge').text(update_count);

    switch (update_type) {
        case 'Watching':
            update_section.find('.qgcio__user-content-list').append($('<div class="card-block" />'));

            for (var update in update_content) {
                var current_update = update_content[update];
                var card_template = qgcio.fn.renderWatchingTemplate(current_update);
                update_section.find('.card-block').append(card_template);

                if ($('.my__watching-results').length > 0) {
                    qgcio.fn.updateMyWatchingPage(current_update);
                }
            }

            break;

        case 'Notifications':

            update_section.find('.qgcio__user-content-list').append($('<div class="card-block" />'));

            for (var update in update_content) {
                var current_update = update_content[update];

                var card_template = qgcio.fn.renderNotificationsTemplate(current_update);
                update_section.find('.card-block').append(card_template);

                if ($('.my__notifications-results').length) {
                    qgcio.fn.updateMyNotificationsPage(current_update);
                }
            }

            break;

    }
};

// Render the template for the Watching update
qgcio.fn.renderWatchingTemplate = function (content) {
    var content_body = content['body'];
    var milli_time = qgcio.fn.secondsToMilliseconds(content_body['updated_on']);
    var updated_on = qgcio.fn.timestampToFormattedDate(milli_time);

    var template = '<div class="card" data-pageid="' + content_body['asset_id'] + '" data-msgid="' + content['msgid'] + '">';
    template += '<p class="card-text">';
    template += '<a href="' + content_body['url'] + '">' + content_body['name'] + '</a>';
    template += '</p>';
    template += '<small class="text-muted">' + content_body['updated_by'] + ' on ' + updated_on + '</small>';
    template += '</div>';

    return template;
};

qgcio.fn.updateMyWatchingPage = function (content) {
    var content_body = content['body'];
    var assetID = content_body['asset_id'];

    $('.my__watching-results li').each(function () {
        if ($(this).data('id') == assetID) {
            $(this).addClass('unread');
        }
    });
};

qgcio.fn.updateMyNotificationsPage = function (content) {
    var content_body = content['body'];
    var assetID = content_body['asset_id'];

    $('.my__notifications-results li').each(function () {
        if ($(this).data('id') == assetID) {
            $(this).addClass('unread');
        }
    });
};

// Render the template for Notifications
qgcio.fn.renderNotificationsTemplate = function (content) {
    var content_body = content['body'];
    var milli_time = qgcio.fn.secondsToMilliseconds(content_body['published_on']);
    var published_on = qgcio.fn.timestampToFormattedDate(milli_time);

    var template = '<div class="card" data-pageid="' + content_body['asset_id'] + '" data-msgid="' + content['msgid'] + '">';
    template += '<p class="card-text">';
    template += '<a href="' + content_body['url'] + '">' + content_body['name'] + '</a>';
    template += '</p>';
    template += '<small class="text-muted">' + content_body['published_by'] + ' on ' + published_on + '</small>';
    template += '</div>';

    return template;
};

// Remove the update message when visiting the related page
qgcio.fn.markPageAsRead = function () {

    var page_type;
    var current_page_id;

    // Determine if its a watching/notification type page
    if ($(".qgcio-quicklinks__link-watch").length) {
        // Check if watching icon exists in side menu
        page_type = "Watching";
        current_page_id = $('.qgcio-quicklinks__link-watch').attr('data-pageid');
    } else if ($("[data-page-type='notification']").length) {
        page_type = "Notifications";
        current_page_id = $("[data-page-type='notification']").data("pageid");
    }

    // If page is either watching/notification
    if (page_type) {

        // Get current page card. Determined by whats in the DOM.
        var $current_page_card = $(".qgcio__user-section[data-update='" + page_type + "'] .card[data-pageid='" + current_page_id + "']");

        if ($current_page_card.length) {

            var current_page_card_unread_msg_id = $current_page_card.attr('data-msgid');

            // Remove from internal message
            qgcio.fn.deleteInternalMessages(current_page_card_unread_msg_id);

            // Remove from the menu
            //$current_page_card.remove();
        }
    }
};

/*
    Utilities
*/

// Convert timestamp in seconds to milliseconds
qgcio.fn.secondsToMilliseconds = function (seconds) {
    return parseInt(seconds) * 1000;
};

// Convert timestamp to time
qgcio.fn.timestampToFormattedTime = function (timestamp) {
    var new_date = new Date(timestamp);
    var hours = new_date.getHours();
    var minutes = new_date.getMinutes();
    var suffix = 'am';
    var formatted_time = '';

    // Check for the afternoon
    if (hours > 12) {
        hours = hours - 12;
        suffix = 'pm';
    }

    // Check for midnight
    if (hours === 0) {
        hours = 12;
    }

    // Pad minutes
    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    formatted_time = hours + ':' + minutes + suffix;

    return formatted_time;
};

// Convert timestamp to time
qgcio.fn.timestampToFormattedDate = function (timestamp) {
    var new_date = new Date(timestamp);
    var day = new_date.getDate();
    var month = new_date.getMonth();
    var year = new_date.getFullYear();
    var formatted_date = '';

    // Pad days
    if (day < 10) {
        day = '0' + day;
    }

    // Convert month
    month = month + 1;
    if (month < 10) {
        month = '0' + month;
    }

    formatted_date = day + '/' + month + '/' + year;

    return formatted_date;
};

qgcio.fn.quicklinksPrint = function () {
    window.print();
};

qgcio.fn.googleMapInit = function () {
    var map;

    function initialize() {

        var eventString = $('#aside-canvas').attr('data-address');
        var eventCoords = eventString.replace(/[a-z]+=/g, '').replace(" ", "").split(';');

        if (eventCoords[0].length > 0 && eventCoords[1].length > 0) {
            var eventLoc = new google.maps.LatLng(eventCoords[0], eventCoords[1]);

            var mapOptions = {
                center: eventLoc,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("aside-canvas"), mapOptions);
            var marker = new google.maps.Marker({
                position: eventLoc,
                map: map
            });
        } else {
            $('#event-map-canvas').hide();
        }
    }

    $(document).ready(function () {
        google.maps.event.addDomListener(window, "load", initialize);
    });
};

/****** QRATE *******/

// Create required abbr for dynamic insertion
var $required_abbr = $('<abbr/>', {
    "title": "required",
    "class": "sq-form-required-field",
    "text": "*"
});

// Function: Generates a font awesome tag which takes a string to be the class(es)
qgcio.fn.generateFontAwesomeTag = function (class_name) {

    return $('<i/>', {
        "class": "fa " + class_name,
        "aria-hidden": true
    });
};

// Function: Related to sort/refine/paginate suppliers functionality on QRate landing page (#1290)
qgcio.fn.initQrateSearch = function () {

    var $suppliers_content_container = $(".qrate__content");

    if ($suppliers_content_container.length) {

        var $suppliers_content_table = $suppliers_content_container.find("table"); // Store table of results in variable

        var $refinement_lists_aside = $(".refinement__list").closest(".aside__section"); // Store aside refinement list in variable

        // If table of results exist
        if ($suppliers_content_table.length) {

            var $loading_blurb = $("<span class='loader'></span><em>Loading...</em>"); // Create loading blurb
            var $suppliers_content_header = $(".qrate__suppliers__header"); // Store header (contains title and form serch) above results table in variable

            var $suppliers_content_thead = $suppliers_content_table.find("thead"); // Store thead of table results in variable
            var $suppliers_content_thead_cells = $suppliers_content_thead.find("th"); // Store th of table results in variable
            var $suppliers_content_tbody = $suppliers_content_table.find("tbody"); // Store tbody of table results in variable
            var $suppliers_content_tbody_rows = $suppliers_content_tbody.children("tr"); // Store tr of table results in variable
            var $suppliers_content_pagination_container = $suppliers_content_container.find(".results__pagination"); // Store pagination results in variable

            var $current_search = $(".qrate-current_search"); // Store element which should contain current search url
            var $apply_filters_button = $(".search-results__filer-apply"); // Store apply fliter button element in variable

            var sortByConfig = {
                "fa-sort-asc": "metarating",
                "fa-sort-desc": "dmetarating",
                "fa-sort-alpha-asc": "title",
                "fa-sort-alpha-desc": "dtitle"
            };

            initQrateSortBy(); // Initiate Qrate Sort By functionality
            initQrateApplyFilterButton(); // Initiate QRate Apply Filters button functionality
            initQratePaginateResults(); // Initiate QRate Paginate Results functionality
        } else {

            // No results
            $refinement_lists_aside.remove(); // Hide side filters menu
        }
    }

    // Initiate Qrate Sort By functionality
    function initQrateSortBy() {

        initQrateSortByClickHandlers($(".qrate__content__rating"), "fa-sort-desc", "fa-sort-asc"); // Set up sorting by rating
        $(".qrate__content__name").addClass("active"); // active class is added to .qrate__content__name table header cell to indicate its the active sort on page load

        initQrateSortByClickHandlers($(".qrate__content__name"), "fa-sort-alpha-asc", "fa-sort-alpha-desc"); // Set up sorting by name

        // Add font awesome icons to name and rating table header cells, add cursor pointer when hovering over them, and initialise click functionality
        function initQrateSortByClickHandlers($thead_cell, primary_class, secondary_class) {

            $thead_cell.css("cursor", "pointer"); // Add cursor pointer when hovering over table header cells

            // Append font awesome icons
            $thead_cell.append(qgcio.fn.generateFontAwesomeTag(primary_class)).on('click', function () {

                var $this = $(this);

                var $sort_icon = $this.find("i"); // Get sort icon

                if ($this.hasClass("active")) {
                    $sort_icon.toggleClass(primary_class + " " + secondary_class); // switch class to change fontawesome icon
                } else {
                    $suppliers_content_thead_cells.removeClass("active"); // remove active class from previously selected table cell header
                    $this.addClass("active"); // add active class to newly selected table cell header
                }

                searchQrateSuppliers(); // Perform search
            });
        }
    }

    // Initiate QRate Apply Filters button functionality
    function initQrateApplyFilterButton() {

        $apply_filters_button.on('click', function (event) {

            event.preventDefault();
            searchQrateSuppliers(); // Perform search
            qgcio.utils.mobileActions(); // Fix for mobile

            // Scroll to title above table
            $('html, body').animate({
                scrollTop: $suppliers_content_header.offset().top
            }, 0);
        });
    }

    // Initiate QRate Paginate Results functionality
    function initQratePaginateResults() {

        $('body').on('click', ".pagination__list a", function (event) {

            event.preventDefault();

            var $clicked_anchor = $(this); // Get clicked element

            var clicked_url = $clicked_anchor.attr("href"); // Get url of clicked element

            // Scroll to title above table
            $('html, body').animate({
                scrollTop: $suppliers_content_header.offset().top
            }, 0);

            qgcio.fn.performSearch(undefined, undefined, clicked_url, undefined);
        });
    }

    function searchQrateSuppliers() {

        // Whenever a sort or refinement by filters happen, we need to
        // 1. Get the current search URL
        // 2. Generate a new query string to search by meta fields. This is done by checking what is the current sort and what filters have been ticked
        // 3. Create a new search url by combining the current serch url with the generated query string

        var current_search_url = $current_search.data("url");
        var new_search_url = current_search_url + generateQueryString();

        qgcio.fn.performSearch(new_search_url); // Perform search

        function generateQueryString() {

            var query_string = generateSortByQuery() + generateFiltersQuery();

            return encodeURI(query_string);
        }

        // Generate sort query string
        function generateSortByQuery() {

            var active_sort_by_icon = $suppliers_content_thead.find("th.active i"); // Get icon where its parent th contains an active class
            var sort_by_query = "";

            // Check which sort icon is currently "active" and generated a sort query string based on that
            $.each(sortByConfig, function (key, value) {

                if (active_sort_by_icon.hasClass(key)) {

                    sort_by_query = "&sort=" + sortByConfig[key];

                    return false; // Break the loop once its found
                }
            });

            return sort_by_query;
        }

        // Generate filters query string
        function generateFiltersQuery() {

            var refinments_query = "";

            // At each group of refinement list...
            $(".refinement__list").each(function () {

                var $checked_items = $(this).find("input:checked"); // Get checked items

                // If there are checked items, create meta query string
                if ($checked_items.length) {

                    refinments_query += "&meta_" + $(this).data("meta") + "_or=";

                    $checked_items.each(function (index) {

                        refinments_query += $(this).val();

                        if (index < $checked_items.length - 1) {
                            refinments_query += " ";
                        }
                    });
                }
            });

            return refinments_query;
        }
    }
};

// A general function used to fetch and return ajax results with a provided URL
qgcio.fn.performSearch = function (response_data, bBackButtonPressed, sURL, sTitle) {

    var $suppliers_content_container = $(".qrate__content");
    var $loading_blurb = $("<span class='loader'></span><em>Loading...</em>"); // Create loading blurb
    if ($suppliers_content_container.length) {

        var $suppliers_content_table = $suppliers_content_container.find("table"); // Store table of results in variable

        var $refinement_lists_aside = $(".refinement__list").closest(".aside__section"); // Store aside refinement list in variable

        // If table of results exist
        if ($suppliers_content_table.length) {

            var $loading_blurb = $("<span class='loader'></span><em>Loading...</em>"); // Create loading blurb
            var $suppliers_content_header = $(".qrate__suppliers__header"); // Store header (contains title and form serch) above results table in variable

            var $suppliers_content_thead = $suppliers_content_table.find("thead"); // Store thead of table results in variable
            var $suppliers_content_thead_cells = $suppliers_content_thead.find("th"); // Store th of table results in variable
            var $suppliers_content_tbody = $suppliers_content_table.find("tbody"); // Store tbody of table results in variable
            var $suppliers_content_tbody_rows = $suppliers_content_tbody.children("tr"); // Store tr of table results in variable
            var $suppliers_content_pagination_container = $suppliers_content_container.find(".results__pagination"); // Store pagination results in variable

            var $current_search = $(".qrate-current_search"); // Store element which should contain current search url
            var $apply_filters_button = $(".search-results__filer-apply"); // Store apply fliter button element in variable

            var sortByConfig = {
                "fa-sort-asc": "metarating",
                "fa-sort-desc": "dmetarating",
                "fa-sort-alpha-asc": "title",
                "fa-sort-alpha-desc": "dtitle"
            };
        } else {

            // No results
            $refinement_lists_aside.remove(); // Hide side filters menu
        }
    }

    $suppliers_content_container.append($loading_blurb); // Add loading blurb
    $suppliers_content_table.add($suppliers_content_pagination_container).hide(); // Hide table of suppliers and pagination

    var boole = bBackButtonPressed === undefined ? false : true;
    var historyData = response_data;
    var url = sURL;
    var title = sTitle;

    $(".search-results__no-results").remove();

    $.get(url, function (data) {

        //check if back button pressed
        if (!boole) {
            var $supplier_results = $(data).find("tbody").children(); // Extract supplier results from fetched results DOM
        } else {
            var $supplier_results = $(historyData).find("tbody").children(); // Extract supplier results from fetched results DOM
        }

        // If successful fetch...
        if ($supplier_results.length) {

            var results = data;
            var ajaxUrl = url;
            var ajaxTitle = $(data).filter('title').text();
            var historyTitle = $(historyData).filter('title').text();

            if (!boole) {
                if (results.match(/doctype/gi) === null) {
                    history.replaceState({
                        "html": results,
                        "pageTitle": ajaxTitle
                    }, "", ajaxUrl);
                } else {
                    history.pushState({
                        "html": results,
                        "pageTitle": ajaxTitle
                    }, "", ajaxUrl);
                }
            }

            // If there are results

            $suppliers_content_tbody.children().remove(); // Remove table rows in tbody
            $suppliers_content_tbody.append($supplier_results); // Add results

            var $updated_pagination = $(data).find(".results__pagination").children(); // Extract updated pagination results from fetched results DOM
            $suppliers_content_pagination_container.children().remove(); // Remove current pagination
            $suppliers_content_pagination_container.append($updated_pagination); // Add pagination results

            $suppliers_content_table.add($suppliers_content_pagination_container).show(); // Show table of suppliers and pagination
        } else {

            var $no_supplier_results = $(data).find(".search-results__no-results"); // Get no results
            $suppliers_content_container.append($no_supplier_results); // Append no results message
        }
    }).fail(function () {

        $suppliers_content_table.add($suppliers_content_pagination_container).show(); // Just show existing table of suppliers

    }).always(function () {

        $loading_blurb.remove(); // Always remove loading blurb
    });
};

// Function: Related to using QRate (#1290) to submit supplier reviews
qgcio.fn.initSupplierReviewForm = function () {

    var $supplier_review_asset_builder_form = $("#page_asset_builder_1294"); // Caution. Hardcoded Assetid

    // If supplier review asset builder form exists...
    if ($supplier_review_asset_builder_form.length) {

        $supplier_review_asset_builder_form.addClass("sq-form"); // Add class for styling purposes

        var $supplier_review_asset_builder_form_button = $supplier_review_asset_builder_form.find("#sq_commit_button");

        // Turn off default js matrix form submit functionality. Otherwise, jQuery validate won't work!
        $supplier_review_asset_builder_form.prop('onsubmit', null);

        // Turn off default js matrix functionality - onclick. Disable until supplier is populated and create supplier form is ajaxed in and ready
        $supplier_review_asset_builder_form_button.prop('onclick', null).off("click");

        // Get Action to see if user is creating or editing an asset
        var action = $supplier_review_asset_builder_form.find("[name*='ASSET_BUILDER_ACTION']").val();

        var rating_field_id = "1337";

        // Get Department Select field
        var $supplier_review_department_field_row = $("#supplier-review-department-field-row");
        var $supplier_review_department_dropdown = $supplier_review_department_field_row.find("select");

        // Get Organisation Input field
        var $organisation_review_organisation_field_row = $("#supplier-review-organisation-field-row");
        var $organisation_input = $organisation_review_organisation_field_row.find("input");
        var $organisation_label = $organisation_input.parent().parent().find("label");

        // If creating a supplier review
        if (action === "create") {

            // Prefill Department
            var user_department = $supplier_review_department_field_row.data("user-department");

            if ($supplier_review_department_dropdown.val() == "" && user_department != "") {
                $supplier_review_department_dropdown.val(user_department); // Select default value dropdown with user's department
            }
            $('#metadata_field_select_1321').change(function () {
                var $this = $(this).val();
                $('#metadata_field_text_24759_value').val($this);
            });

            initFieldDependencies();

            // On page load, WYSIWYG fields are not initiated until a "button" is clicked which is the following code
            // Trigger this automatically on page load
            switchEditingMode('metadata_field_wysiwyg_1336_contents_div', 'metadata_field_wysiwyg_1336_wysiwyg_div', editor_metadata_field_wysiwyg_1336); // Caution. Hardcoded Assetid

            var $supplier_assetid_field_row = $supplier_review_asset_builder_form.find("#supplier-assetid-field-row");
            var $supplier_assetid_field = $supplier_assetid_field_row.find("input");

            // Clear the default rating
            $supplier_review_asset_builder_form.find("#supplier-review-rating-field-row input:checked").prop('checked', false); // Remove default selected empty rating
            $("[for='metadata_field_select_" + rating_field_id + "_']").hide(); // Hide default empty rating

            // Create faux supplier select dropdown field
            var $supplier_select_faux_field = $('<select/>', {
                id: "supplier-select-faux-field",
                required: "required",
                html: "<option></option>",
                style: "width: 100%"
            }).insertAfter($supplier_assetid_field).hide();

            // Make Supplier Review Form Submission possible only after supplier dropdown and create new supplier form are ready
            $.when(getCreateNewSupplierForm(), initSupplierDropdown()).then(function (supplier_asset_builder_form) {

                // Enable the submit button once select2 has been populated
                $supplier_review_asset_builder_form_button.on("click");

                var $supplier_asset_builder_form_container = $("<div>" + supplier_asset_builder_form + "</div>");
                var $supplier_asset_builder_form = $supplier_asset_builder_form_container.find("form");
                var $supplier_asset_builder_form_name_field = $supplier_asset_builder_form.find("#supplier-name-field-row input");
                var supplier_asset_builder_form_submit_url = $supplier_asset_builder_form.attr("action");

                $supplier_review_asset_builder_form.validate({
                    ignore: [], // Also validate fields that are hidden (including display: none). Examples are the hidden supplier select and rating input fields

                    focusInvalid: false,
                    errorPlacement: function errorPlacement(error, element) {

                        if (element.hasClass("select2-hidden-accessible")) {
                            error.insertAfter(element.next());
                        } else if (element.attr("name").indexOf("metadata_field_select_1337") != -1) {

                            error.insertAfter(element.parent());
                        } else {
                            error.insertAfter(element);
                        }
                    },

                    submitHandler: function submitHandler(form) {

                        $supplier_review_asset_builder_form.find(".error").remove(); // Remove all existing errors (jQuery Validate and matrix supplied)

                        $supplier_review_asset_builder_form_button.off("click");

                        var $selected_supplier_option = $supplier_select_faux_field.find("option:selected");

                        // Everytime a new tag is added, a new option is inserted into the select drop down with attribtue, data-select2-tag="true"
                        var isNewSupplier = $selected_supplier_option.data("select2-tag"); // Either returns boolean true or undefined

                        var selected_supplier_name = $selected_supplier_option.text();

                        if (isNewSupplier === true) {

                            // Create new supplier
                            $supplier_asset_builder_form_name_field.val(selected_supplier_name);

                            $.post(supplier_asset_builder_form_submit_url, $supplier_asset_builder_form.serialize(), function (result) {

                                var $created_asset_result = $(result).find("#created_assetid");

                                if ($created_asset_result.length) {

                                    var created_supplier_assetid = $created_asset_result.text();

                                    createSupplierReview(form, created_supplier_assetid, selected_supplier_name);
                                } else {

                                    // Post error that supplier was not created
                                    addFailedToCreateSupplierMsg();
                                    $supplier_review_asset_builder_form_button.on("click");
                                }
                            }).fail(function () {

                                // Post error that supplier was not created
                                addFailedToCreateSupplierMsg();
                                $supplier_review_asset_builder_form_button.on("click");
                            });
                        } else {

                            var selected_supplier_value = $selected_supplier_option.val();

                            if (selected_supplier_value != "") {

                                // Use id of existing supplier
                                createSupplierReview(form, selected_supplier_value, selected_supplier_name);
                            }
                        }
                    }

                });
            });
        } else {

            initFieldDependencies();

            $("[for='metadata_field_select_" + rating_field_id + "_data_record_']").hide(); // Hide default empty rating


            // Editing a supplier review
            $supplier_review_asset_builder_form.validate({

                ignore: [], // Also validate fields that are hidden (including display: none). Examples are the hidden supplier select and rating input fields

                focusInvalid: false,
                errorPlacement: function errorPlacement(error, element) {

                    if (element.attr("name").indexOf("metadata_field_select_1337") != -1) {

                        error.insertAfter(element.parent());
                    } else {
                        error.insertAfter(element);
                    }
                },

                submitHandler: function submitHandler(form) {

                    $supplier_review_asset_builder_form_button.off("click");

                    $supplier_review_asset_builder_form.find(".error").remove(); // Remove all existing errors (jQuery Validate and matrix supplied)

                    $(".sq-wysiwyg-standalone-body").each(function (index) {

                        var $this = $(this);
                        var contents = $this.find(".with-viper").html();
                        var $textarea = $this.find("textarea");

                        $textarea.val(contents);
                    });

                    form.submit();
                }

            });
        }
    }

    function addFailedToCreateSupplierMsg() {

        $('<label/>', {
            "for": "supplier-select-faux-field",
            "class": "error",
            "text": "Failed to create supplier"
        }).insertAfter($supplier_select_faux_field.next());
    }

    function getCreateNewSupplierForm() {

        var create_new_supplier_form_url = $supplier_assetid_field_row.data("create_new_supplier_form_url");

        return $.get(create_new_supplier_form_url);
    }

    function initSupplierDropdown() {

        var supplier_json_url = $supplier_assetid_field_row.data("supplier_json_url");

        // If visiting this asset builder from a specific vendor
        var get_supplier_assetid = $supplier_assetid_field_row.data("get_supplier_assetid");

        return $.getJSON(supplier_json_url, function (supplier_json) {

            // Remap JSON data to create a data object select2 accepts
            var supplier_json_select2_formatted_json = $.map(supplier_json, function (supplier) {
                return {
                    "id": supplier.assetid,
                    "text": supplier.name
                };
            });

            // Populate dropdown with existing suppliers
            $supplier_select_faux_field.select2({
                data: supplier_json_select2_formatted_json,
                tags: true,
                placeholder: "Search or add a supplier"
            }).on('change', function (evt) {
                $supplier_assetid_field_row.find(".error").remove(); // Get rid of jQuery validate error
            });

            if (get_supplier_assetid) {
                $supplier_select_faux_field.val(get_supplier_assetid).change();
            }
        });
    }

    function createSupplierReview(form, supplier_assetid, supplier_name) {

        // add("#AB_1294_ASSET_BUILDER_ADDITIONAL_LOCATIONS") is a precaution incase somehow the user manages to submit the form, but an error
        // causes the user to return to the page. In this case, since theres a globals post variable supplier_assetid, a hidden field,
        // of id AB_1294_ASSET_BUILDER_ADDITIONAL_LOCATIONS will be populated. If user decides to switch suppliers, this field should be updated as well.
        $supplier_assetid_field.add("#AB_1294_ASSET_BUILDER_ADDITIONAL_LOCATIONS").val(supplier_assetid); //Caution. Hardcoded
        //$supplier_review_name_field.val( supplier_name + " - Review");

        // Get data from wysiwyg iframe body and paste into related textarea
        $(".sq-wysiwyg-standalone-body").each(function (index) {

            var $this = $(this);
            var iframe_contents = $this.find(".htmlarea iframe").contents().find("body").html();
            var $textarea = $this.find("textarea");

            $textarea.val(iframe_contents);
        });

        form.submit();
    }

    function initFieldDependencies() {

        // Make organisation mandatory if "Other" is selected as Department
        $supplier_review_department_dropdown.change(function () {
            if ($(this).val() !== null) {
                if ($(this).val().toLowerCase() === "other") {
                    //Caution: Hardcoded value
                    $organisation_input.prop("required", "true");
                    $organisation_label.append($required_abbr.clone());
                } else {
                    $organisation_input.prop("required", false);
                    $organisation_label.find("abbr").remove();
                }
            }
        }).change();
    }
};

if ($('.qgcio-user_edit-tabbed').length > 0) {

    var action = $('#main_form').attr('action');

    $('.tmp_tabs-menu a').each(function () {

        var $title = $(this);

        if ($title.data('tabs') == 'not-loaded') {

            $title.click(function (event) {

                $title.closest('.tmp_tabs').find('.active').removeClass('active'); // Remove active class from tab and content container
                $title.parent('li').addClass('active'); // Add active class to tab
                $title.closest('.tmp_tabs').find($title.attr('href')).addClass('active'); // Add active class to content container

                // Update action attribute on form so that when submitted,
                // next page url will have the get paramter which will determine which tab to load
                var currentTab = $title.attr('href').replace("#", "");
                $(this).closest('form').attr('action', action + "?active-tab=" + currentTab);

                event.preventDefault(); // Prevent jumping to local link
            });

            $title.attr('data-tabs', 'loaded');
        }
    });

    // Show initial tab
    var initial_active_tab = $("[data-active-tab]").data("active-tab"); // Get value from data attribute thats populated by %globals_get_active-tab%

    if (initial_active_tab.length) {
        $("[href='#" + initial_active_tab + "']").click();
    };
}

// If user is visiting account page directly, remove register form
qgcio.fn.removeRegisterForm = function ($local_user_register_form) {
    $local_user_register_form.remove();
};

// Whenever a user logs out, we want JS to
// ---- Clear the user's local storage of watching/notifications
qgcio.fn.initLogoutButton = function ($logout_buttons) {

    if (squiz.fn.canUseBrowserStorage()) {
        $logout_buttons.click(function () {
            qgcio.fn.removeWatchingStorage();
        });
    }
};

qgcio.fn.removeWatchingStorage = function () {
    squiz.fn.removeLocalObject("watchlist");
    squiz.fn.removeSessionObject("unread");
};

// Function: Sets up the local user registration form functionality (#524)
qgcio.fn.initLocalUserRegisterForm = function () {

    // If user registration button exists
    if ($(".user__register_button").length) {

        // Initiate pop up and form functionality
        $(".user__register_button").magnificPopup({

            type: 'ajax',
            closeOnBgClick: false,
            closeBtnInside: true,
            alignTop: true,
            fixedContentPos: true,

            closeMarkup: '<button title="Close (Esc)" type="button" class="mfp-close">' + '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 39 38">' + '<path fill="#C80400" fill-rule="evenodd" d="M19.704 17.327L3.77 1.392 3.063.685 1.649 2.1l.707.708L18.29 18.74 1.644 35.387l-.707.707 1.414 1.414.707-.707 16.646-16.646L36.35 36.801l.708.707 1.414-1.414-.707-.707-16.646-16.646L37.053 2.807l.707-.708L36.346.685l-.707.707-15.935 15.935z"/>' + '</svg>' + '</button>',

            callbacks: {

                parseAjax: function parseAjax(mfpResponse) {

                    var $form = $(mfpResponse.data); // Get jQuery object of form returned from ajax defined in href attribute of anchor

                    var form_submit_url = $form.attr("action"); // Get form submit url for ajax post later
                    var $form_submit_button = $form.find("#sq_commit_button"); // Get form submit button

                    // Turn off default js matrix form functionality. Otherwise, jQuery validate Won't WORK!
                    $form.prop('onsubmit', null); // Turn off default js matrix functionality - submit
                    $form_submit_button.prop('onclick', null); // Turn off default js matrix functionality - onclick

                    // Store field ids (Found by inspecting element of page)
                    var field_ids = {
                        username: "simple_edit_user_0_427",
                        password: "simple_edit_user_0_434_one",
                        email: "simple_edit_user_0_429",
                        department: "metadata_field_select_1321",
                        organisation: "metadata_field_text_495_value"
                    };

                    // Make organisation required if department selected is other
                    var $organisation_input = $form.find("#" + field_ids["organisation"]);
                    var $organisation_label = $organisation_input.parent().parent().find("label");

                    $form.find("#" + field_ids["department"]).change(function () {

                        if ($(this).val().toLowerCase() == "other") {
                            //Caution: Hardcoded value
                            $organisation_input.prop("required", "true");
                            $organisation_label.append($required_abbr.clone());
                        } else {
                            $organisation_input.prop("required", false);
                            $organisation_label.find("abbr").remove();
                        }
                    });

                    // Populate the username field with email address value as its being typed
                    // Copy and paste and undo are taken care of as well
                    $form.find("#" + field_ids["email"]).on('keyup keypress blur change', function (e) {
                        $("#" + field_ids["username"]).val($(this).val()).blur();
                    });

                    // Add class for styling purposes and remove login form brought in from account manager
                    $form.addClass("sq-form").find(".qgcio_login-wrapper").remove();

                    // Jquery validate default email validation allows inputs such as abc@domain.
                    // Used an alternative pattern to make sure its like abc@domain.com
                    // This is applied by adding to email field as data-rule-validate_email against the email field in asset #845
                    $.validator.addMethod("validate_email", function (value, element) {

                        if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(value)) {
                            return true;
                        } else {
                            return false;
                        }
                    }, "Please enter a valid email address");

                    // Setup jQuery validate on form
                    $form.validate({

                        focusInvalid: false,
                        errorPlacement: function errorPlacement(error, element) {
                            if (element.attr("type") == "checkbox") {
                                error.appendTo(element.parent());
                            } else {
                                error.insertAfter(element);
                            }
                        },

                        // On successful validation
                        submitHandler: function submitHandler(form) {

                            var $magnific_close_button = $(".mfp-close"); // Get current magnific popup close button
                            $form_submit_button.add($magnific_close_button).prop("disabled", true); // Disable popup close button and submit button
                            $form.find(".error").remove(); // Remove all existing errors (jQuery Validate and matrix supplied)

                            $.post(form_submit_url, $(form).serialize(), function (result) {

                                // On success post (this doesn't mean account has been created yet!)
                                var $error_result = $(result).find(".error"); // Check if returned account manager html contains "matrix supplied error list"

                                // If error list exists
                                if ($error_result.length) {

                                    var error_object = {}; // Prepare to categories errors according to "username" and "password"

                                    // Go through each error in list
                                    $error_result.find("li").each(function (index) {

                                        var error_text = $(this).text();
                                        var error_text_lowercase = error_text.toLowerCase();

                                        if (error_text_lowercase != "unable to create a user without a username and password") {

                                            if (error_text_lowercase.indexOf("username") > -1) {

                                                // If li contains the text "username"
                                                if (error_object.username === undefined) {
                                                    error_object.username = [];
                                                }

                                                if (error_text.indexOf("another asset already uses") > -1) {
                                                    error_text = "Email address/Username is taken.";
                                                    error_object.username.push(error_text); // Add error to array in error_object
                                                }
                                            } else if (error_text_lowercase.indexOf("password") > -1) {

                                                // If li contains the text "password"
                                                if (error_object.password === undefined) {
                                                    error_object.password = [];
                                                }

                                                error_object.password.push(error_text); // Add error to array in error_object
                                            }
                                        }
                                    });

                                    // If there are username or password errors reported by Matrix
                                    if (Object.keys(error_object).length) {

                                        var field_name = Object.keys(error_object);
                                        for (field_name in error_object) {

                                            if (error_object.hasOwnProperty(field_name)) {

                                                var field_id = field_ids[field_name];
                                                var $field = $("#" + field_id);

                                                // Add error label below targeted field (supported by field_ids declared above)
                                                $('<label/>', {
                                                    "for": field_id,
                                                    "class": "error",
                                                    "text": error_object[field_name].join(", ")
                                                }).insertAfter($field);

                                                if (field_name == "password") $(".password-fields").find("input").addClass("error");else {
                                                    $field.addClass("error");
                                                }
                                            }
                                        }
                                    }
                                } else {

                                    // Update pop up to show success message returned by Matrix

                                    $form.find(".form-title").text("Registration Successful").siblings().remove(); // Update h1 and remove form fields

                                    var $success_result = $(result).find(".success_msg"); // Get success message in html returned by post

                                    $form.append($success_result); // Append success message to popup

                                    $(".mfp-wrap").scrollTop(0); // Scroll to Top
                                }
                            }).fail(function () {

                                // For debugging purposes. Leave commented if POST is working fine
                                //console.log("Failed to create user. POST to account manager failed");

                            }).always(function () {
                                $form_submit_button.add($magnific_close_button).prop("disabled", false); // Re-enable modal close and submit button
                            });
                        }

                    });

                    // Set modified content to be appended to DOM
                    mfpResponse.data = $form;
                },
                ajaxContentAdded: function ajaxContentAdded() {
                    $(this.content).wrap("<div class='white-popup'></div>"); // Wrap for css purposes
                }

            }

        });
    }
};

// Function: Set up local user edit form which allows logged in user to edit their profile
qgcio.fn.initLocalUserEditForm = function () {

    var $form = $('#main_form'); // Get form
    var form_submit_url = $form.attr("action"); // Get form submit url for ajax post later
    var $form_submit_button = $form.find("#sq_commit_button"); // Get form submit button

    // Store field ids (Found by inspecting element of page)
    var field_ids = {
        department: "metadata_field_select_1321",
        organisation: "metadata_field_text_495_value"
    };

    // Create required abbr for dynamic insertion
    var $required_abbr = $('<abbr/>', {
        "title": "required",
        "class": "sq-form-required-field",
        "text": "*"
    });

    // Make organisation required if department selected is other
    var $organisation_input = $form.find("#" + field_ids["organisation"]);
    var $organisation_label = $organisation_input.parent().parent().find("label");

    $form.find("#" + field_ids["department"]).change(function () {

        if ($(this).val().toLowerCase() == "other") {
            //Caution: Hardcoded value
            $organisation_input.prop("required", "true");
            $organisation_label.append($required_abbr.clone());
        } else {
            $organisation_input.prop("required", false);
            $organisation_label.find("abbr").remove();
        }
    });

    $form.find("#" + field_ids["organisation"]).change(function () {
        qgcio.fn.validateOrganisationForm($(this));
    });

    // Turn off default js matrix form functionality. Otherwise, jQuery validate Won't WORK!
    $form.prop('onsubmit', null); // Turn off default js matrix functionality - submit
    $form_submit_button.prop('onclick', null); // Turn off default js matrix functionality - onclick

    // Setup jQuery validate on form
    $form.validate({

        focusInvalid: false,
        errorPlacement: function errorPlacement(error, element) {
            if (element.attr("type") == "checkbox") {
                error.appendTo(element.parent());
            } else {
                error.insertAfter(element);
            }
        },

        // On successful validation
        submitHandler: function submitHandler(form) {

            form.submit();
        }

    });
};

// Function: Currently in use by qgcio.fn.initLocalUserEditForm
qgcio.fn.validateOrganisationForm = function (field) {

    // Make organisation required if department selected is other

    var field_ids = {
        department: "metadata_field_select_1321"
    };

    var $organisation_input = $(field);
    var $organisation_label = $organisation_input.parent().parent().find("label");
    var $bSquizAdminGroup = $('div.sq-form').data('group'); // Used to determine if the user is in the MAtrix Admin user group https://jira.squiz.net/browse/QGCIO-188

    if (!$bSquizAdminGroup) {
        // Do a check to see if a Squiz Admin User
        if ($("#" + field_ids["department"]).val().toLowerCase() == "other" && !$organisation_input.prop('required')) {
            //Caution: Hardcoded value
            // set attr to be required
            $organisation_input.prop("required", "true");
            $organisation_label.append($required_abbr.clone());
        } else if ($("#" + field_ids["department"]).val().toLowerCase() == "other" && $organisation_input.prop('required')) {// // do nothing because it should already have the attr required

        } else {
            // set attr to not be required
            $organisation_input.prop("required", false);
            $organisation_label.find("abbr").remove();
        }
    }
};

/*
    John's JS
*/
qgcio.fn.initLocalUserLoginForm = function (event) {
    // console.log("Initiating Local User Login Form");

    if ($(".user__signin_button").length) {

        // console.log("Setting up Local User Login Form");

        var magnificPopup = $.magnificPopup.instance;
        var $form;
        $(".user__signin_button").magnificPopup({
            type: 'ajax',
            closeOnBgClick: false,
            closeBtnInside: true,
            alignTop: true,
            fixedContentPos: true,
            overflowY: 'hidden',
            closeMarkup: '<button title="Close (Esc)" type="button" class="mfp-close">' + '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 39 38">' + '<path fill="#C80400" fill-rule="evenodd" d="M19.704 17.327L3.77 1.392 3.063.685 1.649 2.1l.707.708L18.29 18.74 1.644 35.387l-.707.707 1.414 1.414.707-.707 16.646-16.646L36.35 36.801l.708.707 1.414-1.414-.707-.707-16.646-16.646L37.053 2.807l.707-.708L36.346.685l-.707.707-15.935 15.935z"/>' + '</svg>' + '</button>',
            callbacks: {
                parseAjax: function parseAjax(mfpResponse) {

                    // mfpResponse.data is a "data" object from ajax "success" callback
                    // for simple HTML file, it will be just String
                    // You may modify it to change contents of the popup
                    // For example, to show just #some-element:
                    // mfpResponse.data = $(mfpResponse.data).find('#some-element');

                    // mfpResponse.data must be a String or a DOM (jQuery) element

                    $form = $(mfpResponse.data);
                    $form.find(".local-user-register-form").remove();

                    $form.addClass("sq-form");
                    $form.find('#SQ_LOGIN_SUBMIT').addClass('button button-blue');

                    $form.validate({
                        rules: {

                            SQ_LOGIN_USERNAME: "required",
                            SQ_LOGIN_PASSWORD: "required"
                        },
                        submitHandler: function submitHandler(form) {
                            var serializedData = $(form).serialize();
                            $.ajax({
                                url: $(form).attr('action') + '?SQ_ASSET_CONTENTS_RAW',
                                type: "POST",

                                data: serializedData,
                                success: function success(response) {
                                    var $responseHTML = $('<div class="white-popup"></div>');
                                    $($responseHTML).html(response);
                                    var $elFormNEW = $($responseHTML).find('#page_account_manager_524');

                                    $elFormNEW.find(".local-user-register-form").remove();

                                    $responseHTML.html($elFormNEW);
                                    var sNewKey = $elFormNEW.find('input[name="SQ_LOGIN_KEY"]').val();

                                    if (sNewKey == null) {
                                        window.location.reload();
                                        // console.log('sReLoading:');
                                    } else {
                                        var $error = $elFormNEW.find('.error');
                                        var sOldKey = $form.find('input[name="SQ_LOGIN_KEY"]').val(sNewKey);
                                        // console.log(sNewKey);
                                        if ($form.find('.error').length === 0) {
                                            $form.find('h1').after($error);
                                        } else {
                                            $($form.find('.error')).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
                                        }
                                    }
                                }
                            });
                        }
                    });

                    // Set modified content to be appended to DOM
                    mfpResponse.data = $form;
                },
                ajaxContentAdded: function ajaxContentAdded() {
                    $(this.content).wrap("<div class='white-popup'></div>");
                }
            }
        });
    }
};

qgcio.fn.backToTop = function () {

    $('.footer .back-to-top').click(function (e) {
        e.preventDefault();

        $('html, body').animate({ scrollTop: 0 }, 1200);
    });
    $(window).scroll(function () {
        var scrollPos = $(document).scrollTop();
        var htmlHeight = $(window).height();

        if (scrollPos > htmlHeight) {
            $('.footer .back-to-top').removeClass('hide');
        } else {
            $('.footer .back-to-top').addClass('hide');
        }
    });
};

/*
    Ready
*/

$(document).ready(function () {

    if ($(".local-user-register-form").length) {
        qgcio.fn.removeRegisterForm($(".local-user-register-form"));
    }

    if ($("[href~='?SQ_ACTION=logout']").length) {
        qgcio.fn.initLogoutButton($("[href~='?SQ_ACTION=logout']"));
    }

    if ($(".search-results__title").length) {
        qgcio.fn.initPaginationClick($(".search-results__title"));
    }

    if ($('.search-results__layout').length > 0) {
        $('body').on('click', '.search-results__filer-apply', qgcio.fn.filterResultsByFacets);
    }

    if ($('.qgcio-quicklinks__link-watch').length > 0) {
        qgcio.fn.setJSAPI();
        qgcio.fn.getUserWatchlist();
    }

    if ($('.access .qgcio__user-content').length > 0) {

        qgcio.fn.getUnreadMessages();
    }

    $('body').on('click', '.qgcio-quicklinks__link-watch', qgcio.fn.watchContentHandler);
    //$('body').on('click', '.content__toggler', qgcio.fn.clearUpdateList);


    if ($('.aside__navigation').length > 0) {
        qgcio.fn.asideNav();
    }

    $('body').on('click', '.qgcio-quicklinks__link-print', qgcio.fn.quicklinksPrint);

    if ($('#aside-canvas').length > 0) {
        //qgcio.fn.googleMapInit();
    }

    if ($('.search-results__layout').length > 0) {
        //qgcio.fn.updateSearchSortDisplay();
        $('body').on('click', '.search-results__sort-apply', qgcio.fn.sortResults);
        qgcio.fn.initAutocomplete('.search-results__input');
    }

    if ($('.qgcio-info-pane').length > 0) {
        qgcio.fn.initHomeEqualHeights();
    }

    $('body').on('click', '.media-tabs_link', qgcio.fn.initHomeEqualHeights);

    if ($('#other-languages').length > 0) {
        qgcio.fn.otherLanguagesSwitcher();
    }

    if ($('.my__watching').length > 0) {
        qgcio.fn.orderWatching();
    }

    if ($('.search-results__layout').length > 0) {
        $('body').on('click', '.search-results__tabs-title', qgcio.fn.filterResultsByCollection);
        $('body').on('click', '.results__pagination a', qgcio.fn.paginateResults);
        //$('body').on('click', '.search-results__filer-apply', qgcio.fn.filterResultsByFacets);
        //$('body').on('click', '.search-results__sort-apply', qgcio.fn.sortResults);
        //qgcio.fn.updateSearchSortDisplay();
        //qgcio.fn.initAutocomplete('.search-results__input');
    }

    if ($('.qgcio_local-login-form').length > 0) {
        $('body').on('click', '.qgcio-local-user-button', qgcio.fn.loginButtons);
        if ($('.qgcio_local-login-form .error').text().length > 0) {
            //trigger click if login pages loads with errors
            $('.qgcio-local-user-button').trigger('click');
        }
    }

    if ($('#content-search__form').length > 0) {
        qgcio.fn.initAutocomplete('.content-search__input');
    }

    $(".policy .aside__navigation__list").tableOfContents($(".main__content"), // Default scoping
    {
        startLevel: 1, // H1
        depth: 3, // H1 through H4
        proportionateSpacing: true, // Spacing On
        levelClass: "aside__navigation__lvl-%"
    });

    $('.policy .navigation__sub-list-item ul').each(function () {
        if (!$(this).parents('.navigation__sub-list-item').hasClass('navigation_has-subs')) {
            $(this).parents('.navigation__sub-list-item').addClass('navigation_has-subs');
            $(this).parents('.navigation__sub-list-item').append('<a href="#" class="aside__navigation__toggler"><i class="fa fa-angle-down" aria-hidden="true"></i><span class="visuallyhidden">Expand navigation</span></a>');
        }
    });

    $('.policy .navigation__sub-list-item ul').each(function () {
        $(this).addClass('aside__navigation__lvl-2');
    });

    if (typeof qgcio.navigationAside != 'undefined') {
        qgcio.navigationAside.initAsideAnchorNav('.aside__anchor-menu');
    }

    $('[data-toggle="tooltip"]').tooltip();

    qgcio.fn.initClearAsideFilters(); // Initialise clear filters button on aside
    qgcio.fn.initLocalUserRegisterForm(); // Initialise local user account manager form functionality
    qgcio.fn.initSupplierReviewForm(); // Initialise supplier review asset builder form functionality
    qgcio.fn.initQrateSearch(); // Initialise QRate search functionality

    if ($('#main_form').length > 0) {
        var field_ids = {
            organisation: "metadata_field_text_495_value"
        };

        qgcio.fn.validateOrganisationForm($(this).find("#" + field_ids["organisation"]));

        qgcio.fn.initLocalUserEditForm(); // Initialise local user edit form functionality
    }

    qgcio.fn.initLocalUserLoginForm();

    //Funnelback pagination
    if ($('.search-results__listing .pagination__list').length > 0) {
        if (window.location.href.split('?').length <= 1) {
            if ($('.search-results__container').html() !== null) {
                var sPageTitle = $('title').html();
                qgcio.fn.updateSearchResults($('.search-results__container').html(), undefined, window.location.href.split('?')[0], sPageTitle);
            }
        }
        // THIS EVENT MAKES SURE THAT THE BACK/FORWARD BUTTONS WORK AS WELL
        // Updated for JIRA SDQLD-1246
        window.onpopstate = function (event) {
            if (window.history.state === null) {
                //                 history.go(-2);
                //                 qgcio.fn.updateSearchResults(event.state.html, true);
                event.preventDefault();
            } else {
                console.log("data: " + event.state.html);
                qgcio.fn.updateSearchResults(event.state.html, true);
                event.preventDefault();
            }
        };
    }
    //Qrate pagination
    if ($('.qrate__content .pagination__list').length > 0) {
        if (window.location.href.split('?').length <= 1) {
            if ($('.qrate__content .table-responsive').html() !== null) {
                var sPageTitle = $('title').html();
                qgcio.fn.performSearch($('.qrate__content .table-responsive').html(), undefined, window.location.href.split('?')[0], sPageTitle);
            }
        }
        // THIS EVENT MAKES SURE THAT THE BACK/FORWARD BUTTONS WORK AS WELL
        // Updated for JIRA SDQLD-1246
        window.onpopstate = function (event) {
            if (window.history.state === null) {
                //                 history.go(-2);
                //                 qgcio.fn.updateSearchResults(event.state.html, true);
                event.preventDefault();
            } else {
                console.log("data: " + event.state.html);
                qgcio.fn.performSearch(event.state.html, true, undefined, undefined);
                event.preventDefault();
            }
        };
    }
    if ($(".footer .back-to-top").length) {
        qgcio.fn.backToTop();
    }
});

qgcio.navigation = {
    'firstInit': true,
    'mobileInitialised': false,
    'desktopInitialised': false,
    'init': function init() {

        switch (qgcio.vars.screensize) {
            case 1:
                // mobile
                if (!qgcio.navigation.mobileInitialised) {
                    qgcio.navigation.initMobileNav();
                }
                break;
            case 2:
                // tablet

                if (!qgcio.navigation.mobileInitialised) {
                    qgcio.navigation.initMobileNav();
                }
                break;
            case 3:
                // desktop
                if (!qgcio.navigation.desktopInitialised) {
                    qgcio.navigation.initDesktopNav();
                }
                break;
            default:
                break;
        }

        //$('body').on('click', '.navigation__toggler', qgcio.navigation.toggleMenuItem);
        $('body').on('click', '.navigation__toggle', qgcio.navigation.displayMobileNav);
    },
    'initMobileNav': function initMobileNav() {
        var nav = $('.navigation__list');
        $('.navigation__list').hide();
        setTimeout(function () {
            $('.navigation__list').removeAttr('style');
        }, 500);

        // initialise the accordion navigation
        $('.navigation__list').each(function () {
            var $this = $(this);
            if (!$this.hasClass('nav_initialised')) {
                $this.addClass('nav_initialised');
                $this.find('ul').each(function () {
                    var thisUL = $(this);
                    thisUL.parent().addClass('navigation_has-subs');
                    $('<a href="#" class="navigation__toggler"><i class="fa fa-angle-down" aria-hidden="true"></i>' + '<span class="visuallyhidden">Expand navigation</span></a>').appendTo(thisUL.parent());
                });
            }
        });
        $('body').on('click', '.navigation__toggler', qgcio.navigation.toggleMenuItem);
        qgcio.navigation.mobileInitialised = true;
    },
    'displayMobileNav': function displayMobileNav(e) {
        e.preventDefault();
        var activeTarget = $(this).data('target');
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $('.qgcio__user-icon').removeClass('active');
            $(activeTarget).removeClass('active');
            qgcio.utils.removeFullScreenMode();
        } else {
            $(this).addClass('active');
            $(activeTarget).addClass('active');
            $('.qgcio__user-icon').removeClass('active');
            qgcio.utils.toggleFullScreenMode();
        }
    },
    'hideMobileNav': function hideMobileNav() {
        var activeTarget = $(this).data('target');
        $('.navigation__list, .navigation__toggle').removeClass('active');
        qgcio.utils.removeFullScreenMode();
    },
    'initDesktopNav': function initDesktopNav() {
        var item = $('.navigation__list');
        if (!item.hasClass('desktop_nav_initialised')) {

            item.addClass('desktop_nav_initialised');
            var settings = {
                menuHoverClass: 'show-menu'
            };

            // Add ARIA role to menubar and menu items
            item.attr('role', 'menubar').find('li').attr('role', 'menuitem');

            var top_level_links = item.find('> li > a');

            // Set tabIndex to -1 so that top_level_links can't receive focus until menu is open
            $(top_level_links).next('ul').attr({ 'aria-hidden': 'true', 'role': 'menu' }).find('a').attr('tabIndex', -1);

            // Adding aria-haspopup for appropriate items
            $(top_level_links).each(function () {
                if ($(this).next('ul').length > 0) $(this).parent('li').attr('aria-haspopup', 'true');
            });

            $(top_level_links).hover(function () {
                $(this).closest('ul').attr('aria-hidden', 'false').find('.' + settings.menuHoverClass).attr('aria-hidden', 'true').removeClass(settings.menuHoverClass).find('a').attr('tabIndex', -1);
                $(this).next('ul').attr('aria-hidden', 'false').addClass(settings.menuHoverClass).find('a').attr('tabIndex', 0);
            });

            $(top_level_links).focus(function () {
                $(this).closest('ul').find('.' + settings.menuHoverClass).attr('aria-hidden', 'true').removeClass(settings.menuHoverClass).find('a').attr('tabIndex', -1);

                $(this).next('ul').attr('aria-hidden', 'false').addClass(settings.menuHoverClass).find('a').attr('tabIndex', 0);
            });

            // Bind arrow keys for navigation
            $(top_level_links).keydown(function (e) {
                if (e.keyCode == 37) {
                    e.preventDefault();
                    // This is the first item
                    if ($(this).parent('li').prev('li').length == 0) {
                        $(this).parents('ul').find('> li').last().find('a').first().focus();
                    } else {
                        $(this).parent('li').prev('li').find('a').first().focus();
                    }
                } else if (e.keyCode == 38) {
                    e.preventDefault();
                    if ($(this).parent('li').find('ul').length > 0) {
                        $(this).parent('li').find('ul').attr('aria-hidden', 'false').addClass(settings.menuHoverClass).find('a').attr('tabIndex', 0).last().focus();
                    }
                } else if (e.keyCode == 39) {
                    e.preventDefault();
                    // This is the last item
                    if ($(this).parent('li').next('li').length == 0) {
                        $(this).parents('ul').find('> li').first().find('a').first().focus();
                    } else {
                        $(this).parent('li').next('li').find('a').first().focus();
                    }
                } else if (e.keyCode == 40) {
                    e.preventDefault();
                    if ($(this).parent('li').find('ul').length > 0) {
                        $(this).parent('li').find('ul').attr('aria-hidden', 'false').addClass(settings.menuHoverClass).find('a').attr('tabIndex', 0).first().focus();
                    }
                } else if (e.keyCode == 13 || e.keyCode == 32) {
                    // If submenu is hidden, open it
                    e.preventDefault();
                    $(this).parent('li').find('ul[aria-hidden=true]').attr('aria-hidden', 'false').addClass(settings.menuHoverClass).find('a').attr('tabIndex', 0).first().focus();
                } else if (e.keyCode == 27) {
                    e.preventDefault();
                    $('.' + settings.menuHoverClass).attr('aria-hidden', 'true').removeClass(settings.menuHoverClass).find('a').attr('tabIndex', -1);
                } else {
                    $(this).parent('li').find('ul[aria-hidden=false] a').each(function () {
                        if ($(this).text().substring(0, 1).toLowerCase() == qgcio.keyCodeMap[e.keyCode]) {
                            $(this).focus();
                            return false;
                        }
                    });
                }
            });

            var links = $(top_level_links).parent('li').find('ul').find('a');
            $(links).keydown(function (e) {
                if (e.keyCode == 38) {
                    e.preventDefault();
                    // This is the first item
                    if ($(this).parent('li').prev('li').length == 0) {
                        $(this).parents('ul').parents('li').find('a').first().focus();
                    } else {
                        $(this).parent('li').prev('li').find('a').first().focus();
                    }
                } else if (e.keyCode == 40) {
                    e.preventDefault();
                    if ($(this).parent('li').next('li').length == 0) {
                        $(this).parents('ul').parents('li').find('a').first().focus();
                    } else {
                        $(this).parent('li').next('li').find('a').first().focus();
                    }
                } else if (e.keyCode == 27 || e.keyCode == 37) {
                    e.preventDefault();
                    $(this).parents('ul').first().prev('a').focus().parents('ul').first().find('.' + settings.menuHoverClass).attr('aria-hidden', 'true').removeClass(settings.menuHoverClass).find('a').attr('tabIndex', -1);
                } else if (e.keyCode == 32) {
                    e.preventDefault();
                    window.location = $(this).attr('href');
                } else {
                    var found = false;
                    $(this).parent('li').nextAll('li').find('a').each(function () {
                        if ($(this).text().substring(0, 1).toLowerCase() == qgcio.keyCodeMap[e.keyCode]) {
                            $(this).focus();
                            found = true;
                            return false;
                        }
                    });

                    if (!found) {
                        $(this).parent('li').prevAll('li').find('a').each(function () {
                            if ($(this).text().substring(0, 1).toLowerCase() == qgcio.keyCodeMap[e.keyCode]) {
                                $(this).focus();
                                return false;
                            }
                        });
                    }
                }
            });

            // Hide menu if click or focus occurs outside of navigation
            item.find('a').last().keydown(function (e) {
                if (e.keyCode == 9) {
                    // If the user tabs out of the navigation hide all menus
                    $('.' + settings.menuHoverClass).attr('aria-hidden', 'true').removeClass(settings.menuHoverClass).find('a').attr('tabIndex', -1);
                }
            });
            $(document).click(function () {
                $('.' + settings.menuHoverClass).attr('aria-hidden', 'true').removeClass(settings.menuHoverClass).find('a').attr('tabIndex', -1);
            });
            item.click(function (e) {
                e.stopPropagation();
            });
        }
        qgcio.navigation.desktopInitialised = true;
    },
    'toggleMenuItem': function toggleMenuItem(e) {
        e.preventDefault();
        $(this).parent('li').find('> ul').toggleClass('active');
        $(this).find('i').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
    }

};
qgcio.navigation.init();
qgcio.globalSearch = {
    'init': function init() {

        $('.search_toggler').magnificPopup({
            type: 'inline',
            focus: '#global-search__query',
            'closeOnBgClick': false,
            'closeBtnInside': true,
            'alignTop': true,
            'fixedContentPos': true,
            'overflowY': 'hidden',
            'closeMarkup': '<button title="Close (Esc)" type="button" class="mfp-close">' + '<svg class="mfp-close" width="100" height="100" viewBox="-3 13 30 30">' + '<g>' + '<path fill="#fff" d="M14.414 13l14.142 14.142-1.414 1.414L13 14.414z"/>' + '<path fill="#fff" d="M27.142 13L13 27.142l1.414 1.414 14.142-14.142z"/>' + '</g>' + '</svg>' + '</button>',
            callbacks: {
                open: function open() {
                    $('body').addClass('search-modal');
                    qgcio.fn.initAutocomplete('.global-search__input');
                },
                close: function close() {
                    $('body').removeClass('search-modal');
                }
            }
        });
    }
};
qgcio.globalSearch.init();

qgcio.grids = {
    'init': function init() {
        var grids = $('.content-grid > .row');
        grids.each(function () {
            $(this).find('> li:nth-child(3n)').each(function () {
                var $this = $(this);
                $('<li class="clearfix"></li>').insertAfter($(this));
            });
        });
    },
    'setHeights': function setHeights() {
        var height = 0;
        var grid_items = $('.content-grid .content-grid__item');
        grid_items.css('height', 'auto');
        grid_items.each(function () {
            var thisHeight = $(this).height();
            if (thisHeight > height) {
                height = thisHeight;
            }
        });
        grid_items.css('height', height);
    }
};
qgcio.grids.init();

qgcio.mediaTabs = {
    'init': function init() {
        $('.media-tab:not(":first")').addClass('media-tab__hidden');
        $('.media-tabs-options a:first').addClass('active');
        $('body').on('click', '.media-tabs_link', qgcio.mediaTabs.click);
    },
    'click': function click(e) {
        e.preventDefault();
        if (!$(this).hasClass('active')) {
            $(this).parents('.media-tabs-options').find('.active').removeClass('active');
            $(this).addClass('active');
            $('.media-tab:not(".media-tab__hidden")').addClass('media-tab__hidden');
            $('.media-tab[data-rel="' + $(this).data('target') + '"]').removeClass('media-tab__hidden');
        }
    }
};
qgcio.mediaTabs.init();

qgcio.quicklinks = {
    'init': function init() {
        $('body').on('click touchstart', '.qgcio-quicklinks__link-share', qgcio.quicklinks.activate);
        $(".resp-sharing-button__link").bind('touchstart', function (event) {
            event.stopPropagation();
        });
        $("#yj-share-button").bind('touchstart', function (event) {
            event.stopPropagation();
        });
    },
    'activate': function activate() {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
        } else {
            $('.qgcio-quicklinks__link').each(function () {
                $(this).removeClass('active');
            });
            $(this).addClass('active');
        }
    }
};

qgcio.quicklinks.init();

$(document).click(function (event) {
    if ($(event.target).closest(".qgcio-quicklinks__link-share").length === 0) {
        if ($(".qgcio-quicklinks__link-share").hasClass("active")) {
            $('.qgcio-quicklinks__link-share').each(function () {
                $(this).removeClass('active');
            });
        }
    }

    if ($(event.target).closest('.qgcio__user').length === 0) {
        if ($(".qgcio__user-content").hasClass("active")) {
            $('.qgcio__user-content').toggleClass("active");
            $('.qgcio__user-icon').toggleClass("active");
        }
    }
});

qgcio.search = {
    'init': function init() {
        // is the search active? eg: someone has ran the search
        // check for the Funnelback 'query' get param
        qgcio.search.searchState();

        $('body').on('click', '.search-results__clear-search', qgcio.search.resetForm);
        $('body').on('click', '.search-results__options-toggler', qgcio.search.displayToggle);
    },
    'searchState': function searchState() {
        // the main search form object
        var searchForm = $('.search-results__form');
        // look for the query param in the url
        var urlSearch = window.location.search.substring(1);
        var checkForSearchParam = urlSearch.indexOf('query');

        if (checkForSearchParam >= 0) {
            /* if it's there, and it has a value, add an active class. CSS drives the display, toggling the 'reset' or 'search' buttons */
            qgcio.search.formData = qgcio.search.filterGetParams(urlSearch);
            if (qgcio.search.formData.query.length > 0) {
                searchForm.addClass('search-results__active');
            }
            if (typeof qgcio.search.formData.displayType != 'undefined' && qgcio.search.formData.displayType.length > 0) {
                $('.search-results__options-toggler[data-display-type="' + qgcio.search.formData.displayType + '"]').trigger('click');
            }
        }
    },
    'resetForm': function resetForm(e) {
        e.preventDefault();
        $('.search-results__form').removeClass('search-results__active');
        $('.search-results__form input[name="query"]').val('').focus();
    },
    'displayToggle': function displayToggle(e) {
        e.preventDefault();
        var layoutSelector = $('.search-results__layout');
        var displayType = $(this).data('display-type');
        if (displayType == 'list') {
            layoutSelector.removeClass('search-results__show-grid-view').addClass('search-results__show-list-view');
        } else {
            layoutSelector.removeClass('search-results__show-list-view').addClass('search-results__show-grid-view');
        }

        $('.search-results__form [name="displayType"]').val(displayType);
    },
    /*
    * thanks to https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
    // returns an object
    */
    'filterGetParams': function filterGetParams(query) {
        var vars = query.split("&");
        var query_string = {};
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }

};

qgcio.search.init();

/*(function($){
    'use strict';

    // Sample of how you might invoke your jQuery Plugin
    $(".policy .aside__navigation__list").tableOfContents(
		$(".main__content"),	// Default scoping
		{
			startLevel:           1,   // H1
			depth:                3,   // H1 through H4
			proportionateSpacing: true, // Spacing On
			levelClass:           "aside__navigation__lvl-%"
		}); 

		$('.policy .navigation__sub-list-item ul').each(function(){
			if(!$(this).parents('.navigation__sub-list-item').hasClass('navigation_has-subs')){
			    $(this).parents('.navigation__sub-list-item').addClass('navigation_has-subs');
			    $(this).parents('.navigation__sub-list-item').append('<a href="#" class="aside__navigation__toggler"><i class="fa fa-angle-down" aria-hidden="true"></i><span class="visuallyhidden">Expand navigation</span></a>');
			}
		});

		$('.policy .navigation__sub-list-item ul').each(function(){
			$(this).addClass('aside__navigation__lvl-2');
		});
		
}(jQuery));*/

qgcio.userPanel = {
    'init': function init() {
        qgcio.userPanel.contentListAccordion($('.qgcio__user-sections'), '.qgcio__user-content-list');
        $('body').on('click', '.qgcio__user-icon', qgcio.userPanel.displayUserPanel);
        $('body').on('click', '.content__toggler', qgcio.userPanel.toggleContentPanel);

        $('.user-modal').magnificPopup({
            type: 'inline',
            'closeOnBgClick': false,
            'closeBtnInside': true,
            'alignTop': true,
            'fixedContentPos': true,
            'overflowY': 'hidden',
            'closeMarkup': '<button title="Close (Esc)" type="button" class="mfp-close">' + '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 39 38">' + '<path fill="#C80400" fill-rule="evenodd" d="M19.704 17.327L3.77 1.392 3.063.685 1.649 2.1l.707.708L18.29 18.74 1.644 35.387l-.707.707 1.414 1.414.707-.707 16.646-16.646L36.35 36.801l.708.707 1.414-1.414-.707-.707-16.646-16.646L37.053 2.807l.707-.708L36.346.685l-.707.707-15.935 15.935z"/>' + '</svg>' + '</button>'
        });
    },
    'displayUserPanel': function displayUserPanel(e) {
        e.preventDefault();
        var activeTarget = $(this).data('target');
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $('.navigation__toggle').removeClass('active');
            $(activeTarget).removeClass('active');
            qgcio.utils.removeFullScreenMode();
        } else {
            $(this).addClass('active');
            $('.navigation__toggle').removeClass('active');
            $(activeTarget).addClass('active');
            qgcio.utils.toggleFullScreenMode();
        }
    },
    'contentListAccordion': function contentListAccordion(parent, childSelector) {
        parent.find('> li').each(function () {
            var $thisLi = $(this);

            if ($thisLi.find(childSelector).length > 0) {
                $thisLi.find(childSelector).addClass('content__toggler-content');
                var link = '<a href="#" class="content__toggler visuallyhidden">' + '<i class="fa fa-angle-down" aria-hidden="true"></i>' + '<span class="visuallyhidden">Expand navigation</span>' + '</a>';
                $(link).appendTo($thisLi);
            }
        });
    },
    'toggleContentPanel': function toggleContentPanel(e) {
        e.preventDefault();
        var $this = $(this);
        $this.toggleClass('active');
        $this.parent().find('.content__toggler-content').toggleClass('active');
        $this.find('i').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
    }
    // pass in parent element, and selector
};qgcio.userPanel.init();
//# sourceMappingURL=global.js.map
