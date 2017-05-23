class HTTPException extends Error {
    constructor(status, ...args) {
        super(...args);
        this.status = status;
    }

    get isClientException() {
        return this.status >= 400 && this.status < 500;
    }
}

new HTTPException(404, "File does not exists");

module.exports = {HTTPException};
