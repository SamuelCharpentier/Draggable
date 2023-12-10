import liveServer from 'live-server';

var params = {
	port: 8080, // Set the server port. Defaults to 8080.
	host: 'localhost', // Set the address to bind to. Defaults to 0.0.0.0.
	root: './dev', // Set root directory that's being server. Defaults to cwd.
	wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
};
liveServer.start(params);
