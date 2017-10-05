/**
 * # Checks whether running on a mobile device according to browser data.
 * Functions (each returns bool):
 * * Android
 * * BlackBerry
 * * iPhone
 * * iPod
 * * iPad
 * * iOS
 * * Opera
 * * Windows
 * * Kindle Fire
 * * any
 * @example
 * isMobile.Android() => true/false
 * isMobile.iOS() => true/false
 * isMobile.any() => true/false
 * isMobile.KindleFire() => true/false
 * isMobile.BlackBerry() => true/false
 * Source: https://bitsrc.io/tomlandau/simple-js/global/is-mobile/code
 */

const isMobile = {
    getUserAgent: () => {
        return navigator.userAgent;
    },
    Android: function() {
        return /Android/i.test(isMobile.getUserAgent()) && !isMobile.Windows();
    },
    BlackBerry: function() {
        return /BlackBerry|BB10|PlayBook/i.test(isMobile.getUserAgent());;
    },
    iPhone: function() {
        return /iPhone/i.test(isMobile.getUserAgent()) && !isMobile.iPad() && !isMobile.Windows();
    },
    iPod: function() {
        return /iPod/i.test(isMobile.getUserAgent());
    },
    iPad: function() {
        return /iPad/i.test(isMobile.getUserAgent());
    },
    iOS: function() {
        return (isMobile.iPad() || isMobile.iPod() || isMobile.iPhone());
    },
    Opera: function() {
        return /Opera Mini/i.test(isMobile.getUserAgent());
    },
    Windows: function() {
        return /Windows Phone|IEMobile|WPDesktop/i.test(isMobile.getUserAgent());
    },
    KindleFire: function() {
        return /Kindle Fire|Silk|KFAPWA|KFSOWI|KFJWA|KFJWI|KFAPWI|KFAPWI|KFOT|KFTT|KFTHWI|KFTHWA|KFASWI|KFTBWI|KFMEWI|KFFOWI|KFSAWA|KFSAWI|KFARWI/i.test(isMobile.getUserAgent());
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

export default isMobile;