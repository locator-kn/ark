export class DatabaseService {
    connect: any;
    db: any;
    constructor() {
        this.db = new(require('cradle').Connection);
    }
}
