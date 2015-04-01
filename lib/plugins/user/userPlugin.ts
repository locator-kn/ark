export class UserPlugin {
    databaseInstance: any;
    constructor() {
        this.register.attributes = {
            name: 'myPlugin',
            version: '1.0.0'
        };
    }
    register(server, options, next) {
        if(!options.databaseInstance) {
            throw new Error('options.databaseInstance needs to be defined');
        }
        this.databaseInstance = options.databaseInstance;
        var users = this.databaseInstance.database('users');

        server.route({
            method: 'POST',
            path: '/login',
            handler:  (request, reply) => {
                var pl = JSON.parse(request.payload);
                users.view('login/login', function (err, docs) {
                    reply(docs);
                    docs.forEach(doc => {
                        if(doc.name === pl.name && doc.password === pl.password) {
                            console.log('hallo', pl.name);
                        }
                    });
                });
            }
        });

        next();
    }

    errorInit(err) {
        if(err) {
            console.log('Failed to load plugin:', err);
        }

    }

}
