export class APIError {
    constructor(message) {
        this.success = false;
        this.message = message;
    }
}

export class APIResponse {
    constructor(message = "Request was successful", data = []) {
        this.success = true;
        this.data = data;
        this.message = message;
    }
}