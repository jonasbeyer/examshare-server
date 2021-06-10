var gaProperty = 'UA-136850761-2';
var disableStr = 'ga-disable-' + gaProperty;
if (document.cookie.indexOf(disableStr + '=true') > -1)
    window[disableStr] = true;

window.dataLayer = window.dataLayer || [];
gtag('js', new Date());
gtag('config', gaProperty, {'anonymize_ip': true});

function gaOptout() {
    document.cookie = disableStr + '=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/';
    window[disableStr] = true;
    alert('Das Tracking durch Google Analytics wurde in Ihrem Browser für diese Website deaktiviert.');
}

function gtag() {
    dataLayer.push(arguments);
}