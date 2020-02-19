const router = require('express').Router();
const gate = require('./gate');
const config = require('config');

function commandGate(cmd, code, seconds) {
	if (config.code && code !== config.code) {
		return false;
	}

	if (seconds) {
		//set timout
		gate.addTimer(seconds, cmd);
	} else {
		// toggle immediatly
		gate.action(cmd);
	}

	return true;
}

router.get('/state', async function (req, res) {
	res.send(gate.isOpen ? 'open' : 'closed');
});

router.get('/timers', async function (req, res) {
	let data = gate.timers.map(({ id, cmd, triggerTime }) => ({ id, cmd, triggerTime }));
	res.json(data);
});

router.delete('/timers/:id', async function (req, res) {
	gate.cancelTimer(req.params.id);
});

router.get('/command/:cmd', async function (req, res) {
	if (commandGate(req.params.cmd, req.query.code, req.query.seconds)) {
		res.status(204).send();
	} else {
		res.status(401).send();
	}
});

router.post('/command', async function(req, res) {
	if (commandGate(req.body.cmd, req.body.code, req.body.seconds)) {
		res.status(204).send();
	} else {
		res.status(401).send();
	}
});

module.exports = router;
