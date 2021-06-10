class Response {

    constructor(code, data, message = "") {
        this.code = code;
        this.message = message;
        this.data = data instanceof Array ? {Total: data[0], Items: data[1]} : data;
    }

    exportMessage() {
        return this.message;
    }

    merge(response) {
        Object.assign(this, response);
        return this;
    }

    replace(placeholder, text) {
        this.message = this.message.replace(placeholder, text);
        return this;
    }
}

module.exports = {
    Response: Response,
    SUCCESS: new Response(200),
    UPDATED_PASSWORD: new Response(200, undefined, "Das Passwort wurde aktualisiert."),
    VERIFIED_USER: new Response(200, undefined, "Benutzer erfolgreich verifiziert"),
    VERIFIED_EMAIL: new Response(200, undefined, "E-Mail-Adresse erfolgreich aktualisiert"),
    NOTIFICATION_SENT: new Response(200, undefined, "Die Benachrichtigung wurde an die ausgewählten Empfänger gesendet."),
    UPDATED_EMAIL: new Response(200, undefined, "Zur Bestätigung der neuen E-Mail-Adresse wurde eine E-Mail versandt. Überprüfe auch deinen Spam-Ordner."),
    EMAIL_SENT_IF_EXISTS: new Response(200, undefined, "Ein Link zum Zurücksetzen des Passworts wurde gesendet, falls die E-Mail-Adresse existiert. Überprüfe auch deinen Spam-Ordner."),
    DISABLED_ACCOUNT: new Response(200, undefined, "Dein Account wurde deaktiviert und wird nach 7 Tagen ohne Login gelöscht"),
    DELETED_TASK: new Response(200, undefined, "Die Übung wurde entfernt"),
    BAD_REQUEST: new Response(400, undefined, "Bad Request"),
    UNAUTHORIZED: new Response(401, undefined, "Dazu fehlt dir die Berechtigung."),
    SESSION_INVALID: new Response(401, {login: true}, "Deine Sitzung ist nicht mehr gültig. Bitte melde dich an."),
    ALREADY_RATED: new Response(401, undefined, "Du hast diese Übung bereits bewertet."),
    PENDING_EMAIL: new Response(402, undefined, "Die E-Mail-Adresse %email dieses Kontos ist nicht bestätigt. Benutze dazu den Bestätigungslink in der gesendeten E-Mail. Überprüfe auch deinen Spam-Ordner."),
    WRONG_PASSWORD: new Response(403, undefined, "Das Passwort ist nicht gültig."),
    WRONG_CREDENTIALS: new Response(403, undefined, "Der Nutzername und das Passwort stimmen nicht überein."),
    WRONG_OLD_PASSWORD: new Response(403, undefined, "Das alte Passwort ist nicht gültig."),
    NOT_FOUND: new Response(404, undefined, "Not found"),
    USER_ALREADY_VERIFIED: new Response(404, undefined, "Dieser Benutzer ist bereits verifiziert."),
    LINK_INVALID: new Response(404, undefined, "Dieser Link ist nicht gültig."),
    USERNAME_NOT_AVAILABLE: new Response(405, undefined, "Dieser Benutzername ist bereits vergeben."),
    EMAIL_NOT_AVAILABLE: new Response(406, undefined, "Diese E-Mail-Adresse wird bereits genutzt."),
    BAD_VERSION: new Response(407, undefined, "Bitte führe ein Update durch, um die App weiterhin nutzen zu können."),
    ACCOUNT_BLOCKED: new Response(408, undefined, "Dieses Benutzerkonto wurde gesperrt.")
};