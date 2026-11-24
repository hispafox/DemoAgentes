<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

if (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}

if ($_SERVER['APP_DEBUG']) {
    umask(0000);
}

// Recreate the SQLite test database from the migrations on every run,
// so each test run starts from the same schema as production.
$testDb = dirname(__DIR__).'/var/test.db';
if (is_file($testDb)) {
    unlink($testDb);
}
passthru(sprintf(
    '%s %s doctrine:migrations:migrate --env=test --no-interaction --allow-no-migration --quiet',
    escapeshellarg(PHP_BINARY),
    escapeshellarg(dirname(__DIR__).'/bin/console'),
), $exitCode);
if (0 !== $exitCode) {
    throw new RuntimeException('Could not create the test database.');
}
