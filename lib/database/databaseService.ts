export class DatabaseService {
    db: any;
    constructor() {
        this.db = new(require('cradle').Connection);
    }
}
