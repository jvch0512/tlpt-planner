node dist/src/cli.js plan examples/bank.json > /tmp/a.md || true; diff /tmp/a.md docs/sample-bank.md
node dist/src/cli.js plan examples/ready.json > /tmp/b.md; diff /tmp/b.md docs/sample-ready.md
test "$(node dist/src/cli.js plan examples/bank.json >/dev/null; echo $?)" = "1"
node dist/src/cli.js plan examples/ready.json >/dev/null
